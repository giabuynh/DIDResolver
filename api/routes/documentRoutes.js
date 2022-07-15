const express = require("express");
const documentController = require("../controllers/documentController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.ensureAuthenticated);

router.get("/did-document", documentController.getDIDDocument);
router.post("/did-document", documentController.createDIDDocument);

router.get("/wrapped-document", documentController.getWrappedDocument);
router.post("/wrapped-document", documentController.createWrappedDocument);
router.put("/wrapped-document/valid", documentController.validateWrappedDocument);
router.get("/wrapped-document/exist", documentController.checkWrappedDocumentExistence);
router.get("/wrapped-document/user", documentController.getAllWrappedDocumentsOfUser);
router.put("/wrapped-document/transfer", documentController.transferWrappedDocument);

module.exports = router;