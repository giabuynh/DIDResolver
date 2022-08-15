const axios = require("axios").default;
const { ERRORS, SERVERS, SCHEMAS } = require("../../core/constants");
const Logger = require("../../logger");
const {
  validateJSONSchema,
  getAddressFromHexEncoded,
  validateDIDSyntax,
  checkUndefinedVar,
} = require("../../core/index");

module.exports = {
  getDIDDocument: async function (req, res) {
    const { access_token } = req.cookies;
    const { did } = req.headers;

    try {
      // Check missing paramters
      const undefinedVar = checkUndefinedVar({ did });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });
      // Validate DID syntax
      const validDid = validateDIDSyntax(did, false),
        companyName = validDid.companyName,
        publicKey = validDid.fileNameOrPublicKey;
      if (!validDid.valid)
        return res.status(200).json({
          ...ERRORS.INVALID_INPUT,
          detail: "Invalid DID syntax.",
        });

      // Call DID Controller
      // success:
      //   { ... }
      // error:
      //   { error_code: number, message: string }
      const { data } = await axios.get(SERVERS.DID_CONTROLLER + "/api/did/", {
        withCredentials: true,
        headers: {
          companyName: companyName,
          publicKey: publicKey,
          Cookie: `access_token=${access_token}`,
        },
      });

      data?.error_code
        ? Logger.apiError(req, res, `${JSON.stringify(data)}`)
        : Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);

      return res.status(200).json(data); // 404
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  createDIDDocument: async function (req, res) {
    // Receive input data
    const { access_token } = req.cookies;
    const { did, didDocument } = req.body;

    try {
      // Check missing parameters
      const undefinedVar = checkUndefinedVar({ did, didDocument });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Validate DID syntax
      const validDid = validateDIDSyntax(did, false),
        companyName = validDid.companyName,
        publicKey = validDid.fileNameOrPublicKey;
      if (!validDid.valid)
        return res.status(200).json({
          ...ERRORS.INVALID_INPUT,
          detail: "Invalid DID syntax.",
        });

      // Call DID Controller
      // success:
      //   { message: string }
      // error:
      //   { error_code: number, message: string }
      const { data } = await axios.post(
        SERVERS.DID_CONTROLLER + "/api/did/",
        {
          companyName: companyName,
          publicKey: publicKey,
          content: didDocument,
        },
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token}`,
          },
        }
      );

      if (data?.error_code) {
        Logger.apiError(req, res, `${JSON.stringify(data)}`);
        return res.status(200).json(data);
      } else {
        Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);
        return res.status(201).send("DID Document created.");
      }
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  getWrappedDocument: async function (req, res) {
    const { access_token } = req.cookies;
    const { did } = req.headers;
    const { only } = req.query;

    try {
      // Check missing parameters
      const undefinedVar = checkUndefinedVar({ did });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Validate DID syntax
      const validDid = validateDIDSyntax(did, false),
        companyName = validDid.companyName,
        fileName = validDid.fileNameOrPublicKey;
      if (!validDid.valid) return res.status(200).json(ERRORS.INVALID_INPUT);

      // Call DID Controller
      // success:
      //   {
      //     didDoc: {},
      //     wrappedDoc: {}
      //   }
      // error:
      //   { error_code: number, message: string }
      const { data } = await axios.get(SERVERS.DID_CONTROLLER + "/api/doc", {
        withCredentials: true,
        headers: {
          Cookie: `access_token=${access_token}`,
        },
        params: { companyName, fileName, only },
      });

      Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);
      return res.status(200).json(data); // 404
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  getAllWrappedDocumentsOfUser: async function (req, res) {
    // Receive input data
    const { access_token } = req.cookies;
    const { did } = req.headers;

    try {
      // Handle input errors
      const undefinedVar = checkUndefinedVar({ did });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Validate DID syntax
      const validDID = validateDIDSyntax(did, false),
        companyName = validDID.companyName,
        publicKey = validDID.fileNameOrPublicKey;
      if (!validDID.valid) return res.status(200).json(ERRORS.INVALID_INPUT);

      // Call DID Controller
      // success:
      //   [
      //     {...},
      //     {...}
      //   ]
      // error:
      //   { error_code: number, message: string }
      const { data } = await axios.get(
        SERVERS.DID_CONTROLLER + "/api/doc/user",
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token}`,
          },
          params: {
            companyName: companyName,
            publicKey: publicKey,
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

  checkWrappedDocumentExistence: async function (req, res) {
    const { access_token } = req.cookies;
    const { companyname: companyName, filename: fileName } = req.headers;

    try {
      // Handle input errors
      const undefinedVar = checkUndefinedVar({ companyName, fileName });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Call DID Contoller
      // success:
      //   { isExisted: true/false }
      const { data } = await axios.get(
        SERVERS.DID_CONTROLLER + "/api/doc/exists/",
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token}`,
          },
          params: {
            companyName,
            fileName,
          },
        }
      );

      Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);
      return res.status(200).json(data?.isExisted);
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  createWrappedDocument: async function (req, res) {
    const { access_token } = req.cookies;
    let {
      wrappedDocument,
      issuerAddress: encryptedIssuerAddress,
      mintingNFTConfig,
    } = req.body;

    try {
      // 0. Handle input errors
      const undefinedVar = checkUndefinedVar({
        wrappedDocument,
        encryptedIssuerAddress,
      });
      if (undefinedVar.undefined) {
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });
      }

      // ? Validate wrapped document format
      // const valid = validateJSONSchema(
      //   SCHEMAS.NEW_WRAPPED_DOCUMENT,
      //   wrappedDocument
      // );
      // if (!valid.valid)
      //   return res.status(200).json({
      //     ...ERRORS.INVALID_INPUT,
      //     error_message: "Bad request. Invalid wrapped document.",
      //     detail: valid.detail,
      //   });

      // Validate DID syntax
      const did = wrappedDocument.data?.did,
        validDid = validateDIDSyntax(did, true),
        companyName = validDid.companyName,
        fileName = validDid.fileNameOrPublicKey;
      if (!validDid.valid)
        return res.status(200).json({
          ...ERRORS.INVALID_INPUT,
          detail: "Invalid DID syntax. Check did element.",
        });

      // 1. Validate permission to create document
      const issuerAddress = getAddressFromHexEncoded(encryptedIssuerAddress),
        targetHash = wrappedDocument.signature.targetHash;
      // 1.1. Get address of user from the acess token
      // success:
      //   { data: { address: string } }
      // error: 401 - unauthorized
      const address = await axios.get(
        SERVERS.AUTHENTICATION_SERVICE + "/api/auth/verify",
        {
          withCredentials: true,
          headers: { Cookie: `access_token=${access_token};` },
        }
      );
      Logger.apiInfo(
        req,
        res,
        `Address of user: ${address?.data?.data?.address}`
      );

      // 1.2 Compare issuer address with user address
      if (issuerAddress !== address.data.data.address) {
        Logger.apiError(
          req,
          res,
          `Address ${address.data.data.address} is not issuerAddress ${issuerAddress}`
        );
        return res.status(200).send(ERRORS.PERMISSION_DENIED); // 403
      } else
        Logger.apiInfo(
          req,
          res,
          `Issuer address matchs current address. Address: ${issuerAddress}`
        );

      // 2. Check if document is already stored on DB (true/false).
      // success:
      //   { isExisted: true/false }
      const existence = await axios.get(
        SERVERS.DID_CONTROLLER + "/api/doc/exists/",
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
          params: {
            companyName,
            fileName,
          },
        }
      );

      if (existence?.data?.isExisted) {
        Logger.apiError(
          req,
          res,
          `Wrapped document with name ${fileName} already existed.`
        );
        return res.status(200).json(ERRORS.ALREADY_EXSISTED); // 409
      } else
        Logger.apiInfo(
          req,
          res,
          `Confirm new wrapped document. Continue creating...`
        );

      // 3. Storing hash on Cardano blockchain
      // 3.1. Call Cardano Service
      // success:
      //   {
      //     data:
      //       {
      //         result: true,
      //         token: { policyId: string, assetId: string }
      //       }
      //   }
      // error:
      //   { error_code: number, error_message: string } }

      let mintBody = {
          hash: targetHash,
        },
        mintingNFT;
      if (mintingNFTConfig) {
        // * Update
        mintBody = {
          newHash: targetHash,
          config: { ...mintingNFTConfig, burn: false },
        };
        mintingNFT = await axios.put(
          SERVERS.CARDANO_SERVICE + "/api/v2/hash/",
          mintBody,
          {
            withCredentials: true,
            headers: {
              Cookie: `access_token=${access_token};`,
            },
          }
        );
      } else {
        // * Create
        mintingNFT = await axios.post(
          SERVERS.CARDANO_SERVICE + "/api/v2/hash/",
          mintBody,
          {
            withCredentials: true,
            headers: {
              Cookie: `access_token=${access_token};`,
            },
          }
        );
      }

      if (!mintingNFT) return res.status(200).json(ERRORS.CANNOT_MINT_NFT);
      if (mintingNFT?.data?.code !== 0) {
        Logger.apiError(req, res, `${JSON.stringify(mintingNFT.data)}`);
        return res.status(200).json({
          ...ERRORS.CANNOT_MINT_NFT,
          detail: mintingNFT.data,
        });
      } else
        Logger.apiInfo(
          req,
          res,
          `Minting NFT.\n${JSON.stringify(mintingNFT.data)}`
        );

      const _mintingNFTConfig = mintingNFT?.data?.data
        ? mintingNFT?.data?.data
        : false;

      // 4. Add policy Id and assert Id to wrapped document
      wrappedDocument = {
        ...wrappedDocument,
        mintingNFTConfig: _mintingNFTConfig,
      };

      // 5. Storing wrapped document on DB
      // Call DID Controller
      // success:
      //   { message: "success" }
      // error:
      //   { error_code: number, message: string }
      const storeWrappedDocumentStatus = await axios.post(
        SERVERS.DID_CONTROLLER + "/api/doc",
        {
          fileName,
          wrappedDocument,
          companyName,
        },
        {
          withCredentials: true,
          headers: { Cookie: `access_token=${access_token};` },
        }
      );

      // Return policyId an assetId if the process is success.
      if (storeWrappedDocumentStatus?.data?.error_code) {
        Logger.apiError(
          req,
          res,
          `${JSON.stringify(storeWrappedDocumentStatus.data)}`
        );
        return res.status(200).json(storeWrappedDocumentStatus.data);
      } else {
        Logger.apiInfo(
          req,
          res,
          `Success.\n${JSON.stringify(storeWrappedDocumentStatus.data)}`
        );
        return res.status(201).json(wrappedDocument);
      }
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  validateWrappedDocument: async function (req, res) {
    const { wrappedDocument } = req.body;
    const undefinedVar = checkUndefinedVar({ wrappedDocument });

    try {
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      const valid = validateJSONSchema(
        SCHEMAS.WRAPPED_DOCUMENT,
        wrappedDocument
      );

      Logger.apiInfo(req, res, `Success.\n${JSON.stringify(valid)}`);
      return res.status(200).json(valid);
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      return res.status(200).send("Cannot validate wrapped document.");
    }
  },

  transferWrappedDocument: async function (req, res) {
    // * Update DID document of wrapped document
    const { access_token } = req.cookies;
    const { did, didDoc: didDocumentOfWrappedDocument } = req.body;

    try {
      // Check missing parameters
      const undefinedVar = checkUndefinedVar({
        did,
        didDoc: didDocumentOfWrappedDocument,
      });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Validate DID syntax
      const validDid = validateDIDSyntax(did, false),
        companyName = validDid.companyName,
        fileName = validDid.fileNameOrPublicKey;
      if (!validDid.valid) res.status(200).json(ERRORS.INVALID_INPUT);

      // Validate DID document of wrapped document
      const valid = validateJSONSchema(
        SCHEMAS.DID_DOCUMENT_OF_WRAPPED_DOCUMENT,
        didDocumentOfWrappedDocument
      );
      if (!valid.valid)
        return res.status(200).json({
          ...ERRORS.INVALID_INPUT,
          error_message: "Bad request. Invalid did document.",
          detail: valid.detail,
        });

      // Call DID Controller
      // success:
      //   { message: string }
      // error:
      //   { error_code: number, message: string }
      const { data } = await axios.put(
        SERVERS.DID_CONTROLLER + "/api/doc",
        {
          companyName: companyName,
          fileName: fileName,
          didDoc: didDocumentOfWrappedDocument,
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
        : Logger.apiInfo(req, res, `\n${JSON.stringify(data)}`);
      return res.status(200).json(data);
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      return error.response
        ? res.status(400).json(error.response)
        : res.status(400).json(error);
    }
  },

  revokeDocument: async function (req, res) {
    const { config } = req.body;
    const { access_token } = req.cookies;

    try {
      // Check missing parameters
      const undefinedVar = checkUndefinedVar({
        config,
      });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      const { request, data } = await axios.delete(
        SERVERS.CARDANO_SERVICE + "/api/v2/hash",
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
          data: { config },
        }
      );

      return res.status(200).json(data);
    } catch (error) {
      console.log(4);
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      return error.response
        ? res.status(400).json(error.response)
        : res.status(400).json(error);
    }
  },

  searchWrappedDocument: async function (req, res) {
    const { access_token } = req.cookies;
    let { companyName, searchString, pageNumber, itemsPerPage } = req.query;

    try {
      // Check missing paramters
      const undefinedVar = checkUndefinedVar({
        companyName,
        searchString,
      });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Update default/manual input
      pageNumber = pageNumber ? pageNumber : 1;
      itemsPerPage = itemsPerPage ? itemsPerPage : 5;

      // Call DID Controller
      // success:
      //   [
      //     {
      //       data:{ name: string, title: string, fileName: string, did: string, issuers: [] },
      //       signature: {},
      //       policyId: string,
      //       assetId: string
      //     },
      //     ...
      //   ]
      // error:
      //   { error_code: number, message: string }
      const { data } = await axios.get(
        SERVERS.DID_CONTROLLER + "/api/doc/search-content",
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
          params: {
            companyName,
            searchString,
          },
        }
      );

      if (data?.error_code) {
        Logger.apiError(req, res, `${JSON.stringify(data)}`);
        return res.status(200).json(data);
      }

      const _logWrappedDocuments = ((arrayOfItems) => {
        let fileNames = [];
        for (const item of arrayOfItems) fileNames.push(item.data.fileName);
        return fileNames;
      })(data);

      const total = data.length,
        maxPage =
          (total - (total % itemsPerPage)) / itemsPerPage +
          (total % itemsPerPage ? 1 : 0);

      pageNumber = pageNumber > maxPage ? maxPage : pageNumber;

      const startIndex = (pageNumber - 1) * itemsPerPage;
      let endIndex = parseInt(itemsPerPage) + parseInt(startIndex);
      endIndex = endIndex > total ? total : endIndex;

      const result = data.slice(startIndex, endIndex),
        _logResult = _logWrappedDocuments.slice(startIndex, endIndex);

      Logger.apiInfo(
        req,
        res,
        `Page: ${pageNumber} of ${maxPage}.\nDisplay ${itemsPerPage} of ${total} results. From ${startIndex} to ${endIndex}.\n${JSON.stringify(
          _logResult
        )}`
      );

      return res.status(200).json({
        total,
        maxPage,
        currentPage: pageNumber,
        result,
      });
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },
};