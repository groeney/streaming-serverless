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
  callback(null, `Success`);
};
