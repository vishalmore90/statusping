import React from "react";
import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
        padding: "3.5rem 0 2.5rem",
        marginTop: "auto",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "2rem",
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
                  backgroundColor: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={14} color="#0a0d12" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                StatusPing
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "340px" }}>
              Open-source synthetic monitoring and incident communication for engineering reliability.
            </p>
          </div>

          {/* Links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "2rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              Terms of Service
            </Link>
            <Link href="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              Dashboard
            </Link>
            <a
              href="https://github.com/vishalmore90/statusping"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "1.75rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
          }}
        >
          <div>&copy; 2026 StatusPing. Released under MIT License.</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={15} color="var(--status-up)" />
            <span>Infrastructure Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
