const axios = require("axios").default;
const {
  validateJSONSchema,
  getPublicKeyFromAddress,
  validateDIDSyntax,
} = require("../../core/index");
const { ERRORS, SERVERS, SCHEMAS } = require("../../core/constants");
const sha256 = require("js-sha256").sha256;

module.exports = {
  createCredential: async function (req, res) {
    console.log("Creating credential...");
    // Receive input data
    const { access_token } = req.cookies;
    const { indexOfCres, credential, payload, did } = req.body;

    // Handle input error
    if (!indexOfCres || !credential || !payload || !did)
      return res.status(200).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail:
          "Not found:" + !indexOfCres
            ? " indexOfCres"
            : "" + !credential
            ? " credential"
            : "" + !payload
            ? " payload"
            : "" + !did
            ? " did"
            : "",
      });

    // Validate input
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
    var valid = validateJSONSchema(SCHEMAS.CREDENTIAL, credential);
    if (!valid.valid)
      return res.status(200).json({
        ...ERRORS.INVALID_INPUT,
        error_message: "Bad request. Invalid credential.",
        detail: valid.detail,
      });

    try {
      // 1. Get wrapped document and did document of wrapped odcument
      // 1.1. Get did document and wrapped document of did document
      // sucess:
      //   { wrappedDoc: {}, didDoc: {} }
      // error:
      //   { error_code: number, message: string }
      const documents = await axios.get(SERVERS.DID_CONTROLLER + "/api/doc", {
        headers: {
          companyName,
          fileName,
        },
      });
      const didDocument = documents.data.didDoc,
        wrappedDocument = documents.data.wrappedDoc;
      const originPolicyId = wrappedDocument.policyId,
        hashOfDocument = wrappedDocument.signature.targetHash;

      // 3. Validate permission to create credential
      // 3.1. Get address of current user from access token
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

      // 3.2. Compare user address with public key from issuer did in credential
      // credential.issuer: did:method:companyName:publicKey
      console.log("-- Checking permission: current vs issuer of credential");
      publicKey = getPublicKeyFromAddress(address.data.data.address);
      issuerDidComponents = credential.issuer.split(":");
      console.log(
        publicKey,
        issuerDidComponents[issuerDidComponents.length - 1]
      );
      if (publicKey !== issuerDidComponents[issuerDidComponents.length - 1])
        return res.status(200).json(ERRORS.PERMISSION_DENIED); // 403

      // 3.3. Compare user address with controller address (from did document of wrapped document)
      // ?? BO MAY DANG SUA TOI CHO NAY THI TEST DEO DUOC ._.
      // ?? BO MAY SE QUAY LAI SAU
      // ?? XIN ACCESS_TOKEN CUA HAOOOO EVERYTIME TEST CAI LZZZ QUE NAY
      console.log(
        "-- Checking permission: current vs controller of DID document"
      );
      console.log(didDocument.controller.indexOf(publicKey));
      if (didDocument.controller.indexOf(publicKey) < 0)
        // if (publicKey !== didDocument.owner && publicKey !== didDocument.holder)
        return res.status(200).json(ERRORS.PERMISSION_DENIED); // 403

      // 4. Call Cardano Service to verify signature
      // success:
      //   { data: { result: true/false } }
      // error:
      //   { error_code: stringify, error_message: string }
      const verifiedSignature = await axios.post(
        SERVERS.CARDANO_SERVICE + "/api/verifySignature",
        {
          address: getPublicKeyFromAddress(address.data.data.address),
          payload,
          signature: credential.signature,
        },
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
        }
      );

      console.log(verifiedSignature.data);
      if (
        !verifiedSignature.data.data.result ||
        verifiedSignature.data.error_code
      )
        return res.status(200).json({
          ...ERRORS.UNVERIFIED_SIGNATURE,
          detail: verifiedSignature.data,
        }); // 403

      // 3. Call Cardano Service to store new credential
      // success:
      //   {
      //     data:
      //     {
      //       result: true,
      //       token: { policyId: string, assetId: string }
      //     }
      //   }
      // error:
      //   { error_code: number, message: string }

      // * Cancel request after 4 seconds if no response from Cardano Service
      const source = axios.CancelToken.source();
      let storeCredentialStatus = null;
      setTimeout(() => {
        if (storeCredentialStatus === null) {
          source.cancel();
        }
      }, 8000);

      console.log([{ ...credential }]);

      storeCredentialStatus = await axios.put(
        SERVERS.CARDANO_SERVICE + "/api/storeCredentials",
        {
          address: address?.data?.data?.address,
          hashOfDocument,
          originPolicyId,
          indexOfCreds: indexOfCres,
          credentials: [
            sha256(
              Buffer.from(JSON.stringify(credential), "utf8").toString("hex")
            ),
          ],
        },
        {
          // cancelToken: source.token,
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
        }
      );

      storeCredentialStatus?.data?.data?.result
        ? res.status(201).send("Credential created.")
        : res.status(200).send(storeCredentialStatus.data);
    } catch (err) {
      err.response
        ? res.status(400).json(err.response.data)
        : res.status(400).json(err);
    }
  },
};
