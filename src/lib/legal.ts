export type License = "mit" | "isc" | "unlicense" | "apache-2.0" | "gpl-3.0";

export const LICENSE_OPTIONS: Array<{ id: License; name: string }> = [
  { id: "mit", name: "MIT (permissive, most common)" },
  { id: "isc", name: "ISC (minimal permissive)" },
  { id: "unlicense", name: "Unlicense (public domain)" },
  { id: "apache-2.0", name: "Apache-2.0 (permissive + patent grant)" },
  { id: "gpl-3.0", name: "GPL-3.0 (copyleft)" },
];

const MIT =
  "Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
  "of this software and associated documentation files (the \"Software\"), to deal\n" +
  "in the Software without restriction, including without limitation the rights\n" +
  "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
  "copies of the Software, and to permit persons to whom the Software is\n" +
  "furnished to do so, subject to the following conditions:\n\n" +
  "The above copyright notice and this permission notice shall be included in all\n" +
  "copies or substantial portions of the Software.\n\n" +
  "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n" +
  "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
  "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
  "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n" +
  "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n" +
  "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n" +
  "SOFTWARE.";

const ISC =
  "Permission to use, copy, modify, and/or distribute this software for any\n" +
  "purpose with or without fee is hereby granted, provided that the above\n" +
  "copyright notice and this permission notice appear in all copies.\n\n" +
  "THE SOFTWARE IS PROVIDED \"AS IS\" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH\n" +
  "REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY\n" +
  "AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,\n" +
  "INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM\n" +
  "LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR\n" +
  "OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR\n" +
  "PERFORMANCE OF THIS SOFTWARE.";

const UNLICENSE =
  "This is free and unencumbered software released into the public domain.\n\n" +
  "Anyone is free to copy, modify, publish, use, compile, sell, or distribute this\n" +
  "software, either in source code form or as a compiled binary, for any purpose,\n" +
  "commercial or non-commercial, and by any means.\n\n" +
  "In jurisdictions that recognize copyright laws, the author or authors of this\n" +
  "software dedicate any and all copyright interest in the software to the public\n" +
  "domain. We make this dedication for the benefit of the public at large and to\n" +
  "the detriment of our heirs and successors. We intend this dedication to be an\n" +
  "overt act of relinquishment in perpetuity of all present and future rights to\n" +
  "this software under copyright law.\n\n" +
  "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n" +
  "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
  "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
  "AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN\n" +
  "ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\n" +
  "WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\n" +
  "For more information, please refer to <https://unlicense.org>";

const APACHE_APEX =
  "Licensed under the Apache License, Version 2.0 (the \"License\");\n" +
  "you may not use this file except in compliance with the License.\n" +
  "You may obtain a copy of the License at\n\n" +
  "http://www.apache.org/licenses/LICENSE-2.0\n\n" +
  "Unless required by applicable law or agreed to in writing, software\n" +
  "distributed under the License is distributed on an \"AS IS\" BASIS,\n" +
  "WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" +
  "See the License for the specific language governing permissions and\n" +
  "limitations under the License.\n";

const GPL_APEX =
  "This program is free software: you can redistribute it and/or modify\n" +
  "it under the terms of the GNU General Public License as published by\n" +
  "the Free Software Foundation, either version 3 of the License, or\n" +
  "(at your option) any later version.\n\n" +
  "This program is distributed in the hope that it will be useful,\n" +
  "but WITHOUT ANY WARRANTY; without even the implied warranty of\n" +
  "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\n" +
  "GNU General Public License for more details.\n\n" +
  "You should have received a copy of the GNU General Public License\n" +
  "along with this program. If not, see <https://www.gnu.org/licenses/>.\n";

interface LicensePack {
  short: string;
  full: string;
  canonical: string;
  noticeHeader: string;
}

function licensePack(license: License, holder: string, year: number): LicensePack {
  const noticeHeader =
    `Copyright (c) ${year} ${holder}\n` +
    `SPDX-License-Identifier: ${spdx(license)}\n` +
    `License text preceded by a full-text copy of the license in the LICENSE file.\n`;
  switch (license) {
    case "mit":
      return {
        short: `Copyright (c) ${year} ${holder}\n\n${MIT}`,
        full: MIT,
        canonical: "https://spdx.org/licenses/MIT.html",
        noticeHeader,
      };
    case "isc":
      return {
        short: `ISC License\n\nCopyright (c) ${year} ${holder}\n\n${ISC}`,
        full: ISC,
        canonical: "https://spdx.org/licenses/ISC.html",
        noticeHeader,
      };
    case "unlicense":
      return {
        short: `Unlicense\n\nThis is free and unencumbered software released into the public domain.\n\n${UNLICENSE}`,
        full: UNLICENSE,
        canonical: "https://spdx.org/licenses/Unlicense.html",
        noticeHeader,
      };
    case "apache-2.0":
      return {
        short: `Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/\n\n` + APACHE_APEX,
        full: `Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/\n\n` + APACHE_APEX,
        canonical: "https://spdx.org/licenses/Apache-2.0.html",
        noticeHeader,
      };
    case "gpl-3.0":
      return { short: GPL_APEX, full: GPL_APEX, canonical: "https://spdx.org/licenses/GPL-3.0-only.html", noticeHeader };
  }
}

function spdx(license: License): string {
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

export interface ProtectionFiles {
  files: Record<string, string>;
  missingFullText: string[];
}

/**
 * Generate the protection pack for one repository.
 *
 * Always returns a LICENSE header + SPDX, the AI-training NOTICE, and a
 * machine-readable AI policy. For licenses whose full text is not embedded
 * (Apache-2.0, GPL-3.0) the caller must paste the canonical text from the
 * returned `canonical` URL — the generator deliberately refuses to fake it.
 */
export function protectionFiles(repo: string, holder: string, year: number, license: License): ProtectionFiles {
  const pack = licensePack(license, holder, year);
  const missingFullText: string[] = [];

  const licenseFile = `${pack.short}\n`;
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
    LICENSE: licenseFile,
    NOTICE: notice,
    "AI_TRAINING_POLICY.md": policy,
    "REPO_SHIELD.txt": `Protected by Repo Shield. See NOTICE and AI_TRAINING_POLICY.md.\n`,
  };

  // Licenses without the full canonical text embedded get a stub the user must
  // complete (the generator refuses to fake a license it does not carry in full).
  if (license === "apache-2.0" || license === "gpl-3.0") {
    missingFullText.push(`${spdx(license)} full license text is intentionally not embedded. Paste the canonical text from ${pack.canonical} into LICENSE before committing.`);
  }

  return { files, missingFullText };
}