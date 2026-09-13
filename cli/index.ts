#!/usr/bin/env node
/* Repo Shield CLI — protects GitHub repos from AI scraping: license + NOTICE +
 * AI policy + weekly monitoring workflow, delivered as a pull request per repo.
 *
 * Auth: GitHub App device flow (public client, no client secret shipped).
 * The resulting token stays in ~/.config/repo-shield/config.json on the user's
 * machine. Nothing runs on a server; the web app is fully static.
 */
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, chmodSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { protectRepo, classifyError } from "./protect.ts";

const GH = "https://api.github.com";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "Iv23lidhennqrdpdFUAT";
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const APP_SLUG = process.env.GITHUB_APP_SLUG || "reposell";
const INSTALL_URL = `https://github.com/apps/${APP_SLUG}/installations/new`;
const SCOPE = JSON.stringify({ contents: "write", pull_requests: "write", workflows: "write", metadata: "read" });
const AUTH = "https://github.com/login/oauth/access_token";
const DEVICE = "https://github.com/login/device/code";

const configDir = process.env.XDG_CONFIG_HOME ? path.join(process.env.XDG_CONFIG_HOME, "repo-shield") : path.join(os.homedir(), ".config", "repo-shield");
const configFile = path.join(configDir, "config.json");

interface Config {
  token: string;
  user: { login: string; name: string | null; avatar_url: string };
  installed: number;
}

const json = (r: Response) => r.json().catch(() => null);

/* ---------- config ---------- */
function loadConfig(): Config | null {
  try {
    if (!existsSync(configFile)) return null;
    const c = JSON.parse(readFileSync(configFile, "utf8")) as Config;
    return c?.token ? c : null;
  } catch {
    return null;
  }
}
function saveConfig(c: Config): void {
  mkdirSync(configDir, { recursive: true });
  writeFileSync(configFile, JSON.stringify(c, null, 2), { mode: 0o600 });
  chmodSync(configFile, 0o600);
}

