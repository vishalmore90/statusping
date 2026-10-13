import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Globe,
  Radio,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UptimeBar } from "@/components/monitors/UptimeBar";
import { StatusIndicator } from "@/components/monitors/StatusIndicator";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  // Static demonstration data for 90-day uptime bar showcase
  const mockUptimeData = Array.from({ length: 90 }, (_, i) => {
    let uptime = 100.0;
    if (i === 42) uptime = 98.4;
    if (i === 78) uptime = 96.2;
    return {
      date: `Day -${89 - i}`,
      uptime_percentage: uptime,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          padding: "6rem 1.5rem 4rem",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow accents */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          className="container-narrow"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.75rem",
          }}
        >
          {/* Top Pill Announcement */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-default)",
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--status-up)",
                boxShadow: "0 0 8px var(--status-up)",
              }}
            />
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>StatusPing 1.0</span>
            <span style={{ color: "var(--border-default)" }}>|</span>
            <span>Self-hosted & Cloud Uptime Monitoring</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "800px",
            }}
          >
            Know when your APIs go down{" "}
            <span
              style={{
                background: "var(--primary-gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              before your users do.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              lineHeight: 1.6,
            }}
          >
            High-frequency synthetic health checks, automatic incident tracking, 90-day SLA transparency, and beautiful public status pages designed for indie hackers and small teams.
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "0.5rem",
            }}
          >
            <Link href="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                Start Monitoring Free
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">
                View Live Dashboard
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2.5rem",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "2rem",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={16} color="var(--status-up)" />
              <span>30-second check intervals</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={16} color="var(--status-up)" />
              <span>HTTP & TCP port validation</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={16} color="var(--status-up)" />
              <span>100% Free & Open Source</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Preview Card */}
      <section style={{ padding: "0 1.5rem 5rem" }}>
        <div className="container-narrow">
          <Card
            elevated
            style={{
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-lg), 0 20px 40px rgba(0,0,0,0.4)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Header bar */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <StatusIndicator status="operational" label="All Systems Operational" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Badge variant="up" showDot pulseDot>
                  99.98% Uptime (90d)
                </Badge>
                <Badge variant="neutral">Auto-refresh 30s</Badge>
              </div>
            </div>

            {/* Simulated Live Monitor Rows */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Row 1: API Gateway */}
              <div
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "var(--status-up)",
                        boxShadow: "0 0 10px var(--status-up-glow)",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        Production API Gateway
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        https://api.example.com/healthz • 42ms response
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Badge variant="up">Operational</Badge>
                    <Badge variant="neutral">HTTP 200</Badge>
                  </div>
                </div>

                {/* 90-Day Interactive Uptime Bar */}
                <UptimeBar data={mockUptimeData} height={28} overallUptime={99.98} />
              </div>

              {/* Row 2: Database Cluster */}
              <div
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "var(--status-up)",
                        boxShadow: "0 0 10px var(--status-up-glow)",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        PostgreSQL Primary Cluster
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        db.internal.example.com:5432 • TCP Socket Check
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Badge variant="up">Connected</Badge>
                    <Badge variant="neutral">TCP Ping</Badge>
                  </div>
                </div>

                <UptimeBar data={mockUptimeData} height={28} overallUptime={100.0} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section
        style={{
          padding: "5rem 1.5rem",
          backgroundColor: "rgba(17, 20, 32, 0.4)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container">
          <div
            style={{
              textAlign: "center",
              maxWidth: "600px",
              margin: "0 auto 3.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Engineered for developer clarity & uptime
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
              Everything you need to observe availability, diagnose failures, and build trust with your users.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.75rem",
            }}
          >
            {/* Feature 1 */}
            <Card style={{ padding: "1.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "var(--primary)",
                }}
              >
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Synthetic Health Probes
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Configurable HTTP(S) endpoint validation and TCP port pings running at 30 to 300 second cadences with strict timeout enforcement.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card style={{ padding: "1.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "var(--status-up)",
                }}
              >
                <Globe size={22} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Hosted Public Status Pages
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Instant public status pages for your users with customizable slugs, real-time status banners, 90-day history bars, and incident feeds.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card style={{ padding: "1.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "var(--status-down)",
                }}
              >
                <Radio size={22} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Automated Incident Lifecycle
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                When a monitor goes down, StatusPing automatically opens an incident and resolves it once recovery is confirmed.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card style={{ padding: "1.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "var(--status-degraded)",
                }}
              >
                <Bell size={22} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Instant Downtime Alerts
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Immediate asynchronous email alerts dispatched upon downtime detection and subsequent recovery confirmation.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card style={{ padding: "1.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "#60a5fa",
                }}
              >
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                90-Day Retention & Stats
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Historical aggregation across 24h, 7d, 30d, and 90d intervals, response latency trends, and automated cleanup jobs.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card style={{ padding: "1.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(168, 85, 247, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "#c084fc",
                }}
              >
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Zero Vendor Lock-in
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Fully self-hostable on Docker, Railway, or VPS. Your monitoring infrastructure, your PostgreSQL database, your rules.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div className="container-narrow">
          <div
            style={{
              padding: "3.5rem 2rem",
              borderRadius: "var(--radius-xl)",
              background: "linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-lg)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <h2 style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Ready to monitor your services?
            </h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "520px", fontSize: "1rem" }}>
              Set up your first synthetic monitor in less than 60 seconds. No credit card required.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/register">
                <Button size="lg" variant="primary">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
