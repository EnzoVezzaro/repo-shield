export const BRAND = "Repo Shield";
export const TAGLINE = "Protect all your GitHub repos from AI scraping — in one click.";
export const AUDIENCE = "For open-source maintainers with many public repos";
export const SUB = [
  "Every year you pour into public repos — and those repos are bulk-ingested for AI training",
  "without consent or credit. Repo Shield stakes your claim: the license and AI-training",
  "notices that say who can and can't use your code, applied across every repo you own,",
  "then monitored weekly so gaps surface before they bite.",
].join(" ");

export const PAIN_POINTS: Array<{ title: string; body: string }> = [
  {
    title: "Your code trains models it never agreed to",
    body: "LLM pipelines bulk-ingest public repos at scale. A LICENSE file is rarely read before training — most repos never state an AI-training position at all.",
  },
  {
    title: "GitHub protects one repo at a time",
    body: "For a maintainer with dozens of repos, per-repo friction means the ones that matter never get covered. The gap is proportional to your catalog.",
  },
  {
    title: "Gaps are invisible",
    body: "A missing notice, a file that drifted, a fork that stripped your marker — no one notices until your code turns up in a training run without a say.",
  },
];

export const PACK_MANIFEST: Array<{ file: string; role: string; pro: boolean }> = [
  { file: "LICENSE", role: "Full license text under your holder and year.", pro: false },
  { file: "NOTICE", role: "Explicit AI-training consent — human-readable and SPDX-stamped.", pro: false },
  { file: "AI_TRAINING_POLICY.md", role: "Machine-readable policy plus the marker monitoring scans for.", pro: false },
  { file: "REPO_SHIELD.txt", role: "Signature marker that flags public copies in scraping scans.", pro: false },
  { file: ".github/workflows/repo-shield.yml", role: "Weekly monitoring run inside your own repo.", pro: true },
  { file: "scripts/shield-check.mjs", role: "Verifies the files and heuristically scans for public copies.", pro: true },
  { file: "apply-all.sh", role: "One command protect-commits every public repo you own.", pro: true },
];

export const DOES: Array<string> = [
  "Stakes a written, machine-readable AI-training position on every repo.",
  "Makes accidental ingestion visible — and gives you a defensible record if you ever need one.",
  "Monitors every week from inside your own CI, flagging missing files and obvious re-publication.",
];

export const DOESNT: Array<string> = [
  "Can't stop scrapers — no one can. Anyone who promises to 'block' training is selling you a lie.",
  "Doesn't prove a model trained on your code; detection is heuristic by design.",
  "Isn't legal advice. Templates are yours to verify against canonical SPDX text.",
];

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  bullet: string;
  cta: string;
  href: string;
  featured: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "one repo",
    bullet: "Protection pack for a single repository — forever.",
    cta: "Generate your pack",
    href: "#/generate",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/ month",
    bullet: "Protect unlimited repos + weekly monitoring workflow for each.",
    cta: "Get Pro",
    href: "#PRO_PAYMENT_LINK",
    featured: true,
  },
  {
    id: "audit",
    name: "One-time audit",
    price: "$49",
    period: "one time",
    bullet: "Full pack for all your repos plus a monitored setup — no subscription.",
    cta: "Buy audit",
    href: "#AUDIT_PAYMENT_LINK",
    featured: false,
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Doesn't adding a LICENSE already do this?",
    a: "A license defines rights but almost nobody reads it before training. The NOTICE file makes your AI-training consent explicit and machine-readable, which is the deterrent most repos never set up. GitHub's tools make you do this one repo at a time; Repo Shield does it across everything.",
  },
  {
    q: "Can you actually stop AI companies from scraping my repo?",
    a: "No — and we say so on the tin. This is deterrence, not enforcement. Clear licensing plus explicit training notices give you a written position and make accidental ingestion visible, so you have a defensible record if you ever need to act. Anyone who promises to 'block' scrapers is selling you a lie.",
  },
  {
    q: "Does Repo Shield need write access to all my repos?",
    a: "To apply the files automatically: yes, one generated script uses your existing gh CLI session. You can also download each file and add it by hand to a single repo with zero special permissions. Pro's monitoring runs inside your own repo via GitHub Actions — we never see your code.",
  },
  {
    q: "Your monitoring is heuristic. What does that mean?",
    a: "The weekly workflow checks that LICENSE, NOTICE and the AI policy exist and flags public copies of a unique marker string. It can't prove someone trained on your code — that would require forensic access we don't have. It catches the common failure modes (missing files, obvious re-publication) reliably.",
  },
  {
    q: "Are you lawyers?",
    a: "No. Everything generated is template text; we are not giving legal advice and we won't review your specific case. Licenses are templates you should verify against the canonical SPDX text before relying on them.",
  },
];

export const PRIVACY_SECTIONS: Array<[string, string]> = [
  [
    "What we collect",
    "Repo Shield processes only what is needed to run: the GitHub repo names you type, the protection choices you make, and, if you subscribe, the Stripe-hosted payment details (we never see your card).",
  ],
  [
    "What we run on your machines",
    "Pro's monitoring runs as a GitHub Actions workflow inside each of your own repositories. It generates an issue in your repo and never uploads your code to us.",
  ],
  [
    "Cookies & analytics",
    "The site uses no third-party trackers. We keep minimal server logs for abuse prevention.",
  ],
  [
    "Sharing",
    "We only share data when required by law, or with processors (e.g. Stripe) strictly to provide the service.",
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
    "Repo Shield generates license and AI-training protection files and monitoring workflows for GitHub repositories you own.",
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
    "Pro's apply script uses your local gh session with the permissions you grant. We claim no ownership over your code. Monitoring runs in your own CI.",
  ],
  [
    "Payment",
    "Subscriptions and one-time purchases are billed by Stripe. Cancellation ends future billing; no refunds for partial periods unless required by law.",
  ],
  [
    "Liability",
    "The service is provided as-is, without warranty of any kind. Our total liability is limited to the amount you paid in the previous 30 days.",
  ],
];

export const HOW_IT_WORKS: Array<[string, string]> = [
  [
    "Answer four questions",
    "Your GitHub user or org, the license you want (MIT is a good default), the copyright holder, and the year.",
  ],
  [
    "Download your protection pack",
    "LICENSE, a NOTICE with explicit AI-training consent, and a machine-readable policy — plus the monitoring workflow and check script.",
  ],
  [
    "Apply it",
    "Free: drop the files in one repo. Pro: one script applies the pack to all your public repos and pushes weekly monitoring to each.",
  ],
];

export const PACK_PURPOSE: Array<[string, string]> = [
  ["LICENSE", "locks in the license you picked, under your name"],
  ["NOTICE", "stakes the explicit AI-training claim"],
  ["AI_TRAINING_POLICY.md", "machine-readable consent + the marker monitoring scans for"],
  ["REPO_SHIELD.txt", "signature marker that flags public copies"],
];