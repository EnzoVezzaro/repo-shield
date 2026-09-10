export function shieldCheckScript(): string {
  return `// Repo Shield monitoring check (generated).
// Verifies this repository carries the expected protection files and, when a
// search term is configured, heuristically detects public copies being used
// for training. Detection is heuristic by design; it is not proof of
// infringement and is not legal advice.
import { readFileSync, existsSync } from "node:fs";

const REQUIRED = ["LICENSE", "NOTICE", "AI_TRAINING_POLICY.md"];
const MARKERS = { NOTICE: "AI-TRAINING", "AI_TRAINING_POLICY.md": "ai-training-consent" };

let failures = 0;
const report = [];
for (const file of REQUIRED) {
  const present = existsSync(file);
  const marker = MARKERS[file];
  const ok = present && (!marker || readFileSync(file, "utf8").includes(marker));
  if (!ok) failures++;
  report.push(\`\${ok ? "OK  " : "FAIL"} \${file}\`);
}
console.log(report.join("\\n"));

const term = process.env.REPO_SHIELD_SEARCH_TERM;
if (term) {
  console.log("Scanning public copies (heuristic)...");
  const res = await fetch(
    \`https://api.github.com/search/code?q=\${encodeURIComponent(term)}&\`,
    { headers: { Authorization: \`Bearer \${process.env.GITHUB_TOKEN}\`, Accept: "application/vnd.github+json" } },
  );
  if (res.status === 200) {
    const json = await res.json();
    const total = json.total_count ?? 0;
    const inThisRepo = (json.items ?? []).filter((i) => i.repository.full_name === process.env.GITHUB_REPOSITORY);
    const others = (json.items ?? []).filter((i) => i.repository.full_name !== process.env.GITHUB_REPOSITORY);
    console.log(\`Public copies outside this repo: \${others.length} (total hits \${total})\`);
    if (others.length > 0 && inThisRepo.length === 0) {
      // Probable scraped/ingested copy outside our control.
      failures++;
      console.log("WARNING: protection marker found outside this repository.");
    }
  } else {
    console.log(\`Scan skipped (api status \${res.status}); set REPO_SHIELD_SEARCH_TERM in env to enable.\`);
  }
}

if (failures > 0) {
  const body = \`## Repo Shield found gaps\\n\\n\${report.join("\\n")}\\n\\nAdd or fix the flagged files, then re-run this workflow.\\n\\n_This is an automated check; it is heuristic and not legal advice._\`;
  const { execSync } = await import("node:child_process");
  try {
    const title = "Repo Shield: protection files missing";
    console.log("Opening issue via gh...");
    execSync(\`gh issue create --title "\${title}" --body "\${body.replace(/"/g, '\\\\"')}"\`, { stdio: "inherit" });
  } catch (e) {
    console.error("Could not open issue:", e?.message);
  }
  process.exit(1);
}
console.log("Protected: licenses and AI-training notices are present.");
`;
}

export function monitorWorkflow(): string {
  return `name: Repo Shield

on:
  # Run weekly on Monday 03:00 UTC; trigger manually from the Actions tab too.
  schedule:
    - cron: "0 3 * * 1"
  workflow_dispatch: {}

permissions:
  contents: read
  issues: write

jobs:
  protected:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Repo Shield check
        env:
          GITHUB_TOKEN: \${{ github.token }}
          GITHUB_REPOSITORY: \${{ github.repository }}
        run: node scripts/shield-check.mjs
`;
}