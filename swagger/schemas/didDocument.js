module.exports = {
  type: "object",
  // properties: {
  //   name: {
  //     type: "string",
  //     descrption: "???",
  //   },
  //   content: {
  //     type: "objects",
  properties: {
    controller: {
      type: "string",
      description: "???",
    },
    id: {
      type: "string",
      description: "DID string of company or user. Syntax: did:method:companyName:publicKey",
    },
    date: {
      type: "string",
      description: "???",
    }
    // }
    // }
  },
  example: {
    // name: "public_key",
    // content: {
    controller: "1234abcd",
    id: "did:somes_tring:Kukulu:zaq12wsxcde34rfvbgt56yhnmkju8iko",
    date: "10-10-2000"
  }
  // }
}
