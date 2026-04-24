import { filterProjects, getFilterOptions, sortByRecentActivity, getFreshness } from "../projects";
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
    launchCommand: null,
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
    launchCommand: null,
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

  it("filters by freshness", () => {
    const withDates: Project[] = [
      { ...mockProjects[0], lastCommit: { message: "x", date: new Date().toISOString(), sha: "a" } },
      { ...mockProjects[1] }, // null lastCommit → "unknown"
    ];
    const result = filterProjects(withDates, { freshness: ["fresh"] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("atlas");
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

  it("extracts freshness values present in projects", () => {
    const options = getFilterOptions(mockProjects);
    expect(options.freshnesses).toContain("unknown");
  });
});

describe("sortByRecentActivity", () => {
  it("sorts projects with most recent commits first", () => {
    const projects: Project[] = [
      { ...mockProjects[0], lastCommit: { message: "old", date: "2026-01-01T00:00:00Z", sha: "a" } },
      { ...mockProjects[1], lastCommit: { message: "new", date: "2026-04-01T00:00:00Z", sha: "b" } },
    ];
    const sorted = sortByRecentActivity(projects);
    expect(sorted[0].id).toBe("facebook-car-scraper");
    expect(sorted[1].id).toBe("atlas");
  });

  it("pushes projects with no commit date to the end", () => {
    const projects: Project[] = [
      { ...mockProjects[0] }, // null lastCommit
      { ...mockProjects[1], lastCommit: { message: "x", date: "2026-04-01T00:00:00Z", sha: "a" } },
    ];
    const sorted = sortByRecentActivity(projects);
    expect(sorted[0].id).toBe("facebook-car-scraper");
    expect(sorted[1].id).toBe("atlas");
  });
});

describe("getFreshness", () => {
  it("returns 'unknown' when lastCommit is null", () => {
    expect(getFreshness(mockProjects[0])).toBe("unknown");
  });

  it("returns 'fresh' for commits within 7 days", () => {
    const project = { ...mockProjects[0], lastCommit: { message: "x", date: new Date().toISOString(), sha: "a" } };
    expect(getFreshness(project)).toBe("fresh");
  });

  it("returns 'recent' for commits within 30 days", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86_400_000).toISOString();
    const project = { ...mockProjects[0], lastCommit: { message: "x", date: twoWeeksAgo, sha: "a" } };
    expect(getFreshness(project)).toBe("recent");
  });

  it("returns 'stale' for commits older than 30 days", () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000).toISOString();
    const project = { ...mockProjects[0], lastCommit: { message: "x", date: sixtyDaysAgo, sha: "a" } };
    expect(getFreshness(project)).toBe("stale");
  });
});
