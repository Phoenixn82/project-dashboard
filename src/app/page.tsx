"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { ProjectGrid } from "./components/ProjectGrid";
import {
  filterProjects,
  sortByRecentActivity,
  getFilterOptions,
  type Filters,
} from "@/lib/projects";
import type { Project, ProjectStatus, ProjectType } from "@/lib/types";
import projectsData from "../../projects.json";

export default function Home() {
  const projects = projectsData as Project[];
  const filterOptions = useMemo(() => getFilterOptions(projects), [projects]);

  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeFilters: Filters = {
    ...filters,
    search: searchQuery || undefined,
  };

  const filteredProjects = useMemo(
    () => sortByRecentActivity(filterProjects(projects, activeFilters)),
    [projects, activeFilters]
  );

  function handleFilterChange(
    category: "status" | "stack" | "type",
    value: string
  ) {
    setFilters((prev) => {
      const current = (prev[category] as string[] | undefined) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [category]: next.length > 0 ? next : undefined,
      } as Filters;
    });
  }

  function handleReset() {
    setFilters({});
    setSearchQuery("");
  }

  return (
    <div className="flex relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-30 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          filterOptions={filterOptions}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden fixed top-4 left-4 z-10 p-2 bg-[#1a1a2e] text-white rounded-lg"
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <ProjectGrid
          projects={filteredProjects}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </div>
  );
}
