"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, AlertCircle, CheckCircle2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { TokenResponse, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registered = searchParams.get("registered");
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post<TokenResponse>("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = response.data.access_token;
      // Fetch user profile
      const userRes = await apiClient.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      await login(token, userRes.data);
      router.push(redirectTarget);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const detail = error.response?.data?.detail;
      setErrorMessage(detail || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <Card
          elevated
          style={{
            padding: "2.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
          }}
        >
          {/* Brand & Heading */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--primary-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-glow-primary)",
              }}
            >
              <Activity size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Welcome back
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                Sign in to your StatusPing dashboard
              </p>
            </div>
          </div>

          {/* Registration Notice */}
          {registered && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--status-up-subtle)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "var(--status-up-text)",
                fontSize: "0.8125rem",
              }}
            >
              <CheckCircle2 size={16} />
              <span>Account created successfully! Please sign in.</span>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--status-down-subtle)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "var(--status-down-text)",
                fontSize: "0.8125rem",
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Input
              id="email"
              label="Email Address"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer Link */}
          <div
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                transition: "color var(--transition-fast)",
              }}
            >
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
          <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
