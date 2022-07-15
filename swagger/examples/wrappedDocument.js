module.exports = {
  version: "https://schema.openattestation.com/2.0/schema.json",
  data: {
    name: "UUIDv4:string:...",
    issuers: [{
      identityProof: {
        type: "UUIDv4:string:DID",
        location: "UUIDv4:string:fuixlabs.com"
      },
      did: "UUIDv4:string:...",
      tokenRegistry: "UUIDv4:string:...",
      address: "addr_test...."
    }],
    signature: {
      type: "SHA3MerkleProof",
      targetHash: "",
      proof: [],
      merkleRoot: ""
    }
  }
}
