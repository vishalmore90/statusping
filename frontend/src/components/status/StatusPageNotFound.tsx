"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StatusPageNotFoundProps {
  slug: string;
}

export function StatusPageNotFound({ slug }: StatusPageNotFoundProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-base)",
      }}
    >
      {/* Minimal Brand Header */}
      <header
        style={{
          width: "100%",
          borderBottom: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-glass)",
          padding: "1rem 0",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              textDecoration: "none",
              color: "var(--text-primary)",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                background: "var(--primary-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={18} color="#ffffff" />
            </div>
            <span>StatusPing</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            padding: "3rem 2.5rem",
            borderRadius: "var(--radius-xl)",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--status-down)",
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Status Page Not Found
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              The status page for <code style={{ color: "var(--primary)", fontFamily: "var(--font-mono)" }}>{slug}</code> could not be found, has been removed, or is currently set to private.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
              marginTop: "0.5rem",
            }}
          >
            <Link href="/status/demo" style={{ textDecoration: "none" }}>
              <Button variant="primary">
                View Demo Status Page
              </Button>
            </Link>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button variant="outline" style={{ gap: "0.375rem" }}>
                <ArrowLeft size={15} />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
