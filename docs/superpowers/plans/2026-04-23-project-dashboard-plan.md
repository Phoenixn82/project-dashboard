# Project Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean, Claude-inspired project dashboard with sidebar filters, expandable project cards, and a nightly GitHub Actions script that auto-updates project data.

**Architecture:** Next.js App Router with Tailwind CSS. All project data lives in a static `projects.json` at the repo root. A Node script (`scripts/update-projects.mjs`) hits the GitHub API to refresh commit data, triggered nightly by GitHub Actions. No database, no auth, no AI in the loop.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Jest + React Testing Library, Node 20

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `jest.config.ts`, `jest.setup.ts`

- [ ] **Step 1: Initialize the Next.js project**

Run from the `project_dashboard` directory:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults for all prompts. This creates the full scaffold.

- [ ] **Step 2: Install test dependencies**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest ts-jest jest-environment-jsdom
```

- [ ] **Step 3: Create jest.config.ts**

```ts
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
```

- [ ] **Step 4: Create jest.setup.ts**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Add test script to package.json**

Add to `"scripts"` in `package.json`:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: Verify scaffold works**

Run: `npm run dev`
Expected: Next.js dev server starts on localhost:3000 with the default page.

Run: `npx jest --passWithNoTests`
Expected: Jest runs, 0 tests, passes.

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind and Jest"
```

---

### Task 2: Create projects.json Data File

**Files:**
- Create: `projects.json`
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create the TypeScript types**

Create `src/lib/types.ts`:

```ts
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
}
```

- [ ] **Step 2: Create projects.json with all 5 projects**

Create `projects.json` at the repo root:

```json
[
  {
    "id": "atlas",
    "name": "Atlas",
    "description": "Industry-specific landing pages with dynamic theming and static generation for 11 industries",
    "localPath": "atlas",
    "githubRepo": "Phoenixn82/atlas",
    "liveUrl": null,
    "status": "active",
    "stack": ["nextjs", "tailwind"],
    "type": "web-app",
    "lastCommit": null,
    "recentCommits": [],
    "openIssues": 0,
    "repoDescription": "",
    "updatedAt": ""
  },
  {
    "id": "claude-usage-widget",
    "name": "Claude Usage Widget",
    "description": "Electron desktop widget for tracking Claude API usage and costs",
    "localPath": "claude-usage-widget",
    "githubRepo": "SlavomirDurej/claude-usage-widget",
    "liveUrl": null,
    "status": "active",
    "stack": ["electron", "javascript"],
    "type": "desktop-app",
    "lastCommit": null,
    "recentCommits": [],
    "openIssues": 0,
    "repoDescription": "",
    "updatedAt": ""
  },
  {
    "id": "facebook-car-scraper",
    "name": "Facebook Car Scraper",
    "description": "Facebook Marketplace car listing scraper with Docker backend and desktop launcher UI",
    "localPath": "facebook_scraper_app/facebook-car-scraper",
    "githubRepo": "Phoenixn82/facebook-car-scraper",
    "liveUrl": null,
    "status": "active",
    "stack": ["python", "docker"],
    "type": "desktop-app",
    "lastCommit": null,
    "recentCommits": [],
    "openIssues": 0,
    "repoDescription": "",
    "updatedAt": ""
  },
  {
    "id": "hometown-hybrids",
    "name": "Hometown Hybrids",
    "description": "Hybrid vehicle dealership site with inventory pages, contact forms, and Resend email integration",
    "localPath": "hometown_hybrids",
    "githubRepo": "Phoenixn82/HometownHybrids",
    "liveUrl": null,
    "status": "active",
    "stack": ["nextjs", "tailwind"],
    "type": "web-app",
    "lastCommit": null,
    "recentCommits": [],
    "openIssues": 0,
    "repoDescription": "",
    "updatedAt": ""
  },
  {
    "id": "job-findr",
    "name": "Job Findr",
    "description": "Full-stack job search platform with Supabase backend, Crawlee scraping, and React frontend",
    "localPath": "job findr",
    "githubRepo": "Phoenixn82/job-findr",
    "liveUrl": null,
    "status": "active",
    "stack": ["nextjs", "supabase", "python"],
    "type": "web-app",
    "lastCommit": null,
    "recentCommits": [],
    "openIssues": 0,
    "repoDescription": "",
    "updatedAt": ""
  }
]
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts projects.json
git commit -m "feat: add project types and projects.json data file"
```

