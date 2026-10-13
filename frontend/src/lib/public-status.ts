import { PublicStatusPage, DailyUptime } from "@/types";

/**
 * Generates 90 days of synthetic daily uptime data.
 */
function generateDemoDailyUptime(basePct: number = 99.95, hasIncidentDay: number = 18): DailyUptime[] {
  const bars: DailyUptime[] = [];
  const now = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    let pct = basePct;
    if (i === hasIncidentDay) {
      pct = 87.4; // noticeable minor outage/degraded bar
    } else if (i % 23 === 0 && i !== 0) {
      pct = 98.2;
    } else {
      // Small natural jitter between 99.8 and 100
      pct = Math.min(100, Number((100 - (Math.random() * 0.15)).toFixed(2)));
    }

    bars.push({
      date: dateStr,
      uptime_percentage: pct,
    });
  }
  return bars;
}

export const DEMO_STATUS_PAGE: PublicStatusPage = {
  slug: "demo",
  title: "StatusPing Cloud Platform",
  description: "Real-time service health, synthetic probe telemetry, and incident history for the StatusPing edge platform.",
  overall_status: "operational",
  last_updated: new Date().toISOString(),
  monitors: [
    {
      id: "demo-mon-1",
      name: "API Gateway (Global Anycast)",
      current_status: "up",
      uptime_percentage_90d: 99.98,
      avg_response_time_ms: 38.4,
      status_history_90d: generateDemoDailyUptime(99.98, 14),
    },
    {
      id: "demo-mon-2",
      name: "Authentication & JWT Service",
      current_status: "up",
      uptime_percentage_90d: 100.0,
      avg_response_time_ms: 42.1,
      status_history_90d: generateDemoDailyUptime(100.0, -1),
    },
    {
      id: "demo-mon-3",
      name: "Synthetic Health Check Dispatcher",
      current_status: "up",
      uptime_percentage_90d: 99.94,
      avg_response_time_ms: 28.6,
      status_history_90d: generateDemoDailyUptime(99.94, 32),
    },
    {
      id: "demo-mon-4",
      name: "Primary PostgreSQL Cluster (Read/Write)",
      current_status: "up",
      uptime_percentage_90d: 100.0,
      avg_response_time_ms: 11.2,
      status_history_90d: generateDemoDailyUptime(100.0, -1),
    },
    {
      id: "demo-mon-5",
      name: "Webhook Delivery & Alerting Engine",
      current_status: "up",
      uptime_percentage_90d: 99.91,
      avg_response_time_ms: 54.8,
      status_history_90d: generateDemoDailyUptime(99.91, 18),
    },
  ],
  incidents: [
    {
      id: "demo-inc-1",
      title: "Scheduled Maintenance: Core Router Firmware Upgrade",
      status: "resolved",
      impact: "minor",
      started_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 34 * 3600 * 1000).toISOString(),
      updates: [
        {
          message: "All router redundancy channels successfully verified. Upgrades completed with zero packet drop.",
          status: "resolved",
          created_at: new Date(Date.now() - 34 * 3600 * 1000).toISOString(),
        },
        {
          message: "Switching traffic to secondary edge nodes to apply kernel security patch.",
          status: "monitoring",
          created_at: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
        },
        {
          message: "Scheduled firmware patch initiated for US-East and EU-West routing backbones.",
          status: "investigating",
          created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        },
      ],
    },
  ],
};

/**
 * Fetches public status page data from backend SSR endpoint.
 * Gracefully falls back to demo data for "demo" slug if backend is offline.
 */
export async function getPublicStatusPageData(slug: string): Promise<PublicStatusPage | null> {
  const baseUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  try {
    const res = await fetch(`${baseUrl}/api/v1/public/status/${encodeURIComponent(slug)}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    });

    if (res.status === 404) {
      if (slug === "demo") {
        return DEMO_STATUS_PAGE;
      }
      return null;
    }

    if (!res.ok) {
      if (slug === "demo") {
        return DEMO_STATUS_PAGE;
      }
      return null;
    }

    const data: PublicStatusPage = await res.json();
    return data;
  } catch {
    // If backend is not running or unreachable during static build / demo test
    if (slug === "demo") {
      return DEMO_STATUS_PAGE;
    }
    return null;
  }
}
