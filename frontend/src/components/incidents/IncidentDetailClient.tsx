"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Clock,
  Send,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Incident, IncidentStatus, IncidentUpdate, IncidentUpdateCreatePayload } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";

interface IncidentDetailClientProps {
  incidentId: string;
}

export function IncidentDetailClient({ incidentId }: IncidentDetailClientProps) {
  const router = useRouter();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post update form
  const [updateStatus, setUpdateStatus] = useState<IncidentStatus>("investigating");
  const [updateMessage, setUpdateMessage] = useState("");
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  // Resolve & delete states
  const [isResolving, setIsResolving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    apiClient
      .get<Incident>(`/incidents/${incidentId}`)
      .then((res) => {
        setIncident(res.data);
        setUpdateStatus(res.data.status);
        setErrorMessage(null);
      })
      .catch(() => {
        setErrorMessage("Failed to load incident.");
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<Incident>(`/incidents/${incidentId}`)
      .then((res) => {
        if (!isMounted) return;
        setIncident(res.data);
        setUpdateStatus(res.data.status);
        setErrorMessage(null);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("Failed to load incident details.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [incidentId]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;

    setIsSubmittingUpdate(true);
    try {
      const payload: IncidentUpdateCreatePayload = {
        message: updateMessage.trim(),
        status: updateStatus,
      };

      const res = await apiClient.post<IncidentUpdate>(`/incidents/${incidentId}/updates`, payload);

      setIncident((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: updateStatus,
          resolved_at: updateStatus === "resolved" ? new Date().toISOString() : prev.resolved_at,
          updates: [res.data, ...(prev.updates || [])],
        };
      });

      setUpdateMessage("");
    } catch {
      alert("Failed to submit status update.");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const res = await apiClient.post<Incident>(`/incidents/${incidentId}/resolve`);
      setIncident(res.data);
      setUpdateStatus("resolved");
    } catch {
      alert("Failed to resolve incident.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/incidents/${incidentId}`);
      router.push("/dashboard/incidents");
    } catch {
      alert("Failed to delete incident.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "5rem 0",
          gap: "1rem",
          color: "var(--text-muted)",
        }}
      >
        <RefreshCw size={28} className="animate-spin" />
        <span>Loading incident details...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Incident not found</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          This incident may have been removed or does not exist.
        </p>
        <Link href="/dashboard/incidents" style={{ marginTop: "1rem", display: "inline-block" }}>
          <Button variant="secondary">Return to Incidents</Button>
        </Link>
      </div>
    );
  }

  const isResolved = incident.status === "resolved" || incident.resolved_at !== null;
  const sortedUpdates = useMemo(() => {
    return [...(incident.updates || [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [incident.updates]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "860px", margin: "0 auto", width: "100%" }}>
      {/* Top Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link
          href="/dashboard/incidents"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Incidents</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          {!isResolved && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResolve}
              isLoading={isResolving}
              leftIcon={<CheckCircle2 size={14} color="var(--status-up)" />}
            >
              Resolve Incident
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 size={14} />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Incident Card */}
      <Card
        elevated
        style={{
          padding: "2rem",
          borderLeft: isResolved
            ? "4px solid var(--status-up)"
            : incident.impact === "critical"
            ? "4px solid var(--status-down)"
            : "4px solid var(--status-degraded)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <Badge variant={incident.status} showDot pulseDot={!isResolved}>
              {incident.status.toUpperCase()}
            </Badge>
            <Badge variant={incident.impact}>
              {incident.impact.toUpperCase()} IMPACT
            </Badge>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {incident.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              flexWrap: "wrap",
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={14} />
              <span>Started: {new Date(incident.started_at).toLocaleString()}</span>
            </div>
            {incident.resolved_at && (
              <div style={{ color: "var(--status-up-text)" }}>
                Resolved: {new Date(incident.resolved_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Error Banner */}
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

      {/* Post Update Form (for active or recently updated incidents) */}
      <Card elevated style={{ padding: "1.75rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Post Status Update
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>
          Provide real-time progress updates to your team and public status page viewers.
        </p>

        <form onSubmit={handlePostUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Select
            label="New Incident Status"
            value={updateStatus}
            onChange={(e) => setUpdateStatus(e.target.value as IncidentStatus)}
            options={[
              { value: "investigating", label: "Investigating — We are analyzing the issue" },
              { value: "identified", label: "Identified — Root cause found, fix in progress" },
              { value: "monitoring", label: "Monitoring — Fix applied, observing recovery" },
              { value: "resolved", label: "Resolved — System is fully operational" },
            ]}
          />

          <Textarea
            label="Update Message"
            placeholder="Describe what has been discovered, current mitigation steps, or confirmation of recovery."
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            required
            rows={3}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingUpdate}
              leftIcon={<Send size={15} />}
            >
              {isSubmittingUpdate ? "Posting..." : "Post Update"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Incident Updates Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Update Timeline</h3>

        {sortedUpdates.length === 0 ? (
          <Card style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No updates posted yet. Use the form above to post the first update.
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative" }}>
            {/* Timeline vertical connector */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                bottom: "16px",
                left: "19px",
                width: "2px",
                backgroundColor: "var(--border-subtle)",
                zIndex: 0,
              }}
            />

            {sortedUpdates.map((upd) => (
              <div
                key={upd.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1.25rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Node icon */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "2px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {upd.status === "resolved" ? (
                    <CheckCircle2 size={18} color="var(--status-up)" />
                  ) : (
                    <AlertTriangle size={18} color="var(--primary)" />
                  )}
                </div>

                {/* Content Box */}
                <Card style={{ flex: 1, padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <Badge variant={upd.status} size="sm">
                      {upd.status.toUpperCase()}
                    </Badge>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(upd.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {upd.message}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Incident"
        description="Are you sure you want to delete this incident and its entire update timeline? This cannot be undone."
      >
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Incident"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
