/* Helpers for validator layer */

const env = process.env;

exports.handleParams = handleParams;
exports.parseValidatorFunction = parseValidatorFunction;
exports.publishToTopic = publishToTopic;

function handleParams(sns, params, topicName) {
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

function _isObjEmpty(obj) {
  return (
    typeof obj === 'undefined' || obj === null || Object.keys(obj).length === 0
  );
}
