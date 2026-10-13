"use client";

import React, { useState } from "react";
import { DailyUptime } from "@/types";

interface UptimeBarProps {
  data?: DailyUptime[];
  totalDays?: number;
  height?: number;
  className?: string;
  showLabels?: boolean;
  overallUptime?: number;
}

export function UptimeBar({
  data = [],
  totalDays = 90,
  height = 32,
  className = "",
  showLabels = true,
  overallUptime,
}: UptimeBarProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    uptime: number | null;
    x: number;
  } | null>(null);

  const getBarColor = (uptime: number | null) => {
    if (uptime === null) return "rgba(255, 255, 255, 0.08)";
    if (uptime >= 99.5) return "var(--status-up)";
    if (uptime >= 95.0) return "#34d399";
    if (uptime >= 85.0) return "var(--status-degraded)";
    return "var(--status-down)";
  };

  const calculateAverageUptime = () => {
    if (overallUptime !== undefined) return overallUptime.toFixed(2);
    const valid = data.filter((d) => d.uptime_percentage !== null && d.uptime_percentage !== undefined);
    if (!valid.length) return "100.0";
    const sum = valid.reduce((acc, curr) => acc + curr.uptime_percentage, 0);
    return (sum / valid.length).toFixed(2);
  };

  // Generate totalDays slots (using data passed in or fallback empty slots)
  const slots = Array.from({ length: totalDays }, (_, i) => {
    const item = data[i];
    return {
      index: i,
      date: item ? item.date : `Day ${i + 1}`,
      uptime: item ? item.uptime_percentage : 100,
    };
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        width: "100%",
        position: "relative",
      }}
      className={`statusping-uptime-bar ${className}`}
    >
      {/* Tooltip Overlay */}
      {hoveredDay && (
        <div
          style={{
            position: "absolute",
            bottom: `${height + 28}px`,
            left: `${hoveredDay.x}px`,
            transform: "translateX(-50%)",
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "0.35rem 0.65rem",
            boxShadow: "var(--shadow-lg)",
            pointerEvents: "none",
            zIndex: 30,
            whiteSpace: "nowrap",
            fontSize: "0.75rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {hoveredDay.uptime !== null ? `${hoveredDay.uptime.toFixed(2)}%` : "No data"}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
            {hoveredDay.date}
          </div>
        </div>
      )}

      {/* 90-day segments container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2.5px",
          width: "100%",
          height: `${height}px`,
        }}
      >
        {slots.map((slot) => {
          const color = getBarColor(slot.uptime);
          return (
            <div
              key={slot.index}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: "3px",
                backgroundColor: color,
                transition: "transform 120ms ease, opacity 120ms ease",
                cursor: "pointer",
                opacity: hoveredDay && hoveredDay.date === slot.date ? 1 : 0.88,
                transform: hoveredDay && hoveredDay.date === slot.date ? "scaleY(1.18)" : "scaleY(1)",
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const parentRect = e.currentTarget.parentElement?.getBoundingClientRect() || rect;
                const relX = rect.left - parentRect.left + rect.width / 2;
                setHoveredDay({
                  date: slot.date,
                  uptime: slot.uptime,
                  x: relX,
                });
              }}
              onMouseLeave={() => setHoveredDay(null)}
            />
          );
        })}
      </div>

      {/* Axis Footer */}
      {showLabels && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <span>{totalDays} days ago</span>
          <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
            {calculateAverageUptime()}% uptime
          </span>
          <span>Today</span>
        </div>
      )}
    </div>
  );
}
