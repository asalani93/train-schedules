'use strict';

/*
  ./controllers/times
  A controller that has two endpoints - "show" and "times"
  "show" renders the provided HTML file and servers as the root of the app
  "times" fetches the MBTA times from their server and formats them
*/

const co = require('co');
const request = require('co-request');
const parse = require('csv-parse/lib/sync');

class TimesController {
  constructor(app) {
    // Initialize the routes
    // app is the Express server object
    app.get('/', this.show);
    app.get('/times', this.times);
  }

  show(req, res) {
    // Respond by sending the view for the app
    res.sendFile('./views/index.html');
  }

  times(req, res) {
    co(function * () {
      // Asynchronously retrieve the departure time listings from the MBTA's
      //   server
      // Errors here are routed down to the catch clause
      const timesRequest = request('http://developer.mbta.com/lib/gtrtfs/Departures.csv');
      const timesResponse = yield timesRequest;

      // Parse the CSV itself, extract the row headers from the CSV
      const rows = parse(timesResponse.body);
      const headers = rows[0];

      // Convert the array-of-arrays CSV to a JSON object
      const trainBoard = rows.slice(1).map(function(row) {
        const trainRow = {};
        headers.forEach(function(header, idx) {
          trainRow[header] = row[idx];
        });
        return trainRow;
      });

      // Respond with an array of train departure time listings
      res.send(trainBoard);
    }).catch(function(e) {
      // Basic error reporting
      // Should send a 500, will do later
      res.send(`error! ${e}`);
    });
  }
}

module.exports = TimesController;