module.exports.getWrappedDocument = {
  get: {
    tags: ["Wrapped document"],
    summary: "Get wrapped document and/or its DID document by a given DID.",
    parameters: [
      {
        in: "header",
        name: "did",
        type: "string",
        require: true,
        description: "DID string. Syntax: did:method:companyName:publicKey.",
        example: "did:method:Kukulu:file_name",
      },
      {
        in: "query",
        name: "only",
        type: "string",
        require: false,
        description: "Optional parameter to receive DID document and/or wrapped document.",
        examples: {
          "empty": {
            "value": "",
            "summary": "'' or undefined for receiving both DID document and wrapped document"
          },
          "did": {
            "value": "did",
            "summary": "'did' for receiving DID document only."
          },
          "doc": {
            "value": "doc",
            "summary": "'doc' for receiving wrapped document only."
          }
        }
      }
    ],
    responses: {
      200: {
        description: "Return documents.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                didDoc: { $ref: "#/components/schemas/didDocumentOfWrappedDocument" },
                wrappedDoc: { $ref: "#/components/schemas/wrappedDocument" }
              }
            },
          }
        },
      },
      400: {
        description: "Missing parameters or invalid input",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": { $ref: "#/components/examples/errorMissingParameters" },
              "Invalid input": { $ref: "#/components/examples/errorInvalidInput" }
            }
          }
        }
      },
      404: {
        $ref: "#/components/responses/NotFound_DIDDocument"
      }
    }
  }
}

module.exports.getAllWrappedDocumentsOfUser = {
  get: {
    tags: ["Wrapped document"],
    summary: "Get all wrapped document of a user given user's DID.",
    parameters: [
      {
        in: "header",
        name: "did",
        type: "string",
        require: true,
        description: "DID string. Syntax: did:method:companyName:publicKey.",
        example: "did:method:Kukulu:uuid:string:address",
        // default: "did:method:giabuynh:srs"
      }
    ],
    responses: {
      200: {
        description: "Return array containind all wrapped documents of users.",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/wrappedDocument"
              }
            },
          }
        },
      },
      400: {
        description: "Missing parameters or invalid input",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": { $ref: "#/components/examples/errorMissingParameters" },
              "Invalid input": { $ref: "#/components/examples/errorInvalidInput" }
            }
          }
        }
      },
      404: {
        $ref: "#/components/responses/NotFound_DIDDocument"
      }
    }
  }
}

module.exports.checkWrappedDocumentExistence = {
  get: {
    tags: ["Wrapped document"],
    summary: "Check existence of a given wrapped document of a company.",
    parameters: [
      {
        in: "header",
        name: "fileName",
        type: "string",
        require: true,
        description: "Name of wrapped file.",
        example: "file_name"
      },
      {
        in: "header",
        name: "companyName",
        type: "string",
        require: true,
        description: "Name of company.",
        example: "Kukulu"
      }
    ],
    responses: {
      200: {
        description: "Return true/false value representing the exsitence of the given wrapped document name in the given company storage.",
        content: {
          "text/plain": {
            schema: {
              type: "boolean"
            }
          }
        }
      },
      400: {
        description: "Missing parameters or invalid input",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": { $ref: "#/components/examples/errorMissingParameters" },
              "Invalid input": { $ref: "#/components/examples/errorInvalidInput" }
            }
          }
        }
      }
    }
  }
}

module.exports.createWrappedDocument = {
  post: {
    tags: ["Wrapped document"],
    summary: "Receive and valiate wrapped document from dApp and call services to hash and store data.",
    parameters: [
      {
        in: "cookie",
        name: "access_token",
        type: "string",
        require: true,
        description: "Access token of current user",
        // default: "did:method:Kukulu:public_key",
      }
    ],
    requestBody: {
      require: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              wrappedDocument: {
                $ref: "#/components/schemas/wrappedDocument"
              },
              issuerAddress: {
                type: "string",
                example: "???"
              },
              // did: {
              //   type: "string",
              //   example: ""
              // }
            }
          }
        }
      }
    },
    responses: {
      201: {
        description: "New wrapped document is successfully created.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/wrappedDocument" }
          }
        }
      },
      400: {
        description: "Missing parameters or invalid input",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": { $ref: "#/components/examples/errorMissingParameters" },
              "Invalid input": { $ref: "#/components/examples/errorInvalidInput" }
            }
          }
        }
      },
      401: {
        description: "Cannot verify user with the given access token.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Unauthorized."
            }
          },
        }
      },
      403: {
        description: "User is not allow to create wrapped document.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Permission denied": { $ref: "#/components/examples/errorPermissionDenied" }
            }
          }
        }
      },
      409: {
        description: "Wrapped document with the same name is created.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Already existed": { $ref: "#/components/examples/errorAlreadyExisted" }
            }
          }
        }
      }
    }
  }
}

module.exports.updateWrappedDocument = {
  put: {
    tags: ["Wrapped document"],
    summary: "Receive and valiate wrapped document from dApp and call services to hash and store data.",
    parameters: [
      {
        in: "cookie",
        name: "access_token",
        type: "string",
        require: true,
        description: "Access token of current user",
      }
    ],
    requestBody: {
      require: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              newWrappedDocument: {
                $ref: "#/components/schemas/wrappedDocument"
              },
              previousHashOfDocument: {
                type: "string",
                example: "???"
              },
            }
          }
        }
      }
    },
    responses: {
      201: {
        description: "New wrapped document is successfully created.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/wrappedDocument" }
          }
        }
      },
      400: {
        description: "Missing parameters or invalid input",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": { $ref: "#/components/examples/errorMissingParameters" },
              "Invalid input": { $ref: "#/components/examples/errorInvalidInput" }
            }
          }
        }
      },
      401: {
        description: "Cannot verify user with the given access token.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Unauthorized."
            }
          },
        }
      },
      403: {
        description: "User is not allow to modify wrapped document.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Permission denied": { $ref: "#/components/examples/errorPermissionDenied" }
            }
          }
        }
      },
      409: {
        description: "Wrapped document with the same name is created.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Not found": { $ref: "#/components/examples/errorNotFound" }
            }
          }
        }
      }
    }
  }
}

module.exports.validateWrappedDocument = {
  put: {
    tags: ["Wrapped document"],
    summary: "Valiate wrapped document.",
    requestBody: {
      require: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              wrappedDocument: { $ref: "#/components/schemas/wrappedDocument" },
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: "New wrapped document is successfully created.",
        content: {
          "text/plain": {
            schema: { type: "boolean" }
          },
          "application/json": {
            // schema: { $ref: "#/components/schemas/wrappedDocument" }
            example: {
              valid: false,
              detail: [
                {
                  instancePath: "",
                  schemaPath: "#/required",
                  keyword: "required",
                  params: { missingProperty: "signature" },
                  message: "must have required property 'signature'"
                }
              ]
            }
          }
        }
      },
    }
  }
}
