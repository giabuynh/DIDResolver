module.exports = {
  type: "object",
  required: ["data", "signature"],
  properties: {
    vesion: { type: "string" },
    data: {
      type: "object",
      required: ["issuers"],
      properties: {
        name: { type: "string" },
        issuers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              identityProof: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  location: { type: "string" }
                }
              },
              did: { type: "string" },
              tokenRegistry: { type: "string" },
              address: { type: "string" }
            }
          }
        }
      }
    },
    signature: {
      type: "object",
      required: ["targetHash"],
      properties: {
        type: { type: "string" },
        targetHash: { type: "string" },
        proof: { type: "array" },
        merkleRoot: { type: "string" }
      }
    },
    assetId: { type: "string" },
    policyId: { type: "string" }
  },
  example: {
    vesion: "https://schema.openattestation.com/2.0/schema.json",
    data: {
      name: "UUIDv4:string:...",
      issuers: [
        {
          identityProof: {
            type: "UUIDv4:string:...",
            location: "UUIDv4:string:fuixlabx.com"
          },
          did: "UUIDv4:string:...",
          tokenRegistry: "UUIDv4:string:...",
          address: "addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur"
        }
      ]
    },
    signature: {
      type: "SHA3MerkleRoot",
      targetHash: "string",
      proof: [],
      merkleRoot: "string"
    },
  }
}
