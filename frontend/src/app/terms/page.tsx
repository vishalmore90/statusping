import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfService() {
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
              <FileText size={20} />
            </div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account or accessing StatusPing, you agree to comply with and be bound by these Terms of Service. If you do not agree with any portion of these terms, you should discontinue use of the service.
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
                2. Acceptable Use
              </h2>
              <p>
                StatusPing is designed exclusively for synthetic availability monitoring of systems and infrastructure you own or are authorized to inspect. You agree not to configure health checks targeting third-party endpoints without permission or use the probe network for denial-of-service activities.
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
                3. Service Availability & SLA
              </h2>
              <p>
                StatusPing is provided &ldquo;as is&rdquo; under the MIT open-source license. While we strive to maintain uninterrupted service availability and timely alerting, we do not warrant that health checks or email notifications will be error-free or instantaneous under all network conditions.
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
                4. Account Responsibilities
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your authentication credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access.
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
                5. Modifications & Termination
              </h2>
              <p>
                We reserve the right to modify these terms or terminate accounts that violate our acceptable use guidelines at any time with or without prior notice.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
