"use client";

import React, { Suspense } from "react";
import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 64px)" }}>
      <Suspense fallback={<div style={{ width: "240px", flexShrink: 0 }} />}>
        <Sidebar />
      </Suspense>
      <main
        style={{
          flex: 1,
          padding: "2rem",
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
