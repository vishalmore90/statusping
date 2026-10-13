"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, AlertCircle, CheckCircle, Lock, Mail, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { TokenResponse, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create User
      const regResponse = await apiClient.post<User>("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      const registeredUser = regResponse.data;

      // 2. Seamless Auto-Login
      try {
        const loginRes = await apiClient.post<TokenResponse>("/auth/login", {
          email: email.trim().toLowerCase(),
          password,
        });

        await login(loginRes.data.access_token, registeredUser);
        router.push("/dashboard");
      } catch {
        // Fallback to login screen if auto-auth fails
        router.push("/login?registered=true");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const detail = error.response?.data?.detail;
      setErrorMessage(detail || "Failed to create account. Please try again.");
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
      <div style={{ width: "100%", maxWidth: "440px" }}>
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
                Create your account
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                Start monitoring your websites and APIs in seconds
              </p>
            </div>
          </div>

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
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
            <Input
              id="name"
              label="Full Name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon size={16} />}
            />

            <Input
              id="email"
              label="Work Email"
              type="email"
              required
              autoComplete="email"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              helperText="Must be at least 8 characters"
            />

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Benefits summary */}
          <div
            style={{
              padding: "0.875rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <CheckCircle size={13} color="var(--status-up)" />
              <span>Unlimited HTTP & TCP health checks</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <CheckCircle size={13} color="var(--status-up)" />
              <span>Instant downtime notifications</span>
            </div>
          </div>

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
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                transition: "color var(--transition-fast)",
              }}
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
