"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Clock } from "lucide-react";
import { OverallStatus } from "@/types";

interface OverallStatusHeroProps {
  status: OverallStatus;
  title: string;
  description: string | null;
  lastUpdated?: string;
  overallUptimeAvg?: number;
}

export function OverallStatusHero({
  status,
  title,
  description,
  lastUpdated,
  overallUptimeAvg,
}: OverallStatusHeroProps) {
  const config = {
    operational: {
      title: "All Systems Operational",
      subtitle: "All services and background workers are operating normally with zero active disruptions.",
      icon: CheckCircle2,
      bgColor: "rgba(16, 185, 129, 0.08)",
      borderColor: "rgba(16, 185, 129, 0.28)",
      glowColor: "rgba(16, 185, 129, 0.2)",
      textColor: "var(--status-up-text)",
      iconColor: "var(--status-up)",
    },
    degraded_performance: {
      title: "Degraded System Performance",
      subtitle: "One or more services are experiencing elevated latency or intermittent degradation.",
      icon: AlertTriangle,
      bgColor: "rgba(245, 158, 11, 0.08)",
      borderColor: "rgba(245, 158, 11, 0.3)",
      glowColor: "rgba(245, 158, 11, 0.2)",
      textColor: "var(--status-degraded-text)",
      iconColor: "var(--status-degraded)",
    },
    partial_outage: {
      title: "Partial System Outage",
      subtitle: "Some services are currently experiencing disruptions. Our team is actively investigating.",
      icon: AlertTriangle,
      bgColor: "rgba(249, 115, 22, 0.09)",
      borderColor: "rgba(249, 115, 22, 0.35)",
      glowColor: "rgba(249, 115, 22, 0.22)",
      textColor: "#fb923c",
      iconColor: "#f97316",
    },
    major_outage: {
      title: "Major System Outage",
      subtitle: "Multiple critical services are currently unavailable. Emergency remediation is underway.",
      icon: XCircle,
      bgColor: "rgba(239, 68, 68, 0.1)",
      borderColor: "rgba(239, 68, 68, 0.38)",
      glowColor: "rgba(239, 68, 68, 0.25)",
      textColor: "var(--status-down-text)",
      iconColor: "var(--status-down)",
    },
  }[status] || {
    title: "System Status Unknown",
    subtitle: "Unable to verify current system telemetry.",
    icon: ShieldAlert,
    bgColor: "rgba(100, 116, 139, 0.08)",
    borderColor: "rgba(100, 116, 139, 0.2)",
    glowColor: "transparent",
    textColor: "var(--text-secondary)",
    iconColor: "var(--text-muted)",
  };

  const Icon = config.icon;

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "var(--radius-xl)",
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${config.borderColor}`,
        boxShadow: `0 8px 32px -4px ${config.glowColor}, var(--shadow-md)`,
        padding: "2.25rem 2rem",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      {/* Background radial accent glow */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "200%",
          background: `radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%)`,
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      {/* Main Status Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", maxWidth: "720px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: config.bgColor,
              border: `1px solid ${config.borderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 0 16px ${config.glowColor}`,
            }}
          >
            <Icon size={28} color={config.iconColor} strokeWidth={2.2} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {title}
            </div>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                lineHeight: 1.15,
              }}
            >
              {config.title}
            </h1>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              {description || config.subtitle}
            </p>
          </div>
        </div>

        {/* Aggregate Stats Pill */}
        {overallUptimeAvg !== undefined && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.25rem",
            }}
          >
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: config.textColor,
                letterSpacing: "-0.02em",
                fontFamily: "var(--font-mono)",
              }}
            >
              {overallUptimeAvg.toFixed(2)}%
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
              90-day avg availability
            </div>
          </div>
        )}
      </div>

      {/* Sub-bar with Live Pulse and Timestamp */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border-subtle)",
          position: "relative",
          zIndex: 1,
          fontSize: "0.8125rem",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              width: "8px",
              height: "8px",
            }}
          >
            <span
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: config.iconColor,
                opacity: 0.75,
                animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
            <span
              style={{
                position: "relative",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: config.iconColor,
              }}
            />
          </span>
          <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
            Monitored continuously every 60 seconds
          </span>
        </div>

        {formattedTime && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Clock size={14} />
            <span>Last updated at {formattedTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}
