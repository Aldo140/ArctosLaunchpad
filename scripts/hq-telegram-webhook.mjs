// Points the HQ Telegram bot at the deployed webhook and sets its command menu.
// Run once after the env vars are on Vercel (and again if the domain changes):
//
//   HQ_TELEGRAM_BOT_TOKEN=… HQ_TELEGRAM_WEBHOOK_SECRET=… node scripts/hq-telegram-webhook.mjs [https://arctoslaunchpad.com]

const token = process.env.HQ_TELEGRAM_BOT_TOKEN;
const secret = process.env.HQ_TELEGRAM_WEBHOOK_SECRET;
const origin = (process.argv[2] ?? "https://arctoslaunchpad.com").replace(/\/$/, "");
if (!token || !secret) {
  console.error("Set HQ_TELEGRAM_BOT_TOKEN and HQ_TELEGRAM_WEBHOOK_SECRET (the same values as on Vercel).");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
  console.error("HQ_TELEGRAM_WEBHOOK_SECRET may only use letters, digits, _ and - (Telegram's rule).");
  process.exit(1);
}

async function call(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  if (!json.ok) throw new Error(`${method}: ${json.description}`);
  return json.result;
}

const url = `${origin}/api/hq/telegram`;
await call("setWebhook", { url, secret_token: secret, allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
await call("setMyCommands", {
  commands: [
    { command: "today", description: "What's waiting on you" },
    { command: "inbox", description: "Approve posts, pitches and replies" },
    { command: "help", description: "What HQ can do here" },
  ],
});
const info = await call("getWebhookInfo", {});
console.log(`Webhook set to ${info.url}${info.last_error_message ? ` (last error: ${info.last_error_message})` : ""}.`);
