/**
 * Arctos HQ · Gmail sync
 *
 * Runs inside mrotiz14@gmail.com every 15 minutes. Reads the last 30 days of
 * mail sent from each send-as address (Vow Motion, Arctos, CalgaryWatch) and
 * the replies to it, and posts a summary to arctoslaunchpad.com/hq: who was
 * pitched, from which address, who answered, auto-replies, opt-outs and
 * bounces, and any pitch that went out from the wrong address. A reply carries
 * a 240-character snippet. For a real reply nobody has answered yet, the
 * newest one in its thread also carries the conversation (our first message
 * and the latest few, each cut to its new text, 700 characters at most) so
 * HQ's reply check can tell whether it needs you. Nothing else of a body
 * leaves Gmail.
 *
 * Setup (once): paste this file into a new project at script.google.com, put
 * the HQ key in HQ_KEY below (or in Project Settings → Script properties as
 * HQ_KEY), choose `setup` in the toolbar and press Run, then Allow. It syncs
 * straight away and every 15 minutes after. `sync` runs it once by hand.
 */

var HQ_URL = 'https://arctoslaunchpad.com/api/hq/ingest/gmail';
var HQ_KEY = ''; // or Script properties → HQ_KEY
var DAYS = 30;

var ALIASES = {
  'aldo@vowmotionweddings.com': 'vowmotion',
  'aldo@arctoslaunchpad.com': 'arctos',
  'aldo@calgarywatch.ca': 'calgarywatch',
};
/** Words in a body that say which business a message is about. */
var BRANDS = [
  ['vowmotion', /vow\s*motion/i],
  ['arctos', /arctos/i],
  ['calgarywatch', /calgary\s*watch/i],
];

function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sync') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sync').timeBased().everyMinutes(15).create();
  sync();
}

