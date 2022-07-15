const axios = require("axios").default;
const { ERRORS, SERVERS } = require("../../core/constants");

module.exports = {
  setCookie: async (req, res, next) => {
    const { access_token } = req.headers;
    res.cookie("access_token", access_token);
    res.send("Set Cookie Successfully.");
  },

  clearCookie: async (req, res, next) => {
    res.clearCookie("access_token");
    res.send("Clear Cookie Successfully.");
  },
};
