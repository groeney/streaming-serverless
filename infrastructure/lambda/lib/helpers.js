exports.parseDynamoObj = parseDynamoObj;
exports.isObjEmpty = isObjEmpty;

/* Function definitions */
function parseDynamoObj(item) {
  return _stripMetaData(item);
}

function isObjEmpty(obj) {
  return (
    typeof obj === 'undefined' || obj === null || Object.keys(obj).length === 0
  );
}

/* Private methods to the module */

/*
Strips metadata from object passed through from DynamoDB Streams.

Example input

{
  "status":{
    "N":"0"
  },
  "display_name":{
    "S":"Extended coherent orchestration"
  },
  "title":{
    "S":"Extended coherent orchestration"
  },
  "is_priority":{
    "BOOL":"true"
  }
}

Example output
{
  "status":0,
  "display_name":"Extended coherent orchestration",
  "title":"Extended coherent orchestration",
  "is_priority": true
}

Source: https://github.com/microapps/eskimo-stripper
*/

function _stripMetaData(item, type = 'OBJECT_MAP') {
  const result = type === 'OBJECT_MAP' ? {} : [];
  const keys = Object.keys(item);
  keys.forEach(key => {
    const nestedKeys = Object.keys(item[key]);
    if (`${nestedKeys[0]}` === 'M') {
      result[key] = _stripMetaData(item[key].M);
    } else if (_isDynamoCollection(`${nestedKeys[0]}`)) {
      result[key] = _stripMetaData(item[key][`${nestedKeys[0]}`], 'COLLECTION');
    } else {
      if (type === 'OBJECT_MAP') {
        const nestedProp = item[key];
        const propKeys = Object.keys(nestedProp);
        if (propKeys.length > 1 && !Array.isArray(nestedProp[propKeys[0]])) {
          result[key] = _stripMetaData(nestedProp[propKeys[0]], 'OBJECT_MAP');
        } else if (
          propKeys.length === 1 &&
          !Array.isArray(nestedProp[propKeys[0]])
        ) {
          result[key] = _parsePrimitive(
            `${propKeys[0]}`,
            nestedProp[propKeys[0]]
          );
        } else {
          result[key] = _stripMetaData(nestedProp[propKeys[0]], 'COLLECTION');
        }
      } else if (type === 'COLLECTION') {
        const index = parseInt(key, 10);
        const nestedProp = item[index];
        const propKeys = Object.keys(nestedProp);

        if (propKeys.length > 1 && !Array.isArray(nestedProp[propKeys[0]])) {
          result[index] = _stripMetaData(nestedProp, 'OBJECT_MAP');
        } else if (
          propKeys.length === 1 &&
          !Array.isArray(nestedProp[propKeys[0]])
        ) {
          result[index] = _parsePrimitive(
            `${propKeys[0]}`,
            nestedProp[propKeys[0]]
          );
        } else {
          result[key] = _stripMetaData(nestedProp[propKeys[0]], 'COLLECTION');
        }
      }
    }
  });
  return result;
}

function _isDynamoCollection(key) {
  const types = ['SS', 'NS', 'BS', 'L'];
  return types.indexOf(key) !== -1;
}

function _parsePrimitive(type, value) {
  if (type === 'N' || type === 'BOOL') {
    return JSON.parse(value);
  }
  return value;
}
