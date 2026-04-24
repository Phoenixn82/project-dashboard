"use client";

import { useMemo, useRef, useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { getFreshness } from "@/lib/projects";
import type { Project } from "@/lib/types";
import type { Freshness } from "@/lib/projects";

interface ProjectGridProps {
  projects: Project[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function useProjectStats(projects: Project[]) {
  return useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "active").length;
    const paused = projects.filter((p) => p.status === "paused").length;
    const idea = projects.filter((p) => p.status === "idea").length;
    const openIssues = projects.reduce((sum, p) => sum + p.openIssues, 0);

    const freshnessCounts: Record<Freshness, number> = {
      fresh: 0,
      recent: 0,
      stale: 0,
      unknown: 0,
    };
    for (const p of projects) {
      freshnessCounts[getFreshness(p)]++;
    }
    const freshnessParts: string[] = [];
    if (freshnessCounts.fresh) freshnessParts.push(`${freshnessCounts.fresh} fresh`);
    if (freshnessCounts.recent) freshnessParts.push(`${freshnessCounts.recent} recent`);
    if (freshnessCounts.stale) freshnessParts.push(`${freshnessCounts.stale} stale`);
    if (freshnessCounts.unknown) freshnessParts.push(`${freshnessCounts.unknown} unknown`);
    const freshnessLabel = freshnessParts.join(", ");

    return { total, active, paused, idea, openIssues, freshnessLabel };
  }, [projects]);
}

export function ProjectGrid({
  projects,
  searchQuery,
  onSearchChange,
}: ProjectGridProps) {
  const stats = useProjectStats(projects);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        onSearchChange("");
        searchInputRef.current?.blur();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSearchChange]);

  return (
    <div className="flex-1 p-8 bg-[#fafafa] min-h-screen">
      {/* Stats summary */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-gray-500">
        <span>{stats.total} project{stats.total !== 1 ? "s" : ""}</span>
        <span className="text-gray-300">|</span>
        <span>{stats.active} active, {stats.paused} paused, {stats.idea} idea</span>
        <span className="text-gray-300">|</span>
        <span>{stats.openIssues} open issue{stats.openIssues !== 1 ? "s" : ""}</span>
        <span className="text-gray-300">|</span>
        <span>{stats.freshnessLabel}</span>
      </div>

      {/* Search */}
      <div className="flex items-center justify-end mb-8">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-4 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-64"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[11px] font-sans text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 leading-none">/</kbd>
        </div>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
