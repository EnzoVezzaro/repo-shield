import { protectionFiles } from "./lib/legal.ts";
import { monitorWorkflow, shieldCheckScript } from "./lib/monitor.ts";

const GH = "https://api.github.com";
const BRANCH = "repo-shield/protect";
const PR_TITLE = "Protect repo: license, AI-training notice, Repo Shield monitoring";
const PR_BODY =
  "This change applies the Repo Shield protection pack: a license, an AI-training NOTICE, and a machine-readable AI policy, plus a weekly monitoring workflow that verifies these files stay present. Run by Repo Shield. Review before merging; nothing on the default branch changes until you accept.";

const jsonHeaders = { Accept: "application/vnd.github+json", "Content-Type": "application/json" };

async function gh(path: string, token: string, init: RequestInit = {}): Promise<{ status: number; json: any }> {
  return fetch(GH + path, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}`, ...jsonHeaders },
  }).then(async (r) => ({ status: r.status, json: await r.json().catch(() => null) }));
}

export { GH, BRANCH, PR_TITLE, PR_BODY };

export interface ProtectOpts {
  license: "mit" | "isc" | "unlicense" | "apache-2.0" | "gpl-3.0";
  holder: string;
  year: number;
}

export interface ProtectResult {
  full_name: string;
  status: "ok" | "exists" | "error";
  number?: number;
  pr_url?: string;
  branch?: string;
  error?: string;
}

interface GitFile {
  path: string;
  content: string;
}

export async function repoDefaultBranch(token: string, fullName: string): Promise<string> {
  const r = await gh(`/repos/${fullName}`, token);
  if (r.status !== 200) throw new Error(`cannot reach ${fullName} (HTTP ${r.status})`);
  return r.json.default_branch as string;
}

/**
 * The root cause a protect run failed for (used to surface an install hint).
 */
export function classifyError(msg: string): "install" | "auth" | "other" {
  if (/403|not (have|granted) access|not accessible|could not be dereferenced|install|installation/i.test(msg)) return "install";
  if (/401|bad credentials|token|scope/i.test(msg)) return "auth";
  return "other";
}

/** Protect one repo: create the branch (one commit) if needed, open the PR, return the PR row. */
export async function protectRepo(token: string, fullName: string, opts: ProtectOpts): Promise<ProtectResult> {
  if (!/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(fullName)) {
    return { full_name: fullName, status: "error", error: `invalid repo name: ${fullName}` };
  }
  const [owner] = fullName.split("/");
  try {
    const base = await repoDefaultBranch(token, fullName);

    /* Idempotent: an open PR for this branch is success. */
    const openPr = await gh(`/repos/${fullName}/pulls?state=open&head=${encodeURIComponent(owner)}:${BRANCH}&base=${encodeURIComponent(base)}`, token);
    if (openPr.status === 200 && Array.isArray(openPr.json) && openPr.json[0]) {
      const pr = openPr.json[0];
      return { full_name: fullName, status: "exists", number: pr.number, pr_url: pr.html_url, branch: BRANCH };
    }

    /* Reuse an existing branch if it's there; never overwrite its contents. */
    const existingRef = await gh(`/repos/${fullName}/git/ref/${encodeURIComponent("heads/" + BRANCH)}`, token);
    if (existingRef.status !== 200 && existingRef.status !== 404) {
      throw new Error(existingRef.json?.message || `reading ${BRANCH} failed (HTTP ${existingRef.status})`);
    }
    if (existingRef.status === 404) {
      await createBranchCommit(token, fullName, base, opts);
    }

    const pr = await gh(
      `/repos/${fullName}/pulls`,
      token,
      { method: "POST", body: JSON.stringify({ title: PR_TITLE, head: BRANCH, base, body: PR_BODY }) },
    );
    if (pr.status === 201 && pr.json?.number) {
      return { full_name: fullName, status: "ok", number: pr.json.number, pr_url: pr.json.html_url, branch: BRANCH };
    }
    if (pr.status === 422 && pr.json?.errors?.some((e: any) => (e.message || "").toLowerCase().includes("a pull request already exists"))) {
      const list = await gh(`/repos/${fullName}/pulls?state=open&head=${encodeURIComponent(owner)}:${BRANCH}&base=${encodeURIComponent(base)}`, token);
      const found = Array.isArray(list.json) && list.json[0] ? list.json[0] : null;
      if (found) return { full_name: fullName, status: "exists", number: found.number, pr_url: found.html_url, branch: BRANCH };
    }
    throw new Error(pr.json?.message || `opening a PR failed (HTTP ${pr.status})`);
  } catch (e: any) {
    return { full_name: fullName, status: "error", error: e?.message || "failed" };
  }
}

/** Write the pack files into reposhield/protect as one commit on top of the current default branch. */
async function createBranchCommit(token: string, fullName: string, base: string, opts: ProtectOpts): Promise<void> {
  const pack = protectionFiles(fullName, opts.holder, opts.year, opts.license);
  const files: GitFile[] = [
    { path: "LICENSE", content: pack.files.LICENSE },
    { path: "NOTICE", content: pack.files.NOTICE },
    { path: "AI_TRAINING_POLICY.md", content: pack.files["AI_TRAINING_POLICY.md"] },
    { path: "REPO_SHIELD.txt", content: pack.files["REPO_SHIELD.txt"] },
    { path: ".github/workflows/repo-shield.yml", content: monitorWorkflow() },
    { path: "scripts/shield-check.mjs", content: shieldCheckScript() },
  ];

  const baseRef = await gh(`/repos/${fullName}/git/ref/heads/${encodeURIComponent(base)}`, token);
  if (baseRef.status !== 200) throw new Error(`no ${base} branch (HTTP ${baseRef.status})`);
  const baseSha = baseRef.json.object.sha as string;
  const commitInfo = await gh(`/repos/${fullName}/git/commits/${baseSha}`, token);
  const baseTree = commitInfo.json?.tree?.sha as string | undefined;
  if (!baseTree) throw new Error("could not resolve base tree");

  const blobs: { sha: string; path: string }[] = [];
  for (const f of files) {
    const b = await gh(
      `/repos/${fullName}/git/blobs`,
      token,
      { method: "POST", body: JSON.stringify({ content: Buffer.from(f.content, "utf8").toString("base64"), encoding: "base64" }) },
    );
    if (b.status !== 201 && b.status !== 200) throw new Error(b.json?.message || `blob failed (HTTP ${b.status})`);
    blobs.push({ sha: b.json.sha as string, path: f.path });
  }

  const tree = await gh(
    `/repos/${fullName}/git/trees`,
    token,
    { method: "POST", body: JSON.stringify({ base_tree: baseTree, tree: blobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })) }) },
  );
  if (tree.status !== 201 && tree.status !== 200) throw new Error(tree.json?.message || "tree failed");

  const botEmail = `${999999 + Math.floor(Math.random() * 899999)}+repo-shield[bot]@users.noreply.github.com`;
  const commit = await gh(
    `/repos/${fullName}/git/commits`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        message: PR_TITLE,
        tree: tree.json.sha,
        parents: [baseSha],
        author: { name: "Repo Shield", email: botEmail },
        committer: { name: "Repo Shield", email: botEmail },
      }),
    },
  );
  if (commit.status !== 201 && commit.status !== 200) throw new Error(commit.json?.message || "commit failed");

  const ref = await gh(
    `/repos/${fullName}/git/refs`,
    token,
    { method: "POST", body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: commit.json.sha }) },
  );
  if (ref.status !== 201 && ref.status !== 200) throw new Error(ref.json?.message || "branch ref failed");
}