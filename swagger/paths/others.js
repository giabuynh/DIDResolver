
module.exports.getNFTs = {
  get: {
    tags: ["Others"],
    summary: "",
    parameters: [
      {
        in: "cookie",
        name: "access_token",
        type: "string",
        require: true,
        description: "Access token of current user.",
        // default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      },
      {
        in: "header",
        name: "policyid",
        type: "string",
        require: true,
        description: "Policy Id",
        default: "1050dd64e77e671a0fee81f391080f5f57fefba2e26a816019aa5524",
        // example: "did:method:companyName:publicKey",
      }
    ],
    responses: {
      200: {
        description: "",
        content: {
          "application/json": {
            example: {
              "nfts": [
                {
                  "unit": "199062e26a0ea1370249e71e6224c6541e7825a192fe42c57aa538c341616461476f6c64656e526566657272616c31363339303438343435",
                  "quantity": 1
                }
              ]
            }
          }
        }
      },
      400: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": { $ref: "#/components/examples/errorMissingParameters" }
            }
          }
        }
      },
      401: { $ref: "#/components/responses/Unauthorized" }
    }
  }
}


module.exports.verifyHash = {
  get: {
    tags: ["Others"],
    summary: "",
    parameters: [
      {
        in: "cookie",
        name: "access_token",
        type: "string",
        require: true,
        description: "Access token of current user.",
        // default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      },
      {
        in: "header",
        name: "hashOfDocument",
        type: "string",
        require: true,
        description: "Hash of document",
        // default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      },
      {
        in: "header",
        name: "policyId",
        type: "string",
        require: true,
        description: "Policy Id of document",
        // default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      }
    ],
    responses: {
      200: {
        description: "OK. Return a conforming DID document.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    result: { type: "boolean" }
                  }
                }
              }
            }
          }
        }
      },
      400: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": { $ref: "#/components/examples/errorMissingParameters" }
            }
          }
        }
      },
      401: { $ref: "#/components/responses/Unauthorized" }
    }
  }
}

module.exports.verifySignature = {
  get: {
    tags: ["Others"],
    summary: "",
    parameters: [
      {
        in: "cookie",
        name: "access_token",
        type: "string",
        require: true,
        description: "Access token of current user.",
        // default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      },
      {
        in: "header",
        name: "address",
        type: "string",
        require: true,
        description: "",
        // default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      },
      {
        in: "header",
        name: "payload",
        type: "string",
        require: true,
        description: "",
        // default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      },
      {
        in: "header",
        name: "signature",
        type: "string",
        require: true,
        description: "",
        // default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              did: {
                type: "string",
                example: "did:method:Kukulu:public_key"
              },
              didDocument: {
                $ref: "#/components/schemas/didDocument"
              }
            }
          },
        }
      }
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    result: { type: "boolean" }
                  }
                }
              }
            }
          }
        }
      },
      400: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": { $ref: "#/components/examples/errorMissingParameters" }
            }
          }
        }
      },
      401: { $ref: "#/components/responses/Unauthorized" }
    }
  }
}