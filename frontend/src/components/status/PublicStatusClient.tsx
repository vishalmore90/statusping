"use client";

import React, { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PublicStatusPage } from "@/types";
import { PublicStatusHeader } from "./PublicStatusHeader";
import { OverallStatusHero } from "./OverallStatusHero";
import { PublicMonitorList } from "./PublicMonitorList";
import { PublicIncidentTimeline } from "./PublicIncidentTimeline";
import { PublicStatusFooter } from "./PublicStatusFooter";

interface PublicStatusClientProps {
  initialData: PublicStatusPage;
}

export function PublicStatusClient({ initialData }: PublicStatusClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const data = initialData;

  // Set up 30-second interval to silently refresh data from server
  useEffect(() => {
    const timer = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 30000);

    return () => clearInterval(timer);
  }, [router]);

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  // Calculate aggregate 90-day uptime across all monitors
  const calculateAggregateUptime = () => {
    if (!data.monitors || data.monitors.length === 0) return 100.0;
    const sum = data.monitors.reduce((acc, m) => acc + (m.uptime_percentage_90d || 100), 0);
    return Number((sum / data.monitors.length).toFixed(2));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-base)",
      }}
    >
      {/* Specialized Public Status Top Bar */}
      <PublicStatusHeader
        title={data.title}
        slug={data.slug}
        onRefresh={handleManualRefresh}
        isRefreshing={isPending}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          width: "100%",
          paddingTop: "2.5rem",
          paddingBottom: "2rem",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "2.5rem",
          }}
        >
          {/* 1. Overall Status Hero */}
          <OverallStatusHero
            status={data.overall_status}
            title={data.title}
            description={data.description}
            lastUpdated={data.last_updated}
            overallUptimeAvg={calculateAggregateUptime()}
          />

          {/* 2. Public Monitor List with 90-day Uptime Bars */}
          <PublicMonitorList monitors={data.monitors} />

          {/* 3. Incidents Timeline (Active + Past Incidents) */}
          <PublicIncidentTimeline incidents={data.incidents} />
        </div>
      </main>

      {/* Specialized Public Footer */}
      <PublicStatusFooter />
    </div>
  );
}
