'use strict';

const co = require('co');
const request = require('co-request');
const parse = require('csv-parse/lib/sync');

class TimesController {
  constructor(app) {
    app.get('/', this.show);
    app.get('/times', this.times);
  }

  show(req, res) {
    res.sendFile('./views/index.html');
  }

  times(req, res) {
    co(function * () {
      const timesRequest = request('http://developer.mbta.com/lib/gtrtfs/Departures.csv');
      const timesResponse = yield timesRequest;

      const rows = parse(timesResponse.body);
      const headers = rows[0];

      const trainBoard = rows.slice(1).map(function(row) {
        const trainRow = {};
        headers.forEach(function(header, idx) {
          trainRow[header] = row[idx];
        });
        return trainRow;
      });

      res.send(trainBoard);
    }).catch(function(e) {
      res.send(`error! ${e}`);
    });
  }
}

module.exports = TimesController;