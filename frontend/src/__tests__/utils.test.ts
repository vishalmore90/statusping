import { formatUptime, statusColor, overallStatusLabel } from "../lib/utils";

describe("Frontend utils", () => {
  test("formatUptime formats percentage with 2 decimals", () => {
    expect(formatUptime(99.9)).toBe("99.90%");
    expect(formatUptime(100)).toBe("100.00%");
  });

  test("statusColor maps monitor status correctly", () => {
    expect(statusColor("up")).toBe("text-green-500");
    expect(statusColor("down")).toBe("text-red-500");
    expect(statusColor("unknown")).toBe("text-gray-400");
  });

  test("overallStatusLabel maps platform status correctly", () => {
    expect(overallStatusLabel("operational")).toBe("All Systems Operational");
    expect(overallStatusLabel("partial_outage")).toBe("Partial Outage");
    expect(overallStatusLabel("major_outage")).toBe("Major Outage");
    expect(overallStatusLabel("degraded_performance")).toBe("Degraded Performance");
  });
});
