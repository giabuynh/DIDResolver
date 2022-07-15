const DID_CONTROLLER = "http://localhost:9000";
// const CARDANO_SERVICE = "http://192.168.1.23:10000";
const CARDANO_SERVICE = "http://localhost:10000";
// const AUTHENTICATION_SERVICE = "http://18.139.84.180:12000";
const AUTHENTICATION_SERVICE = "http://localhost:12000";

const axios = require("axios").default;
const { getAddressFromHexEncoded, errorResponse } = require("../../core/index");

/**
 * POST to create DID Doc for a DID
 * @param {String} did DID string of user/company. Syntax did:tradetrust:<companyName>:<publicKey>
 * @param {Object} didDocument JSON object is a DID Document
 * @returns {Object} DID Document of DID
 */
exports.createDIDDocument = async function (req, res) {
  const { did, didDocument } = req.body;
  if (!did || !didDocument)
    return errorResponse(400, "Missing parrameters");

  const didComponents = did.split(":");
  if (didComponents.length < 4 || didComponents[0] != "did")
    return res.status(400).json("Invalid DID syntax.");

  const companyName = didComponents[2];
  const publicKey = didComponents[3];
  await axios
    .post(DID_CONTROLLER + "/api/did/",
      {
        companyName: companyName,
        publicKey: publicKey,
        content: didDocument,
      })
    .then((response) => {
      response.data.errorCode
        ? res.status(400).json(response.data)
        : res.status(201).send("DID Document created.")
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json(error.response?.data)
    });
};

/**
 * GET request to resolve DID
 * @param {String} did syntax is did:tradetrust:<companyName>:<documentName>
 * @returns {Object} DID Document of DID
 */
exports.getDIDDocument = async function (req, res) {
  const { did } = req.headers;
  if (!did) return res.status(400).send("Missing parameters.");

  const didComponents = did.split(":");
  if (didComponents.length < 4 || didComponents[0] != "did")
    return res.status(400).send("Invalid DID syntax.");

  const companyName = didComponents[2];
  const fileName = didComponents[3];
  await axios
    .get(DID_CONTROLLER + "/api/did/",
      {
        headers: {
          companyName: companyName,
          publicKey: fileName,
        },
      })
    .then((response) =>
      response.data.errorCode
        ? res.status(404).json(req.data)
        : res.status(200).json(req.data))
    .catch((error) =>
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error)
    );
};

/**
 * GET request to check if the wrapped document is exsited
 * @param {String} companyName
 * @param {String} fileName 
 * @returns {boolean} status isExisted 
 */
exports.checkWrappedDocumentExistence = async function (req, res) {
  const { companyname: companyName, filename: fileName } = req.headers;
  console.log()
  if (!companyName || !fileName)
    return res.status(400).send("Missing parameters.");

  await axios.get(DID_CONTROLLER + "/api/doc/exists/",
    {
      headers: {
        companyName,
        fileName,
      },
    })
    .then((existence) => res.status(200).json(existence.data.isExisted))
    .catch((error) =>
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error)
    );
};

/**
 * POST to creat wrapped document
 * @param {Object} wrappedDocument JSON object wrapped document, including did, hash and address.
 * @param {}
 * @returns {Object} message
 */
