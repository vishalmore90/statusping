"use client";

import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export function PublicStatusFooter() {
  return (
    <footer
      style={{
        width: "100%",
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
        padding: "3rem 0 2.5rem",
        marginTop: "4rem",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          textAlign: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "-0.01em",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span>Powered by StatusPing</span>
        </Link>

        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            maxWidth: "460px",
            lineHeight: 1.5,
          }}
        >
          Next-generation open-source synthetic uptime monitoring, multi-region health checks, and transparent public status communication.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            fontSize: "0.75rem",
            color: "var(--text-dim)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span>SSL 256-bit encrypted telemetry</span>
          <span>•</span>
          <span>Automated 30-second edge cache</span>
          <span>•</span>
          <Link
            href="/dashboard"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            Manage Monitors
          </Link>
        </div>
      </div>
    </footer>
  );
}
