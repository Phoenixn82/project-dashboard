"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { getFreshness, type Freshness } from "@/lib/projects";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  idea: "bg-gray-500/20 text-gray-400",
};

const freshnessConfig: Record<Freshness, { dot: string; label: string }> = {
  fresh: { dot: "bg-emerald-400", label: "Active this week" },
  recent: { dot: "bg-amber-400", label: "Active this month" },
  stale: { dot: "bg-red-400", label: "Stale (30+ days)" },
  unknown: { dot: "bg-gray-400", label: "No commit data" },
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  const days = Math.floor(seconds / 86400);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours}h ago`;
  return "just now";
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);

  const freshness = getFreshness(project);
  const { dot, label } = freshnessConfig[freshness];

  async function handleLaunch(e: React.MouseEvent) {
    e.stopPropagation();
    setLaunching(true);
    setLaunchStatus(null);
    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: project.id,
          localPath: project.localPath,
          launchCommand: project.launchCommand,
        }),
      });
      const data = await res.json();
      setLaunchStatus(res.ok ? "Running" : data.error);
    } catch {
      setLaunchStatus("Failed to connect");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
    >
      {/* Collapsed view — always visible */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} title={label} />
            <h3 className="font-semibold text-gray-900 text-lg">
              {project.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {project.openIssues > 0 && (
              <a
                href={`https://github.com/${project.githubRepo}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium hover:bg-orange-100 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {project.openIssues}
              </a>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] ?? statusColors.idea}`}
            >
              {project.status}
            </span>
            {project.githubRepo && (
              <a
                href={`https://github.com/${project.githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.stack.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium"
            >
              {s}
            </span>
          ))}
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
            {project.type}
          </span>
        </div>

        {project.lastCommit && (
          <p className="text-sm text-gray-500 truncate font-mono">
            {project.lastCommit.message}
            <span className="ml-2 text-gray-400">
              {timeAgo(project.lastCommit.date)}
            </span>
          </p>
        )}
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-700 mb-4">{project.description}</p>

          {project.recentCommits.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Recent Commits
              </h4>
              <ul className="space-y-1.5">
                {project.recentCommits.map((commit) => (
                  <li key={commit.sha} className="flex items-baseline gap-2 text-sm">
                    <a
                      href={`https://github.com/${project.githubRepo}/commit/${commit.sha}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-500 hover:underline text-xs shrink-0"
                    >
                      {commit.sha.slice(0, 7)}
                    </a>
                    <span className="text-gray-700 truncate">
                      {commit.message}
                    </span>
                    <span className="text-gray-400 text-xs shrink-0">
                      {timeAgo(commit.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            {project.launchCommand && (
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                {launching ? "Launching..." : "Launch"}
              </button>
            )}
            {project.githubRepo && (
              <a
                href={`https://github.com/${project.githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                View on GitHub
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                Visit Site
              </a>
            )}
            {launchStatus && (
              <span className={`text-xs font-medium ${launchStatus === "Running" ? "text-emerald-500" : "text-red-500"}`}>
                {launchStatus}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
