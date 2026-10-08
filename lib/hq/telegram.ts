import type { Card } from "./telegramBot";

/**
 * The few Telegram Bot API calls HQ makes, with the token in
 * HQ_TELEGRAM_BOT_TOKEN (from @BotFather). Messages use Telegram's HTML mode.
 */

type Markup = { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> };

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

const keyboard = (buttons: Card["buttons"]): Markup | undefined =>
  buttons.length ? { inline_keyboard: [buttons.map((b) => ({ text: b.text, callback_data: b.data }))] } : undefined;

export const sendText = (chatId: number, text: string, buttons: Card["buttons"] = []) =>
  call("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", link_preview_options: { is_disabled: true }, reply_markup: keyboard(buttons) });

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

export const sendTyping = (chatId: number) => call("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => null);

export const answerButton = (callbackId: string, text: string) => call("answerCallbackQuery", { callback_query_id: callbackId, text }).catch(() => null);

export const setButtons = (chatId: number, messageId: number, buttons: Card["buttons"]) =>
  call("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: keyboard(buttons) ?? { inline_keyboard: [] } }).catch(() => null);
