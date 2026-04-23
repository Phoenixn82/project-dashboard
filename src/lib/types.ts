export type ProjectStatus = "active" | "paused" | "idea";

export type ProjectType = "web-app" | "desktop-app" | "tool" | "script";

export interface Commit {
  message: string;
  date: string;
  sha: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  localPath: string;
  githubRepo: string | null;
  liveUrl: string | null;
  status: ProjectStatus;
  stack: string[];
  type: ProjectType;
  lastCommit: Commit | null;
  recentCommits: Commit[];
  openIssues: number;
  repoDescription: string;
  updatedAt: string;
  launchCommand: string | null;
}
