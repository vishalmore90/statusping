"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Incident } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { CreateIncidentModal } from "@/components/incidents/CreateIncidentModal";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "resolved">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    apiClient
      .get<Incident[]>("/incidents")
      .then((res) => {
        setIncidents(res.data);
        setErrorMessage(null);
      })
      .catch(() => {
        setErrorMessage("Failed to load incidents. Please try refreshing.");
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      apiClient
        .get<Incident[]>("/incidents")
        .then((res) => {
          if (isMounted) {
            setIncidents(res.data);
            setErrorMessage(null);
          }
        })
        .catch(() => {
          if (isMounted) setErrorMessage("Failed to load incidents.");
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

  const handleResolve = async (id: string) => {
    try {
      const res = await apiClient.post<Incident>(`/incidents/${id}/resolve`);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? res.data : inc)));
    } catch {
      alert("Failed to resolve incident.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/incidents/${id}`);
      setIncidents((prev) => prev.filter((inc) => inc.id !== id));
    } catch {
      alert("Failed to delete incident.");
    }
  };

  const handleIncidentCreated = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
  };

  // Stats
  const stats = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter((i) => i.status !== "resolved" && i.resolved_at === null).length;
    const resolved = incidents.filter((i) => i.status === "resolved" || i.resolved_at !== null).length;
    return { total, active, resolved };
  }, [incidents]);

  // Filtered
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const isResolved = inc.status === "resolved" || inc.resolved_at !== null;
      if (filterTab === "active") return !isResolved;
      if (filterTab === "resolved") return isResolved;
      return true;
    });
  }, [incidents, searchQuery, filterTab]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
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
            Incidents
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Track, communicate, and resolve service degradations
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
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus size={16} />}
          >
            Declare Incident
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
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
              Total Incidents
            </span>
            <AlertTriangle size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {stats.total}
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Active / Ongoing
            </span>
            <AlertCircle size={16} color={stats.active > 0 ? "var(--status-down)" : "var(--status-up)"} />
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
              color: stats.active > 0 ? "var(--status-down)" : "var(--status-up)",
            }}
          >
            {stats.active}
          </div>
        </Card>

        <Card style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Resolved
            </span>
            <CheckCircle2 size={16} color="var(--status-up)" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem", color: "var(--status-up)" }}>
            {stats.resolved}
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

      {/* Filter and Search */}
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
            placeholder="Search incidents by title..."
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
              { key: "active", label: `Active (${stats.active})` },
              { key: "resolved", label: `Resolved (${stats.resolved})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                borderRadius: "var(--radius-sm)",
                backgroundColor: filterTab === tab.key ? "var(--bg-surface-elevated)" : "transparent",
                color: filterTab === tab.key ? "var(--text-primary)" : "var(--text-muted)",
                transition: "all var(--transition-fast)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
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
          <span style={{ fontSize: "0.875rem" }}>Loading incident history...</span>
        </div>
      ) : filteredIncidents.length === 0 ? (
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
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--status-up)",
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>
              {searchQuery || filterTab !== "all"
                ? "No matching incidents"
                : "No active incidents reported"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem", maxWidth: "420px" }}>
              {searchQuery || filterTab !== "all"
                ? "Try adjusting your search criteria or tab filter."
                : "All services are operating nominally. When downtime occurs or an incident is declared, it will appear here."}
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={16} />}>
            Declare Incident
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Declare Incident Modal */}
      <CreateIncidentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleIncidentCreated}
      />
    </div>
  );
}
