const { response } = require("express");

const axios = require("axios").default;
const DID_CONTROLLER = "http://localhost:9000";
const CARDANO_SERVICE = "http://localhost:10000";

/**
 * POST to create DID Doc for a DID
 * @param {String} did DID string of user/company. Syntax did:tradetrust:<companyName>:<publicKey>
 * @param {Object} didDocument JSON object is a DID Document
 * @returns {Object} DID Document of DID
 */
exports.createDIDDocument = async function (req, res) {
    const { did, didDocument } = req.body;
    if (!did || !didDocument)
        return res.status(400).send("Missing parameters.");

    const didComponents = did.split(":");
    if (didComponents.length < 4 || didComponents[0] != "did")
        return res.status(400).json("Invalid DID syntax.");

    const companyName = didComponents[2];
    const publicKey = didComponents[3];
    await axios.post(DID_CONTROLLER + "/api/did/", {
        companyName: companyName,
        publicKey: publicKey,
        content: didDocument
    })
    .then((response) => res.status(201).json(response.data))
    .catch((error) => res.status(400).json(error.response.data));
}


/**
 * GET request to resolve DID
 * @param {String} did syntax is did:tradetrust:<companyName>:<documentName>:<somehash>
 * @returns {Object} DID Document of DID
 */
exports.getDIDDocument = async function(req, res) {
    const { did } = req.headers;
    if (!did)
        return res.status(400).send("Missing parameters.");

    const didComponents = did.split(":");
    if (didComponents.length < 4 || didComponents[0] != "did")
        return res.status(400).send("Invalid DID syntax.");

    const companyName = didComponents[2];
    const fileName = didComponents[3];
    await axios.get(DID_CONTROLLER + "/api/did/", {
        headers: {
            companyName: companyName,
            fileName: fileName
        }
    })
    .then((response) => res.status(200).json(response.data))
    .catch((error) => res.status(400).json(error.response.data));
}

/**
 * POST to creat wrapped document
 * @param {Object} wrappedDocument JSON object wrapped document, including did, hash and address.
 * @returns {JSON} message
 */
exports.createWrappedDocument = async function(req, res) {
    const { wrappedDocument } = req.body;  
    if (!wrappedDocument || !wrappedDocument.data.ddidDocument)
        return res.status(400).send("Missing parameters.");
    
    const did = wrappedDocument.data.ddidDocument,
         didComponents = did.split(":");
    if (didComponents.length < 6) 
        return res.status(400).send("Invalid DID syntax.");

    const companyName = didComponents[4], 
        fileName = didComponents[5],
        address = wrappedDocument.data.issuers[0].address,
        targetHash = wrappedDocument.signature.targetHash;

    await axios.get(DID_CONTROLLER + "/api/doc/exists/", {
        headers: {
            companyName: companyName,
            fileName: fileName
        }
    })
    .then((existence) => {
        (existence.data.isExisted) ? res.status(400).send("File name existed") :
            axios.put(CARDANO_SERVICE + "/api/storeHash/", {
                address,
                hash: targetHash
            })
            .then((storingHashStatus) => {
                const status = storingHashStatus.data.result;
                // const status = "true";
                console.log(status);
                (status !== "true") ? res.status(400).send( status, ". Cannot store hash") :
                    axios.post(DID_CONTROLLER + "/api/doc/", {
                        fileName,
                        wrappedDocument,
                        companyName
                    })
                    .then((storingWrappedDocumentStatus) => {
                        console.log("Stored data");
                        return res.status(200).json(storingWrappedDocumentStatus.data);
                    })
                    .catch((error) => {
                        console.log("ERROR WHEN STORING WRAPPED DOCUMENT");
                        return (error.response) ? res.status(400).json(error.response.data) : res.status(400).json(error);
                    }); 
            })
            .catch((error) => {
                console.log("ERROR WHEN STORING HASH");
                console.log(error);
                return (error.response) ? res.status(400).json(error.response.data) : res.status(400).json(error);
            }); 
    })
    .catch((error) => {
        console.log("ERROR WHEN CHECKING EXISTANCE");
        return (error.response) ? res.status(400).json(error.response.data) : res.status(400).json(error);
    });
}
