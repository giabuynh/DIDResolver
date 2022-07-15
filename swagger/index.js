const tags = require("./tags");
const components = require("./components");
const paths = require("./paths");

module.exports = {
  openapi: "3.0.9",
  info: {
    version: "1.0.0",
    title: "DID Resolver",
    description: "DID resolver for Cardano project | Fuixlabs"
  },
  servers: [
    {
      url: "/resolver",
      description: "Local server",
    },
  ],
  schemes: ["http"],
  ...tags,
  components: {
    ...components
  },
  ...paths,
}