/* ---------- github api ---------- */
function gh(path: string, token?: string, init: RequestInit = {}): Promise<{ status: number; json: any }> {
  return fetch(GH + path, {
    ...init,
    headers: { ...init.headers, Accept: "application/vnd.github+json", "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  }).then(async (r) => ({ status: r.status, json: await json(r) }));
}

async function countInstallations(token: string): Promise<number> {
  try {
    const r = await gh("/user/installations?per_page=1", token);
    return r.status === 200 ? (r.json?.total_count ?? 0) : 0;
  } catch {
    return 0;
  }
}

async function installationRepos(token: string): Promise<Array<{ full_name: string; private: boolean; default_branch: string; fork: boolean }>> {
  const installs = await gh("/user/installations?per_page=100", token);
  if (installs.status !== 200) throw new Error(`could not list installations (HTTP ${installs.status})`);
  const ids: number[] = (installs.json?.installations ?? []).map((x: any) => x.id);
  const out: Array<{ full_name: string; private: boolean; default_branch: string; fork: boolean }> = [];
  for (const id of ids) {
    const r = await gh(`/user/installations/${id}/repositories?per_page=100`, token);
    if (r.status === 200) {
      for (const repo of r.json?.repositories ?? []) {
        out.push({ full_name: repo.full_name, private: !!repo.private, default_branch: repo.default_branch, fork: !!repo.fork });
      }
    }
  }
  return out.sort((a, b) => a.full_name.localeCompare(b.full_name));
}

/* ---------- device flow ---------- */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function startDevice(): Promise<{ user_code: string; verification_uri: string; interval: number; device_code: string; expires_in: number }> {
  const body = new URLSearchParams({ client_id: CLIENT_ID, scope: SCOPE });
  const r = await fetch(DEVICE, { method: "POST", headers: { Accept: "application/json" }, body });
  const j: any = await json(r);
  if (!r.ok || !j?.device_code) throw new Error(j?.error_description || j?.error || `device flow unavailable (HTTP ${r.status})`);
  return { user_code: j.user_code, verification_uri: j.verification_uri, interval: j.interval || 5, device_code: j.device_code, expires_in: j.expires_in };
}

async function redeem(deviceCode: string): Promise<{ ok: boolean; token?: string; error?: string }> {
  const body = new URLSearchParams({ client_id: CLIENT_ID, device_code: deviceCode, grant_type: "urn:ietf:params:oauth:grant-type:device_code" });
  if (CLIENT_SECRET) body.set("client_secret", CLIENT_SECRET);
  const r = await fetch(AUTH, { method: "POST", headers: { Accept: "application/json" }, body });
  const j: any = await json(r);
  if (r.ok && j?.access_token) return { ok: true, token: j.access_token };
  return { ok: false, error: j?.error || `HTTP ${r.status}` };
}

async function login(): Promise<Config> {
  if (loadConfig()) {
    console.log("Already signed in as @\x1b[1m" + loadConfig()!.user.login + "\x1b[0m. Run `rs logout` first, or `rs whoami`.");
    process.exit(0);
  }
  const d = await startDevice();
  console.log("");
  console.log("  GitHub authorization");
  console.log("  " + "-".repeat(42));
  console.log("  1. Open  \x1b[1m" + d.verification_uri + "\x1b[0m");
  console.log("  2. Enter this code:  \x1b[1;92m" + d.user_code + "\x1b[0m");
  console.log("  " + "-".repeat(42));
  console.log("");

  let interval = Math.max(d.interval, 5) * 1000;
  const deadline = Date.now() + d.expires_in * 1000;
  const start = Date.now();
  for (;;) {
    const res = await redeem(d.device_code);
    if (res.ok && res.token) {
      const u = await gh("/user", res.token);
      const user = u.status === 200 ? u.json : { login: "unknown", name: null, avatar_url: "" };
      const installed = await countInstallations(res.token);
      const config: Config = { token: res.token, user: { login: user.login, name: user.name ?? null, avatar_url: user.avatar_url ?? "" }, installed };
      saveConfig(config);
      console.log("Signed in as @\x1b[1m" + user.login + "\x1b[0m.");
      if (!installed)
        console.log("Install the Repo Shield app on the repos you want to protect (yours, your org's, or all of them): " + INSTALL_URL);
      return config;
    }
    if (res.error === "slow_down") interval += 5000;
    else if (res.error === "authorization_pending") {
      /* keep waiting */
    } else if (res.error === "access_denied") {
      console.error("Authorization declined. Run `rs login` again when ready.");
      process.exit(1);
    } else if (res.error === "expired_token") {
      console.error("This code expired. Run `rs login` again.");
      process.exit(1);
    } else if (res.error === "incorrect_client_credentials") {
      console.error("The GitHub App rejected the request. Check the app's Device Flow setting, then run `rs login` again.");
      process.exit(1);
    } else if (res.error) {
      console.error("Authorization failed: " + res.error);
      process.exit(1);
    }
    if (Date.now() > deadline) {
      console.error("Expired. Run `rs login` again.");
      process.exit(1);
    }
    const elapsed = Math.floor((Date.now() - start) / 1000);
    process.stdout.write(`\r  Waiting for you in your browser... ${elapsed}s   `);
    await sleep(interval);
  }
}

/* ---------- commands ---------- */
function requireAuth(): Config {
  const c = loadConfig();
  if (!c) {
    console.error("Not signed in. Run `rs login` first.");
    process.exit(1);
  }
  return c;
}

async function cmdList(config: Config): Promise<void> {
  const repos = await installationRepos(config.token);
  if (!repos.length) {
    console.log("No repositories yet. Install the Repo Shield app on some repos — yours, your org's, or all of them: " + INSTALL_URL);
    process.exit(1);
  }
  for (const r of repos) {
    console.log(`\x1b[1m${r.full_name}\x1b[0m  ${r.private ? "private" : "public"}  default: ${r.default_branch}${r.fork ? "  (fork)" : ""}`);
  }
  console.log(`\n${repos.length} repository(ies) the Repo Shield app can write to.`);
}

function parseLicense(name: string): "mit" | "isc" | "unlicense" | "apache-2.0" | "gpl-3.0" {
  const n = name.toLowerCase();
  if (n === "isc") return "isc";
  if (n === "unlicense") return "unlicense";
  if (n === "apache-2.0" || n === "apache") return "apache-2.0";
  if (n === "gpl-3.0" || n === "gpl") return "gpl-3.0";
  return "mit";
}

async function cmdProtect(config: Config, repos: string[], opts: { license?: string; holder?: string; year?: number }): Promise<void> {
  const targets = repos.length ? repos.splice(0, 50) : (await installationRepos(config.token)).slice(0, 50).map((r) => r.full_name);
  if (!targets.length) {
    console.error("Nothing to protect. Pass repos (`rs protect owner/repo`) or --all, and install the Repo Shield app on the repos you want to protect — any repo you can write to: " + INSTALL_URL);
    process.exit(1);
  }
  const license = parseLicense(opts.license || "mit");
  const holder = (opts.holder || config.user.name || config.user.login).trim();
  const year = opts.year || new Date().getFullYear();

  console.log(`Protecting ${targets.length} repo(s)...`);
  let ok = 0;
  let exists = 0;
  let failed = 0;
  for (const full of targets) {
    const res = await protectRepo(config.token, full, { license, holder, year });
    if (res.status === "ok") {
      console.log(`  [opened]   ${full}  ->  PR #${res.number}  ${res.pr_url}`);
      ok++;
    } else if (res.status === "exists") {
      console.log(`  [already]  ${full}  ->  PR #${res.number}  ${res.pr_url}`);
      exists++;
    } else {
      console.error(`  [failed]   ${full}  ${res.error}`);
      if (classifyError(res.error || "") === "install") {
        console.error(`             Install the Repo Shield app on this repo (any repo you can write to), then re-run: ${INSTALL_URL}`);
      }
      failed++;
    }
  }
  console.log(`\n${ok} opened, ${exists} already open, ${failed} failed.`);
  if (failed) process.exit(1);
}

function usage(): void {
  console.log(`Repo Shield — protect your repos from AI scraping.

Usage:
  rs login                 Sign in with GitHub (device flow, no password)
  rs whoami                Show who you are and app install status
  rs repos                 List repos the app can write to
  rs protect <repo...>     Open a protection PR on the given repo(s)
  rs protect --all         Protect every installed repo
  rs logout                Forget your session

Protect options:
  --license <id>   mit | isc | unlicense | apache-2.0 | gpl-3.0   (default: mit)
  --holder <name>  Copyright holder (default: your GitHub name)
  --year <n>       Year of first publication (default: current year)

Install the Repo Shield app on the repos you want to protect — yours, your org's, or all of them (any GitHub user can install it): ${INSTALL_URL}
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (!cmd || cmd === "help" || cmd === "-h" || cmd === "--help") {
    usage();
    return;
  }
  if (cmd === "login") {
    await login();
    return;
  }
  if (cmd === "logout") {
    if (existsSync(configFile)) rmSync(configFile);
    console.log("Signed out.");
    return;
  }
  if (cmd === "whoami") {
    const c = requireAuth();
    console.log(`@${c.user.login}${c.user.name ? " (" + c.user.name + ")" : ""}`);
    const installed = await countInstallations(c.token);
    console.log(installed ? `App installed on ${installed} account(s).` : "The Repo Shield app isn't installed on any of your accounts yet — install it on the repos you want to protect (yours, your org's, or all of them): " + INSTALL_URL);
    return;
  }
  if (cmd === "repos" || cmd === "list") {
    await cmdList(requireAuth());
    return;
  }
  if (cmd === "protect" || cmd === "run") {
    const all = args.includes("--all");
    const repos = args.slice(1).filter((a) => !a.startsWith("--"));
    const opt = (name: string) => {
      const i = args.indexOf(name);
      return i >= 0 ? args[i + 1] : undefined;
    };
    await cmdProtect(requireAuth(), all ? [] : repos, { license: opt("--license"), holder: opt("--holder"), year: opt("--year") ? Number(opt("--year")) : undefined });
    return;
  }
  console.error(`Unknown command: ${cmd}\n`);
  usage();
  process.exit(1);
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});