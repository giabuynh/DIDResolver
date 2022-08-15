const axios = require("axios").default;
const {
  validateJSONSchema,
  getPublicKeyFromAddress,
  validateDIDSyntax,
  checkUndefinedVar,
} = require("../../core/index");
const { ERRORS, SERVERS, SCHEMAS } = require("../../core/constants");
const sha256 = require("js-sha256").sha256;
// const aesjs = require("aes-js");
const Logger = require("../../logger");
const { json } = require("express");

module.exports = {
  createCredential: async function (req, res) {
    const { access_token } = req.cookies;
    const { credential, did, config } = req.body;
    try {
      // Handle input error
      const undefinedVar = checkUndefinedVar({
        credential,
        did,
        config,
      });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });
      // 0. Validate input
      // 0.1. Validate DID syntax
      const validDid = validateDIDSyntax(did, false);
      if (!validDid.valid)
        return res.status(200).json({
          ...ERRORS.INVALID_INPUT,
          detail: "Invalid DID syntax.",
        });
      const companyName = validDid.companyName,
        fileName = validDid.fileNameOrPublicKey;
      // 0.2. Validate credential
      const valid = validateJSONSchema(SCHEMAS.CREDENTIAL, credential);
      if (!valid.valid)
        return res.status(200).json({
          ...ERRORS.INVALID_INPUT,
          detail: valid.detail,
        });

      // 1. Get wrapped document and did document of wrapped document
      // sucess:
      //   { wrappedDoc: {}, didDoc: {} }
      // error:
      //   { error_code: number, message: string }
      const documents = await axios.get(SERVERS.DID_CONTROLLER + "/api/doc", {
        withCredentials: true,
        headers: {
          Cookie: `access_token=${access_token};`,
        },
        params: {
          companyName,
          fileName,
        },
      });

      if (documents?.data?.error_code) {
        Logger.apiError(req, res, `${JSON.stringify(documents.data)}`);
        return res.status(200).json({
          ...ERRORS.INVALID_INPUT,
          detail: documents.data,
        });
      }

      const didDocument = documents.data.didDoc,
        wrappedDocument = documents.data.wrappedDoc;
      const originPolicyId = wrappedDocument?.policyId,
        hashOfDocument = wrappedDocument?.signature?.targetHash;

      Logger.apiInfo(
        req,
        res,
        `Retrieved didDocument and wrappedDocument of ${companyName}/${fileName}`
      );

      // 2. Validate permission to create credential
      // 2.1. Get address of current user from access token
      // success:
      //   { data: { address: string } }
      // error: 401 - unauthorized
      const address = await axios.get(
        SERVERS.AUTHENTICATION_SERVICE + "/api/auth/verify",
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
        }
      );

      // 2.2. Compare user address with public key from issuer did in credential
      // credential.issuer: did:method:companyName:publicKey --> Compare this with publicKey(address)
      const publicKey = getPublicKeyFromAddress(address?.data?.data?.address),
        issuerDidComponents = credential?.issuer?.split(":");
      if (publicKey !== issuerDidComponents[issuerDidComponents.length - 1]) {
        Logger.apiError(
          req,
          res,
          `Unmatch PK.\n
            PK from credential.issuer: ${
              issuerDidComponents[issuerDidComponents.length - 1]
            }\n
            Current user PK: ${publicKey}`
        );
        return res.status(200).json(ERRORS.PERMISSION_DENIED); // 403
      } else
        Logger.apiInfo(
          req,
          res,
          `PK matchs credential.issuer PK. PK: ${publicKey}`
        );

      // 2.3. Compare user address with controller address (from did document of wrapped document)
      // ?? XIN ACCESS_TOKEN CUA HAOOOO EVERYTIME TEST CAI NAY
      if (didDocument?.controller?.indexOf(publicKey) < 0) {
        Logger.apiError(req, res, `User with PK is not one of DID controller.`);
        return res.status(200).json(ERRORS.PERMISSION_DENIED); // 403
      } else Logger.apiInfo(req, res, `PK is one of DID controller.`);

      // // 2.4. Call Cardano Service to verify signature
      // // success:
      // // v1
      // //   { data: { result: true/false } }
      // // v2
      // //   {
      // //     code: 0,
      // //     message: string,
      // //     data: true/false
      // //   }
      // // error:
      // //   { code: string, message: string }
      // const verifiedSignature = await axios.post(
      //   SERVERS.CARDANO_SERVICE + "/api/verifySignature",
      //   {
      //     address: getPublicKeyFromAddress(address.data.data.address),
      //     payload,
      //     signature: credential.signature,
      //   },
      //   {
      //     withCredentials: true,
      //     headers: {
      //       Cookie: `access_token=${access_token};`,
      //     },
      //   }
      // );

      // if (!verifiedSignature.data.data || verifiedSignature.data.code) {
      //   Logger.apiError(req, res, `False signature ${credential.signature}`);
      //   return res.status(200).json({
      //     ...ERRORS.UNVERIFIED_SIGNATURE,
      //     detail: verifiedSignature.data,
      //   }); // 403
      // }
      // Logger.info(`Valid signature.`);

      // 3. Call Cardano Service to store new credential
      // success:
      //   {
      //     code: 1,
      //     message: string,
      //     data: {
      //       type: string,
      //       policy: { type: string, id: string, script: string, ttl: number }
      //       asset: string,
      //     }
      //   }
      // error:
      //   { code: 0, message: string }

      // * Cancel request after 4 seconds if no response from Cardano Service
      const source = axios.CancelToken.source();

      const mintingNFT = await axios.post(
        SERVERS.CARDANO_SERVICE + "/api/v2/credential",
        {
          config,
          credential: sha256(
            Buffer.from(JSON.stringify(credential), "utf8").toString("hex")
          ),
        },
        {
          // cancelToken: source.token,
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
        }
      );
      console.log('CUUUUU', mintingNFT?.data)
      if (mintingNFT?.data?.code) {
        Logger.apiError(req, res, `${JSON.stringify(mintingNFT.data)}`);
        return res.status(200).json({
          ...ERRORS.CANNOT_MINT_NFT,
          detail: mintingNFT.data,
        });
      } else {
        // 4. Call DID_CONTROLLER
        // success:
        //   {}
        // error:
        //   { error_code: number, message: string}
        console.log(1)
        const storeCredentialStatus = await axios.post(
          SERVERS.DID_CONTROLLER + "/api/credential",
          {
            hash: sha256(
              Buffer.from(JSON.stringify(credential), "utf8").toString("hex")
            ),
            content: {
              ...credential,
              mintingNFTConfig: mintingNFT?.data?.data,
            },
          },
          {
            withCredentials: true,
            headers: {
              Cookie: `access_token=${access_token};`,
            },
          }
        );
        console.log(2, storeCredentialStatus.data)
        if (storeCredentialStatus?.data?.error_code) {
          Logger.apiError(
            req,
            res,
            `${JSON.stringify(storeCredentialStatus.data)}`
          );
          console.log(3)
          return res.status(200).json(storeCredentialStatus.data);
        } else {
          Logger.apiInfo(req, res, `Success.`);
          return res.status(201).send(storeCredentialStatus.data);
        }
      }
    } catch (err) {
      Logger.apiError(req, res, `${JSON.stringify(err)}`);
      err.response
        ? res.status(400).json(err.response.data)
        : res.status(400).json(err);
    }
  },

  getCredential: async function (req, res) {
    const { hash } = req.headers;
    const { access_token } = req.cookies;
    try {
      const { data } = await axios.get(
        SERVERS.DID_CONTROLLER + "/api/credential",
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
          params: {
            hash,
          },
        }
      );

      data?.error_code
        ? Logger.apiError(req, res, `${JSON.stringify(data)}`)
        : Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);

      return res.status(200).json(data);
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  updateCredential: async function (req, res) {
    // Receive input data
    const { access_token } = req.cookies;
    const { originCredentialHash, credentialContent } = req.body;
    console.log({ originCredentialHash, credentialContent });
    try {
      const { data } = await axios.put(
        SERVERS.DID_CONTROLLER + "/api/credential",
        {
          hash: originCredentialHash,
          content: credentialContent,
        },
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
        }
      );
      data?.error_code
        ? Logger.apiError(req, res, `${JSON.stringify(data)}`)
        : Logger.apiInfo(req, res, `Sucess.\n${JSON.stringify(data)}`);
      return res.status(200).send(data);
    } catch (err) {
      err.response
        ? res.status(400).json(err.response.data)
        : res.status(400).json(err);
    }
  },
};