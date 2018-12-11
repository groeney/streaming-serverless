const env = process.env;
const http = require('http');
const express = require('express');
const dynamoose = require('dynamoose');
const bodyParser = require('body-parser');
const debug = require('debug')('app');

// This is needed in order for 2nd+ connections i.e. after hot restart
dynamoose.AWS.config.update({
  accessKeyId: 'AKID',
  secretAccessKey: 'SECRET',
  region: 'us-west-1',
});
dynamoose.local('http://localstack:4569');

const app = express();
app.use(bodyParser.json());

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/me', (req, res) => {
  const email = env.LOCAL_EMAIL;
  const phone = env.LOCAL_PHONE;
  res.json({ email, phone });
});
const server = app.listen(env.PORT || 5000, function() {
  debug('Listening on port ' + server.address().port);
});
