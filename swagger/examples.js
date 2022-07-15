const { ERRORS } = require("../core/constants");

exports.errorMissingParameters = {
  value: {
    ...ERRORS.MISSING_PARAMETERS,
    detail: "Not found: did"
  }
}
exports.errorInvalidInput = {
  value: {
    ...ERRORS.INVALID_INPUT,
    detail: ""
  }
}
exports.errorUnauthorized = {
  value: {
    ...ERRORS.UNAUTHORIZED
  }
}
exports.errorPermissionDenied = {
  value: {
    ...ERRORS.PERMISSION_DENIED
  }
}
exports.errorUnverifiedSignature = {
  value: {
    ...ERRORS.UNVERIFIED_SIGNATURE
  }
}
exports.errorNotFound = {
  value: {
    ...ERRORS.NOT_FOUND
  }
}
exports.errorAlreadyExisted = {
  value: {
    ...ERRORS.ALREADY_EXSISTED
  }
}
exports.errorMintNFT = {
  value: {
    ...ERRORS.CANNOT_MINT_NFT
  }
}
exports.errorFetchNFT = {
  value: {
    ...ERRORS.CANNOT_FETCH_NFT
  }
}