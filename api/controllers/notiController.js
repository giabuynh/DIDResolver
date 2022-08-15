const axios = require("axios").default;
const Logger = require("../../logger");
const {
  validateJSONSchema,
  validateDIDSyntax,
  checkUndefinedVar,
} = require("../../core");
const { ERRORS, SCHEMAS, SERVERS } = require("../../core/constants");

module.exports = {
  createNotification: async (req, res) => {
    const { notification } = req.body;

    try {
      // Check missing parameters
      const undefinedVar = checkUndefinedVar({ notification });
      if (undefinedVar.undefined)
        return res.status(200).json({
          ...ERRORS.MISSING_PARAMETERS,
          detail: undefinedVar.detail,
        });

      // Validate notification
      const valid = validateJSONSchema(SCHEMAS.NOTIFICATION, notification);
      if (!valid.valid)
        return res.status(200).json({
          ...ERRORS.INVALID_INPUT,
          error_message: "Bad request. Invalid notification.",
          detail: valid.detail,
        });

      // Check if receiver and sender exist
      // ???
      const dids = [notification.receiver, notification.sender];
      for (let did in dids) {
        const validDid = validateDIDSyntax(did, false),
          companyName = validDid.companyName,
          publicKey = validDid.fileNameOrPublicKey;

        if (!validDid.valid)
          return res.status(200).json({
            ...ERRORS.INVALID_INPUT,
            detail: "Invalid DID syntax.",
          });

        // Call DID Controller to check if DID of receiver and sender exist
        // success:
        const existence = await axios.get(SERVERS.DID_CONTROLLER + "/api/did", {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
          params: {
            companyName,
            publicKey,
          },
        });

        if (existence?.error_code) {
          Logger.apiError(req, res, `User not exists.`);
          return res.status(200).json(ERRORS.USER_NOT_EXIST);
        }
      }

      // Call DID Controller
      // success:
      //   { message: string }
      // error:
      //   { error_code: Number, error_message: string }
      const storeNotificationStatus = await axios.post(
        SERVERS.DID_CONTROLLER + "/api/message/",
        {
          message: notification,
        },
        {
          withCredentials: true,
          headers: {
            Cookie: `access_token=${access_token};`,
          },
        }
      );

      if (storeNotificationStatus?.data?.error_code) {
        Logger.apiError(
          req,
          res,
          `${JSON.stringify(storeNotificationStatus.data)}`
        );
        return res.status(200).json(storeNotificationStatus.data);
      } else {
        Logger.apiInfo(
          req,
          res,
          `Success.\n${JSON.stringify(storeNotificationStatus.data)}`
        );
        return res.status(201).send("Notification created.");
      }
    } catch (error) {
      Logger.apiError(req, res, `${JSON.stringify(error)}`);
      error.response
        ? res.status(400).json(error.response.data)
        : res.status(400).json(error);
    }
  },

  revokeNotification: (req, res) => {
    console.log("Revoke notification...");
    res.status(200).send("Revoke notification");
  },
};