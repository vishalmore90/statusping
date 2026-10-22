import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Badge } from "../components/ui/Badge";
import { StatusIndicator } from "../components/monitors/StatusIndicator";
import { UptimeBar } from "../components/monitors/UptimeBar";

describe("UI Components", () => {
  describe("Badge component", () => {
    test("renders label text correctly", () => {
      render(<Badge variant="up">Active</Badge>);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    test("renders variant colors without errors", () => {
      const { rerender } = render(<Badge variant="down">Major Outage</Badge>);
      expect(screen.getByText("Major Outage")).toBeInTheDocument();

      rerender(<Badge variant="degraded">Degraded</Badge>);
      expect(screen.getByText("Degraded")).toBeInTheDocument();

      rerender(<Badge variant="investigating">Investigating</Badge>);
      expect(screen.getByText("Investigating")).toBeInTheDocument();
    });

    test("renders with dot indicator when showDot is true", () => {
      const { container } = render(
        <Badge variant="up" showDot>
          Live
        </Badge>
      );
      expect(screen.getByText("Live")).toBeInTheDocument();
      expect(container.querySelectorAll("span").length).toBeGreaterThan(1);
    });
  });

  describe("StatusIndicator component", () => {
    test("renders default label for operational status", () => {
      render(<StatusIndicator status="operational" />);
      expect(screen.getByText("Operational")).toBeInTheDocument();
    });

    test("renders custom label when provided", () => {
      render(<StatusIndicator status="down" label="Critical Failure" />);
      expect(screen.getByText("Critical Failure")).toBeInTheDocument();
    });

    test("renders default label for degraded status", () => {
      render(<StatusIndicator status="degraded" />);
      expect(screen.getByText("Degraded")).toBeInTheDocument();
    });

    test("renders default label for unknown status", () => {
      render(<StatusIndicator status="unknown" />);
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });
  });

  describe("UptimeBar component", () => {
    test("renders 90 day slots and axis labels", () => {
      const data = Array.from({ length: 90 }, (_, i) => ({
        date: `2026-01-${String(i + 1).padStart(2, "0")}`,
        uptime_percentage: 100.0,
      }));

      render(<UptimeBar data={data} totalDays={90} overallUptime={100.0} />);
      expect(screen.getByText("90 days ago")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("100.00% uptime")).toBeInTheDocument();
    });

    test("renders with empty data fallback cleanly", () => {
      render(<UptimeBar data={[]} totalDays={30} />);
      expect(screen.getByText("30 days ago")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });
});