---

### Task 3: Data Loading and Filtering Utilities

**Files:**
- Create: `src/lib/projects.ts`
- Create: `src/lib/__tests__/projects.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/projects.test.ts`:

```ts
import { loadProjects, filterProjects, getFilterOptions } from "../projects";
import type { Project } from "../types";

const mockProjects: Project[] = [
  {
    id: "atlas",
    name: "Atlas",
    description: "Industry pages",
    localPath: "atlas",
    githubRepo: "Phoenixn82/atlas",
    liveUrl: null,
    status: "active",
    stack: ["nextjs", "tailwind"],
    type: "web-app",
    lastCommit: null,
    recentCommits: [],
    openIssues: 0,
    repoDescription: "",
    updatedAt: "",
  },
  {
    id: "facebook-car-scraper",
    name: "Facebook Car Scraper",
    description: "Car scraper",
    localPath: "facebook_scraper_app/facebook-car-scraper",
    githubRepo: "Phoenixn82/facebook-car-scraper",
    liveUrl: null,
    status: "paused",
    stack: ["python", "docker"],
    type: "desktop-app",
    lastCommit: null,
    recentCommits: [],
    openIssues: 0,
    repoDescription: "",
    updatedAt: "",
  },
];

describe("filterProjects", () => {
  it("returns all projects when no filters are set", () => {
    const result = filterProjects(mockProjects, {});
    expect(result).toHaveLength(2);
  });

  it("filters by status", () => {
    const result = filterProjects(mockProjects, { status: ["active"] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("atlas");
  });

  it("filters by stack", () => {
    const result = filterProjects(mockProjects, { stack: ["python"] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("facebook-car-scraper");
  });

  it("filters by type", () => {
    const result = filterProjects(mockProjects, { type: ["desktop-app"] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("facebook-car-scraper");
  });

  it("combines multiple filters with AND logic", () => {
    const result = filterProjects(mockProjects, {
      status: ["active"],
      type: ["desktop-app"],
    });
    expect(result).toHaveLength(0);
  });

  it("filters by search query against name and description", () => {
    const result = filterProjects(mockProjects, { search: "car" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("facebook-car-scraper");
  });
});

describe("getFilterOptions", () => {
  it("extracts unique statuses from projects", () => {
    const options = getFilterOptions(mockProjects);
    expect(options.statuses).toEqual(["active", "paused"]);
  });

  it("extracts unique stacks from projects", () => {
    const options = getFilterOptions(mockProjects);
    expect(options.stacks).toEqual(
      expect.arrayContaining(["nextjs", "tailwind", "python", "docker"])
    );
  });

  it("extracts unique types from projects", () => {
    const options = getFilterOptions(mockProjects);
    expect(options.types).toEqual(
      expect.arrayContaining(["web-app", "desktop-app"])
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/lib/__tests__/projects.test.ts`
Expected: FAIL — module `../projects` not found.

- [ ] **Step 3: Implement the utilities**

Create `src/lib/projects.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/lib/__tests__/projects.test.ts`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/projects.ts src/lib/__tests__/projects.test.ts
git commit -m "feat: add project filtering and data loading utilities"
```

---

### Task 4: Sidebar Component

**Files:**
- Create: `src/app/components/FilterGroup.tsx`
- Create: `src/app/components/Sidebar.tsx`
- Create: `src/app/components/__tests__/Sidebar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/components/__tests__/Sidebar.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../Sidebar";

const mockFilterOptions = {
  statuses: ["active" as const, "paused" as const],
  stacks: ["nextjs", "python"],
  types: ["web-app" as const, "desktop-app" as const],
};

