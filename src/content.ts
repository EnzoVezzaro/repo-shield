export const BRAND = "Repo Shield";
export const TAGLINE = "Protect every public repo from AI scraping.";
export const AUDIENCE = "Free and open source for every maintainer";
export const SUB = [
  "Every year you pour into public repos, and those repos get bulk-ingested for AI training",
  "without consent or credit. Repo Shield writes the position for you: a license and",
  "AI-training notice on every repo you own, then a weekly check that they stay put.",
].join(" ");

export const PAIN_POINTS: Array<{ title: string; body: string }> = [
  {
    title: "Your code trains models it never agreed to",
    body: "LLM pipelines bulk-ingest public repos at scale, and a LICENSE file is rarely read before training. Most repos never state an AI-training position at all.",
  },
  {
    title: "GitHub protects one repo at a time",
    body: "For a maintainer with dozens of repos, per-repo friction means the ones that matter never get covered. The gap grows with your catalog.",
  },
  {
    title: "Gaps are invisible",
    body: "A missing notice, a drifted file, a fork that stripped your marker. Nobody notices until your code turns up in a training run without a say.",
  },
];

export const PACK_MANIFEST: Array<{ file: string; role: string }> = [
  { file: "LICENSE", role: "Full license text under your holder and year." },
  { file: "NOTICE", role: "Explicit AI-training consent, human-readable and SPDX-stamped." },
  { file: "AI_TRAINING_POLICY.md", role: "Machine-readable policy plus the marker monitoring scans for." },
  { file: "REPO_SHIELD.txt", role: "Signature marker that flags public copies in scraping scans." },
  { file: ".github/workflows/repo-shield.yml", role: "Weekly monitoring run inside your own repo." },
  { file: "scripts/shield-check.mjs", role: "Verifies the files and scans for public copies." },
  { file: "apply-all.sh", role: "One command protect-commits every public repo you own." },
];

export const DOES: Array<string> = [
  "Writes a clear, machine-readable AI-training position on every repo.",
  "Makes accidental ingestion visible and gives you a defensible record.",
  "Checks every week from inside your own CI, flagging missing files and obvious re-publication.",
];

export const DOESNT: Array<string> = [
  "Can't stop scrapers. Nobody can. Anyone who promises to block training is selling a lie.",
  "Doesn't prove a model trained on your code. Detection is heuristic by design.",
  "Isn't legal advice. The templates are yours to verify against canonical SPDX text.",
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Doesn't adding a LICENSE already do this?",
    a: "A license defines rights, but almost nobody reads it before training. The NOTICE file makes your AI-training consent explicit and machine-readable, which is the deterrent most repos never set up. GitHub's tools make you do this one repo at a time; Repo Shield does it across everything.",
  },
  {
    q: "Can you actually stop AI companies from scraping my repo?",
    a: "No, and we say so on the tin. This is deterrence, not enforcement. Clear licensing plus explicit training notices give you a written position and make accidental ingestion visible, so you have a defensible record if you ever need to act. Anyone who promises to block scrapers is selling you a lie.",
  },
  {
    q: "Does Repo Shield need write access to all my repos?",
    a: "To apply the files automatically: yes, one generated script uses your existing gh CLI session. You can also download each file and add it by hand to a single repo with zero special permissions. Monitoring runs inside your own repo via GitHub Actions, so we never see your code.",
  },
  {
    q: "Your monitoring is heuristic. What does that mean?",
    a: "The weekly workflow checks that LICENSE, NOTICE and the AI policy exist and flags public copies of a unique marker string. It can't prove someone trained on your code; that would require forensic access we don't have. It catches the common failure modes (missing files, obvious re-publication) reliably.",
  },
  {
    q: "Is Repo Shield itself open source?",
    a: "Yes. The entire project is public under a permissive license with one extra condition: no AI training on the code. You can fork it, modify it, and run it yourself. Donations keep the templates audited and the tool maintained.",
  },
  {
    q: "Are you lawyers?",
    a: "No. Everything generated is template text, we're not giving legal advice, and we won't review your specific case. Licenses are templates you should verify against the canonical SPDX text before relying on them.",
  },
];

export const PRIVACY_SECTIONS: Array<[string, string]> = [
  [
    "What we collect",
    "Repo Shield processes only what is needed to run: the GitHub repo names you type and the protection choices you make. The site uses no third-party trackers.",
  ],
  [
    "What we run on your machines",
    "Monitoring runs as a GitHub Actions workflow inside each of your own repositories. It generates an issue in your repo and never uploads your code to us.",
  ],
  [
    "Cookies & analytics",
    "The site uses no third-party trackers. We keep minimal server logs for abuse prevention.",
  ],
  [
    "Sharing",
    "We only share data when required by law, or with processors strictly to provide the service.",
  ],
  [
    "Your rights",
    "You can request a copy or deletion of the data we hold by emailing support at the address in this document.",
  ],
  [
    "Contact",
    "Data controller: Repo Shield. Reach us via a GitHub issue on the repo.",
  ],
];

export const TERMS_SECTIONS: Array<[string, string]> = [
  [
    "The service",
    "Repo Shield is a free, open source generator and monitoring toolkit for license and AI-training protection files on GitHub repositories you own.",
  ],
  [
    "Deterrence, not enforcement",
    "We do not guarantee that any party will respect your files, stop scraping, or honor AI-training notices. The service is provided for good-faith compliance and visibility only.",
  ],
  [
    "Not legal advice",
    "Generated files are templates. You are responsible for verifying their legal effect, choosing the right license, and using them appropriately. We are not your lawyers.",
  ],
  [
    "Access to your repos",
    "The apply script uses your local gh session with the permissions you grant. We claim no ownership over your code. Monitoring runs in your own CI.",
  ],
  [
    "Open source license",
    "The Repo Shield source code is released under the Repo Shield Source License (No AI Training). Use is free and open, provided the license terms, including the no-AI-training condition, are honored.",
  ],
  [
    "Donations",
    "Donations are voluntary and processed by Stripe. They are not a purchase of the software, which is free, and do not change or remove any license terms.",
  ],
  [
    "Liability",
    "The service is provided as-is, without warranty of any kind. Our total liability is limited to the amount you contributed in the previous 30 days.",
  ],
];

export const HOW_IT_WORKS: Array<[string, string]> = [
  [
    "Answer four questions",
    "Your GitHub user or org, the license you want (MIT is a good default), the copyright holder, and the year.",
  ],
  [
    "Download your protection pack",
    "LICENSE, a NOTICE with explicit AI-training consent, and a machine-readable policy, plus the monitoring workflow and check script.",
  ],
  [
    "Apply it",
    "Drop the files into one repo by hand, or let apply-all.sh protect every public repo you own and push weekly monitoring to each.",
  ],
];

export const PACK_PURPOSE: Array<[string, string]> = [
  ["LICENSE", "locks in the license you picked, under your name"],
  ["NOTICE", "stakes the explicit AI-training claim"],
  ["AI_TRAINING_POLICY.md", "machine-readable consent plus the marker monitoring scans for"],
  ["REPO_SHIELD.txt", "signature marker that flags public copies"],
];

export const GITHUB_URL = "https://github.com/EnzoVezzaro/repo-shield";