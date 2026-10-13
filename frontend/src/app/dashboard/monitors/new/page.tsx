"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Radio,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { MonitorCreatePayload, Monitor } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

export default function NewMonitorPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [monitorType, setMonitorType] = useState<"http" | "tcp">("http");
  const [url, setUrl] = useState("https://");
  const [intervalSeconds, setIntervalSeconds] = useState<number>(60);
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(10);
  const [expectedStatusCode, setExpectedStatusCode] = useState<number>(200);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      setErrorMessage("Endpoint URL must start with http:// or https://");
      return;
    }

    setIsLoading(true);

    try {
      const payload: MonitorCreatePayload = {
        name: name.trim(),
        url: cleanUrl,
        monitor_type: monitorType,
        interval_seconds: Number(intervalSeconds),
        timeout_seconds: Number(timeoutSeconds),
        expected_status_code: monitorType === "http" ? Number(expectedStatusCode) : null,
      };

      await apiClient.post<Monitor>("/monitors", payload);
      router.push("/dashboard/monitors");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const detail = error.response?.data?.detail;
      setErrorMessage(detail || "Failed to create monitor. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/monitors"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            transition: "color var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={16} />
          <span>Back to Monitors</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Create New Monitor
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Configure a synthetic health check to track availability and response times.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--status-down-subtle)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "var(--status-down-text)",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <Card elevated style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Probe Type selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Monitor Type
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div
                onClick={() => setMonitorType("http")}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${monitorType === "http" ? "var(--primary)" : "var(--border-subtle)"}`,
                  backgroundColor: monitorType === "http" ? "var(--primary-subtle)" : "var(--bg-surface-elevated)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div
                  style={{
                    color: monitorType === "http" ? "var(--primary)" : "var(--text-muted)",
                  }}
                >
                  <Globe size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>HTTP / HTTPS</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Websites, REST & GraphQL APIs
                  </div>
                </div>
              </div>

              <div
                onClick={() => setMonitorType("tcp")}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${monitorType === "tcp" ? "var(--primary)" : "var(--border-subtle)"}`,
                  backgroundColor: monitorType === "tcp" ? "var(--primary-subtle)" : "var(--bg-surface-elevated)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div
                  style={{
                    color: monitorType === "tcp" ? "var(--primary)" : "var(--text-muted)",
                  }}
                >
                  <Radio size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>TCP Port Ping</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Databases, Redis, Mail servers
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <Input
            id="name"
            label="Friendly Name"
            placeholder="e.g. Production API Gateway"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            helperText="A descriptive identifier shown on your dashboard and status pages."
          />

          {/* URL / Endpoint */}
          <Input
            id="url"
            label={monitorType === "http" ? "Target URL" : "Target Address"}
            type="url"
            placeholder={monitorType === "http" ? "https://api.example.com/healthz" : "http://db.internal.example.com:5432"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            leftIcon={<Globe size={16} />}
            helperText="Must start with http:// or https://"
          />

          {/* Expected Status Code (HTTP only) */}
          {monitorType === "http" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <Input
                id="expectedStatusCode"
                label="Expected HTTP Status Code"
                type="number"
                min={100}
                max={599}
                value={expectedStatusCode}
                onChange={(e) => setExpectedStatusCode(Number(e.target.value))}
                leftIcon={<ShieldCheck size={16} />}
                helperText="Any response with a different status code will mark the monitor as DOWN."
              />
            </div>
          )}

          {/* Frequency & Timeout Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Select
              id="interval"
              label="Check Frequency"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(Number(e.target.value))}
              options={[
                { value: 60, label: "Every 60 seconds (1 min)" },
                { value: 120, label: "Every 2 minutes" },
                { value: 300, label: "Every 5 minutes" },
                { value: 600, label: "Every 10 minutes" },
                { value: 1800, label: "Every 30 minutes" },
                { value: 3600, label: "Every 60 minutes" },
              ]}
              helperText="How often health checks execute."
            />

            <Select
              id="timeout"
              label="Request Timeout"
              value={timeoutSeconds}
              onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
              options={[
                { value: 5, label: "5 seconds" },
                { value: 10, label: "10 seconds (Recommended)" },
                { value: 15, label: "15 seconds" },
                { value: 30, label: "30 seconds" },
              ]}
              helperText="Mark as DOWN if check exceeds this."
            />
          </div>

          {/* Tip Box */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
            }}
          >
            <Clock size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Instant scheduling: </span>
              Health checks begin immediately upon creation. If your endpoint returns an outage, an incident is opened automatically and alerts are dispatched.
            </div>
          </div>

          {/* Submit buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Link href="/dashboard/monitors">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {isLoading ? "Creating Monitor..." : "Save & Start Monitoring"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
