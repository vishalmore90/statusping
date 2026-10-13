import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StatusPing — Uptime Monitoring & Public Status Pages",
  description:
    "Open-source uptime monitoring, SSL tracking, incident communication, and public status pages for modern engineering teams.",
  keywords: ["uptime monitoring", "status page", "health check", "synthetic monitoring", "incident management"],
  authors: [{ name: "StatusPing" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#090a0f" />
      </head>
      <body>
        <AuthProvider>
          <Suspense fallback={<div style={{ height: "64px" }} />}>
            <Navbar />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
