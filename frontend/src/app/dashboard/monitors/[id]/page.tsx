import React, { Suspense } from "react";
import { MonitorDetailClient } from "@/components/monitors/MonitorDetailClient";

async function MonitorDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MonitorDetailClient monitorId={id} />;
}

export default function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", color: "var(--text-muted)", textAlign: "center" }}>
          Loading monitor details...
        </div>
      }
    >
      <MonitorDetailWrapper params={params} />
    </Suspense>
  );
}
