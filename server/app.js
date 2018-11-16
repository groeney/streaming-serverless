const http = require('http');
const express = require('express');
const dynamoose = require('dynamoose');
const bodyParser = require('body-parser');
const debug = require('debug')('app');

// This is needed in order for 2nd+ connections i.e. after hot restart
dynamoose.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-west-1'
});
dynamoose.local('http://localstack:4569');
const app = express();
app.use(bodyParser.json());
const server = app.listen(process.env.PORT || 5000, function() {
  debug('Listening on port ' + server.address().port);
});
