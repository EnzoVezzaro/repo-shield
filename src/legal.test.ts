import { test } from "node:test";
import assert from "node:assert/strict";
import { protectionFiles, LICENSE_OPTIONS } from "../cli/lib/legal.ts";
import { SPDX_LICENSES } from "../cli/lib/spdx.ts";
import { monitorWorkflow, shieldCheckScript } from "../cli/lib/monitor.ts";
import { applyAllNote, applyAllScript } from "./lib/applyAll.ts";

test("protection pack contains the four core protected files with SPDX headers", () => {
  const { files } = protectionFiles("octocat/hello", "Jane Doe", 2026, "mit");
  assert.deepEqual(Object.keys(files).sort(), [
    "AI_TRAINING_POLICY.md",
    "LICENSE",
    "NOTICE",
    "REPO_SHIELD.txt",
  ]);
  for (const f of ["LICENSE", "NOTICE", "AI_TRAINING_POLICY.md"] as const) {
    assert.ok(files[f].includes("SPDX-License-Identifier"), "expected SPDX header in " + f);
  }
});

test("MIT pack embeds the canonical text and the real holder", () => {
  const r = protectionFiles("octocat/hello", "Jane Doe", 2026, "mit");
  assert.ok(r.files.LICENSE.startsWith("MIT License"));
  assert.ok(r.files.LICENSE.includes("SPDX-License-Identifier: MIT"));
  assert.ok(r.files.LICENSE.includes("Copyright (c) 2026 Jane Doe"));
  assert.ok(!r.files.LICENSE.includes("" + "<" + "year>"), "placeholder must be substituted");
  assert.ok(r.files.LICENSE.includes("Permission is hereby granted"));
  assert.ok(r.files.LICENSE.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
  assert.ok(r.files.NOTICE.includes("AI-TRAINING / MACHINE-LEARNING USE"));
  assert.ok(r.files["AI_TRAINING_POLICY.md"].includes("ai-training-consent"));
  assert.equal(r.missingFullText.length, 0);
});

test("every license embeds the full canonical SPDX text, nothing is faked", () => {
  for (const license of LICENSE_OPTIONS.map((o) => o.id)) {
    const r = protectionFiles("octocat/hello", "Jane Doe", 2026, license);
    assert.equal(r.missingFullText.length, 0, `${license} must embed its full text`);
    assert.ok(r.files.LICENSE.includes(`SPDX-License-Identifier: ${({ mit: "MIT", isc: "ISC", unlicense: "Unlicense", "apache-2.0": "Apache-2.0", "gpl-3.0": "GPL-3.0-only" } as Record<string, string>)[license]}`), license);
    if (license === "apache-2.0") {
      assert.ok(r.files.LICENSE.includes("TERMS AND CONDITIONS FOR USE"), license);
      assert.ok(r.files.LICENSE.includes("APPENDIX"), license);
    }
    if (license === "gpl-3.0") {
      assert.ok(r.files.LICENSE.includes("GNU GENERAL PUBLIC LICENSE"), license);
      assert.ok(r.files.LICENSE.includes("Preamble"), license);
      assert.ok(r.files.NOTICE.includes("GPL-3.0-only"), license);
    }
  }
});

test("the SPDX registry metadata is OSI-approved and current", () => {
  assert.equal(SPDX_LICENSES.length, 5);
  for (const meta of SPDX_LICENSES) {
    assert.ok(meta.osiApproved, `${meta.spdxId} must be OSI-approved`);
    assert.ok(!meta.deprecated, `${meta.spdxId} must not be deprecated`);
    assert.ok(meta.text.length > 700, `${meta.spdxId} must carry the full canonical text`);
  }
});

test("monitor workflow schedules weekly and grants issue write", () => {
  const wf = monitorWorkflow();
  assert.match(wf, /cron: "0 3 \* \* 1"/);
  assert.match(wf, /issues: write/);
  assert.match(wf, /node scripts\/shield-check\.mjs/);
});

test("shield-check script verifies markers, license integrity, and is self-contained", () => {
  const s = shieldCheckScript();
  assert.match(s, /REPO_SHIELD_SEARCH_TERM/);
  assert.match(s, /ai-training-consent/);
  assert.match(s, /SPDX-License-Identifier/);
  assert.match(s, /KNOWN_SPDX/);
  assert.match(s, /GPL-3\.0-only/);
  assert.match(s, /placeholder/);
  assert.match(s, /license mismatch/);
});

test("apply-all script is shell-safe and touches only protected files", () => {
  const s = applyAllScript();
  assert.match(s, /gh repo list/);
  assert.match(s, /skips forks|\.fork/);
  assert.ok(s.includes("LICENSE NOTICE AI_TRAINING_POLICY.md"));
  assert.match(applyAllNote(), /chmod \+x/);
  assert.match(applyAllNote(), /skips forks/);
});