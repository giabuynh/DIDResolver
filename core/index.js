const cardanoSerialization = require("@emurgo/cardano-serialization-lib-nodejs");
const Ajv = require("ajv");

module.exports.validateDIDSyntax = (did, isSalted) => {
  console.log("-- Validating DID...");
  // DID syntax: did:method:companyName:fileNameOrPublicKey
  // Salted DID: uuid:string:did:method:companyName:fileNameOrPublicKey
  const maxLength = isSalted ? 6 : 4,
    didPosition = isSalted ? 2 : 0,
    didComponents = did.split(":");

  if (didComponents.length < maxLength || didComponents[didPosition] !== "did")
    return { valid: false };

  return {
    valid: true,
    companyName: didComponents[didPosition + 2],
    fileNameOrPublicKey: didComponents[didPosition + 3],
  };
};

module.exports.getAddressFromHexEncoded = (hexAddress) => {
  return cardanoSerialization.Address.from_bytes(
    Buffer.from(hexAddress, "hex")
  ).to_bech32();
};

module.exports.getPublicKeyFromAddress = (bech32Address) => {
  const address = cardanoSerialization.Address.from_bech32(bech32Address);
  const publicKey = Buffer.from(address.to_bytes(), "hex").toString("hex");
  return publicKey;
};

module.exports.validateJSONSchema = (rawSchema, object) => {
  console.log("-- Validating object...");
  const schema = (({ example, ...props }) => props)(rawSchema);

  const ajv = new Ajv();
  const validate = ajv.compile(schema);

  const valid = validate(object);
  return valid ? { valid } : { valid, detail: validate.errors };
};

// var schema = require("./schemas/credential");
// const clone = (({ example, ...o }) => o)(schema);
// const example = (({ ...o }) => o)(schema.example);

// const valid = this.validateJSONSchema(clone, example);
// console.log(valid);
