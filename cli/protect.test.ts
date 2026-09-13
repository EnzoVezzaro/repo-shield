import { test } from "node:test";
import assert from "node:assert/strict";
import { protectRepo, classifyError, BRANCH, PR_TITLE } from "./protect.ts";

interface RecordedCall {
  method: string;
  url: string;
  body?: any;
}

const send = (status: number, data: any) =>
  ({ status, ok: status >= 200 && status < 300, json: () => Promise.resolve(data), text: () => Promise.resolve("") } as unknown as Response);

function record(calls: RecordedCall[]) {
  return async (input: any, init?: any): Promise<Response> => {
    let url = typeof input === "string" ? input : input.url;
    url = url.replace("https://api.github.com", "");
    const method = (init?.method ?? (typeof input !== "string" ? input.method : "GET")) || "GET";
    let body: any;
    if (init?.body) {
      try {
        body = JSON.parse(String(init.body));
      } catch {
        body = String(init.body);
      }
    }
    calls.push({ method, url, body });
    const route = (globalThis as any).__routes?.[url];
    if (!route) throw new Error("unmocked URL: " + method + " " + url);
    return route(method, body);
  };
}

function install(routes: Record<string, (method: string, body?: any) => Response>, calls: RecordedCall[]): () => void {
  const orig = globalThis.fetch;
  (globalThis as any).__routes = routes;
  (globalThis as any).fetch = record(calls);
  return () => {
    (globalThis as any).fetch = orig;
    delete (globalThis as any).__routes;
  };
}

test("protect opens a PR with the full 6-file pack (blobs, tree, commit, ref)", async () => {
  const calls: RecordedCall[] = [];
  const blobs: string[] = [];
  let blobCount = 0;

  const routes: Record<string, (method: string, body?: any) => Response> = {
    "/repos/o/r": () => send(200, { default_branch: "main" }),
    "/repos/o/r/pulls?state=open&head=o:repo-shield/protect&base=main": () => send(200, []),
    "/repos/o/r/git/ref/heads%2Frepo-shield%2Fprotect": () => send(404, { message: "not found" }),
    "/repos/o/r/git/ref/heads/main": () => send(200, { object: { sha: "AAAA" } }),
    "/repos/o/r/git/commits/AAAA": () => send(200, { tree: { sha: "TREE" } }),
    "/repos/o/r/git/blobs": (m, body) => {
      blobCount++;
      blobs.push(Buffer.from(body.content, "base64").toString("utf8"));
      return send(201, { sha: "B" + blobCount });
    },
    "/repos/o/r/git/trees": (m, body) => {
      const paths = body.tree.map((t: any) => t.path);
      assert.deepEqual(new Set(paths), new Set(["LICENSE", "NOTICE", "AI_TRAINING_POLICY.md", "REPO_SHIELD.txt", ".github/workflows/repo-shield.yml", "scripts/shield-check.mjs"]));
      return send(201, { sha: "TREE2" });
    },
    "/repos/o/r/git/commits": (m, body) => {
      assert.equal(body.message, PR_TITLE);
      assert.deepEqual(body.parents, ["AAAA"]);
      assert.match(body.author.email, /^[0-9]+\+repo-shield\[bot\]@users\.noreply\.github\.com$/);
      assert.equal(body.tree, "TREE2");
      return send(201, { sha: "COMM" });
    },
    "/repos/o/r/git/refs": (m, body) => {
      assert.equal(body.ref, `refs/heads/${BRANCH}`);
      assert.equal(body.sha, "COMM");
      return send(201, { ref: `refs/heads/${BRANCH}` });
    },
    "/repos/o/r/pulls": (m) => send(201, { number: 7, html_url: "https://github.com/o/r/pull/7" }),
  };

  const restore = install(routes, calls);
  try {
    const res = await protectRepo("TOK", "o/r", { license: "mit", holder: "Jane Doe", year: 2026 });
    assert.equal(blobCount, 6);
    assert.ok(blobs.every((b) => b.length > 50));
    const all = blobs.join("\n---\n");
    for (const marker of ["License", "NOTICE", "AI_TRAINING", "REPO", "on:", "shield", "--"]) {
      assert.ok(all.includes(marker), `expected ${JSON.stringify(marker)} in pack`);
    }
    assert.equal(res.status, "ok");
    assert.equal(res.number, 7);
    assert.equal(res.pr_url, "https://github.com/o/r/pull/7");
  } finally {
    restore();
  }
});

test("an already-open PR short-circuits to status exists", async () => {
  const calls: RecordedCall[] = [];
  const restore = install(
    {
      "/repos/o/r": () => send(200, { default_branch: "main" }),
      "/repos/o/r/pulls?state=open&head=o:repo-shield/protect&base=main": () =>
        send(200, [{ number: 3, html_url: "https://github.com/o/r/pull/3" }]),
    },
    calls,
  );
  try {
    const res = await protectRepo("TOK", "o/r", { license: "mit", holder: "Jane", year: 2026 });
    assert.equal(res.status, "exists");
    assert.equal(res.number, 3);
  } finally {
    restore();
  }
});

test("an install-blocked repo surfaces as an install-guidance error", async () => {
  const calls: RecordedCall[] = [];
  const restore = install(
    {
      "/repos/o/r": () => send(403, { message: "installation access not granted" }),
    },
    calls,
  );
  try {
    const res = await protectRepo("TOK", "o/r", { license: "mit", holder: "Jane", year: 2026 });
    assert.equal(res.status, "error");
    assert.equal(classifyError(res.error || ""), "install");
  } finally {
    restore();
  }
});

test("invalid repo names are rejected before any network call", async () => {
  const calls: RecordedCall[] = [];
  const restore = install({}, calls);
  try {
    const bad = await protectRepo("TOK", "../not-a-repo!", { license: "mit", holder: "Jane", year: 2026 });
    assert.equal(bad.status, "error");
    assert.match(bad.error || "", /invalid repo name/);
    assert.equal(calls.length, 0);
    assert.equal(classifyError("403 Forbidden — repository could not be found"), "install");
    assert.equal(classifyError("401 Bad credentials"), "auth");
    assert.equal(classifyError("some other thing happened"), "other");
  } finally {
    restore();
  }
});