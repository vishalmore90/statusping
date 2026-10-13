"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, RefreshCw, Share2, Check, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PublicStatusHeaderProps {
  title: string;
  slug: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function PublicStatusHeader({
  title,
  slug,
  onRefresh,
  isRefreshing,
}: PublicStatusHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header
      style={{
        width: "100%",
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-glass)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          height: "68px",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Brand & Organization Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <Link
            href={`/status/${slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "var(--primary-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-glow-primary)",
              }}
            >
              <Activity size={20} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Official System Status
              </div>
            </div>
          </Link>
        </div>

        {/* Live Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Live indicator badge */}
          <div
            style={{
              display: "none",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.75rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: "0.75rem",
              color: "var(--status-up-text)",
              fontWeight: 500,
            }}
            className="statusping-live-badge"
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--status-up)",
                boxShadow: "0 0 6px var(--status-up)",
                display: "inline-block",
              }}
            />
            Live Auto-Refresh
          </div>

          {/* Copy link button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            style={{
              gap: "0.375rem",
              fontSize: "0.8125rem",
              height: "34px",
            }}
          >
            {copied ? (
              <>
                <Check size={14} color="var(--status-up)" />
                <span style={{ color: "var(--status-up)" }}>Copied</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Share</span>
              </>
            )}
          </Button>

          {/* Manual Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              gap: "0.375rem",
              fontSize: "0.8125rem",
              height: "34px",
              padding: "0 0.625rem",
            }}
            title="Refresh status data"
          >
            <RefreshCw
              size={14}
              style={{
                animation: isRefreshing ? "spin 1s linear infinite" : "none",
              }}
            />
          </Button>

          {/* Back to StatusPing dashboard / home */}
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "0.35rem 0.65rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              transition: "color var(--transition-fast)",
            }}
          >
            <span>Dashboard</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
      <style jsx>{`
        @media (min-width: 640px) {
          .statusping-live-badge {
            display: inline-flex !important;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
}
