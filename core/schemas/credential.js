module.exports = {
  type: "object",
  required: ["issuer", "credentialSubject", "signature"],
  properties: {
    issuer: {
      type: "string",
      description: "DID of who issues this credential.",
    },
    credentialSubject: {
      type: "object",
      description: "Claims",
      // required: ["object", "action"],
      properties: {
        object: {
          type: "string",
          description: "DID of wrapped document.",
        },
        newOwner: {
          type: "string",
          description: "DID of the new owner who can access the document.",
        },
        newHolder: {
          type: "string",
          description: "DID of the new holder who can access the document.",
        },
        action: {
          type: "object",
          description: "Define the action subject can do with the document.",
          properties: {
            code: { type: "integer" },
            value: { type: "string" },
          },
        },
      },
    },
    signature: {
      type: "string",
      description: "Signature of issuer.",
    },
    metadata: {
      type: "object",
      description: "Other data when create credential.",
      properties: {
        dateCreated: { type: "string" },
      },
    },
    mintingNFTconfig: {
      type: "object",
      description: "Config of the credential, in other to create a new one.",
      properties: {
        type: { type: "string" },
        asset: { type: "string" },
        policy: { type: "object" },
      },
    },
  },
  example: {
    issuer: "did:method:Kukulu:zaq12wsxcde34rfvbgt56yhnmju78iko9olp0",
    credentialSubject: {
      object: "did:method:Kukulu:file_name",
      newHolder: "did:method:Kukulu:0po9olki87ujmnhy65tgbvfr43edcxsw21qaz",
      action: {
        code: 2,
        value: "changeHoldership",
      },
    },
    signature: "12345678986543234567qwertytwq231234567876543sdfghgfds",
    metadata: {
      dateCreated: "22-06-2022",
      status: "",
    },
    mintingNFTconfig: {
      type: "credentail",
      policy: {},
      asset:
        "ed9f068881fd29842e8b5267ae8220aca2c2953617ce07c7895cfd30127148bdcb294e220f0c9aef41a307be8e910157901d2bf349492e7919708208",
    },
  },
};
