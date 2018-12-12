/* Helpers for executer layer */

exports.parseEmailDomain = parseEmailDomain;
exports.parseSnsObject = parseSnsObject;

function parseEmailDomain(email) {
  return email.match(/[\w.]+$/, '')[0];
}

function parseSnsObject(sns) {
  const message = JSON.parse(sns.Message);
  sns.Message = message.default;
  sns.MessageAttributes = _flattenMessageAttributes(message.MessageAttributes);
  return sns;
}

/* Helpers for the helpers */

function _createUserRoleObjects(userIds, role) {
  return userIds.map(userId => _createUserRoleObject(userId, role));
}

function _createUserRoleObject(userId, role) {
  const key = /Agent/.test(role) ? 'agent' : role.slice(0, -1);
  return { userId, role: key };
}

function _flattenMessageAttributes(messageAttributes) {
  return Object.keys(messageAttributes).reduce((obj, key) => {
    obj[key] = { Value: _parseAttributeValue(messageAttributes[key]) };
    return obj;
  }, {});
}

function _parseAttributeValue(value) {
  return value.DataType === 'String' ? value.StringValue : null;
}
