const SCHEMAS = require("./schemas");
const EXAMPLES = require("./examples");
// const { wrappedDocumentSchema } = require("./schemas/wrappedDocument.js");

module.exports.schemas = {
  errorMessageDIDController: {
    type: "object",
    properties: {
      errorCode: {
        type: "integer",
        summary: "Error Code.",
      },
      message: {
        type: "string",
        summary: "Error message from DIDController.",
      }
    }
  },
  didDocument: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of DID document, usually is DID string.",
        example: "did:method:giabuynh:srs"
      },
      content: {
        type: "object",
        properties: {

        },
        description: "Example content in JSON format.",
        example: {
          date: "10-10-2000"
        }
      }
    }
  },
  didDocumentOfWrappedDocument: {
    ...SCHEMAS.didDocumentOfWrappedDocument
  },
  // didDocumentOfWrappedDocument: {
  //   type: "object",
  //   properties: {
  //     controller: {
  //       type: "string",
  //       description: "",
  //       example: ""
  //     },
  //     did: {
  //       type: "string",
  //       description: "",
  //       example: ""
  //     },
  //     docController: {
  //       type: "string",
  //       description: "",
  //       example: ""
  //     },
  //     url: {
  //       type: "string",
  //       description: "",
  //       example: ""
  //     }
  //   }
  // },
  wrappedDocument: {
    ...SCHEMAS.wrappedDocument
  }
}

module.exports.examples = {
  didDocumentContent: {
    controller: "someonePublicKey",
    id: "did:method:giabynh:srs",
    date: "10-10-2000"
  },
  wrappedDocument: {
    ...EXAMPLES.wrappedDocument
  }
}