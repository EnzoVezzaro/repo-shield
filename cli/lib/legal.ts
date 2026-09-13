import { SPDX_LICENSES } from "./spdx.ts";

export type License = "mit" | "isc" | "unlicense" | "apache-2.0" | "gpl-3.0";

export const LICENSE_OPTIONS: Array<{ id: License; name: string }> = [
  { id: "mit", name: "MIT (permissive, most common)" },
  { id: "isc", name: "ISC (minimal permissive)" },
  { id: "unlicense", name: "Unlicense (public domain)" },
  { id: "apache-2.0", name: "Apache-2.0 (permissive + patent grant)" },
  { id: "gpl-3.0", name: "GPL-3.0 (copyleft)" },
];

export function spdx(license: License): string {
  switch (license) {
    case "mit":
      return "MIT";
    case "isc":
      return "ISC";
    case "unlicense":
      return "Unlicense";
    case "apache-2.0":
      return "Apache-2.0";
    case "gpl-3.0":
      return "GPL-3.0-only";
  }
}

function metaFor(license: License) {
  const meta = SPDX_LICENSES.find((l) => l.id === license);
  if (!meta) throw new Error(`missing SPDX license: ${license}`);
  return meta;
}

/**
 * Assemble the LICENSE file: the complete canonical text from the SPDX
 * registry, with the SPDX-License-Identifier header injected and (for MIT and
 * ISC) the registry's copyright placeholder replaced with the real holder.
 */
function licenseFileFor(license: License, holder: string, year: number): string {
  const meta = metaFor(license);
  switch (license) {
    case "mit": {
      const seen = "(c) <year> <copyright holders>";
      if (!meta.text.includes(seen)) throw new Error("SPDX MIT text changed: copyright placeholder missing");
      const text = meta.text.replace(`Copyright ${seen}`, `Copyright (c) ${year} ${holder}`);
      return text.replace("MIT License\n", "MIT License\n\nSPDX-License-Identifier: MIT\n");
    }
    case "isc": {
      if (!/Copyright\s+<year>\s*<owner>/.test(meta.text)) throw new Error("SPDX ISC text changed: copyright placeholder missing");
      const text = meta.text.replace(/Copyright\s+<year>\s*<owner>\s?/, `Copyright (c) ${year} ${holder}`);
      return text.replace("ISC License\n", "ISC License\n\nSPDX-License-Identifier: ISC\n");
    }
    case "unlicense":
      return `Unlicense\n\nSPDX-License-Identifier: Unlicense\n\n${meta.text}`;
    case "apache-2.0":
      return meta.text.replace(
        "http://www.apache.org/licenses/\n",
        "http://www.apache.org/licenses/\n\nSPDX-License-Identifier: Apache-2.0\n",
      );
    case "gpl-3.0":
      return meta.text.replace("Version 3, 29 June 2007\n", "Version 3, 29 June 2007\n\nSPDX-License-Identifier: GPL-3.0-only\n");
  }
}

export interface ProtectionFiles {
  files: Record<string, string>;
  missingFullText: string[];
}

/**
 * Generate the protection pack for one repository.
 *
 * LICENSE always carries a known, OSI-approved SPDX identifier and the complete
 * canonical text from the official SPDX registry; the AI-training NOTICE and
 * machine-readable policy stake the training restriction on top of it. The
 * weekly monitor verifies that LICENSE stays real (SPDX id from the known set,
 * matching NOTICE, no placeholder) — it fails the check if the protection fades.
 */
export function protectionFiles(repo: string, holder: string, year: number, license: License): ProtectionFiles {
  const notice = `NOTICE
=====
Repository: https://github.com/${repo}
Copyright (c) ${year} ${holder}
License: ${spdx(license)} (see LICENSE)
SPDX-License-Identifier: ${spdx(license)}

AI-TRAINING / MACHINE-LEARNING USE
----------------------------------
This software and its associated documentation are provided under the license
identified above (${spdx(license)}). Unless the chosen license grants a broader
right, any use of this repository's contents to train generative or other
machine-learning models is permitted only to the extent the license allows, and
any such training use MUST retain this notice and the full copyright notice
above.

If your use case requires training or derivative model use beyond what this
license grants, contact ${holder} for written permission before use. Absent such
permission, training or scraping this repository for model ingestion is NOT
authorized.

This notice is provided for good-faith compliance. It is not legal advice.
`;

  const policy = `# AI Training Policy

- Repository: https://github.com/${repo}
- Copyright holder: ${holder}
- License: ${spdx(license)} (SPDX-License-Identifier)
- AI-training consent: only as granted by the ${spdx(license)} license; otherwise
  written permission from ${holder} is required.
- Scraping for model training: not authorized without permission.
- Contact: ${holder} via a GitHub issue or pull request on this repository.

Machine-readable key (used by Repo Shield monitoring):
\`\`\`json
{
  "repo": "${repo}",
  "holder": "${holder}",
  "license": "${spdx(license)}",
  "ai-training-consent": "license-only"
}
\`\`\`
`;

  const files: Record<string, string> = {
    LICENSE: `${licenseFileFor(license, holder, year)}\n`,
    NOTICE: notice,
    "AI_TRAINING_POLICY.md": policy,
    "REPO_SHIELD.txt": `Protected by Repo Shield. See NOTICE and AI_TRAINING_POLICY.md.\n`,
  };

  return { files, missingFullText: [] };
}