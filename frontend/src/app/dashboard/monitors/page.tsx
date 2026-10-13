"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Monitor } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MonitorCard } from "@/components/monitors/MonitorCard";

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "up" | "down" | "paused">("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    apiClient
      .get<Monitor[]>("/monitors")
      .then((response) => {
        setMonitors(response.data);
        setErrorMessage(null);
      })
      .catch(() => {
        setErrorMessage("Failed to load monitors. Please try refreshing.");
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      apiClient
        .get<Monitor[]>("/monitors")
        .then((response) => {
          if (isMounted) {
            setMonitors(response.data);
            setErrorMessage(null);
          }
        })
        .catch(() => {
          if (isMounted) setErrorMessage("Failed to load monitors. Please try refreshing.");
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await apiClient.patch<Monitor>(`/monitors/${id}`, {
        is_active: !currentActive,
      });
      setMonitors((prev) => prev.map((m) => (m.id === id ? res.data : m)));
    } catch {
      alert("Failed to update monitor status.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/monitors/${id}`);
      setMonitors((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Failed to delete monitor.");
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = monitors.length;
    const up = monitors.filter((m) => m.is_active && m.current_status === "up").length;
    const down = monitors.filter((m) => m.is_active && m.current_status === "down").length;
    const paused = monitors.filter((m) => !m.is_active).length;
    return { total, up, down, paused };
  }, [monitors]);

  // Filtered monitors
  const filteredMonitors = useMemo(() => {
    return monitors.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.url.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "up") return m.is_active && m.current_status === "up";
      if (statusFilter === "down") return m.is_active && m.current_status === "down";
      if (statusFilter === "paused") return !m.is_active;
      return true;
    });
  }, [monitors, searchQuery, statusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Monitors
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Manage and monitor health probes across your services
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Button
            variant="secondary"
            size="md"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Link href="/dashboard/monitors/new">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
              Add Monitor
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Total Monitors
            </span>
            <Activity size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {stats.total}
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Operational
            </span>
            <CheckCircle2 size={16} color="var(--status-up)" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem", color: "var(--status-up)" }}>
            {stats.up}
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Down / Outage
            </span>
            <AlertTriangle size={16} color="var(--status-down)" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem", color: "var(--status-down)" }}>
            {stats.down}
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Paused
            </span>
            <PauseCircle size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem", color: "var(--text-secondary)" }}>
            {stats.paused}
          </div>
        </Card>
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

      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: "100%", maxWidth: "340px" }}>
          <Input
            placeholder="Search by name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Status Filter Tabs */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "var(--bg-surface)",
            padding: "0.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            gap: "0.25rem",
          }}
        >
          {(
            [
              { key: "all", label: `All (${stats.total})` },
              { key: "up", label: `Up (${stats.up})` },
              { key: "down", label: `Down (${stats.down})` },
              { key: "paused", label: `Paused (${stats.paused})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                borderRadius: "var(--radius-sm)",
                backgroundColor: statusFilter === tab.key ? "var(--bg-surface-elevated)" : "transparent",
                color: statusFilter === tab.key ? "var(--text-primary)" : "var(--text-muted)",
                transition: "all var(--transition-fast)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monitor List */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 0",
            gap: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <RefreshCw size={24} className="animate-spin" />
          <span style={{ fontSize: "0.875rem" }}>Loading monitors...</span>
        </div>
      ) : filteredMonitors.length === 0 ? (
        <Card
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--bg-surface-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <Activity size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>
              {searchQuery || statusFilter !== "all"
                ? "No monitors match your filter"
                : "No monitors created yet"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem", maxWidth: "420px" }}>
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search query or status filter to find what you are looking for."
                : "Create your first synthetic HTTP or TCP health probe to monitor your uptime and track incidents automatically."}
            </p>
          </div>
          <Link href="/dashboard/monitors/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              Create First Monitor
            </Button>
          </Link>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredMonitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
