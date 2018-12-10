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

const sns = new AWS.SNS({ endpoint: `http://${env.LOCALSTACK_HOSTNAME}:4575` });

const h = require('./helpers.js');
const hv = require('./helpersValidator.js');

exports.lambda_handler = (event, context, callback) => {
  console.log(`event: ${JSON.stringify(event)}`);
  console.log(`env: ${JSON.stringify(env)}`);
  const promises = event.Records.map(record => {
    return eval(hv.parseValidatorFunction(record.eventName))(record.dynamodb)
      .then(params => {
        return hv.handleValidatorResults(sns, params, 'notifications');
      })
      .then(res => {
        console.log(`${fnName} succeeded: ${JSON.stringify(res)}`);
        return true;
      })
      .catch(err => {
        console.log(
          `${fnName} failed on record: ${JSON.stringify(
            record
          )} \n with error: ${err.stack || err}`
        );
        return false;
      });
  });

  h.handlePromises(promises, fnName, callback);
};

/*
##########################
### HANDLE EVENT TYPES ###
##########################
*/

function validateInsert(record) {
  return new Promise((resolve, reject) => {
    let event, variables;
    const events = hv.events.Tasks.INSERT;

    const newTask = h.parseDynamoObj(record.NewImage);

    /* --- START event business logic --- */
    event = events[0];
    event = hv.interpolateAndParseEvent(
      event,
      hv.handleVariables(event.variables, { newTask })
    );
    /* --- END event business logic --- */

    resolve(hv.createSnsParams(event));
  });
}

function validateModify(record) {
  return new Promise((resolve, reject) => {
    let event = {};
    const events = hv.events.Tasks.MODIFY;

    const newTask = h.parseDynamoObj(record.NewImage);
    const oldTask = h.parseDynamoObj(record.OldImage);

    /* --- START event business logic --- */


    /* --- END event business logic --- */

    resolve(hv.createSnsParams(event));
  });
}

function validateRemove(record) {
  return new Promise((resolve, reject) => {
    let event = {};
    const events = hv.events.Tasks.DELETE;

    /* --- START event business logic --- */

    /* --- END event business logic --- */

    resolve(hv.createSnsParams(event));
  });
}
