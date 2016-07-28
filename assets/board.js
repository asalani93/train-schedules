'use strict';

/*
  ./assets/board.js
  Provides functionality to the board and allows it to update in real time
*/

$(document).ready(function() {

  /*
    Retrieves a JSON file from the server and dumps it into the page
    If the app fails to reload from the endpoint, the page is updated to
      reflect that by changing the last updated time to "Update failed!"
  */

  function refreshBoard() {
    $.ajax('/times')
      .done(function(data, textStatus, jqXHR) {
        formatBoard(data);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        $('#mbta-update-time').text('Update failed!');
        console.error(errorThrown);
      });
  }

  /*
    Dumps train data into the app, and sets the new update time
  */

  function formatBoard(boardData) {
    // Caching expensive jQuery DOM lookups
    const board = $('#mbta-board');
    const lastUpdated = $('#mbta-update-time');

    // Get the current time and set that as the last updated time
    const timeFormat = {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    };
    const currentTime = new Date(Date.now()).toTimeString();
    lastUpdated.text('Updated at ' + currentTime);

    // Dump the table currently being displayed in the app
    board.empty();

    // Append each row in the response to the newly empty table
    boardData.forEach(function(row) {
      row.ScheduledTime = formatTime(row.ScheduledTime, timeFormat);

      row.Lateness = formatTime(row.Lateness, timeFormat);

      // Tag each row with a specific status with the appropriate status color
      // This is stored in a hash table
      // Statuses not listed there get the default gray/white color
      if (row.Status in statusColors) {
        row.StatusClass = statusColors[row.Status];
      } else {
        row.StatusClass = '';
      }

      // Run the handlebars template on the row data and stick it at the end of
      //   the table
      // The server returns the rows in a specific order (sorted by stations, 
      //   then by time of arrival) so appending is the preferred method of
      //   insertion
      const rowHtml = rowTemplate(row);
      board.append(rowHtml);
    });
  }

  /*
    Helper function that formats any given time in a specific way
    Technically this could just go in the above function but this was for an
      interview and I wanted to be fancy
    In a real application this would  be used throughout the site so might as
      well break it out into it's own function
  */

  function formatTime(timeStr, format) {
    const dateObj = new Date(parseInt(timeStr) * 1000);
    return dateObj.toLocaleTimeString('en-GB', format);
  }

  // Constants:
  //   okStatus - the CSS class to use if the status is considered "good"
  //   badStatus - the CSS class to use if the status is considered "bad"
  //   statusColors - a mapping of statuses to their corresponding colors
  const okStatus = 'success';
  const badStatus = 'danger';
  const statusColors = {
    'Now Boarding': okStatus,
    'All Aboard': okStatus,
    'Arriving': okStatus,
    'Arrived': okStatus,
    'Delayed': badStatus,
    'Cancelled': badStatus,
    'Late': badStatus
  }

  // Initializes the Handlebars template
  const rowTemplateSource = $('#row-template').html();
  const rowTemplate = Handlebars.compile(rowTemplateSource);

  // Fire of the initial call to refreshBoard(), otherwise the page is blank and
  //   that's not really desired behavior
  refreshBoard();

  // Set the board to refresh every ten seconds
  setInterval(refreshBoard, 10000);

  // Allow clicking to manually refresh the board
  $('#mbta-refresh').click(refreshBoard);
});