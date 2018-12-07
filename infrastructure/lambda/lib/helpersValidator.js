/* Helpers for validator layer */

const env = process.env;

exports.createNotificationParams = createNotificationParams;
exports.createSnsParams = createSnsParams;
exports.handleValidatorResults = handleValidatorResults;
exports.parseValidatorFunction = parseValidatorFunction;
exports.publishToTopic = publishToTopic;

function createNotificationParams({ subject, message, toEmail }) {
  return {
    ...(!!subject && { subject }),
    ...(!!message && { message, default: message }),
    ...(!!toEmail && { toEmail }),
  };
}

function createSnsParams(notificationParams, imageParams) {
  const messageAttributes = { ...notificationParams, ...imageParams };
  return _validateNotificationParams(notificationParams)
    ? {
        Subject: notificationParams.subject,
        Message: JSON.stringify(messageAttributes),
        MessageAttributes: _formatMessageAttributes(messageAttributes),
        MessageStructure: 'json',
      }
    : {};
}

function handleValidatorResults(sns, params, topicName) {
  return new Promise((resolve, reject) => {
    if (_isObjEmpty(params)) resolve('Invalid event.');
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

function _validateNotificationParams(notificationParams) {
  /*
  Determines whether the notification params for the event are valid
  */
  return (
    typeof notificationParams === 'object' &&
    !!notificationParams.subject &&
    !!notificationParams.message &&
    !!notificationParams.default
  );
}

function _isObjEmpty(obj) {
  return (
    typeof obj === 'undefined' || obj === null || Object.keys(obj).length === 0
  );
}
