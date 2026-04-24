"use client";

import { FilterGroup } from "./FilterGroup";
import type { Filters, FilterOptions } from "@/lib/projects";

interface SidebarProps {
  filterOptions: FilterOptions;
  activeFilters: Filters;
  onFilterChange: (
    category: "status" | "stack" | "type" | "freshness",
    value: string
  ) => void;
  onReset?: () => void;
  className?: string;
}

export function Sidebar({
  filterOptions,
  activeFilters,
  onFilterChange,
  onReset,
  className = "",
}: SidebarProps) {
  const hasActiveFilters =
    (activeFilters.status?.length ?? 0) > 0 ||
    (activeFilters.stack?.length ?? 0) > 0 ||
    (activeFilters.type?.length ?? 0) > 0 ||
    (activeFilters.freshness?.length ?? 0) > 0;

  return (
    <aside
      className={`w-64 bg-[#1a1a2e] text-white p-6 flex flex-col min-h-screen ${className}`}
    >
      <h1 className="text-xl font-bold mb-6 tracking-tight">Projects</h1>

      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="mb-6 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors w-full text-left"
        >
          All Projects
        </button>
      )}

      <FilterGroup
        label="Status"
        options={filterOptions.statuses}
        activeValues={activeFilters.status ?? []}
        onToggle={(v) => onFilterChange("status", v)}
      />

      <FilterGroup
        label="Stack"
        options={filterOptions.stacks}
        activeValues={activeFilters.stack ?? []}
        onToggle={(v) => onFilterChange("stack", v)}
      />

      <FilterGroup
        label="Type"
        options={filterOptions.types}
        activeValues={activeFilters.type ?? []}
        onToggle={(v) => onFilterChange("type", v)}
      />

      <FilterGroup
        label="Freshness"
        options={filterOptions.freshnesses}
        activeValues={activeFilters.freshness ?? []}
        onToggle={(v) => onFilterChange("freshness", v)}
      />
    </aside>
  );
}
