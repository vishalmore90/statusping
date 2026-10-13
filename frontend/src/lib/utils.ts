/**
 * Shared utility functions.
 */
import { formatDistanceToNow, parseISO } from "date-fns";

/** Format an ISO timestamp as relative time (e.g. "3 minutes ago") */
export function timeAgo(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
}

/** Format uptime percentage with 2 decimal places */
export function formatUptime(pct: number): string {
  return `${pct.toFixed(2)}%`;
}

/** Map a monitor current_status to a display color class */
export function statusColor(status: string): string {
  switch (status) {
    case "up":
      return "text-green-500";
    case "down":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

/** Map overall page status to a human label */
export function overallStatusLabel(status: string): string {
  switch (status) {
    case "operational":
      return "All Systems Operational";
    case "degraded_performance":
      return "Degraded Performance";
    case "partial_outage":
      return "Partial Outage";
    case "major_outage":
      return "Major Outage";
    default:
      return "Unknown";
  }
}
