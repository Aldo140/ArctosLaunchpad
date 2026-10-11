#!/usr/bin/env bash
# The last step of an hq-agent.yml job: save the outcome on the job and text
# it to Aldo through /api/hq/agent/notify, which checks this run's GitHub
# OIDC token instead of a stored key. Prints nothing private.
set -u
[ -s "$RUNNER_TEMP/result.txt" ] || echo "The job failed before the agent could answer. The run link has the details." > "$RUNNER_TEMP/result.txt"
node ops/agent-jobs.ts finish "$JOB" "${STATUS:-failed}" "$RUNNER_TEMP/result.txt" || echo "::warning::Couldn't save the outcome on the job."
oidc=$(curl -sf -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=arctos-hq-agent" | jq -r .value)
if curl -sf -X POST https://arctoslaunchpad.com/api/hq/agent/notify \
  -H "Authorization: Bearer $oidc" -H 'Content-Type: application/json' -d "{\"job\":\"$JOB\"}" > /dev/null; then
  echo "Texted Aldo."
else
  echo "::warning::Couldn't text the result; it's saved on the job in HQ."
fi
