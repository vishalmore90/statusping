"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Plus,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Globe,
  Radio,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { Monitor } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/monitors/StatusIndicator";

export default function DashboardPage() {
  const { user } = useAuth();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<Monitor[]>("/monitors")
      .then((res) => {
        if (isMounted) setMonitors(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const total = monitors.length;
  const operational = monitors.filter((m) => m.is_active && m.current_status === "up").length;
  const outages = monitors.filter((m) => m.is_active && m.current_status === "down").length;
  const overallStatus = outages > 0 ? "down" : operational > 0 ? "operational" : "unknown";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Welcome Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Overview
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Welcome back, {user?.name ?? "Engineer"}. Here is your live infrastructure health.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/dashboard/monitors/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              Create Monitor
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Status Banner Card */}
      <Card
        elevated
        style={{
          padding: "1.5rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          backgroundColor:
            outages > 0
              ? "rgba(239, 68, 68, 0.08)"
              : operational > 0
              ? "rgba(16, 185, 129, 0.08)"
              : "var(--bg-surface)",
          border: `1px solid ${
            outages > 0
              ? "rgba(239, 68, 68, 0.3)"
              : operational > 0
              ? "rgba(16, 185, 129, 0.3)"
              : "var(--border-subtle)"
          }`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <StatusIndicator
            status={overallStatus}
            size="lg"
            label={
              outages > 0
                ? `${outages} service${outages > 1 ? "s" : ""} experiencing outages`
                : operational > 0
                ? "All systems operational"
                : "No active monitors"
            }
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Badge variant={outages > 0 ? "down" : "up"} size="sm">
            {outages > 0 ? "Action Required" : "100% Up"}
          </Badge>
        </div>
      </Card>

      {/* Quick Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Total Monitors
            </span>
            <Activity size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {total}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Configured endpoints
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Operational
            </span>
            <ShieldCheck size={18} color="var(--status-up)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "0.5rem", color: "var(--status-up)" }}>
            {operational}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Passing health probes
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Active Outages
            </span>
            <AlertTriangle size={18} color="var(--status-down)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "0.5rem", color: "var(--status-down)" }}>
            {outages}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Failing health probes
          </div>
        </Card>
      </div>

      {/* Monitor list summary */}
      <Card style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Your Monitors</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
              Live availability across your endpoints
            </p>
          </div>
          <Link href="/dashboard/monitors">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <RefreshCw size={20} className="animate-spin" style={{ margin: "0 auto 0.5rem" }} />
            <span style={{ fontSize: "0.875rem" }}>Loading monitor status...</span>
          </div>
        ) : monitors.length === 0 ? (
          <div
            style={{
              padding: "3.5rem 1.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Activity size={24} color="var(--text-muted)" />
            <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>No monitors added yet</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "360px" }}>
              Create your first monitor to start collecting uptime metrics and receiving downtime alerts.
            </p>
            <Link href="/dashboard/monitors/new" style={{ marginTop: "0.5rem" }}>
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                Create Monitor
              </Button>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.85rem 1.5rem" }}>Status</th>
                  <th style={{ padding: "0.85rem 1.5rem" }}>Name</th>
                  <th style={{ padding: "0.85rem 1.5rem" }}>Type</th>
                  <th style={{ padding: "0.85rem 1.5rem" }}>Interval</th>
                  <th style={{ padding: "0.85rem 1.5rem", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {monitors.slice(0, 5).map((m) => (
                  <tr
                    key={m.id}
                    style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background-color var(--transition-fast)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-elevated)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "0.85rem 1.5rem" }}>
                      <StatusIndicator
                        status={
                          !m.is_active
                            ? "unknown"
                            : m.current_status === "up"
                            ? "up"
                            : m.current_status === "down"
                            ? "down"
                            : "unknown"
                        }
                        label={!m.is_active ? "Paused" : undefined}
                      />
                    </td>
                    <td style={{ padding: "0.85rem 1.5rem" }}>
                      <Link
                        href={`/dashboard/monitors/${m.id}`}
                        style={{ fontWeight: 600, color: "var(--text-primary)" }}
                      >
                        {m.name}
                      </Link>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <span>{m.url}</span>
                        <a href={m.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1.5rem" }}>
                      <Badge variant="neutral" size="sm">
                        {m.monitor_type === "http" ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Globe size={11} /> HTTP
                          </span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Radio size={11} /> TCP
                          </span>
                        )}
                      </Badge>
                    </td>
                    <td style={{ padding: "0.85rem 1.5rem", color: "var(--text-muted)" }}>
                      {m.interval_seconds}s
                    </td>
                    <td style={{ padding: "0.85rem 1.5rem", textAlign: "right" }}>
                      <Link href={`/dashboard/monitors/${m.id}`}>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
