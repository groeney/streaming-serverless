/*

Subscribes to events sns topic and sends email notifications to appropriate users

*/
const mail = require('@sendgrid/mail');
const AWS = require('aws-sdk');

const env = process.env;
const fnName = env.AWS_LAMBDA_FUNCTION_NAME;
const localEmail = env.LOCAL_EMAIL;

console.log(`Loading function ${fnName}...`);

const config = new AWS.Config({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
});

const h = require('./helpers.js');
const he = require('./helpersExecuter.js');

exports.lambda_handler = (event, context, callback) => {
  console.log(`event: ${JSON.stringify(event)}`);
  console.log(`env: ${JSON.stringify(env)}`);
  const promises = event.Records.map(record => {
    const notifications = JSON.parse(record.Sns.Message).default.notifications;
    if (h.isEmpty(notifications))
      return Promise.resolve(
        `No notifications defined in record ${JSON.stringify(record)}`
      );

    return emailHandler(notifications)
      .then(res => {
        callback(null, `${fnName} succeeded with ${JSON.stringify(res)}`);
      })
      .catch(err =>
        callback(null, `${fnName} failed with ${err.stack || err}`)
      );
  });

  h.handlePromises(promises, fnName, callback);
};

function emailHandler(notifications) {
  return h.isEmpty(notifications.email)
    ? Promise.resolve(
        `No email notifications defined in notifications ${JSON.stringify(
          notifications
        )}`
      )
    : emailTransport(notifications.email);
}

function emailTransport(emailNotification) {
  mail.setApiKey(env.SENDGRID_KEY);
  const emailParams = createEmailParams(emailNotification);
  console.log(
    `Sending email with the following params: ${JSON.stringify(emailParams)}`
  );
  return mail.send(emailParams);
}

function createEmailParams({ to, subject, body }) {
  return {
    subject,
    personalizations: to.map(email => {
      return {
        to: {
          email,
        },
      };
    }),
    content: [
      {
        type: 'text/plain',
        value: body,
      },
    ],
    from: {
      email: 'hello@streaming-serverless.io',
      name: 'Streaming Serverless',
    },
    mailbox_settings: {
      sandbox_mode: {
        enable: true,
      },
    },
  };
}
