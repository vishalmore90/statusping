import React from "react";

export type BadgeVariant =
  | "up"
  | "down"
  | "degraded"
  | "unknown"
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved"
  | "critical"
  | "major"
  | "minor"
  | "none"
  | "primary"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showDot?: boolean;
  pulseDot?: boolean;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "neutral",
  showDot = false,
  pulseDot = false,
  size = "md",
  className = "",
  style,
  ...props
}: BadgeProps) {
  // Config per variant
  const variantConfig: Record<
    BadgeVariant,
    { bg: string; color: string; border: string; dotColor: string }
  > = {
    up: {
      bg: "var(--status-up-subtle)",
      color: "var(--status-up-text)",
      border: "rgba(16, 185, 129, 0.25)",
      dotColor: "var(--status-up)",
    },
    resolved: {
      bg: "var(--status-up-subtle)",
      color: "var(--status-up-text)",
      border: "rgba(16, 185, 129, 0.25)",
      dotColor: "var(--status-up)",
    },
    down: {
      bg: "var(--status-down-subtle)",
      color: "var(--status-down-text)",
      border: "rgba(239, 68, 68, 0.25)",
      dotColor: "var(--status-down)",
    },
    critical: {
      bg: "var(--status-down-subtle)",
      color: "var(--status-down-text)",
      border: "rgba(239, 68, 68, 0.25)",
      dotColor: "var(--status-down)",
    },
    degraded: {
      bg: "var(--status-degraded-subtle)",
      color: "var(--status-degraded-text)",
      border: "rgba(245, 158, 11, 0.25)",
      dotColor: "var(--status-degraded)",
    },
    major: {
      bg: "var(--status-degraded-subtle)",
      color: "var(--status-degraded-text)",
      border: "rgba(245, 158, 11, 0.25)",
      dotColor: "var(--status-degraded)",
    },
    minor: {
      bg: "rgba(59, 130, 246, 0.12)",
      color: "#60a5fa",
      border: "rgba(59, 130, 246, 0.25)",
      dotColor: "#3b82f6",
    },
    investigating: {
      bg: "rgba(239, 68, 68, 0.12)",
      color: "#f87171",
      border: "rgba(239, 68, 68, 0.25)",
      dotColor: "var(--status-down)",
    },
    identified: {
      bg: "var(--status-degraded-subtle)",
      color: "var(--status-degraded-text)",
      border: "rgba(245, 158, 11, 0.25)",
      dotColor: "var(--status-degraded)",
    },
    monitoring: {
      bg: "rgba(59, 130, 246, 0.12)",
      color: "#60a5fa",
      border: "rgba(59, 130, 246, 0.25)",
      dotColor: "#3b82f6",
    },
    unknown: {
      bg: "var(--status-unknown-subtle)",
      color: "var(--status-unknown-text)",
      border: "rgba(100, 116, 139, 0.25)",
      dotColor: "var(--status-unknown)",
    },
    none: {
      bg: "var(--status-unknown-subtle)",
      color: "var(--status-unknown-text)",
      border: "rgba(100, 116, 139, 0.25)",
      dotColor: "var(--status-unknown)",
    },
    primary: {
      bg: "var(--primary-subtle)",
      color: "#a5b4fc",
      border: "rgba(99, 102, 241, 0.3)",
      dotColor: "var(--primary)",
    },
    neutral: {
      bg: "var(--bg-surface-elevated)",
      color: "var(--text-secondary)",
      border: "var(--border-default)",
      dotColor: "var(--text-muted)",
    },
  };

  const config = variantConfig[variant] || variantConfig.neutral;

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: size === "sm" ? "0.15rem 0.5rem" : "0.25rem 0.65rem",
    fontSize: size === "sm" ? "0.75rem" : "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.2,
    borderRadius: "var(--radius-full)",
    backgroundColor: config.bg,
    color: config.color,
    border: `1px solid ${config.border}`,
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
    ...style,
  };

  return (
    <span style={badgeStyle} className={`statusping-badge ${className}`} {...props}>
      {showDot && (
        <span
          style={{
            position: "relative",
            display: "inline-flex",
            width: "6px",
            height: "6px",
          }}
        >
          {pulseDot && (
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: config.dotColor,
                opacity: 0.75,
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
          )}
          <span
            style={{
              position: "relative",
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: config.dotColor,
            }}
          />
        </span>
      )}
      {children}
    </span>
  );
}
