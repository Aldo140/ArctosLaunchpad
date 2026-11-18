import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyStripeSignature(raw: string, signature: string | null, secret = process.env.STRIPE_WEBHOOK_SECRET, now = Date.now()): boolean {
  if (!secret || !signature) return false;
  const pairs = signature.split(",").map((part) => part.split("=", 2) as [string, string]);
  const timestamp = pairs.find(([name]) => name === "t")?.[1];
  const sent = pairs.filter(([name]) => name === "v1").map(([, value]) => value);
  if (!timestamp || !sent.length || !Number.isFinite(Number(timestamp)) || Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex");
  return sent.some((value) => {
    if (!/^[a-f0-9]{64}$/i.test(value)) return false;
    const received = Buffer.from(value, "hex");
    const wanted = Buffer.from(expected, "hex");
    return received.length === wanted.length && timingSafeEqual(wanted, received);
  });
}
