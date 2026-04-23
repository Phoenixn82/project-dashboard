import type { Project, ProjectStatus, ProjectType } from "./types";

export interface Filters {
  status?: ProjectStatus[];
  stack?: string[];
  type?: ProjectType[];
  search?: string;
}

export interface FilterOptions {
  statuses: ProjectStatus[];
  stacks: string[];
  types: ProjectType[];
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

export function getFilterOptions(projects: Project[]): FilterOptions {
  const statuses = [...new Set(projects.map((p) => p.status))].sort();
  const stacks = [...new Set(projects.flatMap((p) => p.stack))].sort();
  const types = [...new Set(projects.map((p) => p.type))].sort();
  return { statuses, stacks, types };
}
