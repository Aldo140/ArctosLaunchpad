const GLOSSARY: Array<[string, string]> = [
  ["Inbox", "Everything waiting for a decision: posts to approve, replies to answer, pitches to send. Your action is applied by the agents on their next run, about every 15 minutes."],
  ["Queued / Undo", "An action you took that the agents haven't applied yet. Undo cancels it until they do."],
  ["Median views", "The middle value when posts are sorted by views. One viral post can't drag it up, so it shows what a typical post does."],
  ["Credited repost", "Another creator's Reel posted with their permission and their @handle in the caption. Historically CalgaryDaily's best format."],
  ["Beat their own usual (lift)", "How many times a post did better than that account's median. A 4× post on a small account counts as much as one on a big account."],
  ["Engagement rate", "Median likes plus comments divided by followers. Shows whether an audience actually reacts, whatever its size."],
  ["Reached a stage", "In the pipeline funnel, every lead that got at least that far, so the drop between steps is real."],
  ["Reply rate", "Of the businesses we emailed, the share who wrote back, whatever they said."],
  ["Follow-up due", "A lead that got one email, didn't answer within 7 days, and is owed the single polite follow-up."],
  ["Suppression list", "Addresses that asked not to be contacted, or bounced. Nobody on it is ever emailed again, by any business."],
  ["CASL", "Canada's anti-spam law: business emails only, a real mailing address, a working opt-out honoured immediately."],
  ["Send-as", "Gmail sending as aldo@arctoslaunchpad.com or aldo@vowmotionweddings.com through the Brevo relay."],
  ["Lateness", "Minutes between a post's slot and when it actually went out. GitHub starts scheduled runs late."],
  ["Scout", "The agent that reads Calgary Instagram accounts (yours and others) every morning. It only reads."],
  ["Workload identity", "How GitHub and Vercel sign in to Google without a stored key: each run gets a one-hour token."],
  ["Data access (Scout)", "Meta stops the Scout's token returning data about 90 days after the app was last approved. Renewing is one click in the Graph API Explorer."],
];

export function GlossaryView() {
  return (
    <div className="hq-view">
      <header>
        <p className="hq-eyebrow">Reference</p>
        <h1 className="hq-h1">Words on <em>this page.</em></h1>
      </header>
      <dl className="hq-gloss">
        {GLOSSARY.map(([t, d]) => (
          <div key={t} style={{ display: "contents" }}><dt>{t}</dt><dd>{d}</dd></div>
        ))}
      </dl>
    </div>
  );
}
