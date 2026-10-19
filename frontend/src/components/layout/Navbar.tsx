"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Plus, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile drawer on route transition during render
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPublicStatusPage = pathname.startsWith("/status/");

  if (isPublicStatusPage) {
    return null;
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
          gap: "1rem",
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
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Activity size={18} color="#0a0d12" strokeWidth={2.5} />
            </div>
            <span>Status<span style={{ color: "var(--primary)" }}>Ping</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          {!user && !isAuthPage ? (
            <nav className="nav-desktop-links" style={{ alignItems: "center", gap: "1.25rem" }}>
              <Link
                href="/#features"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                Features
              </Link>
              <Link
                href="/#about"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                About
              </Link>
              <a
                href="https://statusping-7ozn.onrender.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                Docs
              </a>
            </nav>
          ) : user && !isAuthPage ? (
            <nav className="nav-desktop-links" style={{ alignItems: "center", gap: "0.5rem" }}>
              <Link
                href="/dashboard"
                style={{
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderRadius: "var(--radius-md)",
                  color: pathname === "/dashboard" ? "var(--text-primary)" : "var(--text-secondary)",
                  backgroundColor: pathname === "/dashboard" ? "var(--bg-surface-elevated)" : "transparent",
                  textDecoration: "none",
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
                  textDecoration: "none",
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
                  textDecoration: "none",
                }}
              >
                Incidents
              </Link>
            </nav>
          ) : null}
        </div>

        {/* Right Action Area */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Desktop Actions */}
          <div className="nav-desktop-actions" style={{ alignItems: "center", gap: "0.75rem" }}>
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
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--bg-surface-elevated)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      <UserIcon size={14} />
                    </div>
                    <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{user.name}</span>
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
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Button size="sm" variant="secondary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" style={{ textDecoration: "none" }}>
                  <Button size="sm" variant="primary">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Right Controls: Quick CTA + Hamburger Toggle */}
          {!isAuthPage && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {!user ? (
                <Link href="/register" className="nav-mobile-btn" style={{ textDecoration: "none" }}>
                  <Button size="sm" variant="primary">
                    Start Free
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard/monitors/new" className="nav-mobile-btn" style={{ textDecoration: "none" }}>
                  <Button size="sm" variant="primary" leftIcon={<Plus size={14} />}>
                    New
                  </Button>
                </Link>
              )}

              {/* Hamburger Button */}
              <button
                type="button"
                className="nav-mobile-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface-elevated)",
                  color: "var(--text-primary)",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && !isAuthPage && (
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {!user ? (
            <>
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  padding: "0.5rem 0",
                  textDecoration: "none",
                }}
              >
                Features
              </Link>
              <Link
                href="/#about"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  padding: "0.5rem 0",
                  textDecoration: "none",
                }}
              >
                About
              </Link>
              <a
                href="https://statusping-7ozn.onrender.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  padding: "0.5rem 0",
                  textDecoration: "none",
                }}
              >
                API Documentation ↗
              </a>
              <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "0.25rem 0" }} />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none" }}>
                <Button size="md" variant="secondary" style={{ width: "100%", justifyContent: "center" }}>
                  Sign In
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  padding: "0.5rem 0",
                  textDecoration: "none",
                }}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/monitors"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  padding: "0.5rem 0",
                  textDecoration: "none",
                }}
              >
                Monitors
              </Link>
              <Link
                href="/dashboard/incidents"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  padding: "0.5rem 0",
                  textDecoration: "none",
                }}
              >
                Incidents
              </Link>
              <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "0.25rem 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{user.email}</span>
                <Button size="sm" variant="ghost" onClick={logout} leftIcon={<LogOut size={15} />}>
                  Log out
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
