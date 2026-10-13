"use client";

import React from "react";
import { Server, Clock } from "lucide-react";
import { PublicMonitor } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/monitors/StatusIndicator";
import { UptimeBar } from "@/components/monitors/UptimeBar";

interface PublicMonitorListProps {
  monitors: PublicMonitor[];
}

export function PublicMonitorList({ monitors }: PublicMonitorListProps) {
  if (!monitors || monitors.length === 0) {
    return (
      <Card style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--bg-surface-elevated)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
            color: "var(--text-muted)",
          }}
        >
          <Server size={24} />
        </div>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          No Services Configured
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: "400px", margin: "0 auto" }}>
          There are currently no public monitors assigned to this status page.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Services & Infrastructure
          </h2>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            {monitors.length}
          </span>
        </div>

        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          90-Day Health History
        </div>
      </div>

      {/* Services List Card */}
      <Card
        style={{
          padding: "0",
          overflow: "hidden",
          border: "1px solid var(--border-default)",
        }}
      >
        {monitors.map((monitor, idx) => {
          const isLast = idx === monitors.length - 1;
          const statusType =
            monitor.current_status === "up"
              ? "operational"
              : monitor.current_status === "down"
              ? "down"
              : "unknown";

          return (
            <div
              key={monitor.id}
              style={{
                padding: "1.5rem",
                borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "1.125rem",
                transition: "background-color var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {/* Top row: Name, tags & status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {monitor.name}
                  </span>

                  {monitor.avg_response_time_ms !== null && monitor.avg_response_time_ms !== undefined && (
                    <Badge variant="neutral" size="sm" style={{ gap: "0.25rem", fontFamily: "var(--font-mono)" }}>
                      <Clock size={11} />
                      {Math.round(monitor.avg_response_time_ms)}ms avg
                    </Badge>
                  )}
                </div>

                {/* Status indicator pill */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <StatusIndicator
                    status={statusType}
                    size="sm"
                    label={
                      monitor.current_status === "up"
                        ? "Operational"
                        : monitor.current_status === "down"
                        ? "Major Outage"
                        : "Unknown"
                    }
                  />
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      minWidth: "60px",
                      textAlign: "right",
                    }}
                  >
                    {monitor.uptime_percentage_90d.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 90-day interactive Uptime Bar */}
              <UptimeBar
                data={monitor.status_history_90d}
                totalDays={90}
                height={26}
                showLabels={true}
                overallUptime={monitor.uptime_percentage_90d}
              />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
