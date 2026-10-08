/**
 * Arctos HQ · Calendar sync
 *
 * Runs inside mrotiz14@gmail.com every 15 minutes, beside the Gmail sync.
 * Posts today's and the next six days' events from every calendar you have
 * switched on (title, start, end, location) to arctoslaunchpad.com/hq, where
 * the Overview shows your day, finds a free gym slot and works it into the
 * morning brief. Descriptions and guests never leave Google.
 *
 * Setup (once): in the same Apps Script project as hq-sync.gs, add a file
 * (+ → Script), paste this in, choose `setupCalendar` in the toolbar, press
 * Run and Allow. It uses the same HQ_KEY. `syncCalendar` runs it once by hand.
 */

var HQ_CALENDAR_URL = 'https://arctoslaunchpad.com/api/hq/ingest/calendar';
var CALENDAR_DAYS = 7;

function setupCalendar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncCalendar') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('syncCalendar').timeBased().everyMinutes(15).create();
  syncCalendar();
}

function syncCalendar() {
  var key = (typeof HQ_KEY !== 'undefined' && HQ_KEY) || PropertiesService.getScriptProperties().getProperty('HQ_KEY');
  if (!key) throw new Error('Put the HQ key in HQ_KEY (hq-sync.gs) or in Script properties.');

  var start = new Date();
  start.setHours(0, 0, 0, 0);
  var end = new Date(start.getTime() + CALENDAR_DAYS * 86400000);
  var events = [];
  CalendarApp.getAllCalendars().forEach(function (cal) {
    if (cal.isHidden()) return;
    cal.getEvents(start, end).forEach(function (e) {
      var mine = e.getMyStatus();
      if (mine === CalendarApp.GuestStatus.NO) return; // declined
      events.push({
        title: e.getTitle() || '(busy)',
        start: e.getStartTime().getTime(),
        end: e.getEndTime().getTime(),
        allDay: e.isAllDayEvent(),
        location: e.getLocation() || '',
      });
    });
  });

  var res = UrlFetchApp.fetch(HQ_CALENDAR_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-hq-key': key },
    payload: JSON.stringify({ generatedAt: Date.now(), events: events.slice(0, 400) }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error('HQ said ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
  Logger.log('Synced ' + events.length + ' events.');
}
