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