exports.createWrappedDocument = async function (req, res) {
  // Get access-token from request
  const access_token = req.cookies['access_token'];

  const { wrappedDocument, issuerAddress: encryptedIssuerAddress, did } = req.body;
  if (!wrappedDocument || !encryptedIssuerAddress || !did) {
    return res.status(400).send("Missing parameters.");
  }
  const didComponents = did.split(":");
  if (didComponents.length < 4 || didComponents[0] !== "did") {
    return res.status(400).send("Invalid DID syntax.");
  }
  const companyName = didComponents[2],
    fileName = didComponents[3],
    targetHash = wrappedDocument.signature.targetHash,
    issuerAddress = getAddressFromHexEncoded(encryptedIssuerAddress);

  try {
    // 1. Validate permission to create document. 
    // 1.1 Get address of user from the acess token. 
    const address = await axios.get(AUTHENTICATION_SERVICE + "/api/auth/verify",
      {
        withCredentials: true,
        headers: {
          "Cookie": `access_token=${access_token};`
        }
      });
    // 1.2 Compare
    if (issuerAddress !== address.data.data.address)
      return res.status(400).send("DUNG LAI");
    // 2. Check if document is already stored on DB (true/false).
    const existence = await axios.get(DID_CONTROLLER + "/api/doc/exists/",
      {
        headers: {
          companyName,
          fileName,
        },
      });
    if (existence.data.isExisted) {
      return res.status(400).send("File name exsited");
    }
    console.log(1, access_token)
    // 3. Storing hash on Cardano blockchain
    const mintingNFT = await axios.put(CARDANO_SERVICE + "/api/storeHash/",
      {
        address: issuerAddress,
        hashOfDocument: targetHash,
        // previousHashOfDocument: ""
      },
      {
        withCredentials: true,
        headers: {
          "Cookie": `access_token=${access_token}`
        }
      });
    if (mintingNFT.error_code) {
      return res.status(400).send('Storing has error.');
    }
    // console.log(mintingNFT) policyId
    if (!mintingNFTStatus) return res.status(400).send("Cannot store hash.");
    const mintingNFTStatus = (mintingNFT.data.data.result) ? mintingNFT.data.data.result : false;
    const policyId = mintingNFTStatus ? mintingNFT.data.data.token.policyId : "No policyId";


    // 4. Storing wrapped document on DB
    const storingWrappedDocumentStatus = await axios.post((DID_CONTROLLER + "/api/doc"),
      {
        fileName,
        wrappedDocument,
        companyName,
      }
    );
    return res.status(200).json(policyId);
  } catch (err) {
    console.log("CATCH ERROR");
    console.log(err);
    return err.response
      ? res.status(400).json(err.response.data)
      : res.status(400).json(err);
  }
};

/** GET to receive didDocument and wrappedDocument of a document
 * @param {String} did
 * @param {boolean} didDocument 
 * @param {boolean} wrappedDocument
 * @returns {Object} 
 */
exports.getDocuments = async function (req, res) {
  const { did } = req.headers;
  console.log(did);
  const { exclude } = req.query;
  console.log(exclude);
  if (!did)
    return res.status(400).send("Missing parameters.");

  const didComponents = did.split(":");
  if (didComponents.length < 6 || didComponents[2] != "did")
    return res.status(400).send("Invalid DID syntax.");

  await axios.get(DID_CONTROLLER + "/api/doc", {
    headers: {
      companyName: didComponents[4],
      fileName: didComponents[5]
    },
    params: {
      exclude
    }
  })
    .then((response) => {
      console.log(response)
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error)
    });
};

exports.getNfts = async function (req, res) {
  const access_token = req.cookies['access_token'];
  const { policyid } = req.headers;
  if (!policyid) return res.status(400).send("Missing parameters.");
  await axios.get(`${CARDANO_SERVICE}/api/getNFTs/${policyid}`, {
    withCredentials: true,
    headers: {
      "Cookie": `access_token=${access_token}`
    }
  })
    .then((response) => {
      console.log(response)
      return res.status(200).json(response.data)
    })
    .catch(error => {
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error)
    })
}

exports.verifyHash = async function (req, res) {
  const { hashOfDocument, policyId } = req.headers;
  if (!hashOfDocument || !policyId)
    return res.status(400).send("Missing parameters.");

  await axios.get(`${CARDANO_SERVICE}/api/verifyHash/?hashOfDocument=${hashOfDocument}&policyId=${policyId}`)
    .then((response) => res.status(200).json(response.data))
    .catch(error => {
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error)
    })
}

exports.verifySignature = async function (req, res) {
  const { address, payload, signature } = req.headers;
  if (!address || !payload || !signature)
    return res.status(400).send("Missing parameters.");

  await axios.post(CARDANO_SERVICE + "/api/verifySignature", {
    address,
    payload,
    signature
  })
    .then((response) => res.status(200).json(response.data))
    .catch((error) => {
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error)
    })
}