"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  ExternalLink,
  PlusCircle,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard size={18} />,
      exact: true,
    },
    {
      title: "Monitors",
      href: "/dashboard/monitors",
      icon: <Activity size={18} />,
      exact: false,
    },
    {
      title: "Incidents",
      href: "/dashboard/incidents",
      icon: <AlertTriangle size={18} />,
      exact: false,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        width: "240px",
        flexShrink: 0,
        borderRight: "1px solid var(--border-subtle)",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1.25rem 0.75rem",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Main Nav */}
        <div>
          <div
            style={{
              padding: "0 0.75rem 0.5rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
            }}
          >
            Monitoring
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderRadius: "var(--radius-md)",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    backgroundColor: active ? "var(--bg-surface-elevated)" : "transparent",
                    borderLeft: active ? "3px solid var(--primary)" : "3px solid transparent",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <span style={{ color: active ? "var(--primary)" : "var(--text-muted)" }}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Action */}
        <div style={{ padding: "0 0.5rem" }}>
          <Link
            href="/dashboard/monitors/new"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              fontSize: "0.8125rem",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--border-default)",
              color: "var(--text-secondary)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <PlusCircle size={15} />
            <span>Add Monitor</span>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: "0.75rem",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <span>StatusPing Engine</span>
          <span style={{ color: "var(--status-up)", fontWeight: 600 }}>v1.0.0</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Open Source Core</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </aside>
  );
}
