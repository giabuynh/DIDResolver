const axios = require("axios").default;
const { checkUndefinedVar } = require("../../core");
const { ERRORS, SERVERS } = require("../../core/constants");
const Logger = require("../../logger");

module.exports = {
  getNFTs: async function (req, res) {
    const { access_token } = req.cookies;
    const { policyid: policyId } = req.headers;

    try {
      // Handle input errors
      const undefinedVar = checkUndefinedVar({ policyId });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Call Cardano Service
      // success:
      // v2
      //   {
      //     code: 0,
      //     message: string,
      //     data: [] or {}
      //   }
      // error:
      //   { code: 1, message: string }
      const { data } = await axios.post(
        `${SERVERS.CARDANO_SERVICE}/api/v2/fetch/nft`,
        {
          // (opt) asset: 41ac0d6b1287d7abd2c0443566cf34f95f1ec7e338dc18653fcedcb4ec9df0f3318725fa3c636ee118d233cadf8bd4a6f654c89f164d1169cc473cdc
          policyId: policyId, // 41ac0d6b1287d7abd2c0443566cf34f95f1ec7e338dc18653fcedcb4
        },
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
        }
      );

      if (data.code) {
        Logger.apiError(req, res, `${JSON.stringify(data)}`);
        return res.status.json(ERRORS.CANNOT_FETCH_NFT);
      } else {
        Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);
        return res.status(200).json(data.data);
      }
    } catch (error) {
      Logger.apiInfo(req, res, `${JSON.stringify(error)}`);
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  verifyHash: async function (req, res) {
    // Receive input data
    const { access_token } = req.cookies;
    const { hashofdocument, policyid } = req.headers;

    try {
      // Handle input errors
      const undefinedVar = checkUndefinedVar({ hashofdocument, policyid });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Call Cardano Service
      // v2
      // success:
      //   {
      //     code: 0,
      //     message: string,
      //     data: [] or {}
      //   }
      // error:
      //   { code: 1, message: string }
      let query = { policyId: policyid },
        undefinedCheck = { policyid };
      if (hashofdocument) {
        query = { asset: `${policyid}${hashofdocument}` };
        undefinedCheck = { ...undefinedCheck, hashofdocument };
      }

      const { data } = await axios.post(
        `${SERVERS.CARDANO_SERVICE}/api/v2/fetch/nft`,
        query,
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token}`,
          },
        }
      );

      if (data.code) {
        Logger.apiError(req, res, `${JSON.stringify(data)}`);
        return res.status.json(ERRORS.CANNOT_FETCH_NFT);
      } else {
        Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);
        return res.status(200).json(data.data);
      }
    } catch (error) {
      Logger.apiError(req, res, error);
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  verifySignature: async function (req, res) {
    // Receive input data
    const { access_token } = req.cookies;
    const { address, payload, signature, key } = req.headers;

    try {
      // Handle input error
      const undefinedVar = checkUndefinedVar({
        address,
        payload,
        signature,
        key,
      });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Call Cardano Service
      // success:
      //   {
      //     code: 0,
      //     message: string,
      //     data: true/false
      //   }
      // error:
      //   { code: 1, message: string }
      const { data } = await axios.post(
        SERVERS.CARDANO_SERVICE + "/api/v2/verify/signature",
        {
          address: address,
          payload: payload,
          signature: signature,
          key: key,
        },
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token}`,
          },
        }
      );

      data.code
        ? Logger.apiError(req, res, `${JSON.stringify(data)}`)
        : Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);
      return res.status(200).json(data.data);
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },
};