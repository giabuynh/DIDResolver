module.exports.getPublicKeyFromAddress = {
  get: {
    tags: ["Others"],
    summary: "Get pulic key from address of user",
    parameters: [
      {
        in: "query",
        name: "address",
        type: "string",
        require: true,
        description: "Address.",
      },
    ],
    responses: {
      200: {
        description: "Public key of the given address",
        content: {
          "application/json": {
            schema: {
              example: {
                publicKey: "something",
              },
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
      401: {
        $ref: "#/components/responses/Unauthorized",
      },
    },
  },
};
