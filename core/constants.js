module.exports.SERVERS = {
  DID_CONTROLLER: "http://localhost:9000",
  CARDANO_SERVICE: "http://localhost:1000",
  AUTHENTICATION_SERVICE: "http://localhost:12000",
}

module.exports.ERRORS = {
  MISSING_PARAMETERS: {
    errorCode: 400,
    errorMessage: "Bad request. Missing parameters."
  },
  INVALID_INPUT: {
    errorCode: 400,
    errorMessage: "Bad request. Invalid input syntax."
  },
  UNAUTHORIZED: {
    errorCode: 401,
    errorMessage: "Unauthorized. Access token is invalid."
  },
  PERMISSION_DENIED: {
    errorCode: 403,
    errorMessage: "Forbidden. Permission denied."
  },
  NOT_FOUND: {
    errorCode: 404,
    errorMessage: "Not found. Resource is not found."
  }
}