/* Helpers for validator layer */

const yaml = require('js-yaml');
const fs = require('fs');
const h = require('./helpers.js');

const env = process.env;

exports.events = yaml.load(fs.readFileSync('./events.yml', 'utf-8'));
exports.createSnsParams = createSnsParams;
exports.handleValidatorResults = handleValidatorResults;
exports.handleVariables = handleVariables;
exports.interpolateAndParseEvent = interpolateAndParseEvent;
exports.parseValidatorFunction = parseValidatorFunction;
exports.publishToTopic = publishToTopic;

function createSnsParams(event) {
  const notifications = _createNotificationParams(event);
  return h.isEmpty(notifications)
    ? {}
    : {
        Message: JSON.stringify(notifications),
        MessageAttributes: _formatMessageAttributes(notifications),
        MessageStructure: 'json',
      };
}

function handleValidatorResults(sns, params, topicName) {
  return new Promise((resolve, reject) => {
    if (h.isEmpty(params)) resolve('Invalid event.');
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

function handleVariables(event, data = {}) {
  const mappings = {
    emailTo({ newTask, oldTask }) {
      oldTask = oldTask || {};
      newTask = newTask || {};
      return [newTask.assignee_email || oldTask.assignee_email || ''];
    },
    smsTo({ newTask, oldTask }) {
      oldTask = oldTask || {};
      newTask = newTask || {};
      return [newTask.assignee_phone || oldTask.assignee_phone || ''];
    },
    taskTitle({ newTask, oldTask }) {
      oldTask = oldTask || {};
      newTask = newTask || {};
      return newTask.title || oldTask.title || '';
    },
    newTaskTitle({ newTask }) {
      return newTask.title || '';
    },
    oldTaskTitle({ oldTask }) {
      return oldTask.title || '';
    },
  };

  return _mapVars(event.variables, mappings, data);
}

function interpolateAndParseEvent(event, variables = {}) {
  const eventStr = JSON.stringify(event).interpolate(variables);
  return { ...JSON.parse(eventStr), variables };
}

function parseValidatorFunction(eventName) {
  return `validate${eventName.charAt(0) + eventName.substr(1).toLowerCase()}`;
}

function publishToTopic(sns, params, topicName) {
  return new Promise((resolve, reject) => {
    _getTopicArn(sns, topicName)
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

/* Helpers of helpers */

function _createNotificationParams(event) {
  const notifications = event.notifications;
  const variables = event.variables;
  if (h.isEmpty(notifications) || h.isEmpty(variables)) return {};

  /* { emailTo: 'me@example.com' } => { email: { to: 'me@example.com', ... } } */
  Object.keys(notifications).map(k => {
    notifications[k]['to'] = variables[k + 'To'];
  });

  return {
    default: { notifications },
  };
}

function _mapVars(keys, mappings, data) {
  return keys.reduce((res, key) => {
    if (mappings[key]) {
      res[key] = mappings[key](data);
    }
    return res;
  }, {});
}

function _getTopicArn(sns, topicName) {
  return new Promise((resolve, reject) => {
    sns
      .listTopics()
      .promise()
      .then(data => {
        const topic = data.Topics.filter(topic => {
          return _getTopicNameFromARN(topic.TopicArn) === topicName;
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

function _getTopicNameFromARN(arn) {
  /*
  Returns undefined if arn is invalid
  Example
  arn: 'arn:aws:sns:us-east-1:123456789012:events'
   */
  return arn.split(':').slice(-1)[0];
}

function _formatMessageAttributes(messageAttributes) {
  let res = {};
  Object.keys(messageAttributes).forEach(key => {
    res[key] = {
      DataType: 'String',
      StringValue: JSON.stringify(messageAttributes[key]),
    };
  });
  return res;
}
