import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <main style={{ padding: "6rem 2rem", flex: 1 }}>
        <div className="container-narrow">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              marginBottom: "2.5rem",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <Shield size={20} />
            </div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Privacy Policy
            </h1>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginBottom: "3rem" }}>
            Last updated: October 19, 2026
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2.5rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              fontSize: "1rem",
            }}
          >
            <section>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                1. Information We Collect
              </h2>
              <p>
                StatusPing collects your email address, name, and hashed credentials when you register an account. When configuring synthetic monitors, we store the target URLs, port numbers, check cadences, and recorded latency metrics.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                2. How We Use Data
              </h2>
              <p>
                Your data is exclusively used to perform automated health checks, calculate uptime percentages, deliver downtime notifications, and render your status pages. We do not sell, license, or monetize your personal information or probe logs.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                3. Data Retention & Deletion
              </h2>
              <p>
                Individual check results and latency measurements are automatically retained for 90 days, after which scheduled database retention jobs permanently remove them. You may delete your account and all associated monitor configurations at any time.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                4. Security Standards
              </h2>
              <p>
                All account passwords are encrypted using industry-standard bcrypt hashing. API communication is enforced strictly over encrypted HTTPS protocols, and database access utilizes isolated tenant authorization constraints.
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                5. Contact Information
              </h2>
              <p>
                For questions regarding this privacy policy or data inquiries, contact the open-source maintenance team through our official GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
