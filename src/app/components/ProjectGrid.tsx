"use client";

import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/lib/types";

interface ProjectGridProps {
  projects: Project[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProjectGrid({
  projects,
  searchQuery,
  onSearchChange,
}: ProjectGridProps) {
  return (
    <div className="flex-1 p-8 bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-medium text-gray-500">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </h2>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-64"
        />
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
