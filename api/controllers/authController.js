const axios = require("axios").default;
const Logger = require("../../logger");
const { ERRORS, SERVERS } = require("../../core/constants");
const {
  getPublicKeyFromAddress,
  getAddressFromHexEncoded,
} = require("../../core/index");

module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (!req.cookies["access_token"]) {
      Logger.apiError(req, res, `Not found: access_token.`);
      return res.status(200).json(ERRORS.UNAUTHORIZED);
    }

    console.log(1);

    const token = req.cookies["access_token"];
    // Call Auth Service
    // success:
    //   { data: { address: string } }
    // error: 401 - unauthorized
    axios
      .get(`${SERVERS.AUTHENTICATION_SERVICE}/api/auth/verify`, {
        withCredentials: true,
        headers: {
          Cookie: `access_token=${token};`,
        },
      })
      .then(
        (response) => {
          Logger.apiInfo(req, res, `Successfull authentication.`);
          var response = response.data;
          req.userData = {
            token,
            address: response.address,
          };
          next();
        },
        (error) => {
          console.log(2, error);
          if (
            error.response?.data === "Unauthorized" &&
            error.response?.status === 401
          ) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
          }
          Logger.apiError(req, res, `${JSON.stringify(error)}`);
          next(error);
        }
      );
  },

  requestGetPublicKeyFromAddress: (req, res) => {
    const { address, user, confirmNominate } = req.query;
    const returnKey = getPublicKeyFromAddress(address);
    try {
      console.log("Returnkey: ", returnKey);
      Logger.apiInfo(req, res, `User: ${user}, address: ${address}`);
      return res.status(200).json({
        publicKey: returnKey,
        user: user,
      });
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      return res.status(400).json(error);
    }
  },

  verifyToken: async (req, res) => {
    console.log(1);
    if (!req.cookies["access_token"])
      return res.status(401).json(ERRORS.UNAUTHORIZED);
    const token = req.cookies["access_token"];
    console.log(2);
    try {
      const { data } = await axios.get(
        `${SERVERS.AUTHENTICATION_SERVICE}/api/auth/verify`,
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${token};`,
          },
        }
      );
      console.log(3, data);

      Logger.apiInfo(req, res, `Success.\n${JSON.stringify(data)}`);
      return res.status(200).json({
        address: getPublicKeyFromAddress(data?.data?.address),
      });
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      return error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },
};
