import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../Sidebar";

const mockFilterOptions = {
  statuses: ["active" as const, "paused" as const],
  stacks: ["nextjs", "python"],
  types: ["web-app" as const, "desktop-app" as const],
  freshnesses: ["stale" as const, "unknown" as const],
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

  it("renders all four filter groups", () => {
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
    expect(screen.getByText("Freshness")).toBeInTheDocument();
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
