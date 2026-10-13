"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Pause,
  Play,
  Trash2,
  Clock,
  ArrowRight,
  Globe,
  Radio,
} from "lucide-react";
import { Monitor } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/monitors/StatusIndicator";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface MonitorCardProps {
  monitor: Monitor;
  onToggleActive: (id: string, currentActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MonitorCard({ monitor, onToggleActive, onDelete }: MonitorCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToggling(true);
    try {
      await onToggleActive(monitor.id, monitor.is_active);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(monitor.id);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatLastChecked = (dateStr: string | null) => {
    if (!dateStr) return "Never checked";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const statusType = !monitor.is_active
    ? "unknown"
    : monitor.current_status === "up"
    ? "up"
    : monitor.current_status === "down"
    ? "down"
    : "unknown";

  return (
    <>
      <Card
        style={{
          transition: "all var(--transition-normal)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.transform = "translateY(-2px)";
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
            gap: "1rem",
          }}
        >
          {/* Top row: Status & Type badges & actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <StatusIndicator
                status={statusType}
                label={!monitor.is_active ? "Paused" : undefined}
                pulse={monitor.is_active}
              />
              <Badge variant="neutral" size="sm">
                {monitor.monitor_type === "http" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Globe size={12} /> HTTP
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Radio size={12} /> TCP
                  </span>
                )}
              </Badge>
              {monitor.expected_status_code && (
                <Badge variant="neutral" size="sm">
                  HTTP {monitor.expected_status_code}
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                isLoading={isToggling}
                title={monitor.is_active ? "Pause monitoring" : "Resume monitoring"}
                aria-label={monitor.is_active ? "Pause monitoring" : "Resume monitoring"}
                style={{ padding: "0.35rem 0.5rem", height: "30px" }}
              >
                {monitor.is_active ? <Pause size={14} /> : <Play size={14} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                title="Delete monitor"
                aria-label="Delete monitor"
                style={{ padding: "0.35rem 0.5rem", height: "30px", color: "var(--status-down-text)" }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {/* Middle: Name & URL */}
          <div>
            <Link
              href={`/dashboard/monitors/${monitor.id}`}
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>{monitor.name}</span>
              <ArrowRight size={14} color="var(--text-muted)" />
            </Link>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                marginTop: "0.25rem",
                fontFamily: "var(--font-mono)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{monitor.url}</span>
              {monitor.monitor_type === "http" && (
                <a
                  href={monitor.url.startsWith("http://") || monitor.url.startsWith("https://") ? monitor.url : `https://${monitor.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open URL in new tab"
                  style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Footer metrics */}
          <div
            style={{
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={12} />
              <span>Interval: {monitor.interval_seconds}s</span>
            </div>
            <div>
              <span>Last checked: {formatLastChecked(monitor.last_checked_at)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Monitor"
        description={`Are you sure you want to delete "${monitor.name}"? All historical check results will be permanently removed.`}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Monitor"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
