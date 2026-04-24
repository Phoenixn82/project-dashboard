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
  launchCommand: "npm run dev",
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
