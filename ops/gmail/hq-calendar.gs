/**
 * Arctos HQ · Calendar sync
 *
 * Runs inside mrotiz14@gmail.com every 15 minutes, on its own or beside the Gmail sync.
 * Posts today's and the next six days' events from every calendar you have
 * switched on (title, start, end, location) to arctoslaunchpad.com/hq, where
 * the Overview shows your day, finds a free gym slot and works it into the
 * morning brief. Descriptions and guests never leave Google.
 *
 * Setup (once): paste this into a new project at script.google.com (or as a
 * second file beside hq-sync.gs), put the key from Vercel's HQ_CALENDAR_KEY in
 * HQ_CALENDAR_KEY below (or in Project Settings → Script properties), choose
 * `setupCalendar` in the toolbar, press Run and Allow. Beside hq-sync.gs it can
 * use that file's HQ_KEY instead. `syncCalendar` runs it once by hand.
 */

var HQ_CALENDAR_URL = 'https://arctoslaunchpad.com/api/hq/ingest/calendar';
var HQ_CALENDAR_KEY = ''; // or Script properties → HQ_CALENDAR_KEY
var CALENDAR_DAYS = 7;

function setupCalendar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncCalendar') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('syncCalendar').timeBased().everyMinutes(15).create();
  syncCalendar();
}

function syncCalendar() {
  var props = PropertiesService.getScriptProperties();
  var key = HQ_CALENDAR_KEY || props.getProperty('HQ_CALENDAR_KEY') || (typeof HQ_KEY !== 'undefined' && HQ_KEY) || props.getProperty('HQ_KEY');
  if (!key) throw new Error('Put the key in HQ_CALENDAR_KEY at the top of this file.');

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
