"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Plus, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPublicStatusPage = pathname.startsWith("/status/");

  if (isPublicStatusPage) {
    return null; // Public status pages use their own specialized header
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-glass)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          height: "64px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link
            href={user ? "/dashboard" : "/"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              fontWeight: 700,
              fontSize: "1.125rem",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-md)",
                background: "var(--primary-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-glow-primary)",
              }}
            >
              <Activity size={18} color="#ffffff" />
            </div>
            <span>Status<span style={{ color: "var(--primary)" }}>Ping</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          {user && !isAuthPage && (
            <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link
                href="/dashboard"
                style={{
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "var(--radius-md)",
                  color: pathname === "/dashboard" ? "var(--text-primary)" : "var(--text-secondary)",
                  backgroundColor: pathname === "/dashboard" ? "var(--bg-surface-elevated)" : "transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/monitors"
                style={{
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "var(--radius-md)",
                  color: pathname.startsWith("/dashboard/monitors") ? "var(--text-primary)" : "var(--text-secondary)",
                  backgroundColor: pathname.startsWith("/dashboard/monitors") ? "var(--bg-surface-elevated)" : "transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                Monitors
              </Link>
              <Link
                href="/dashboard/incidents"
                style={{
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "var(--radius-md)",
                  color: pathname.startsWith("/dashboard/incidents") ? "var(--text-primary)" : "var(--text-secondary)",
                  backgroundColor: pathname.startsWith("/dashboard/incidents") ? "var(--bg-surface-elevated)" : "transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                Incidents
              </Link>
            </nav>
          )}
        </div>

        {/* Right CTA / User State */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {user ? (
            <>
              <Link href="/dashboard/monitors/new">
                <Button size="sm" variant="primary" leftIcon={<Plus size={15} />}>
                  New Monitor
                </Button>
              </Link>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  paddingLeft: "0.5rem",
                  borderLeft: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--bg-surface-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <UserIcon size={14} />
                  </div>
                  <span style={{ fontWeight: 500 }}>{user.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </>
          ) : !isAuthPage ? (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">
                  Get Started
                </Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
