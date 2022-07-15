const axios = require("axios").default;
const { ERRORS, SERVERS } = require("../../core/constants");
const { getPublicKeyFromAddress } = require("../../core/index");

module.exports = {
  ensureAuthenticated: (req, res, next) => {
    console.log("AUTHENTICATING...");
    console.log(req.cookies);

    if (!req.cookies["access_token"])
      return res.status(401).json(ERRORS.UNAUTHORIZED);

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
          var response = response.data;
          req.userData = {
            token,
            address: response.address,
          };
          next();
        },
        (error) => {
          console.log(error);
          next(error);
        }
      );
  },

  getPublicKeyFromAddress: (req, res) => {
    console.log("Get public key from address...");
    const { address } = req.query;

    try {
      res.status(200).json({
        publicKey: getPublicKeyFromAddress(address),
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },
};
