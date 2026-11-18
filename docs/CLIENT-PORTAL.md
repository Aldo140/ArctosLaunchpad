# Arctos client portal

The private portal lives at `/portal`. Clients sign in with a passwordless
email link or Google, then see their project, milestones, documents, activity
and Stripe subscription.

## Security model

- Firebase verifies identity. An authenticated email still receives nothing
  unless a matching `client_accounts` record exists.
- Account document ids are SHA-256 hashes of normalized email addresses, not
  readable addresses.
- Every snapshot, document and billing request rechecks both the Firebase token
  and account membership on the server.
- Stripe Checkout collects the initial recurring-payment authorization. Stripe
  Billing Portal handles payment methods, invoices and cancellation.
- Arctos stores Stripe customer/subscription ids and payment status, never full
  card or bank details.
- Stripe webhook bodies are verified with the endpoint signing secret and a
  five-minute timestamp tolerance.

## Production configuration

Existing Firebase and Google workload-identity variables used by HQ also power
the portal. Add these Vercel Production secrets:

- `STRIPE_SECRET_KEY`: Stripe restricted or secret key with Checkout, Billing
  Portal, Customers, Subscriptions, Prices and webhook access.
- `STRIPE_WEBHOOK_SECRET`: signing secret for the webhook endpoint.

In Firebase Authentication, enable:

1. Google provider.
2. Email/Password provider, including Email link (passwordless sign-in).
3. `arctoslaunchpad.com` as an authorized domain.

In Stripe:

1. Activate the Customer Portal and allow payment-method changes, invoice
   history and subscription cancellation.
2. Activate Stripe Tax and confirm the Canadian tax registrations/rules that
   apply to Arctos; Checkout requests automatic tax calculation.
3. Enable the payment methods Arctos accepts. For Canadian pre-authorized bank
   debit, enable ACSS debit and complete Stripe's required business settings.
4. Add a webhook endpoint at
   `https://arctoslaunchpad.com/api/portal/webhook` for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the endpoint signing secret to `STRIPE_WEBHOOK_SECRET`.

Stripe controls which eligible payment methods Checkout shows based on the
account, currency and Dashboard settings. ACSS debit includes its own mandate
and verification flow; do not collect bank details in an Arctos form.

## Client record

Open `/portal/admin` while signed into an email in `HQ_ALLOWED_EMAILS` to create
or update a workspace. The form creates the Stripe Product and monthly Price,
saves the approved client email, and can attach the first secure contract URL.
The client then visits `/portal`, enters that email and receives a sign-in link.

Records live at `client_accounts/{sha256(email).slice(0,32)}` with one string
field named `payload`. The payload follows `ClientAccount` in
`lib/portal/types.ts`. The billing price is a Stripe recurring Price id; the
webhook fills the customer and subscription ids after Checkout.

Document URLs must be HTTPS and access-controlled at their source. The portal
checks that the signed-in client owns the document record before returning its
link. Use expiring or account-restricted links for confidential contracts.

## Launch checklist

- In Vercel Production, confirm every item below exists; never paste values into
  source control or chat: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_SITE_URL`, all `NEXT_PUBLIC_FIREBASE_*` values,
  `HQ_ALLOWED_EMAILS`, and the existing `GCP_*` workload-identity values.
- Set `NEXT_PUBLIC_SITE_URL` exactly to `https://arctoslaunchpad.com`. Checkout
  deliberately refuses to start without a canonical HTTPS return origin.
- Open `/portal/admin` in production. Its readiness panel must be fully green
  before inviting a client.
- Use Stripe test mode first and complete a card subscription, failed payment,
  payment-method update and cancellation.
- If using ACSS debit, test the delayed settlement and mandate experience.
- Confirm the webhook changes portal status exactly once when Stripe retries.
- Test a valid client, an unknown email, an expired email link and a document
  from another account.
- Add the first contract and verify its source permissions with a logged-out
  browser.
- Move to live Stripe keys only after the test-mode path passes.

## Release and incident runbook

1. Create one internal test client at `/portal/admin` using a separate email.
2. Complete Checkout and confirm `customer.subscription.*` and `invoice.paid`
   are HTTP 200 in Stripe Workbench. `checkout.session.completed` records the
   authorization but does not falsely mark delayed ACSS debit as paid.
3. Retry the same webhook in Stripe. The activity entry must appear once.
4. Open Billing Portal, replace the payment method, download an invoice, then
   cancel at period end. Confirm each status appears in `/portal`.
5. If billing is impaired, disable the affected Price or payment method in
   Stripe; do not delete client records. Stripe remains the payment source of
   truth and retries webhook delivery automatically.
6. Rotate a leaked Stripe key in Stripe, replace the matching Vercel secret,
   redeploy, then revoke the old key. Rotate a webhook secret by temporarily
   accepting both endpoints during the Stripe-controlled transition.

The account store uses conditional Firestore writes for webhook updates, so
simultaneous invoice and subscription events retry instead of overwriting one
another. Checkout and Stripe product creation use idempotency keys to make
double taps and network retries safe.
