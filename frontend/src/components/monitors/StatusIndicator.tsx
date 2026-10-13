import React from "react";

export type StatusType = "up" | "down" | "degraded" | "unknown" | "operational";

interface StatusIndicatorProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  label?: string;
  pulse?: boolean;
}

export function StatusIndicator({
  status,
  size = "md",
  label,
  pulse = true,
}: StatusIndicatorProps) {
  const colorMap: Record<StatusType, { color: string; glow: string; text: string; defaultLabel: string }> = {
    up: {
      color: "var(--status-up)",
      glow: "var(--status-up-glow)",
      text: "var(--status-up-text)",
      defaultLabel: "Operational",
    },
    operational: {
      color: "var(--status-up)",
      glow: "var(--status-up-glow)",
      text: "var(--status-up-text)",
      defaultLabel: "Operational",
    },
    degraded: {
      color: "var(--status-degraded)",
      glow: "var(--status-degraded-glow)",
      text: "var(--status-degraded-text)",
      defaultLabel: "Degraded",
    },
    down: {
      color: "var(--status-down)",
      glow: "var(--status-down-glow)",
      text: "var(--status-down-text)",
      defaultLabel: "Major Outage",
    },
    unknown: {
      color: "var(--status-unknown)",
      glow: "transparent",
      text: "var(--status-unknown-text)",
      defaultLabel: "Unknown",
    },
  };

  const current = colorMap[status] || colorMap.unknown;

  const dotSizes = {
    sm: 8,
    md: 10,
    lg: 14,
  };

  const dotSize = dotSizes[size];

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <div
        style={{
          position: "relative",
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {pulse && status !== "unknown" && (
          <span
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: current.color,
              opacity: 0.6,
              animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
        )}
        <span
          style={{
            position: "relative",
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: "50%",
            backgroundColor: current.color,
            boxShadow: `0 0 10px ${current.glow}`,
          }}
        />
      </div>
      {label !== undefined ? (
        label ? (
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: current.text }}>
            {label}
          </span>
        ) : null
      ) : (
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: current.text }}>
          {current.defaultLabel}
        </span>
      )}
    </div>
  );
}
