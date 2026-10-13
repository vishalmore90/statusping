import React from "react";
import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
        padding: "2.5rem 0 2rem",
        marginTop: "auto",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          {/* Logo & description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--primary-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={14} color="#ffffff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                StatusPing
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", maxWidth: "340px" }}>
              High-frequency synthetic monitoring and public incident status pages designed for engineering reliability.
            </p>
          </div>

          {/* Links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            <Link href="/dashboard" style={{ transition: "color var(--transition-fast)" }}>
              Dashboard
            </Link>
            <Link href="/dashboard/monitors" style={{ transition: "color var(--transition-fast)" }}>
              Monitors
            </Link>
            <Link href="/dashboard/incidents" style={{ transition: "color var(--transition-fast)" }}>
              Incidents
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ transition: "color var(--transition-fast)" }}
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <div>&copy; 2026 StatusPing. Released under MIT License.</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={14} color="var(--status-up)" />
            <span>All systems nominal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
