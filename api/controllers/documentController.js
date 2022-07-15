const axios = require("axios").default;
const { ERRORS, SERVERS, SHEMAS } = require("../../core/constants");
const {
  validateJSONSchema,
  getAddressFromHexEncoded,
  validateDIDSyntax,
} = require("../../core/index");

module.exports = {
  getDIDDocument: async function (req, res) {
    console.log("Fetching DID document...");
    // Receive input data
    const { did } = req.headers;

    // Check missing paramters
    if (!did)
      return res.status(200).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail: "Not found: did",
      });

    // Validate DID syntax
    const validDid = validateDIDSyntax(did, (isSalted = false)),
      companyName = validDid.companyName,
      publicKey = validDid.fileNameOrPublicKey;

    if (!validDid.valid)
      return res.status(200).json({
        ...ERRORS.INVALID_INPUT,
        detail: "Invalid DID syntax.",
      });

    // Call DID Controller
    console.log("-- Fetching user/company's DID document");
    // success:
    //   { ... }
    // error:
    //   { error_code: number, message: string }
    axios
      .get(SERVERS.DID_CONTROLLER + "/api/did/", {
        headers: {
          companyName: companyName,
          publicKey: publicKey,
        },
      })
      .then((response) => res.status(200).json(response.data)) // 404
      .catch((error) =>
        error.response
          ? res.status(400).json(error.response.data)
          : res.status(400).json(error)
      );
  },

  createDIDDocument: async function (req, res) {
    // Receive input data
    const { did, didDocument } = req.body;

    // Check missing parameters
    if (!did || !didDocument)
      return res.status(200).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail:
          "Not found:" + !did
            ? " did"
            : "" + !didDocument
            ? " didDocument"
            : "",
      });

    // Validate DID syntax
    const validDid = validateDIDSyntax(did, (isSalted = false)),
      companyName = validDid.companyName,
      publicKey = validDid.fileNameOrPublicKey;

    if (!validDid.valid)
      return res.status(200).json({
        ...ERRORS.INVALID_INPUT,
        detail: "Invalid DID syntax.",
      });

    // Call DID Controller
    console.log("-- Creating DID document...");
    // success:
    //   { message: string }
    // error:
    //   { error_code: number, message: string }
    axios
      .post(SERVERS.DID_CONTROLLER + "/api/did/", {
        companyName: companyName,
        publicKey: publicKey,
        content: didDocument,
      })
      .then((response) => {
        console.log(response.data);
        response.data.error_code
          ? res.status(200).json(response.data)
          : res.status(201).send("DID Document created.");
      })
      .catch((error) => {
        console.log(error);
        error.response
          ? res.status(400).json(error.response.data)
          : res.status(400).json(error);
      });
  },

  getWrappedDocument: async function (req, res) {
    // Receive input data
    const { did } = req.headers;
    const { only } = req.query;

    // Check missing parameters
    if (!did)
      return res.status(200).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail: "Not found: did",
      });

    // Validate DID syntax
    const validDid = validateDIDSyntax(did, (isSalted = false)),
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
    axios
      .get(SERVERS.DID_CONTROLLER + "/api/doc", {
        headers: {
          companyName,
          fileName,
        },
        params: { only },
      })
      .then((response) => res.status(200).json(response.data)) // 404
      .catch((error) => {
        error.response
          ? res.status(400).json(error.response.data)
          : res.status(400).json(error);
      });
  },

  getAllWrappedDocumentsOfUser: async function (req, res) {
    // Receive input data
    const { did } = req.headers;

    // Handle input errors
    if (!did)
      return res.status(200).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail: "Not found: did",
      });

    // Validate DID syntax
    const validDID = validateDIDSyntax(did, (isSalted = false)),
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
    axios
      .get(SERVERS.DID_CONTROLLER + "/api/doc/user", {
        headers: {
          companyName: companyName,
          publicKey: publicKey,
        },
      })
      .then((response) => res.status(200).json(response.data))
      .catch((error) => {
        error.response
          ? res.status(400).json(error.response.data)
          : res.status(400).json(error);
      });
  },

  checkWrappedDocumentExistence: async function (req, res) {
    // Receive input data
    const { companyname: companyName, filename: fileName } = req.headers;

    // Handle input errors
    if (!companyName || !fileName)
      return res.status(200).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail:
          "Not found: " + !companyName
            ? " companyName"
            : "" + !fileName
            ? " fileName"
            : "",
      });

    // Call DID Contoller
    // success:
    //   { isExisted: true/false }
    axios
      .get(SERVERS.DID_CONTROLLER + "/api/doc/exists/", {
        headers: {
          companyName,
          fileName,
        },
      })
      .then((response) => res.status(200).json(response.data.isExisted))
      .catch((error) =>
        error.response
          ? res.status(400).json(error.response.data)
          : res.status(400).json(error)
      );
  },

  createWrappedDocument: async function (req, res) {
    // Get access-token from request and receive input data
    const { access_token } = req.cookies;
    var {
      wrappedDocument,
      issuerAddress: encryptedIssuerAddress,
      previousHashOfDocument,
      originPolicyId,
    } = req.body;

    // Handle input errors
    if (!wrappedDocument || !encryptedIssuerAddress) {
      return res.status(200).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail:
          "Not found:" + !wrappedDocument
            ? " wrappedDocument"
            : "" + !encryptedIssuerAddress
            ? " issuerAddress"
            : "",
      });
    }

    //Validate wrapped document format
    const valid = validateJSONSchema(
      SHEMAS.NEW_WRAPPED_DOCUMENT,
      wrappedDocument
    );
    if (!valid.valid)
      return res.status(200).json({
        ...ERRORS.INVALID_INPUT,
        error_message: "Bad request. Invalid wrapped document.",
        detail: valid.detail,
      });

    // Validate DID syntax
    const did = wrappedDocument.data.did,
      validDid = validateDIDSyntax(did, (isSalted = true)),
      companyName = validDid.companyName,
      fileName = validDid.fileNameOrPublicKey;
    if (!validDid.valid)
      return res.status(200).json({
        ...ERRORS.INVALID_INPUT,
        detail:
          "Invalid DID syntax. Check the wrappedDocument.data.did element.",
      });

    const issuerAddress = getAddressFromHexEncoded(encryptedIssuerAddress),
      targetHash = wrappedDocument.signature.targetHash;

    try {
      // 1. Validate permission to create document
      // 1.1. Get address of user from the acess token
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
      // 1.2 Compare issuer address with user address
      if (issuerAddress !== address.data.data.address)
        return res.status(200).send(ERRORS.PERMISSION_DENIED); // 403

      // 2. Check if document is already stored on DB (true/false).
      // success:
      //   { isExisted: true/false }
      const existence = await axios.get(
        SERVERS.DID_CONTROLLER + "/api/doc/exists/",
        {
          headers: {
            companyName,
            fileName,
          },
        }
      );
      if (existence.data.isExisted)
        return res.status(200).json(ERRORS.ALREADY_EXSISTED); // 409

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
      const mintingNFT = await axios.put(
        SERVERS.CARDANO_SERVICE + "/api/storeHash/",
        {
          address: issuerAddress,
          hashOfDocument: targetHash,
          previousHashOfDocument: previousHashOfDocument || "EMPTY",
          originPolicyId: originPolicyId || "EMPTY",
        },
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
        }
      );

      // 3.2. Handle store hash errors
      if (mintingNFT.data.error_code)
        return res.status(200).json(mintingNFT.data);
      if (!mintingNFT) return res.status(200).json(ERRORS.CANNOT_MINT_NFT);

      // 3.3. Extract policyId and assetId
      const mintingNFTStatus = mintingNFT.data.data.result
        ? mintingNFT.data.data.result
        : false;
      const policyId = mintingNFTStatus
        ? mintingNFT.data.data.token.policyId
        : "No policyId";
      const assetId = mintingNFTStatus
        ? mintingNFT.data.data.token.assetId
        : "No assetId";

      // 4. Add policy Id and assert Id to wrapped document
      wrappedDocument = {
        ...wrappedDocument,
        policyId: policyId,
        assetId: assetId,
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
        }
      );

      // 6. Return policyId an assetId if the process is success.
      storeWrappedDocumentStatus.data.error_code
        ? res.status(200).json(storeWrappedDocumentStatus.data)
        : res.status(201).json(wrappedDocument);
    } catch (err) {
      err.response
        ? res.status(400).json(err.response.data)
        : res.status(400).json(err);
    }
  },

  validateWrappedDocument: async function (req, res) {
    const { wrappedDocument } = req.body;
    if (!wrappedDocument)
      return res.status(200).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail: "Not found: wrappedDocument",
      });

    const valid = validateJSONSchema(SHEMAS.WRAPPED_DOCUMENT, wrappedDocument);

    return res.status(200).send(valid);
  },

  transferWrappedDocument: async function (req, res) {
    const { did, didDoc: didDocumentOfWrappedDocument } = req.body;

    // Check missing parameters
    if (!did || !didDocumentOfWrappedDocument)
      return res.status(200).json(ERRORS.MISSING_PARAMETERS);

    // Validate DID syntax
    const validDid = validateDIDSyntax(did, false),
      companyName = validDid.companyName,
      fileName = validDid.fileNameOrPublicKey;
    if (!validDid.valid) res.status(200).json(ERRORS.INVALID_INPUT);

    const valid = validateJSONSchema(
      SHEMAS.DID_DOCUMENT_OF_WRAPPED_DOCUMENT,
      didDocumentOfWrappedDocument
    );
    if (!valid.valid)
      return res.status(200).json({
        ...ERRORS.INVALID_INPUT,
        error_message: "Bad request. Invalid did document.",
        detail: valid.detail,
      });

    axios
      .put(SERVERS.DID_CONTROLLER + "/api/doc", {
        companyName: companyName,
        fileName: fileName,
        didDoc: didDocumentOfWrappedDocument,
      })
      .then((response) => res.status(200).json(response.data))
      .catch((error) => res.status(400).json(error));
  },
};
