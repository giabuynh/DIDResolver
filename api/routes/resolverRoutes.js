module.exports = function(app) {
    var resolver = require("../controllers/resolverController");

    app.route("/resolver/did-document")
        .get(resolver.getDIDDocument)
        .post(resolver.createDIDDocument);
        
    app.route("/resolver/wrapped-document")
        .post(resolver.createWrappedDocument);
}

