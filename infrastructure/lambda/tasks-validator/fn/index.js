/*

Handles the following event types: INSERT, MODIFY and REMOVE for Tasks table
DynamoDB Stream.

*/
const env = process.env;
const fnName = env.AWS_LAMBDA_FUNCTION_NAME;
console.log(`Loading function ${fnName}...`);

const isLocal = !!env.LOCALSTACK_HOSTNAME;
const AWS = require('aws-sdk');

const config = new AWS.Config({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
});

const sns = isLocal
  ? new AWS.SNS({ endpoint: `http://${env.LOCALSTACK_HOSTNAME}:4575` })
  : new AWS.SNS();

const ddb = isLocal
  ? new AWS.DynamoDB({ endpoint: `http://${env.LOCALSTACK_HOSTNAME}:4569` })
  : new AWS.DynamoDB();

const h = require('./helpers.js');

exports.lambda_handler = (event, context, callback) => {
  console.log(`event: ${JSON.stringify(event)}`);
};

/*
##########################
### HANDLE EVENT TYPES ###
##########################
*/

function validateInsert(data) {
  return new Promise(async (resolve, reject) => {
    const newTask = h.parseDynamoObj(data.NewImage);

    // TODO completed is being sent through stream as S not BOOL
    newTask.completed = newTask.completed === 'true';

    resolve({});
  });
}

function validateModify(data) {
  return new Promise(async (resolve, reject) => {
    const newTask = h.parseDynamoObj(data.NewImage);
    const oldTask = h.parseDynamoObj(data.OldImage);

    // TODO completed is being sent through stream as S not BOOL
    newTask.completed = newTask.completed === 'true';
    oldTask.completed = oldTask.completed === 'true';

    resolve({});
  });
}

function validateRemove(data) {
  return new Promise(async (resolve, reject) => {
    resolve({});
  });
}

/*
##########################
### HELPERS ###
##########################
*/

function handleParams(sns, params, topicName) {
  return new Promise((resolve, reject) => {
    if (h.isObjEmpty(params)) resolve('Invalid event.');
    else {
      publishToTopic(sns, params, topicName)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    }
  });
}

function parseValidatorFunction(eventName) {
  return `validate${eventName.charAt(0) + eventName.substr(1).toLowerCase()}`;
}

function parseKinesisData(record) {
  return JSON.parse(
    new Buffer(record.kinesis.data, 'base64').toString('ascii')
  );
}

function publishToTopic(sns, params, topicName) {
  return new Promise((resolve, reject) => {
    getTopicArn(sns, env.NODE_ENV, topicName)
      .then(topicArn => {
        sns
          .publish({ ...params, TopicArn: topicArn })
          .promise()
          .then(data => {
            resolve(
              `Successfully published to events topic: ${JSON.stringify(data)}`
            );
          })
          .catch(err => {
            reject(`Could not publish to events topic.
                  params: ${JSON.stringify(params)}
                  err: ${err}`);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getTopicArn(sns, env, topicName) {
  return new Promise((resolve, reject) => {
    sns
      .listTopics()
      .promise()
      .then(data => {
        const topic = data.Topics.filter(topic => {
          return (
            getTopicNameFromARN(topic.TopicArn) ===
            `${isLocal ? 'local' : env}-${topicName}`
          );
        });
        topic.length
          ? resolve(topic[0].TopicArn)
          : reject(`No SNS topic ${topicName} found.`);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getTopicNameFromARN(arn) {
  /*
  Returns undefined if arn is invalid
  Example
  arn: 'arn:aws:sns:us-east-1:123456789012:events'
   */
  return arn.split(':').slice(-1)[0];
}
