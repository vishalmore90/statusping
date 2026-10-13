import React, { Suspense } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading dashboard...</div>
        </div>
      }
    >
      <ProtectedRoute>
        <DashboardShell>{children}</DashboardShell>
      </ProtectedRoute>
    </Suspense>
  );
}
