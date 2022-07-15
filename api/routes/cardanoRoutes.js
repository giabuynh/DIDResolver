const express = require("express");
const cardanoController = require("../controllers/cardanoController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.ensureAuthenticated);

router.get("/nfts", cardanoController.getNFTs);
router.get("/hash/verify", cardanoController.verifyHash);
router.get("/signature/verify", cardanoController.verifySignature);

module.exports = router;