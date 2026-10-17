import { MENU, type Button, type Card } from "./telegramBot";

/**
 * The few Telegram Bot API calls HQ makes, with the token in
 * HQ_TELEGRAM_BOT_TOKEN (from @BotFather). Messages use Telegram's HTML mode.
 */

type Markup = { inline_keyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> };

async function call<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = process.env.HQ_TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("HQ_TELEGRAM_BOT_TOKEN is not set");
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await r.json().catch(() => null)) as { ok?: boolean; result?: T; description?: string } | null;
  if (!json?.ok) throw new Error(`Telegram ${method}: ${json?.description ?? `HTTP ${r.status}`}`);
  return json.result as T;
}

/** Two buttons a row, so labels stay readable on a phone; a lone pair of short ones shares a row. */
function keyboard(buttons: Button[]): Markup | undefined {
  if (!buttons.length) return undefined;
  const keys = buttons.map((b) => (b.url ? { text: b.text, url: b.url } : { text: b.text, callback_data: b.data }));
  const rows: Markup["inline_keyboard"] = [];
  for (let i = 0; i < keys.length; i += 2) rows.push(keys.slice(i, i + 2));
  return { inline_keyboard: rows };
}

export const sendText = (chatId: number, text: string, buttons: Button[] = [], silent = false) =>
  call("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", link_preview_options: { is_disabled: true }, reply_markup: keyboard(buttons), disable_notification: silent });

/** A card with its image when it has one (captions stop at 1024 characters, so long ones go as text). */
export async function sendCard(chatId: number, c: Card): Promise<void> {
  if (c.photo && c.text.length <= 1024) {
    try {
      await call("sendPhoto", { chat_id: chatId, photo: c.photo, caption: c.text, parse_mode: "HTML", reply_markup: keyboard(c.buttons) });
      return;
    } catch {
      // An image Telegram can't fetch shouldn't hide the item.
    }
  }
  await sendText(chatId, c.text, c.buttons);
}

/** What Telegram last saw when it called the webhook (for the GET health check). */
export const webhookInfo = () =>
  call<{ url: string; pending_update_count: number; last_error_date?: number; last_error_message?: string }>("getWebhookInfo", {});

export const sendTyping =(chatId: number) => call("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => null);

export const answerButton = (callbackId: string, text: string) => call("answerCallbackQuery", { callback_query_id: callbackId, text }).catch(() => null);

export const setButtons = (chatId: number, messageId: number, buttons: Button[]) =>
  call("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: keyboard(buttons) ?? { inline_keyboard: [] } }).catch(() => null);

/** Keeps the / menu in step with what the bot can do: once per server start, without anyone running a script. */
let menuSet = false;
export function ensureMenu(): void {
  if (menuSet) return;
  menuSet = true;
  void call("setMyCommands", { commands: MENU }).catch(() => (menuSet = false));
}
