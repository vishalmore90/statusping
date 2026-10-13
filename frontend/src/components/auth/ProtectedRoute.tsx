"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !token) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isLoading, token, pathname, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 64px)",
          gap: "1rem",
        }}
      >
        <Loader2 size={32} color="var(--primary)" className="animate-spin" />
        <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Authenticating session...
        </span>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
