module.exports.createDidDocument = {
  post: {
    tags: ["DID document"],
    summary: "Create DID document for a given DID",
    parameters: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              did: {
                type: "string",
                example: "did:method:giabuynh:srs"
              },
              didDocument: {
                type: "object",
                properties: {
                  controller: {
                    type: "string"
                  },
                  id: {
                    type: "string",
                  },
                  date: {
                    type: "string"
                  }
                },
                example: {
                  $ref: "#/components/examples/didDocumentContent"
                }
              }
            }
          },
        }
      }
    },
    responses: {
      201: {
        description: "Created. New DID document is successfully created.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "DID Document created."
            }
          }
        }
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
              $ref: "#/components/schemas/errorMessageDIDController"
            }
          }
        }
      }
    }
  }
}