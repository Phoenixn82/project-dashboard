#!/usr/bin/env node

/**
 * Nightly project data updater.
 * Reads projects.json, hits the GitHub API for each project with a githubRepo,
 * updates commit info and metadata, writes the file back.
 *
 * Usage: node scripts/update-projects.mjs
 * Env: GITHUB_TOKEN (optional, increases rate limit from 60 to 5000 req/hr)
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_PATH = resolve(__dirname, "..", "projects.json");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
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
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
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
      `  [ok] ${project.id} — ${recentCommits.length} commits fetched`
    );

    return {
      ...project,
      repoDescription: repo.description || "",
      openIssues: repo.open_issues_count ?? 0,
      lastCommit: recentCommits[0] || null,
      recentCommits,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`  [warn] ${project.id} — ${err.message}`);
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
