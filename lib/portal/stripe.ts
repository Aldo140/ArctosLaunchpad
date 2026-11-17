const API = "https://api.stripe.com/v1";

function key() {
  const value = process.env.STRIPE_SECRET_KEY;
  if (!value) throw new Error("Billing is not connected yet.");
  return value;
}

export async function stripePost<T>(path: string, params: URLSearchParams): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });
  const body = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message ?? `Stripe returned HTTP ${response.status}.`);
  return body;
}
