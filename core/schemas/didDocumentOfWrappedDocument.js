module.exports = {
  type: "object",
  required: ["did", "controller", "url", "owner", "holder"],
  properties: {
    controller: {
      type: ["array"],
      description: "Public keys of who can transfer the wrapped document.",
      nullable: true,
      items: { type: "string", description: "controller_public_key" },
    },
    did: {
      type: "string",
      description: "DID of DID document of wrapped document",
    },
    owner: {
      type: "string",
      description: "Owner public key.",
    },
    holder: {
      type: "string",
      description: "Holder public key.",
    },
    url: {
      type: "string",
      description: "???",
    },
  },
  example: {
    controller: ["owner_public_key", "holder_public_key"],
    did: "did:method:companyName:somthing",
    owner: "owner_public_key",
    holder: "holder_public_key",
    url: "document_name.document",
  },
};

// ---
//   controller: b3ls1korgn
// did: did: some_string: Kukulu: b3ls1korgn
// docController: b3ls1korgn
// url: file_name.document

// "didDoc": {
//   "controller": [
//     "owner_public_key",
//     "holder_public_key"
//   ],
//   "did": "did:<company_name>:<owner_pk>:<holder_pk>",
//   "owner": "holder_public_key",
//   "holder": "owner_public_key",
//   "url": "document_name.document"
// }
