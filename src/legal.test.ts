import { test } from "node:test";
import assert from "node:assert/strict";
import { protectionFiles, LICENSE_OPTIONS } from "./lib/legal.ts";
import { monitorWorkflow, shieldCheckScript } from "./lib/monitor.ts";
import { applyAllNote, applyAllScript } from "./lib/applyAll.ts";

test("protection pack contains the five protected files", () => {
  const { files } = protectionFiles("octocat/hello", "Jane Doe", 2026, "mit");
  assert.deepEqual(Object.keys(files).sort(), [
    "AI_TRAINING_POLICY.md",
    "LICENSE",
    "NOTICE",
    "REPO_SHIELD.txt",
  ]);
});

test("MIT pack embeds the standard text and no missing-text warning", () => {
  const r = protectionFiles("octocat/hello", "Jane Doe", 2026, "mit");
  assert.ok(r.files.LICENSE.includes("Permission is hereby granted"));
  assert.ok(r.files.NOTICE.includes("AI-TRAINING / MACHINE-LEARNING USE"));
  assert.ok(r.files["AI_TRAINING_POLICY.md"].includes("ai-training-consent"));
  assert.equal(r.missingFullText.length, 0);
});

test("Apache and GPL refuse to fake a full license text", () => {
  for (const license of ["apache-2.0", "gpl-3.0"] as const) {
    const r = protectionFiles("octocat/hello", "Jane Doe", 2026, license);
    assert.ok(r.missingFullText.length === 1, license);
    assert.match(r.missingFullText[0] as string, /Paste the canonical text/);
  }
});

test("every license option renders", () => {
  for (const opt of LICENSE_OPTIONS) {
    const { files } = protectionFiles("octocat/x", "Jane Doe", 2026, opt.id);
    assert.ok(files.LICENSE.length > 60, opt.id);
  }
});

test("monitor workflow schedules weekly and grants issue write", () => {
  const wf = monitorWorkflow();
  assert.match(wf, /cron: "0 3 \* \* 1"/);
  assert.match(wf, /issues: write/);
  assert.match(wf, /node scripts\/shield-check\.mjs/);
});

test("shield-check script verifies markers and exports are self-contained", () => {
  const s = shieldCheckScript();
  assert.match(s, /REPO_SHIELD_SEARCH_TERM/);
  assert.match(s, /ai-training-consent/);
});

test("apply-all script is shell-safe and touches only protected files", () => {
  const s = applyAllScript();
  assert.match(s, /gh repo list/);
  assert.match(s, /skips forks|\.fork/);
  assert.ok(s.includes("LICENSE NOTICE AI_TRAINING_POLICY.md"));
  assert.match(applyAllNote(), /chmod \+x/);
  assert.match(applyAllNote(), /skips forks/);
});