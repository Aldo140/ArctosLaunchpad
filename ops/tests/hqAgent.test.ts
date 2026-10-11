/** The HQ agent's job queue: what a job looks like and what Aldo is texted (pure; no network). */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { cleanTask, jobFromFields, jobMessage, startedMessage } from '../../lib/hq/agentJobs';

const fields = { kind: 'code', task: 'Add a gym streak to Today', by: 'mrotiz14@gmail.com', chatId: 8848971875, at: 1, status: 'pushed', result: 'Added it <b>now</b>.', commit: 'abc123', branch: null, run: 'https://github.com/Aldo140/ArctosLaunchpad/actions/runs/1', finishedAt: 2 };

describe('HQ agent jobs', () => {
  it('keeps a usable task and drops an empty one', () => {
    assert.equal(cleanTask('  fix the money tab  '), 'fix the money tab');
    assert.equal(cleanTask(' '), null);
    assert.equal(cleanTask(42), null);
    assert.equal(cleanTask('x'.repeat(5000))?.length, 4000);
  });

  it('reads a stored job, defaulting anything unknown to a code job', () => {
    const job = jobFromFields('j1', fields);
    assert.equal(job.kind, 'code');
    assert.equal(job.chatId, 8848971875);
    assert.equal(jobFromFields('j2', { ...fields, kind: 'mail' }).kind, 'mail');
    assert.equal(jobFromFields('j3', { ...fields, kind: 'anything' }).kind, 'code');
    assert.equal(jobFromFields('j4', { task: 't' }).status, 'pending');
  });

  it('reports a pushed change with the commit, escaping what Claude wrote', () => {
    const text = jobMessage(jobFromFields('j1', fields));
    assert.match(text, /pushed to main/);
    assert.match(text, /Added it &lt;b&gt;now&lt;\/b&gt;\./);
    assert.match(text, /commit\/abc123/);
  });

  it('points a change whose checks failed at its branch, not main', () => {
    const text = jobMessage(jobFromFields('j1', { ...fields, status: 'checks-failed', commit: null, branch: 'hq-agent/j1' }));
    assert.match(text, /not on main/);
    assert.match(text, /compare\/main\.\.\.hq-agent\/j1/);
    assert.doesNotMatch(text, /commit\//);
  });

  it('only promises the checks for code jobs', () => {
    assert.match(startedMessage('code', 'x'), /checks pass/);
    assert.doesNotMatch(startedMessage('mail', 'x'), /checks/);
  });
});

describe('hq-agent.yml', () => {
  const wf = readFileSync(new URL('../../.github/workflows/hq-agent.yml', import.meta.url), 'utf8');
  const section = (name: string, next?: string) => wf.slice(wf.indexOf(`\n  ${name}:\n`), next ? wf.indexOf(`\n  ${next}:\n`) : undefined);

  it('never gives the job that reads email the right to push or edit', () => {
    const mail = section('mail');
    assert.match(mail, /contents: read/);
    assert.doesNotMatch(mail, /contents: write/);
    assert.match(mail, /--disallowedTools "Edit" "Write"/);
    assert.doesNotMatch(mail, /git push/);
  });

  it('never gives the job that pushes any email access', () => {
    const code = section('code', 'mail');
    assert.doesNotMatch(code, /MS_CLIENT_SECRET|HQ_ACCESS_TOKEN|agent-mail/);
    assert.match(code, /persist-credentials: false/);
  });
});
