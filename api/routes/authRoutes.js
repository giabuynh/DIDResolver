const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.ensureAuthenticated);

router.get("/auth/public-key", authController.getPublicKeyFromAddress);

module.exports = router;
