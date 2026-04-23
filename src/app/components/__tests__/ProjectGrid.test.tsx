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
    render(<ProjectGrid projects={mockProjects} searchQuery="" onSearchChange={jest.fn()} />);
    expect(screen.getByText("Atlas")).toBeInTheDocument();
    expect(screen.getByText("Job Findr")).toBeInTheDocument();
  });

  it("shows the project count in the header", () => {
    render(<ProjectGrid projects={mockProjects} searchQuery="" onSearchChange={jest.fn()} />);
    expect(screen.getByText("2 projects")).toBeInTheDocument();
  });

  it("renders a search input", () => {
    render(<ProjectGrid projects={mockProjects} searchQuery="" onSearchChange={jest.fn()} />);
    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
  });

  it("shows empty state when no projects match", () => {
    render(<ProjectGrid projects={[]} searchQuery="" onSearchChange={jest.fn()} />);
    expect(screen.getByText("No projects found")).toBeInTheDocument();
  });
});
