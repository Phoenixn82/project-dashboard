#!/usr/bin/env node

/**
 * Nightly project data updater.
 * Reads projects.json, hits the GitHub API for each project with a githubRepo,
 * updates commit info and metadata, writes the file back.
 *
 * Usage: node scripts/update-projects.mjs
 * Env: GITHUB_TOKEN — required for private repos; needs `repo` scope.
 *      Falls back to `gh auth token` when running locally.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_PATH = resolve(__dirname, "..", "projects.json");

function getToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

const GITHUB_TOKEN = getToken();
const headers = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "project-dashboard-updater",
};
if (GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

async function updateProject(project) {
  if (!project.githubRepo) {
    console.log(`  [skip] ${project.id} — no githubRepo`);
    return project;
  }

  try {
    const [repo, commits] = await Promise.all([
      fetchJSON(`https://api.github.com/repos/${project.githubRepo}`),
      fetchJSON(
        `https://api.github.com/repos/${project.githubRepo}/commits?per_page=5`
      ),
    ]);

    const recentCommits = commits.map((c) => ({
      message: c.commit.message.split("\n")[0],
      date: c.commit.committer.date,
      sha: c.sha,
    }));

    console.log(
      `  [ok] ${project.id} — ${recentCommits.length} commits fetched (${repo.private ? "private" : "public"})`
    );

    return {
      ...project,
      repoDescription: repo.description || "",
      visibility: repo.private ? "private" : "public",
      openIssues: repo.open_issues_count ?? 0,
      lastCommit: recentCommits[0] || null,
      recentCommits,
      updatedAt: new Date().toISOString(),
      fetchError: null,
    };
  } catch (err) {
    const status = err.status || "unknown";

    if (err.status === 404) {
      console.warn(
        `  [404] ${project.id} — repo "${project.githubRepo}" not found (does not exist or token lacks access)`
      );
      return {
        ...project,
        lastCommit: null,
        recentCommits: [],
        fetchError: `404 — repo not found or private without token access (${new Date().toISOString()})`,
      };
    }

    if (err.status === 403) {
      console.warn(
        `  [403] ${project.id} — access denied (rate-limited or forbidden): ${err.message}`
      );
    } else {
      console.warn(
        `  [err] ${project.id} — HTTP ${status}: ${err.message}`
      );
    }
    return project;
  }
}

async function main() {
  console.log("Reading projects.json...");
  const raw = await readFile(PROJECTS_PATH, "utf-8");
  const projects = JSON.parse(raw);

  console.log(`Updating ${projects.length} projects...`);
  const updated = await Promise.all(projects.map(updateProject));

  const newRaw = JSON.stringify(updated, null, 2) + "\n";
  if (newRaw === raw) {
    console.log("No changes detected.");
    process.exit(0);
  }

  await writeFile(PROJECTS_PATH, newRaw, "utf-8");
  console.log("projects.json updated.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
