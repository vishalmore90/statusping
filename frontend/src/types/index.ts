/**
 * Shared TypeScript types for StatusPing frontend.
 * Mirrors the backend Pydantic schemas.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ─── Status Page ──────────────────────────────────────────────────────────────

export interface StatusPage {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Monitors ─────────────────────────────────────────────────────────────────

export type MonitorType = "http" | "tcp";
export type MonitorStatus = "up" | "down" | "unknown";

export interface Monitor {
  id: string;
  user_id: string;
  status_page_id: string | null;
  name: string;
  url: string;
  monitor_type: MonitorType;
  interval_seconds: number;
  timeout_seconds: number;
  expected_status_code: number | null;
  is_active: boolean;
  current_status: MonitorStatus;
  last_checked_at: string | null;
  uptime_percentage_24h?: number;
  created_at: string;
}

export interface MonitorCreatePayload {
  name: string;
  url: string;
  monitor_type: MonitorType;
  interval_seconds: number;
  timeout_seconds: number;
  expected_status_code?: number | null;
  status_page_id?: string | null;
}

// ─── Check Results ────────────────────────────────────────────────────────────

export interface CheckResult {
  id: number;
  checked_at: string;
  status: "up" | "down";
  response_time_ms: number | null;
  status_code: number | null;
  error_message: string | null;
}

export interface CheckResultsPage {
  results: CheckResult[];
  next_cursor: string | null;
}

export type CheckHistoryResponse = CheckResultsPage;

export interface UptimeStats {
  monitor_id: string;
  uptime_24h: number;
  uptime_7d: number;
  uptime_30d: number;
  avg_response_time_ms?: number | null;
  avg_response_time_ms_24h?: number | null;
  total_checks_24h: number;
  total_outages_24h?: number;
}

// ─── Incidents ────────────────────────────────────────────────────────────────

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
export type IncidentImpact = "none" | "minor" | "major" | "critical";

export interface IncidentUpdate {
  id: string;
  message: string;
  status: IncidentStatus;
  created_at: string;
}

export interface Incident {
  id: string;
  user_id: string;
  status_page_id: string | null;
  monitor_id?: string | null;
  title: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
  updates: IncidentUpdate[];
}

export interface IncidentCreatePayload {
  title: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  status_page_id?: string | null;
  initial_message?: string | null;
}

export interface IncidentUpdateCreatePayload {
  message: string;
  status: IncidentStatus;
}

// ─── Public Status Page ───────────────────────────────────────────────────────

export type OverallStatus = "operational" | "degraded_performance" | "partial_outage" | "major_outage";

export interface DailyUptime {
  date: string;
  uptime_percentage: number;
}

export interface PublicMonitor {
  id: string;
  name: string;
  current_status: MonitorStatus;
  uptime_percentage_90d: number;
  avg_response_time_ms?: number | null;
  response_times_24h?: number[];
  status_history_90d: DailyUptime[];
}

export interface PublicIncidentUpdate {
  message: string;
  status: IncidentStatus;
  created_at: string;
}

export interface PublicIncident {
  id: string;
  title: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  started_at: string;
  resolved_at: string | null;
  updates: PublicIncidentUpdate[];
}

export interface PublicStatusPage {
  slug: string;
  title: string;
  description: string | null;
  overall_status: OverallStatus;
  monitors: PublicMonitor[];
  incidents: PublicIncident[];
  last_updated?: string;
}
