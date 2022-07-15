module.exports = {
  type: "object",
  required: ["error_code", "error_message"],
  properties: {
    error_code: {
      type: "integer",
    },
    error_message: {
      type: "string",
    },
    detail: {
      type: "string",
    },
  },
};
