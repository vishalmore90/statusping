"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Incident } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface IncidentCardProps {
  incident: Incident;
  onResolve: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function IncidentCard({ incident, onResolve, onDelete }: IncidentCardProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isResolved = incident.status === "resolved" || incident.resolved_at !== null;

  const handleQuickResolve = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResolving(true);
    try {
      await onResolve(incident.id);
    } finally {
      setIsResolving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(incident.id);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const latestUpdate = incident.updates && incident.updates.length > 0
    ? incident.updates[incident.updates.length - 1]
    : null;

  return (
    <>
      <Card
        style={{
          transition: "all var(--transition-normal)",
          borderLeft: isResolved
            ? "3px solid var(--status-up)"
            : incident.impact === "critical"
            ? "3px solid var(--status-down)"
            : "3px solid var(--status-degraded)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-subtle)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
          }}
        >
          {/* Header row: Badges and Quick Resolve */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Badge variant={incident.status} showDot pulseDot={!isResolved} size="sm">
                {incident.status.toUpperCase()}
              </Badge>
              <Badge variant={incident.impact} size="sm">
                {incident.impact.toUpperCase()} IMPACT
              </Badge>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {!isResolved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleQuickResolve}
                  isLoading={isResolving}
                  leftIcon={<CheckCircle2 size={13} color="var(--status-up)" />}
                  style={{ height: "28px", fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
                >
                  Resolve
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                title="Delete incident"
                aria-label="Delete incident"
                style={{ padding: "0.25rem", height: "28px", color: "var(--status-down-text)" }}
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>

          {/* Title and Link */}
          <div>
            <Link
              href={`/dashboard/incidents/${incident.id}`}
              style={{
                fontSize: "1.0625rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>{incident.title}</span>
              <ArrowRight size={14} color="var(--text-muted)" />
            </Link>
          </div>

          {/* Latest update preview */}
          {latestUpdate && (
            <div
              style={{
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <MessageSquare size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{latestUpdate.status}: </span>
                {latestUpdate.message}
              </div>
            </div>
          )}

          {/* Timestamps footer */}
          <div
            style={{
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={12} />
              <span>Started: {new Date(incident.started_at).toLocaleString()}</span>
            </div>
            {incident.resolved_at ? (
              <div style={{ color: "var(--status-up-text)" }}>
                Resolved: {new Date(incident.resolved_at).toLocaleString()}
              </div>
            ) : (
              <div style={{ color: "var(--status-degraded-text)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <AlertTriangle size={12} />
                <span>Ongoing incident</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Incident"
        description={`Are you sure you want to delete incident "${incident.title}"? This will remove all associated timeline updates.`}
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
    </>
  );
}
