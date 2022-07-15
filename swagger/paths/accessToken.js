module.exports.setCookie = {
  post: {
    tags: ["Access token"],
    summary: "Set access_token",
    parameters: [
      {
        in: "header",
        name: "access_token",
        type: "string",
        require: true,
        descrption: "Access token",
      },
    ],
    responses: {
      200: {
        description: "",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Set Cookie Successfully.",
            },
          },
        },
      },
    },
  },
};

module.exports.clearCookie = {
  delete: {
    tags: ["Access token"],
    summary: "Clear access_token",
    responses: {
      200: {
        descrption: "",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Clear Cookie Successfully.",
            },
          },
        },
      },
    },
  },
};
