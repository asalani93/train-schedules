'use strict';

const express = require('express');
const consolidate = require('consolidate');
const TimesController = require('./controllers/times');

// Typical express app initialization
const app = express();

app.use(express.static('views'));
app.use('/assets', express.static('assets'));

// Attach the (only) controller to the app
const timesController = new TimesController(app);

// Start listening for people interested in train times
app.listen(3000, function() {
  console.log('listening on port 3000');
});