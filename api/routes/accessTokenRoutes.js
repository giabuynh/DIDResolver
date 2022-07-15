const express = require("express");
const accessTokenController = require("../controllers/accessTokenController");
const router = express.Router();

router
  .route("/")
  .post(accessTokenController.setCookie)
  .delete(accessTokenController.clearCookie);

module.exports = router;
