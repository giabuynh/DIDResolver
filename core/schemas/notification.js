module.exports = {
  type: "object",
  required: ["receiver", "sender", "content"],
  properties: {
    receiver: {
      type: "string",
      description: "DID of receiver",
    },
    sender: {
      type: "string",
      description: "DID of sender",
    },
    content: {
      type: "string",
      description: "Notification information",
    },
  },
  example: {
    receiver: "did:method:companyName:publicKey",
    sender: "did:method:companyName:publicKey",
    content: "Hi! I invite you to be the new owner of the document ABC.",
  },
};