function sync() {
  var key = HQ_KEY || PropertiesService.getScriptProperties().getProperty('HQ_KEY');
  if (!key) throw new Error('Put the HQ key in HQ_KEY first.');
  var me = Session.getActiveUser().getEmail().toLowerCase();
  var mine = Object.keys(ALIASES).concat([me]);
  var since = Date.now() - DAYS * 86400000;
  var sends = [];
  var replies = [];
  var seen = {};

  var query = 'newer_than:' + DAYS + 'd (' + Object.keys(ALIASES).map(function (a) { return 'from:' + a + ' OR to:' + a + ' OR deliveredto:' + a; }).join(' OR ') + ')';
  for (var start = 0; start < 1500; start += 100) {
    var threads = GmailApp.search(query, start, 100);
    if (!threads.length) break;
    threads.forEach(function (thread) {
      if (seen[thread.getId()]) return;
      seen[thread.getId()] = true;
      readThread(thread, mine, me, since, sends, replies);
    });
    if (threads.length < 100) break;
  }

  var body = { generatedAt: Date.now(), account: me, days: DAYS, sends: sends, replies: replies };
  var res = UrlFetchApp.fetch(HQ_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-hq-key': key },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error('HQ said ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
  Logger.log('Synced ' + sends.length + ' sends and ' + replies.length + ' replies.');
}

function readThread(thread, mine, me, since, sends, replies) {
  var messages = thread.getMessages();
  var firstReply = replies.length;
  var url = 'https://mail.google.com/mail/u/0/#all/' + thread.getId();
  var firstFromUs = isMine(address(messages[0].getFrom()), mine);
  // What the conversation is about: the business our first message names, else its address's.
  var ours = messages.filter(function (x) { return isMine(address(x.getFrom()), mine); })[0];
  var threadBusiness = ours ? brandOf(ours.getPlainBody().slice(0, 4000)) || ALIASES[address(ours.getFrom())] || null : null;
  messages.forEach(function (m, i) {
    var at = m.getDate().getTime();
    if (at < since) return;
    var from = address(m.getFrom());
    var later = messages.slice(i + 1);
    if (isMine(from, mine)) {
      var alias = ALIASES[from] ? from : me;
      var to = address(m.getTo());
      if (!to || isMine(to, mine)) return;
      var own = ALIASES[alias] || null;
      var about = brandOf(m.getPlainBody().slice(0, 4000)) || threadBusiness || own || 'other';
      sends.push({
        at: at,
        alias: alias,
        business: about,
        to: to,
        domain: to.split('@')[1] || '',
        subject: m.getSubject() || '',
        first: i === 0,
        // Went out from another business's address (Gmail's default send-as).
        wrongAlias: own && about !== 'other' && about !== own ? own : null,
        replied: later.some(function (x) { return !isMine(address(x.getFrom()), mine); }),
        url: url,
      });
    } else {
      var toAlias = recipientAlias(m, mine) || '';
      if (!toAlias && !firstFromUs) return;
      var plain = m.getPlainBody();
      replies.push({
        at: at,
        alias: toAlias || me,
        business: threadBusiness || ALIASES[toAlias] || 'other',
        from: from,
        name: displayName(m.getFrom()),
        subject: m.getSubject() || '',
        snippet: firstLines(plain).slice(0, 240),
        kind: kindOf(from, m.getSubject() || '', plain),
        toPitch: firstFromUs,
        answered: later.some(function (x) { return isMine(address(x.getFrom()), mine); }),
        url: url,
      });
    }
  });
  // The newest unanswered real reply in this thread gets the conversation.
  for (var j = replies.length - 1; j >= firstReply; j--) {
    if (replies[j].kind === 'reply' && !replies[j].answered) {
      replies[j].thread = conversation(messages, mine);
      break;
    }
  }
}

/** Our first message and the latest seven, each cut to its new text. */
function conversation(messages, mine) {
  var picked = messages.length > 8 ? [messages[0]].concat(messages.slice(-7)) : messages;
  return picked.map(function (x) {
    return { at: x.getDate().getTime(), ours: isMine(address(x.getFrom()), mine), from: address(x.getFrom()), text: firstLines(x.getPlainBody()).slice(0, 700) };
  });
}

function kindOf(from, subject, body) {
  if (/mailer-daemon|postmaster/i.test(from) || /delivery status notification|undeliverable|delivery has failed|returned mail/i.test(subject)) return 'bounce';
  if (/automatic reply|auto.?reply|out of (the )?office|away from|autoresponder|thank you for (your email|contacting|reaching)/i.test(subject)) return 'auto';
  var top = firstLines(body).slice(0, 400);
  if (/\bunsubscribe\b|remove me|take me off|stop (emailing|contacting)|no more emails|do not (email|contact)/i.test(top)) return 'optout';
  if (/out of (the )?office|currently away|limited access to email|will respond .* upon my return/i.test(top)) return 'auto';
  return 'reply';
}

/** The reply above the quoted text. */
function firstLines(body) {
  var cut = body.search(/\n\s*(On .+ wrote:|From: |-----Original Message-----|>)/);
  return (cut > 0 ? body.slice(0, cut) : body).replace(/\s+/g, ' ').trim();
}

function brandOf(body) {
  for (var i = 0; i < BRANDS.length; i++) if (BRANDS[i][1].test(body)) return BRANDS[i][0];
  return null;
}

function recipientAlias(m, mine) {
  var all = (m.getTo() + ',' + m.getCc()).toLowerCase();
  var found = Object.keys(ALIASES).filter(function (a) { return all.indexOf(a) !== -1; })[0];
  return found || (all.indexOf(mine[mine.length - 1]) !== -1 ? mine[mine.length - 1] : null);
}

function isMine(addr, mine) { return mine.indexOf(addr) !== -1; }

function address(header) {
  var m = String(header || '').match(/[\w.+'-]+@[\w-]+(\.[\w-]+)+/);
  return m ? m[0].toLowerCase() : '';
}

function displayName(header) {
  var m = String(header || '').match(/^\s*"?([^"<]+?)"?\s*</);
  return m ? m[1].trim() : address(header);
}
