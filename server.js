'use strict';

const express = require('express');
const consolidate = require('consolidate');
const TimesController = require('./controllers/times');

const app = express();

app.use(express.static('views'));
app.use('/assets', express.static('assets'));

const timesController = new TimesController(app);

app.listen(3000, function() {
  console.log('listening on port 3000');
});