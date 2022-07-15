const schemas = require("./schemas");
const examples = require("./examples");

module.exports.schemas = {
  ...schemas,
};

module.exports.examples = {
  ...examples,
};

// module.exports.securitySchemes = {
//   cookieAuth: {
//     type: "apiKey",
//     in: "cookie",
//     name: "access_token"
//   }
// }

module.exports.responses = {
  BadRequest: {
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/error",
        },
        examples: {
          "Missing parameters": {
            $ref: "#/components/examples/errorMissingParameters",
          },
          "Invalid input": { $ref: "#/components/examples/errorInvalidInput" },
        },
      },
    },
  },
  Unauthorized: {
    description: "Cannot verify user with the given access token.",
    content: {
      "text/plain": {
        schema: {
          type: "string",
          example: "Unauthorized.",
        },
      },
    },
  },
  NotFound_DIDDocument: {
    description: "DID document or/and wrapped document are not found.",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            error_code: { type: "integer" },
            error_message: { type: "string" },
          },
        },
        examples: {
          "No file": {
            value: {
              error_code: 10004,
              error_message:
                "File/Public Key with the given value cannot be found.",
            },
          },
          "No branch": {
            value: {
              error_code: 10003,
              error_message: "Company with the given name cannot be found.",
            },
          },
        },
      },
    },
  },
};
