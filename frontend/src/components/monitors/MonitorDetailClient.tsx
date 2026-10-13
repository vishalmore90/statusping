"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  Globe,
  Radio,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Monitor, UptimeStats, CheckResult, CheckHistoryResponse } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/monitors/StatusIndicator";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface MonitorDetailClientProps {
  monitorId: string;
}

export function MonitorDetailClient({ monitorId }: MonitorDetailClientProps) {
  const router = useRouter();

  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [stats, setStats] = useState<UptimeStats | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editInterval, setEditInterval] = useState<number>(60);
  const [editTimeout, setEditTimeout] = useState<number>(10);
  const [editStatusCode, setEditStatusCode] = useState<number>(200);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      apiClient.get<Monitor>(`/monitors/${monitorId}`),
      apiClient.get<UptimeStats>(`/monitors/${monitorId}/uptime`),
      apiClient.get<CheckHistoryResponse>(`/monitors/${monitorId}/checks?limit=50`),
    ])
      .then(([monRes, statRes, checkRes]) => {
        setMonitor(monRes.data);
        setStats(statRes.data);
        setChecks(checkRes.data.results);
        setErrorMessage(null);
      })
      .catch(() => {
        setErrorMessage("Failed to load monitor details.");
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      Promise.all([
        apiClient.get<Monitor>(`/monitors/${monitorId}`),
        apiClient.get<UptimeStats>(`/monitors/${monitorId}/uptime`),
        apiClient.get<CheckHistoryResponse>(`/monitors/${monitorId}/checks?limit=50`),
      ])
        .then(([monRes, statRes, checkRes]) => {
          if (!isMounted) return;
          setMonitor(monRes.data);
          setStats(statRes.data);
          setChecks(checkRes.data.results);
          setErrorMessage(null);

          // Populate edit fields
          setEditName(monRes.data.name);
          setEditUrl(monRes.data.url);
          setEditInterval(monRes.data.interval_seconds);
          setEditTimeout(monRes.data.timeout_seconds);
          setEditStatusCode(monRes.data.expected_status_code || 200);
        })
        .catch(() => {
          if (isMounted) setErrorMessage("Failed to load monitor details.");
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    };

    load();
    const interval = setInterval(load, 15000); // Polling every 15s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [monitorId]);

  const handleToggleActive = async () => {
    if (!monitor) return;
    try {
      const res = await apiClient.patch<Monitor>(`/monitors/${monitor.id}`, {
        is_active: !monitor.is_active,
      });
      setMonitor(res.data);
    } catch {
      alert("Failed to toggle monitor status.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitor) return;
    setIsSavingEdit(true);
    try {
      const res = await apiClient.patch<Monitor>(`/monitors/${monitor.id}`, {
        name: editName.trim(),
        url: editUrl.trim(),
        interval_seconds: Number(editInterval),
        timeout_seconds: Number(editTimeout),
        expected_status_code: monitor.monitor_type === "http" ? Number(editStatusCode) : null,
      });
      setMonitor(res.data);
      setShowEditModal(false);
    } catch {
      alert("Failed to save changes. Verify URL and parameters.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!monitor) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/monitors/${monitor.id}`);
      router.push("/dashboard/monitors");
    } catch {
      alert("Failed to delete monitor.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "5rem 0",
          gap: "1rem",
          color: "var(--text-muted)",
        }}
      >
        <RefreshCw size={28} className="animate-spin" />
        <span>Loading monitor telemetry...</span>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Monitor not found</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          This monitor may have been removed or you do not have permission to view it.
        </p>
        <Link href="/dashboard/monitors" style={{ marginTop: "1rem", display: "inline-block" }}>
          <Button variant="secondary">Return to Monitors</Button>
        </Link>
      </div>
    );
  }

  const statusType = !monitor.is_active
    ? "unknown"
    : monitor.current_status === "up"
    ? "up"
    : monitor.current_status === "down"
    ? "down"
    : "unknown";

  // Calculate max latency for chart scaling
  const validLatencies = checks.map((c) => c.response_time_ms || 0);
  const maxLatency = Math.max(...validLatencies, 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top breadcrumb navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link
          href="/dashboard/monitors"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Monitors</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleActive}
            leftIcon={monitor.is_active ? <Pause size={14} /> : <Play size={14} />}
          >
            {monitor.is_active ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
            leftIcon={<Edit2 size={14} />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 size={14} />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Status Header Card */}
      <Card elevated style={{ padding: "1.75rem 2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <StatusIndicator
                status={statusType}
                label={!monitor.is_active ? "Monitoring Paused" : undefined}
                size="lg"
                pulse={monitor.is_active}
              />
              <Badge variant="neutral" size="sm">
                {monitor.monitor_type === "http" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Globe size={12} /> HTTP
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Radio size={12} /> TCP
                  </span>
                )}
              </Badge>
              {monitor.expected_status_code && (
                <Badge variant="neutral" size="sm">
                  Expected HTTP {monitor.expected_status_code}
                </Badge>
              )}
            </div>

            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              {monitor.name}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span>{monitor.url}</span>
              {monitor.monitor_type === "http" && (
                <a
                  href={monitor.url.startsWith("http://") || monitor.url.startsWith("https://") ? monitor.url : `https://${monitor.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open URL in new tab"
                  style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              textAlign: "right",
              color: "var(--text-muted)",
              fontSize: "0.8125rem",
            }}
          >
            <div>Check interval: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{monitor.interval_seconds}s</span></div>
            <div>Timeout: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{monitor.timeout_seconds}s</span></div>
            <div>
              Last checked:{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {monitor.last_checked_at
                  ? new Date(monitor.last_checked_at).toLocaleTimeString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Error alert */}
      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--status-down-subtle)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "var(--status-down-text)",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <Card style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
            24-Hour Uptime
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginTop: "0.5rem",
              color: stats && stats.uptime_24h >= 99 ? "var(--status-up)" : "var(--status-degraded)",
            }}
          >
            {stats ? `${stats.uptime_24h.toFixed(1)}%` : "—"}
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
            7-Day Uptime
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginTop: "0.5rem",
              color: stats && stats.uptime_7d >= 99 ? "var(--status-up)" : "var(--status-degraded)",
            }}
          >
            {stats ? `${stats.uptime_7d.toFixed(1)}%` : "—"}
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
            30-Day Uptime
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginTop: "0.5rem",
              color: stats && stats.uptime_30d >= 99 ? "var(--status-up)" : "var(--status-degraded)",
            }}
          >
            {stats ? `${stats.uptime_30d.toFixed(1)}%` : "—"}
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
            Avg Response Time (24h)
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "0.5rem", color: "var(--primary)" }}>
            {stats && stats.avg_response_time_ms ? `${stats.avg_response_time_ms} ms` : "—"}
          </div>
        </Card>
      </div>

      {/* Latency History Chart Card */}
      <Card elevated style={{ padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Response Time Latency</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
              Recent probe latency (last 50 checks)
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }} />
            <span>Response Time (ms)</span>
          </div>
        </div>

        {checks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No check results recorded yet. Probe will run shortly.
          </div>
        ) : (
          <div style={{ width: "100%", height: "180px", display: "flex", alignItems: "flex-end", gap: "4px", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
            {checks.slice().reverse().map((chk, i) => {
              const heightPct = chk.response_time_ms
                ? Math.max(10, Math.min(100, (chk.response_time_ms / maxLatency) * 100))
                : 10;
              const isDown = chk.status === "down";
              return (
                <div
                  key={chk.id || i}
                  title={`${chk.checked_at}: ${chk.response_time_ms ? `${chk.response_time_ms}ms` : "Down"}`}
                  style={{
                    flex: 1,
                    height: `${heightPct}%`,
                    backgroundColor: isDown ? "var(--status-down)" : "var(--primary)",
                    borderRadius: "2px",
                    transition: "height 200ms ease",
                    cursor: "pointer",
                    opacity: 0.85,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
                />
              );
            })}
          </div>
        )}
      </Card>

      {/* Check History Table */}
      <Card style={{ overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Recent Check History</h3>
        </div>

        {checks.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No health checks recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.85rem 1.5rem" }}>Status</th>
                  <th style={{ padding: "0.85rem 1.5rem" }}>Checked At</th>
                  <th style={{ padding: "0.85rem 1.5rem" }}>Response Time</th>
                  <th style={{ padding: "0.85rem 1.5rem" }}>HTTP Code</th>
                  <th style={{ padding: "0.85rem 1.5rem" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((chk) => (
                  <tr
                    key={chk.id}
                    style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background-color var(--transition-fast)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-elevated)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "0.85rem 1.5rem" }}>
                      <Badge variant={chk.status === "up" ? "up" : "down"} showDot size="sm">
                        {chk.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: "0.85rem 1.5rem", color: "var(--text-secondary)" }}>
                      {new Date(chk.checked_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "0.85rem 1.5rem", fontFamily: "var(--font-mono)" }}>
                      {chk.response_time_ms ? `${chk.response_time_ms} ms` : "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1.5rem", fontFamily: "var(--font-mono)" }}>
                      {chk.status_code || "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1.5rem", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                      {chk.error_message || "OK"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Monitor Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Monitor"
        description="Update monitor configuration and intervals"
      >
        <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Input
            label="Monitor Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label={monitor.monitor_type === "tcp" ? "Host / Host:Port" : "Target URL"}
            placeholder={monitor.monitor_type === "tcp" ? "db.example.com:5432" : "https://api.example.com/health"}
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            required
          />
          {monitor.monitor_type === "http" && (
            <Input
              label="Expected HTTP Status Code"
              type="number"
              value={editStatusCode}
              onChange={(e) => setEditStatusCode(Number(e.target.value))}
              required
            />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Select
              label="Interval"
              value={editInterval}
              onChange={(e) => setEditInterval(Number(e.target.value))}
              options={[
                { value: 60, label: "60 seconds" },
                { value: 120, label: "2 minutes" },
                { value: 300, label: "5 minutes" },
                { value: 600, label: "10 minutes" },
              ]}
            />
            <Select
              label="Timeout"
              value={editTimeout}
              onChange={(e) => setEditTimeout(Number(e.target.value))}
              options={[
                { value: 5, label: "5 seconds" },
                { value: 10, label: "10 seconds" },
                { value: 15, label: "15 seconds" },
              ]}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSavingEdit}>
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Monitor"
        description={`Are you sure you want to permanently delete "${monitor.name}"? This action cannot be undone.`}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
