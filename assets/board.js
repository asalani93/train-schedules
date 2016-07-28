'use strict';

$(document).ready(function() {
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

  function formatBoard(boardData) {
    const board = $('#mbta-board');
    const lastUpdated = $('#mbta-update-time');
    const timeFormat = {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    };

    const currentTime = new Date(Date.now()).toTimeString();
    lastUpdated.text('Updated at ' + currentTime);

    board.empty();

    boardData.forEach(function(row) {
      row.ScheduledTime = formatTime(row.ScheduledTime, timeFormat);

      row.Lateness = formatTime(row.Lateness, timeFormat);

      if (row.Status in statusColors) {
        row.StatusClass = statusColors[row.Status];
      } else {
        row.StatusClass = '';
      }

      const rowHtml = rowTemplate(row);
      board.append(rowHtml);
    });
  }

  function formatTime(timeStr, format) {
    const dateObj = new Date(parseInt(timeStr) * 1000);
    return dateObj.toLocaleTimeString('en-GB', format);
  }

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

  const rowTemplateSource = $('#row-template').html();
  const rowTemplate = Handlebars.compile(rowTemplateSource);

  refreshBoard();

  setInterval(refreshBoard, 10000);

  $('#mbta-refresh').click(refreshBoard);
});