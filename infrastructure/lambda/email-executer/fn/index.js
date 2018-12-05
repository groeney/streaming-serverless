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

const ddb = new AWS.DynamoDB({
  endpoint: `http://${env.LOCALSTACK_HOSTNAME}:4569`,
});

const h = require('./helpers.js');
const he = require('./helpersExecuter.js');

exports.lambda_handler = (event, context, callback) => {
  console.log(`event: ${JSON.stringify(event)}`);
  console.log(`env: ${JSON.stringify(env)}`);

  const promises = event.Records.map(record => {
    const messageAttributes = JSON.parse(record.Sns.Message);
    return emailTransport(messageAttributes)
      .then(res => {
        callback(null, `${fnName} succeeded with ${JSON.stringify(res)}`);
      })
      .catch(err =>
        callback(null, `${fnName} failed with ${err.stack || err}`)
      );
  });

  Promise.all(promises.map(p => p.catch(e => e)))
    .then(res => {
      callback(
        null,
        `Processed ${
          res.length
        } records with the following output: ${JSON.stringify(res)}`
      );
    })
    .catch(err =>
      callback(null, `${fnName} failed at the root level: ${err.stack || err}`)
    );
};

function emailTransport(messageAttributes) {
  mail.setApiKey(env.SENDGRID_KEY);
  const emailParams = createEmailParams(messageAttributes);
  console.log(JSON.stringify(emailParams));
  return mail.send(emailParams);
}

function createEmailParams({ toEmail, subject, message }) {
  return {
    subject,
    personalizations: [
      {
        to: {
          email: toEmail,
        },
      },
    ],
    content: [
      {
        type: 'text/plain',
        value: message,
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
