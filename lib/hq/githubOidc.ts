import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Proof that a request comes from one of Aldo's own GitHub workflows: the
 * run's OIDC token, signed by GitHub, for this audience, from a workflow file
 * whose ref starts with one of `workflows` ("owner/repo/.github/workflows/x.yml@").
 * No stored key. Throws when it doesn't check out.
 */

const ISSUER = "https://token.actions.githubusercontent.com";
const jwks = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks`));

export async function verifyWorkflow(authorization: string | null, audience: string, workflows: string[]): Promise<void> {
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("no token");
  const { payload } = await jwtVerify(token, jwks, { issuer: ISSUER, audience });
  const ref = String(payload.workflow_ref ?? "");
  if (!workflows.some((w) => w.startsWith(`${String(payload.repository)}/`) && ref.startsWith(w))) throw new Error("wrong workflow");
}
