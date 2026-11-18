const API = "https://api.stripe.com/v1";

export class StripeRequestError extends Error {
  constructor(readonly status: number, readonly requestId: string | null, message = "Stripe could not complete the request.") { super(message); }
}

function key() {
  const value = process.env.STRIPE_SECRET_KEY;
  if (!value) throw new Error("Billing is not connected yet.");
  return value;
}

export async function stripePost<T>(path: string, params: URLSearchParams, idempotencyKey?: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey.slice(0, 255) } : {}),
    },
    body: params,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new StripeRequestError(response.status, response.headers.get("request-id"), body.error?.message);
  return body;
}
