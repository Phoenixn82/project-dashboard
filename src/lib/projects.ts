import type { Project, ProjectStatus, ProjectType } from "./types";

export interface Filters {
  status?: ProjectStatus[];
  stack?: string[];
  type?: ProjectType[];
  freshness?: Freshness[];
  search?: string;
}

export interface FilterOptions {
  statuses: ProjectStatus[];
  stacks: string[];
  types: ProjectType[];
  freshnesses: Freshness[];
}

export function loadProjects(): Project[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require("../../projects.json");
  return data as Project[];
}

export function filterProjects(
  projects: Project[],
  filters: Filters
): Project[] {
  return projects.filter((p) => {
    if (filters.status?.length && !filters.status.includes(p.status)) {
      return false;
    }
    if (
      filters.stack?.length &&
      !filters.stack.some((s) => p.stack.includes(s))
    ) {
      return false;
    }
    if (filters.type?.length && !filters.type.includes(p.type)) {
      return false;
    }
    if (
      filters.freshness?.length &&
      !filters.freshness.includes(getFreshness(p))
    ) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${p.name} ${p.description}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function sortByRecentActivity(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const dateA = a.lastCommit?.date ?? "";
    const dateB = b.lastCommit?.date ?? "";
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

export type Freshness = "fresh" | "recent" | "stale" | "unknown";

export function getFreshness(project: Project): Freshness {
  if (!project.lastCommit?.date) return "unknown";
  const days = Math.floor(
    (Date.now() - new Date(project.lastCommit.date).getTime()) / 86_400_000
  );
  if (days <= 7) return "fresh";
  if (days <= 30) return "recent";
  return "stale";
}

export function getFilterOptions(projects: Project[]): FilterOptions {
  const statuses = [...new Set(projects.map((p) => p.status))].sort();
  const stacks = [...new Set(projects.flatMap((p) => p.stack))].sort();
  const types = [...new Set(projects.map((p) => p.type))].sort();
  const freshnesses: Freshness[] = ["fresh", "recent", "stale", "unknown"].filter(
    (f) => projects.some((p) => getFreshness(p) === f)
  ) as Freshness[];
  return { statuses, stacks, types, freshnesses };
}
