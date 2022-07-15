const { checkWrappedDocumentExistence } = require("./wrappedDocument");

module.exports.getDocument = {
  get: {
    tags: ["Others"],
    summary: "Get DID document and/or wrapped document by a DID.",
    parameters: [
      {
        in: "header",
        name: "did",
        type: "string",
        require: true,
        description: "DID string. Syntax: did:method:companyName:publicKey.",
        example: "did:method:companyName:publicKey",
        default: "did:method:giabuynh:srs"
      },
      {
        in: "query",
        name: "exclude",
        type: "string",
        require: false,
        description: "Optional parameter to receive DID document and/or wrapped document.",
        example: "'did' for receiving wrapped document onely. 'doc' for receiving DID document only. '' or undefined for receiving both DID document and wrapped document.",
        default: ""
      }
    ],
    responses: {
      200: {
        description: "Return documents.",
        content: {
          "application/json": {
            schema: {
              $ref: "#components/schemas/wrappedDocument",
              // oneOf: {
              //   $ref: "#/components/schemas/didDocumentOfWrappedDocument",
              //   $ref: "#/components/schemas/wrappedDocument",
              // }
              // type: "object",
              // propeties: {
              //   wrapDoc: {
              //     type: "object"
              //   },
              //   didDoc: {
              //     type: "object"
              //   }
              // },
              // example: {
              //   "wrapDoc": {},
              //   "didDoc": {}
              // }
            }
          }
        },
      },
      400: {
        description: "Bad request. Input DID is invalid or undefined.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Missing parameters."
            }
          },
          "application/json": {
            schema: {
              type: "object",
              example: {}
            }
          }
        }
      },
      404: {
        description: "Not found. DID document or/and wrapped document are not found.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "File/Public Key with the given value cannot be found."
            }
          }
        }
      }
    }
  }
}