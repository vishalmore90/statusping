import React, { Suspense } from "react";
import { IncidentDetailClient } from "@/components/incidents/IncidentDetailClient";

async function IncidentDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IncidentDetailClient incidentId={id} />;
}

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", color: "var(--text-muted)", textAlign: "center" }}>
          Loading incident details...
        </div>
      }
    >
      <IncidentDetailWrapper params={params} />
    </Suspense>
  );
}
