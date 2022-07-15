const axios = require("axios").default;
const { ERRORS, SERVERS } = require("../../core/constants");

/** GET to receive DID document and/or wrapped document of a DID string (DID of doucment)
 * @param {string} did DID string. Ex: <uuid>:??:did:<method>:<company>:<publicKey>
 * @param {string} exclude "did" --> return wrapped document only; "doc" --> return DID docment only; "" or undefined --> return both DID document & wrapped document
 * @returns {Object} DIDdocument and/or wrapped document
 */
exports.getDocuments = async function (req, res) {
  // Receive input data
  const { did } = req.headers;
  const { exclude } = req.query;

  // Handle input errors
  if (!did)
    return res.status(400).json(ERRORS.MISSING_PARAMETERS);

  const didComponents = did.split(":");
  if (didComponents.length < 6 || didComponents[2] != "did")
    return res.status(400).json(ERRORS.INVALID_INPUT);

  // Call DID Controller
  await axios.get(`${SERVERS.DID_CONTROLLER}/api/doc`, {
    headers: {
      companyName: didComponents[4],
      fileName: didComponents[5]
    },
    params: { exclude }
  })
    .then((response) => {
      console.log(response);
      response.data.errorCode
        ? res.status(404).send(response.data.message)
        : res.status(200).json(response.data);
    })
    .catch((error) => {
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error)
    });
};

// exports.createDIDDocument = async function (req, res) {
//     const { did, didDocument } = req.body;
//     if (!did || !didDocument)
//         return res.status(200).json(ERRORS.DID_CONTROLLER)

//     const didComponents = did.split(":");
//     if (didComponents.length < 4 || didComponents[0] != "did")
//         return res.status(400).json("Invalid DID syntax.");

//     const companyName = didComponents[2];
//     const publicKey = didComponents[3];
//     await axios
//         .post(DID_CONTROLLER + "/api/did/",
//             {
//                 companyName: companyName,
//                 publicKey: publicKey,
//                 content: didDocument,
//             })
//         .then((response) => {
//             response.data.errorCode
//                 ? res.status(400).json(response.data)
//                 : res.status(201).send("DID Document created.")
//         })
//         .catch((error) => {
//             console.log(error);
//             res.status(400).json(error.response?.data)
//         });
// };