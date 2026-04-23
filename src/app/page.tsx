"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { ProjectGrid } from "./components/ProjectGrid";
import {
  filterProjects,
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

  const activeFilters: Filters = {
    ...filters,
    search: searchQuery || undefined,
  };

  const filteredProjects = useMemo(
    () => filterProjects(projects, activeFilters),
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
    <div className="flex">
      <Sidebar
        filterOptions={filterOptions}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
      <ProjectGrid
        projects={filteredProjects}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}
