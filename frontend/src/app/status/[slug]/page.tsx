import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getPublicStatusPageData } from "@/lib/public-status";
import { PublicStatusClient } from "@/components/status/PublicStatusClient";
import { StatusPageNotFound } from "@/components/status/StatusPageNotFound";

interface StatusPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic SEO metadata for public status pages.
 */
export async function generateMetadata({
  params,
}: StatusPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getPublicStatusPageData(slug);

  if (!pageData) {
    return {
      title: `Status Page Not Found — StatusPing`,
      description: `The requested status page for ${slug} could not be found.`,
    };
  }

  const statusLabel =
    pageData.overall_status === "operational"
      ? "All Systems Operational"
      : pageData.overall_status === "degraded_performance"
      ? "Degraded Performance"
      : pageData.overall_status === "partial_outage"
      ? "Partial Outage"
      : "Major Outage";

  return {
    title: `${pageData.title} — ${statusLabel}`,
    description:
      pageData.description ||
      `Live operational metrics, 90-day uptime history, and real-time incident reports for ${pageData.title}.`,
    openGraph: {
      title: `${pageData.title} — ${statusLabel}`,
      description:
        pageData.description ||
        `Current operational availability and incident status for ${pageData.title}.`,
      type: "website",
    },
  };
}

/**
 * Loading skeleton while SSR or client transitions resolve.
 */
function StatusPageSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          height: "68px",
          borderBottom: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
      />
      <main style={{ flex: 1, padding: "2.5rem 1.5rem" }}>
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {/* Hero Banner Skeleton */}
          <div
            style={{
              height: "180px",
              borderRadius: "var(--radius-xl)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />

          {/* Monitors Skeleton */}
          <div
            style={{
              height: "280px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>
      </main>
    </div>
  );
}

/**
 * Server Component: fetches status data and renders client viewer or 404.
 */
async function StatusPageContent({ params }: StatusPageProps) {
  const { slug } = await params;
  const pageData = await getPublicStatusPageData(slug);

  if (!pageData) {
    return <StatusPageNotFound slug={slug} />;
  }

  return <PublicStatusClient initialData={pageData} />;
}

export default function StatusPage({ params }: StatusPageProps) {
  return (
    <Suspense fallback={<StatusPageSkeleton />}>
      <StatusPageContent params={params} />
    </Suspense>
  );
}
