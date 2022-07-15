module.exports.createNotification = {
  post: {
    tags: ["Others"],
    sumary: "Create a new notification when transfer document.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              notification: {
                $ref: "#/components/schemas/notification",
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "New notificaton is successfully created.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Notification created.",
            },
          },
        },
      },
      401: {
        description: "Cannot verify user with given access_token.",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Unauthorized.",
            },
          },
        },
      },
    },
  },
};
