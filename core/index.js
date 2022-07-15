const cardanoSerialization = require("@emurgo/cardano-serialization-lib-nodejs");


module.exports.ensureAuthenticated = (req, res, next) => {
  if (!req.cookies["access_token"]) return res.sendStatus(401);
  const token = req.cookies["access_token"];
  axios.get(
    `${process.env.verifyAddress}/api/auth/verify`,
    {
      withCredentials: true,
      headers: {
        "Cookie": `access_token=${token};`,
      }, ß
    }
  )
    .then((response) => {
      var response = response.data;
      req.userData = {
        token,
        address: response.address,
      };
      next();
    },
      (error) => {
        console.log(error);
        next(error);
      }
    );
};

module.exports.getAddressFromHexEncoded = (hexAddress) => {
  return cardanoSerialization.Address.from_bytes(Buffer.from(hexAddress, 'hex')).to_bech32();
};