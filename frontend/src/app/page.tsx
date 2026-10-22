import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Globe,
  Radio,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UptimeBar } from "@/components/monitors/UptimeBar";
import { StatusIndicator } from "@/components/monitors/StatusIndicator";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const sampleUptimeData = Array.from({ length: 90 }, (_, i) => {
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
      {/* 1. Hero Section */}
      <section
        className="section-hero"
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="container-narrow"
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "2rem",
          }}
        >
          {/* Architectural Badge (No Pill Shape) */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
              padding: "0.45rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-default)",
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
              maxWidth: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "2px",
                  backgroundColor: "var(--status-up)",
                }}
              />
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>StatusPing 1.0</span>
            </div>
            <span style={{ color: "var(--border-default)" }}>|</span>
            <span>Self-Hosted & Cloud Uptime Monitoring</span>
          </div>

          {/* Headline - Responsive Clamp, Word Break Safe */}
          <h1
            style={{
              fontSize: "clamp(2rem, 7vw, 4.25rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.035em",
              maxWidth: "840px",
              width: "100%",
              color: "var(--text-primary)",
              wordBreak: "break-word",
            }}
          >
            Know when your APIs go down{" "}
            <span style={{ color: "var(--primary)" }}>
              before your users do.
            </span>
          </h1>

          {/* Subtitle - Punchy, High-Contrast */}
          <p
            style={{
              fontSize: "clamp(1.0625rem, 3vw, 1.25rem)",
              color: "var(--text-secondary)",
              maxWidth: "620px",
              width: "100%",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            High-frequency synthetic health checks and public status pages for modern engineering teams.
          </p>

          {/* Single Primary Action Button */}
          <div style={{ paddingTop: "0.25rem" }}>
            <Link href="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                Start Monitoring Free
              </Button>
            </Link>
          </div>

          {/* Verified Technical Standards */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.25rem 2rem",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "1.5rem",
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={16} color="var(--status-up)" />
              <span>60-second check intervals</span>
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

      {/* 2. Live Monitor Preview Card Section */}
      <section className="section-card">
        <div className="container-narrow">
          <Card
            elevated
            style={{
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-lg)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* Header bar */}
            <div
              className="preview-card-header"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <StatusIndicator status="operational" label="All Systems Operational" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Badge variant="up">99.98% 90d Uptime</Badge>
                <Badge variant="neutral">60s Cadence</Badge>
              </div>
            </div>

            {/* Monitor Rows */}
            <div className="preview-card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Row 1 */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, maxWidth: "100%" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "2px",
                        backgroundColor: "var(--status-up)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                        Production API Gateway
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", wordBreak: "break-all" }}>
                        https://api.example.com/healthz • 42ms response
                      </div>
                    </div>
                  </div>
                  <Badge variant="up">Operational</Badge>
                </div>
                <UptimeBar data={sampleUptimeData} height={24} overallUptime={99.98} />
              </div>

              {/* Row 2 */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, maxWidth: "100%" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "2px",
                        backgroundColor: "var(--status-up)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                        PostgreSQL Primary Cluster
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", wordBreak: "break-all" }}>
                        db.internal.example.com:5432 • TCP Socket Check
                      </div>
                    </div>
                  </div>
                  <Badge variant="up">Connected</Badge>
                </div>
                <UptimeBar data={sampleUptimeData} height={24} overallUptime={100.0} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Core Architecture Features Grid */}
      <section
        id="features"
        className="section-features"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container">
          <div
            style={{
              textAlign: "center",
              maxWidth: "640px",
              margin: "0 auto 3rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Engineered for clarity and uptime
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", lineHeight: 1.6 }}>
              Synthetic probes, instant alerts, and SLA transparency without complexity.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* Feature 1 */}
            <Card className="feature-card" style={{ borderRadius: "var(--radius-md)" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
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
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Synthetic Health Probes
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                HTTP and TCP health checks from 60 seconds with strict timeout verification.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="feature-card" style={{ borderRadius: "var(--radius-md)" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "var(--primary)",
                }}
              >
                <Globe size={22} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Hosted Status Pages
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Customizable status pages with live status banners and 90-day SLA history.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="feature-card" style={{ borderRadius: "var(--radius-md)" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "var(--primary)",
                }}
              >
                <Radio size={22} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Automated Incident Lifecycle
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Automatic incident creation on downtime with instant recovery confirmation.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="feature-card" style={{ borderRadius: "var(--radius-md)" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "var(--primary)",
                }}
              >
                <Bell size={22} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Instant Alerting
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Asynchronous alerts dispatched immediately upon downtime and recovery.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Real Creator Note (Real Photo & Name) */}
      <section
        id="about"
        className="section-about"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container-narrow">
          <Card
            className="about-card"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {/* Real Photo of Vishal More */}
              <Image
                src="https://github.com/vishalmore90.png"
                alt="Vishal More"
                width={56}
                height={56}
                unoptimized
                style={{
                  borderRadius: "var(--radius-md)",
                  objectFit: "cover",
                  border: "1px solid var(--border-default)",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--text-primary)" }}>
                  Vishal More
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--primary)" }}>
                  Creator & Lead Engineer, StatusPing
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                fontStyle: "normal",
              }}
            >
              &ldquo;I built StatusPing to give engineering teams an open-source, self-hostable monitoring platform with zero bloated dependencies and complete database ownership.&rdquo;
            </p>
          </Card>
        </div>
      </section>

      {/* 5. Final CTA Section (Single Button, Identical Style) */}
      <section className="section-cta">
        <div className="container-narrow">
          <div
            className="cta-card"
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-lg)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Ready to monitor your services?
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                maxWidth: "500px",
                fontSize: "1.0625rem",
                lineHeight: 1.6,
              }}
            >
              Deploy your first monitor in 60 seconds.
            </p>
            {/* Single Action Button Matching Hero Style */}
            <Link href="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
