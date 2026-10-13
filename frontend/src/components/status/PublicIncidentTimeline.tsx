"use client";

import React from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { PublicIncident } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface PublicIncidentTimelineProps {
  incidents: PublicIncident[];
}

export function PublicIncidentTimeline({ incidents }: PublicIncidentTimelineProps) {
  const activeIncidents = incidents.filter((inc) => inc.status !== "resolved");
  const pastIncidents = incidents.filter((inc) => inc.status === "resolved");

  const getImpactBadgeVariant = (impact: string): "critical" | "major" | "minor" | "neutral" => {
    switch (impact) {
      case "critical":
        return "critical";
      case "major":
        return "major";
      case "minor":
        return "minor";
      default:
        return "neutral";
    }
  };

  const getStatusBadgeVariant = (status: string): "resolved" | "monitoring" | "identified" | "investigating" | "neutral" => {
    switch (status) {
      case "resolved":
        return "resolved";
      case "monitoring":
        return "monitoring";
      case "identified":
        return "identified";
      case "investigating":
        return "investigating";
      default:
        return "neutral";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
      {/* ── 1. ACTIVE INCIDENTS ── */}
      {activeIncidents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "var(--status-down)",
                boxShadow: "0 0 10px var(--status-down)",
              }}
            />
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--status-down-text)",
              }}
            >
              Active Incidents ({activeIncidents.length})
            </h2>
          </div>

          {activeIncidents.map((incident) => (
            <Card
              key={incident.id}
              style={{
                padding: "1.75rem",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                backgroundColor: "rgba(239, 68, 68, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Incident Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {incident.title}
                  </h3>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Clock size={13} />
                    <span>Started {formatDate(incident.started_at)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Badge variant={getImpactBadgeVariant(incident.impact)} size="sm">
                    {incident.impact.toUpperCase()} IMPACT
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(incident.status)} size="sm">
                    {incident.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Updates Timeline */}
              {incident.updates && incident.updates.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    paddingLeft: "0.5rem",
                    borderLeft: "2px solid rgba(239, 68, 68, 0.25)",
                    marginLeft: "0.5rem",
                  }}
                >
                  {incident.updates.map((update, uIdx) => (
                    <div
                      key={uIdx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        paddingLeft: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            textTransform: "capitalize",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {update.status}
                        </span>
                        <span>•</span>
                        <span>{formatDate(update.created_at)}</span>
                      </div>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-primary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {update.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── 2. PAST INCIDENTS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 0.25rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Past Incidents
          </h2>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Last 90 Days
          </span>
        </div>

        {pastIncidents.length === 0 ? (
          <Card
            style={{
              padding: "2.5rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              backgroundColor: "rgba(16, 185, 129, 0.03)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--status-up)",
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h3
              style={{
                fontSize: "1.0625rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              No incidents reported in the past 90 days
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                maxWidth: "420px",
              }}
            >
              All systems maintained uninterrupted operational availability with zero downtime events.
            </p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pastIncidents.map((incident) => (
              <Card
                key={incident.id}
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {incident.title}
                      </h3>
                      <Badge variant="resolved" size="sm">
                        RESOLVED
                      </Badge>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <Clock size={12} />
                      <span>{formatDate(incident.started_at)}</span>
                      {incident.resolved_at && (
                        <>
                          <span>•</span>
                          <span>Resolved in {formatDate(incident.resolved_at)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Badge variant={getImpactBadgeVariant(incident.impact)} size="sm">
                    {incident.impact.toUpperCase()} IMPACT
                  </Badge>
                </div>

                {/* Latest update note */}
                {incident.updates && incident.updates.length > 0 && (
                  <div
                    style={{
                      padding: "0.875rem 1rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--text-primary)", marginRight: "0.35rem" }}>
                      Resolution:
                    </span>
                    {incident.updates[0].message}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