describe("Sidebar", () => {
  it("renders the dashboard title", () => {
    render(
      <Sidebar
        filterOptions={mockFilterOptions}
        activeFilters={{}}
        onFilterChange={jest.fn()}
      />
    );
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders all three filter groups", () => {
    render(
      <Sidebar
        filterOptions={mockFilterOptions}
        activeFilters={{}}
        onFilterChange={jest.fn()}
      />
    );
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Stack")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
  });

  it("renders filter pills for each option", () => {
    render(
      <Sidebar
        filterOptions={mockFilterOptions}
        activeFilters={{}}
        onFilterChange={jest.fn()}
      />
    );
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("paused")).toBeInTheDocument();
    expect(screen.getByText("nextjs")).toBeInTheDocument();
    expect(screen.getByText("python")).toBeInTheDocument();
  });

  it("calls onFilterChange when a pill is clicked", () => {
    const onFilterChange = jest.fn();
    render(
      <Sidebar
        filterOptions={mockFilterOptions}
        activeFilters={{}}
        onFilterChange={onFilterChange}
      />
    );
    fireEvent.click(screen.getByText("active"));
    expect(onFilterChange).toHaveBeenCalledWith("status", "active");
  });

  it("highlights active filter pills", () => {
    render(
      <Sidebar
        filterOptions={mockFilterOptions}
        activeFilters={{ status: ["active"] }}
        onFilterChange={jest.fn()}
      />
    );
    const activePill = screen.getByText("active");
    expect(activePill.className).toMatch(/bg-white/);
  });

  it("renders an All Projects reset button", () => {
    render(
      <Sidebar
        filterOptions={mockFilterOptions}
        activeFilters={{ status: ["active"] }}
        onFilterChange={jest.fn()}
        onReset={jest.fn()}
      />
    );
    expect(screen.getByText("All Projects")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/app/components/__tests__/Sidebar.test.tsx`
Expected: FAIL — module `../Sidebar` not found.

- [ ] **Step 3: Implement FilterGroup**

Create `src/app/components/FilterGroup.tsx`:

```tsx
"use client";

import { useState } from "react";

interface FilterGroupProps {
  label: string;
  options: string[];
  activeValues: string[];
  onToggle: (value: string) => void;
}

export function FilterGroup({
  label,
  options,
  activeValues,
  onToggle,
}: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 hover:text-white transition-colors"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = activeValues.includes(option);
            return (
              <button
                key={option}
                onClick={() => onToggle(option)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-white text-gray-900"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Implement Sidebar**

Create `src/app/components/Sidebar.tsx`:

```tsx
"use client";

import { FilterGroup } from "./FilterGroup";
import type { Filters, FilterOptions } from "@/lib/projects";

interface SidebarProps {
  filterOptions: FilterOptions;
  activeFilters: Filters;
  onFilterChange: (
    category: "status" | "stack" | "type",
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
    (activeFilters.type?.length ?? 0) > 0;

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
    </aside>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest src/app/components/__tests__/Sidebar.test.tsx`
Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/FilterGroup.tsx src/app/components/Sidebar.tsx src/app/components/__tests__/Sidebar.test.tsx
git commit -m "feat: add Sidebar with collapsible filter groups"
```

---

### Task 5: ProjectCard Component (Collapsed View)

**Files:**
- Create: `src/app/components/ProjectCard.tsx`
- Create: `src/app/components/__tests__/ProjectCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/components/__tests__/ProjectCard.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectCard } from "../ProjectCard";
import type { Project } from "@/lib/types";

const mockProject: Project = {
  id: "atlas",
  name: "Atlas",
  description: "Industry-specific landing pages",
  localPath: "atlas",
  githubRepo: "Phoenixn82/atlas",
  liveUrl: "https://atlas.example.com",
  status: "active",
  stack: ["nextjs", "tailwind"],
  type: "web-app",
  lastCommit: {
    message: "feat: add industry route",
    date: "2026-04-18T12:00:00Z",
    sha: "b7f675d",
  },
  recentCommits: [
    {
      message: "feat: add industry route",
      date: "2026-04-18T12:00:00Z",
      sha: "b7f675d",
    },
    {
      message: "fix: add CSSProperties import",
      date: "2026-04-17T12:00:00Z",
      sha: "0e3f2b6",
    },
  ],
  openIssues: 2,
  repoDescription: "Atlas app",
  updatedAt: "2026-04-23T07:00:00Z",
};

describe("ProjectCard", () => {
  it("renders the project name", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Atlas")).toBeInTheDocument();
  });

  it("renders the status badge", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders stack tags", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("nextjs")).toBeInTheDocument();
    expect(screen.getByText("tailwind")).toBeInTheDocument();
  });

  it("renders the last commit message", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/feat: add industry route/)).toBeInTheDocument();
  });

  it("renders a GitHub link when githubRepo is set", () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/Phoenixn82/atlas"
    );
  });

  it("expands when clicked", () => {
    render(<ProjectCard project={mockProject} />);
    fireEvent.click(screen.getByText("Atlas"));
    expect(screen.getByText("Industry-specific landing pages")).toBeInTheDocument();
  });

  it("shows recent commits when expanded", () => {
    render(<ProjectCard project={mockProject} />);
    fireEvent.click(screen.getByText("Atlas"));
    expect(screen.getByText(/fix: add CSSProperties import/)).toBeInTheDocument();
  });

  it("shows action buttons when expanded", () => {
    render(<ProjectCard project={mockProject} />);
    fireEvent.click(screen.getByText("Atlas"));
    expect(screen.getByText("View on GitHub")).toBeInTheDocument();
    expect(screen.getByText("Visit Site")).toBeInTheDocument();
  });

  it("hides Visit Site button when liveUrl is null", () => {
    const noUrlProject = { ...mockProject, liveUrl: null };
    render(<ProjectCard project={noUrlProject} />);
    fireEvent.click(screen.getByText("Atlas"));
    expect(screen.queryByText("Visit Site")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/app/components/__tests__/ProjectCard.test.tsx`
Expected: FAIL — module `../ProjectCard` not found.

- [ ] **Step 3: Implement ProjectCard with integrated expanded view**

Create `src/app/components/ProjectCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  idea: "bg-gray-500/20 text-gray-400",
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
          <h3 className="font-semibold text-gray-900 text-lg">
            {project.name}
          </h3>
          <div className="flex items-center gap-2">
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

          <div className="flex gap-3">
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
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/app/components/__tests__/ProjectCard.test.tsx`
Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/ProjectCard.tsx src/app/components/__tests__/ProjectCard.test.tsx
git commit -m "feat: add ProjectCard with expandable detail view"
```

---

### Task 6: ProjectGrid Component

**Files:**
- Create: `src/app/components/ProjectGrid.tsx`
- Create: `src/app/components/__tests__/ProjectGrid.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/components/__tests__/ProjectGrid.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ProjectGrid } from "../ProjectGrid";
import type { Project } from "@/lib/types";

const mockProjects: Project[] = [
  {
    id: "atlas",
    name: "Atlas",
    description: "Industry pages",
    localPath: "atlas",
    githubRepo: "Phoenixn82/atlas",
    liveUrl: null,
    status: "active",
    stack: ["nextjs"],
    type: "web-app",
    lastCommit: null,
    recentCommits: [],
    openIssues: 0,
    repoDescription: "",
    updatedAt: "",
  },
  {
    id: "job-findr",
    name: "Job Findr",
    description: "Job search platform",
    localPath: "job findr",
    githubRepo: "Phoenixn82/job-findr",
    liveUrl: null,
    status: "active",
    stack: ["nextjs", "supabase"],
    type: "web-app",
    lastCommit: null,
    recentCommits: [],
    openIssues: 0,
    repoDescription: "",
    updatedAt: "",
  },
];

describe("ProjectGrid", () => {
  it("renders a card for each project", () => {
    render(<ProjectGrid projects={mockProjects} />);
    expect(screen.getByText("Atlas")).toBeInTheDocument();
    expect(screen.getByText("Job Findr")).toBeInTheDocument();
  });

  it("shows the project count in the header", () => {
    render(<ProjectGrid projects={mockProjects} />);
    expect(screen.getByText("2 projects")).toBeInTheDocument();
  });

  it("renders a search input", () => {
    render(<ProjectGrid projects={mockProjects} />);
    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
  });

  it("shows empty state when no projects match", () => {
    render(<ProjectGrid projects={[]} />);
    expect(screen.getByText("No projects found")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/app/components/__tests__/ProjectGrid.test.tsx`
Expected: FAIL — module `../ProjectGrid` not found.

- [ ] **Step 3: Implement ProjectGrid**

Create `src/app/components/ProjectGrid.tsx`:

```tsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/app/components/__tests__/ProjectGrid.test.tsx`
Expected: All 4 tests PASS.

Note: The test file uses a simplified version of ProjectGrid props (no searchQuery/onSearchChange). Update the test to pass empty string and jest.fn() for those props:

```tsx
// Update all render calls in the test to:
render(<ProjectGrid projects={mockProjects} searchQuery="" onSearchChange={jest.fn()} />);
```

- [ ] **Step 5: Commit**

```bash
git add src/app/components/ProjectGrid.tsx src/app/components/__tests__/ProjectGrid.test.tsx
git commit -m "feat: add ProjectGrid with search and responsive layout"
```

---

### Task 7: Main Page — Compose Everything

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the default page.tsx**

Replace contents of `src/app/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Update layout.tsx**

Replace contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Dashboard",
  description: "Personal project dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Replace globals.css**

Replace contents of `src/app/globals.css`:

```css
@import "tailwindcss";

body {
  margin: 0;
  min-height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
```

- [ ] **Step 4: Verify the app runs**

Run: `npm run dev`
Expected: Dashboard renders at localhost:3000 with the sidebar on the left showing filter groups, and 5 project cards in the main area. Clicking a card expands it. Clicking filter pills filters the grid.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: compose main dashboard page with sidebar and grid"
```

---

### Task 8: Mobile Sidebar Toggle

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/components/Sidebar.tsx`

- [ ] **Step 1: Add a mobile toggle button to page.tsx**

Add state and a hamburger button. Update the `<div className="flex">` wrapper in `page.tsx`:

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false);
```

Update the return JSX:

```tsx
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
```

- [ ] **Step 2: Verify mobile layout**

Run: `npm run dev`
Resize browser below 1024px. Expected: sidebar is hidden, hamburger icon appears. Clicking it slides the sidebar in with a dark overlay. Clicking overlay closes it.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add mobile sidebar toggle with overlay"
```

---

### Task 9: Nightly Update Script

**Files:**
- Create: `scripts/update-projects.mjs`

- [ ] **Step 1: Create the update script**

Create `scripts/update-projects.mjs`:

```js
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
```

- [ ] **Step 2: Test the script locally**

Run: `node scripts/update-projects.mjs`
Expected: Script reads `projects.json`, fetches data from GitHub API for each repo, writes updated data back. Check `projects.json` — the auto-updated fields should now have real commit data.

- [ ] **Step 3: Commit**

```bash
git add scripts/update-projects.mjs
git commit -m "feat: add nightly project data update script"
```

---

### Task 10: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/update-projects.yml`

- [ ] **Step 1: Create the workflow file**

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/update-projects.yml`:

```yaml
name: Update Project Data

on:
  schedule:
    # 7am UTC = 3am EST, daily
    - cron: "0 7 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Update project data
        run: node scripts/update-projects.mjs
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit and push if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git diff --quiet projects.json && exit 0
          git add projects.json
          git commit -m "chore: nightly project data update"
          git push
```

- [ ] **Step 2: Verify the workflow syntax**

Run: `cat .github/workflows/update-projects.yml`
Expected: Valid YAML, no syntax errors. The `permissions: contents: write` is required for the bot to push.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/update-projects.yml
git commit -m "feat: add nightly GitHub Actions workflow for project data updates"
```

---

### Task 11: Initialize Git Repo and Push to GitHub

**Files:**
- None created — git operations only.

- [ ] **Step 1: Create the GitHub repo**

```bash
gh repo create Phoenixn82/project-dashboard --public --description "Personal project dashboard" --source . --remote origin
```

- [ ] **Step 2: Push everything**

```bash
git push -u origin main
```

Expected: All commits pushed. The GitHub Actions workflow is now live — can be triggered manually via the "Actions" tab, and will auto-run at 3am EST nightly.

- [ ] **Step 3: Run the workflow manually to populate data**

```bash
gh workflow run update-projects.yml
```

Then after ~30 seconds:

```bash
gh run list --workflow=update-projects.yml --limit 1
```

Expected: Shows a completed run. Pull the updated data:

```bash
git pull
```

Check `projects.json` — all auto-updated fields should now have real commit data.

- [ ] **Step 4: Run all tests one final time**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Final commit (if any test fixes were needed)**

```bash
git add -A
git commit -m "chore: final test fixes"
git push
```
