// const { response } = require("express");

const axios = require("axios").default;
const { parseCookies, ensureAuthenticated } = require("../../core/index");
const DID_CONTROLLER = "http://localhost:9000";
const CARDANO_SERVICE = "http://18.139.84.180:10000";
// const CARDANO_SERVICE = "http://localhost:10000";
// const AUTHENTICATION_SERVICE = "http://18.139.84.180:12000";
const AUTHENTICATION_SERVICE = "http://localhost:12000";

/**
 * POST to create DID Doc for a DID
 * @param {String} did DID string of user/company. Syntax did:tradetrust:<companyName>:<publicKey>
 * @param {Object} didDocument JSON object is a DID Document
 * @returns {Object} DID Document of DID
 */
exports.createDIDDocument = async function (req, res) {
  const { did, didDocument } = req.body;
  if (!did || !didDocument) return res.status(400).send("Missing parameters.");

  const didComponents = did.split(":");
  if (didComponents.length < 4 || didComponents[0] != "did")
    return res.status(400).json("Invalid DID syntax.");

  const companyName = didComponents[2];
  const publicKey = didComponents[3];
  await axios
    .post(DID_CONTROLLER + "/api/did/", {
      companyName: companyName,
      publicKey: publicKey,
      content: didDocument,
    })
    .then((response) => res.status(201).json(response.data))
    .catch((error) => res.status(400).json(error.response.data));
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
    .get(DID_CONTROLLER + "/api/did/", {
      headers: {
        companyName: companyName,
        fileName: fileName,
      },
    })
    .then((response) => res.status(200).json(response.data))
    .catch((error) =>
      error.response
        ? res.status(404).json(error.response.data)
        : res.status(400).json(error)
    );
};

exports.checkWrappedDocumentExistence = async function (req, res) {
  const { fileName, companyName } = req.body; //heaer
  console.log(req.body);
  if (!fileName || !companyName)
    return res.status(400).send("Missing parameters.");

  await axios.get(DID_CONTROLLER + "/api/doc/exists/", {
      headers: {
        fileName,
        companyName,
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
 * @returns {JSON} message
 */
exports.createWrappedDocument = async function (req, res) {
  // console.log('REQUEST HEADER:\n', req.headers);
  // const cookies = parseCookies(req);
  // console.log(cookies)
  // console.log('Cookie', cookies);
  list = {};
  var { access_token } = req.headers;
  // let [ name, ...rest] = access_token.split(`=`);
  // name = name?.trim();
  // if (!name) return;
  // const value = rest.join(`=`).trim();
  // if (!value) return;
  // list[name] = decodeURIComponent(value);
  // console.log("list", list);
  // access_token = list.access_token;
  console.log("access_token", access_token);

  const { wrappedDocument, address, did } = req.body;
  if (!wrappedDocument || !wrappedDocument.data.ddidDocument) {
     return res.status(400).send("Missing parameters."); 
  }
    // const access_token = cookies.access_token,
  const didComponents = did.split(":");
  if (didComponents.length < 4) {
    return res.status(400).send("Invalid DID syntax.");
  }
  const companyName = didComponents[2],
    fileName = didComponents[3],
    issuerAddress = wrappedDocument.data.issuers[0].address,
    targetHash = wrappedDocument.signature.targetHash;

  try {
    // const address = await axios.get(AUTHENTICATION_SERVICE + "/api/auth/verify", {
    //     withCredentials: true,
    //     headers: {
    //         "Cookie": `access_token=${access_token};`,
    //     }
    // });
    const address = await axios.get(
      "http://192.168.1.26:12000" + "/api/auth/verify", {
        withCredentials: true,
        headers: {
          Cookie: `access_token=${access_token};`,
        },
      }
    );
    // Get from dApp: encoded address
    // if (address !== issuerAddress)
    //     return res.status(401).send("Unauthorized");

    const existence = await axios.get(DID_CONTROLLER + "/api/doc/exists/", {
      headers: {
        companyName,
        fileName,
      },
    });
    if (existence.data.isExisted) {
      return res.status(400).send("File name exsited");
    }
    const storingHash = await axios.put(CARDANO_SERVICE + "/api/storeHash/", {
        address: address.data.data.address,
        hash: targetHash,
    }, {
      withCredentials: true,
      headers: {
        "Cookie": `access_token=${access_token};`,
      }
    });
    if(storingHash.error_code) {
        return res.status(400).send('Storing has error.')
    }
    const storingHashStatus = (storingHash.data.result) ? storingHash.data.result : false;
    console.log(storingHash.data);
    if (storingHashStatus !== "true") {
      return res.status(400).send(storingHashStatus, ". Cannot store hash.");
    }

    const storingWrappedDocumentStatus = await axios.post(
      (DID_CONTROLLER = "/api/docs"),
      {
        fileName,
        wrappedDocument,
        companyName,
      }
    );
    console.log(storingWrappedDocumentStatus.data);
    return res.status(200).json(storingWrappedDocumentStatus.data);
  } catch (err) {
    // console.log(err);
    return err.response
      ? res.status(400).json(err.response.data)
      : res.status(400).json(err);
  }
};
