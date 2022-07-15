module.exports.getDidDocument = {
  get: {
    tags: ["DID document"],
    summary:
      "Resolve DID - Takes a DID of a company or user as input and produces a conforming DID document as output.",
    parameters: [
      {
        in: "header",
        name: "did",
        type: "string",
        require: true,
        description: "DID string. Syntax: did:method:companyName:publicKey.",
        default: "did:method:Kukulu:public_key",
        // example: "did:method:companyName:publicKey",
      },
    ],
    responses: {
      200: {
        description: "Return a conforming DID document.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/didDocument",
            },
          },
        },
      },
      400: {
        description: "Missing parameters or invalid input.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": {
                $ref: "#/components/examples/errorMissingParameters",
              },
              "Invalid input": {
                $ref: "#/components/examples/errorInvalidInput",
              },
            },
          },
        },
      },
      404: {
        description:
          "Cannot found DID document with a companyName and publicKey included in the given DID string.",
        content: {
          "application/json": {
            example: {
              error_code: 404,
              message: "File/Public Key with the given value cannot be found.",
            },
          },
        },
      },
    },
  },
};

module.exports.createDidDocument = {
  post: {
    tags: ["DID document"],
    summary: "Create DID document for a given DID string of a company/user.",
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
                example: "did:method:Kukulu:public_key",
              },
              didDocument: {
                $ref: "#/components/schemas/didDocument",
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "New DID document is successfully created.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "DID Document created.",
            },
          },
        },
      },
      400: {
        description: "Missing parameters or invalid input",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/error" },
            examples: {
              "Missing parameters": {
                $ref: "#/components/examples/errorMissingParameters",
              },
              "Invalid input": {
                $ref: "#/components/examples/errorInvalidInput",
              },
            },
          },
        },
      },
    },
  },
};
