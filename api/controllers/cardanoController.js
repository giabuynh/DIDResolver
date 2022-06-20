const axios = require("axios").default;
const { ERRORS, SERVERS } = require("../../core/constants");

module.exports = {
  getNFTs: async function (req, res) {
    // Receive input data
    const access_token = req.cookies['access_token'];
    const { policyid: policyId } = req.headers;

    // Handle input errors
    if (!policyId) return res.status(400).json({
      ...ERRORS.MISSING_PARAMETERS,
      detail: "Not found: policiid"
    });

    // Call Cardano Service
    // success:
    //   {
    //     data: {
    //       nfts: [
    //         {
    //           unit: "199062e26a0ea1370249e71e6224c6541e7825a192fe42c57aa538c341616461476f6c64656e526566657272616c31363339303438343435",
    //           quantity: 1
    //         }
    //       ]
    //     }
    //   }
    // error:
    //   { error_code: number, error_message: string }
    await axios
      .get(`${SERVERS.CARDANO_SERVICE}/api/getNFTs/${policyId}`,
        {
          withCredentials: true,
          headers: {
            "Cookie": `access_token=${access_token}`
          }
        })
      .then((response) => {
        console.log(response)
        response.error_code
          ? res.status(400).json(response.data)
          : res.status(200).json(response.data);
      })
      .catch(error => {
        return error.response
          ? res.status(400).json(error.response.data)
          : res.status(400).json(error)
      })
  },

  verifyHash: async function (req, res) {
    // Receive input data
    const access_token = req.cookies['access_token'];
    const { hashofdocument: hashOfDocument, policyid: policyId } = req.headers;
    console.log(policyid)

    // Handle input errors
    if (!hashOfDocument || !policyId)
      return res.status(400).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail: "Not found:"
          + (!hashOfDocument) ? " hashOfDocument" : ""
            + (!policyId) ? " policyId" : ""
      });

    // Call Cardano Service
    // succes:
    //   { data: { result: true/false } }
    // error:
    //   { error_code: number, error_message: string }
    await axios
      .get(`${SERVERS.CARDANO_SERVICE}/api/verifyHash?policyID=${policyId}&hashOfDocument=${hashOfDocument}`, {
        withCredentials: true,
        headers: {
          "Cookie": `access_token=${access_token}`
        }
      })
      .then((response) => res.status(200).json(response.data))
      .catch(error => {
        return error.response
          ? res.status(400).json(error.response.data)
          : res.status(400).json(error)
      })
  },

  verifySignature: async function (req, res) {
    // Receive input data
    const access_token = req.cookies['access_token'];
    const { address, payload, signature } = req.headers;

    // Handle input error
    if (!address || !payload || !signature)
      return res.status(400).json({
        ...ERRORS.MISSING_PARAMETERS,
        detail: "Not found:"
          + (!address) ? " address" : ""
            + (!payload) ? " payload" : ""
              + (!signature) ? " signature" : ""
      });

    // Call Cardano Service
    // success:
    //   { data: { result: true/false } }
    // error:
    //   { error_code: number, error_message: string }      
    await axios.post(SERVERS.CARDANO_SERVICE + "/api/verifySignature",
      {
        address: address,
        payload: payload,
        signature: signature
      },
      {
        withCredentials: true,
        headers: {
          "Cookie": `access_token=${access_token}`
        }
      })
      .then((response) => res.status(200).json(response.data))
      .catch((error) => {
        return error.response
          ? res.status(400).json(error.response.data)
          : res.status(400).json(error)
      })
  },
}