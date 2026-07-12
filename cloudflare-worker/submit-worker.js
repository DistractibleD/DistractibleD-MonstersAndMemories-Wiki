// Cloudflare Worker for the wiki's "Submit a Screenshot" form
// (see the "submit" page in script.js / renderSubmitPage).
//
// GitHub Pages can only serve static files — it can't run this code. This
// file isn't deployed by GitHub Pages at all; it's kept here purely for
// reference and version history. To actually deploy or update it, paste
// this file's contents into the Worker's editor in the Cloudflare
// dashboard (Workers & Pages -> your worker -> Edit Code) and click Deploy.
//
// Required Worker secret (Settings -> Variables -> add secret, NOT a plain
// variable): GITHUB_TOKEN — a GitHub fine-grained Personal Access Token,
// scoped to ONLY this repository, with "Contents: Read and write" and
// "Pull requests: Read and write" permissions and nothing else. Never paste
// this token anywhere except that one secret field.
//
// What this does, end to end: a visitor fills out the on-wiki form and
// submits. The browser POSTs the screenshot + notes here. This Worker then
// uses the GitHub API (with the token above) to create a new branch, commit
// the screenshot into images/Inbox/ on that branch, and open a pull request
// — it never commits to main directly. The site owner accepts a submission
// by merging that PR, or denies it by closing the PR without merging;
// either way nothing on the live site changes until that decision is made.

const OWNER = 'DistractibleD';
const REPO = 'DistractibleD-MonstersAndMemories-Wiki';
const BASE_BRANCH = 'main';
// Must match the wiki's real published URL exactly (scheme + host, no
// trailing path) — this is what keeps other websites from being able to
// call this Worker and open pull requests using your token.
const ALLOWED_ORIGIN = 'https://distractibled.github.io';

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return json({ error: 'Invalid submission — please try again.' }, 400);
    }

    // Honeypot field: real visitors never see or fill this in (see
    // renderSubmitPage), so anything that does is almost certainly a bot.
    // Respond as if it worked so the bot doesn't learn to avoid the field.
    if (form.get('website')) {
      return json({ ok: true });
    }

    const file = form.get('screenshot');
    const notes = (form.get('notes') || '').toString().slice(0, 2000);

    if (!file || typeof file === 'string') {
      return json({ error: 'No screenshot was attached.' }, 400);
    }
    if (file.size > MAX_BYTES) {
      return json({ error: 'That screenshot is too large (8MB max).' }, 400);
    }
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return json({ error: 'Please attach an image file (PNG, JPG, WEBP, or GIF).' }, 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = bytesToBase64(bytes);

    const gh = (path, opts = {}) => fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
      ...opts,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'wiki-submission-worker',
        ...(opts.headers || {})
      }
    });

    try {
      // 1. Read the latest commit on the base branch.
      const refRes = await gh(`/git/ref/heads/${BASE_BRANCH}`);
      if (!refRes.ok) throw new Error('read-base-branch');
      const baseSha = (await refRes.json()).object.sha;

      // 2. Create a new branch from that commit.
      const stamp = Date.now();
      const branch = `submission/${stamp}`;
      const createRefRes = await gh('/git/refs', {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha })
      });
      if (!createRefRes.ok) throw new Error('create-branch');

      // 3. Commit the screenshot into images/Inbox/ on that branch.
      const filename = `submission-${stamp}.${ext}`;
      const putRes = await gh(`/contents/images/Inbox/${filename}`, {
        method: 'PUT',
        body: JSON.stringify({
          message: `Add wiki submission (${filename})`,
          content: base64,
          branch
        })
      });
      if (!putRes.ok) throw new Error('commit-file');

      // 4. Open a pull request — this is the "waiting for accept/deny" step.
      const prBody = [
        'Submitted through the wiki\'s "Submit a Screenshot" form.',
        '',
        'This only adds the screenshot to `images/Inbox/` — nothing else changes, and ' +
          'nothing is live until this PR is merged. **Merge to accept, close (without ' +
          'merging) to deny.**',
        '',
        notes ? `Submitter's notes:\n\n${notes}` : '(No notes were included.)'
      ].join('\n');

      const prRes = await gh('/pulls', {
        method: 'POST',
        body: JSON.stringify({
          title: `Wiki submission: ${filename}`,
          head: branch,
          base: BASE_BRANCH,
          body: prBody
        })
      });
      if (!prRes.ok) throw new Error('open-pr');

      return json({ ok: true });
    } catch (err) {
      return json({ error: 'Something went wrong submitting this — please try again in a moment.' }, 502);
    }
  }
};

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}
