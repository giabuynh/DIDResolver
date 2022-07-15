module.exports = {
  type: "object",
  properties: {
    vesion: {
      type: "string",
      example: "https://schema.openattestation.com/2.0/schema.json"
    },
    data: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "UUIDv4:string:..."
        },
        issuers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              identityProof: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    example: "UUIDv4:string:..."
                  },
                  location: {
                    type: "string",
                    example: "UUIDv4:string:fuixlabx.com"
                  }
                }
              },
              did: {
                type: "string",
                example: "UUIDv4:string:..."
              },
              tokenRegistry: {
                type: "string",
                example: "UUIDv4:string:..."
              },
              address: {
                type: "string",
                example: "addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur"
              }
            }
          }
        }
      }
    },
    signature: {
      type: "object",
      properties: {
        type: {
          type: "string",
          example: "SHA3MerkleRoot"
        },
        targetHash: {
          type: "string",
        },
        proof: {
          type: "array"
        },
        merkleRoot: {
          type: "string"
        }
      }
    }
  }
}
