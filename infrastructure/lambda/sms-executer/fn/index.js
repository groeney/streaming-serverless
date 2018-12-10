/*

Subscribes to events sns topic and sends sms notifications to appropriate users

*/
const twilio = require('twilio');
const AWS = require('aws-sdk');

const env = process.env;
const fnName = env.AWS_LAMBDA_FUNCTION_NAME;
const localPhone = env.LOCAL_PHONE;
const twilioFrom = env.TWILIO_FROM;

console.log(`Loading function ${fnName}...`);

const smsClient = new twilio(env.TWILIO_SID, env.TWILIO_TOKEN);
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

    return smsHandler(notifications)
      .then(res => {
        callback(null, `${fnName} succeeded with ${JSON.stringify(res)}`);
      })
      .catch(err =>
        callback(null, `${fnName} failed with ${err.stack || err}`)
      );
  });

  h.handlePromises(promises, fnName, callback);
};

function smsHandler(notifications) {
  return h.isEmpty(notifications.sms)
    ? Promise.resolve(
        `No sms notifications defined in notifications ${JSON.stringify(
          notifications
        )}`
      )
    : smsTransport(notifications.sms);
}

function smsTransport({ to, body }) {
  const messages = to.map(phone => {
    return { body, from: twilioFrom, to: phone };
  });
  console.log(
    `Sending sms with the following params: ${JSON.stringify(messages)}`
  );
  return Promise.all(
    messages.map(message => smsClient.messages.create(message))
  );
}
