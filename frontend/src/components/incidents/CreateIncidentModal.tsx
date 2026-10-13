"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api";
import { Incident, IncidentCreatePayload, IncidentImpact, IncidentStatus } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newIncident: Incident) => void;
}

export function CreateIncidentModal({ isOpen, onClose, onSuccess }: CreateIncidentModalProps) {
  const [title, setTitle] = useState("");
  const [impact, setImpact] = useState<IncidentImpact>("minor");
  const [status, setStatus] = useState<IncidentStatus>("investigating");
  const [initialMessage, setInitialMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload: IncidentCreatePayload = {
        title: title.trim(),
        impact,
        status,
        initial_message: initialMessage.trim() || undefined,
      };

      const res = await apiClient.post<Incident>("/incidents", payload);
      onSuccess(res.data);
      // Reset
      setTitle("");
      setImpact("minor");
      setStatus("investigating");
      setInitialMessage("");
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setErrorMessage(error.response?.data?.detail || "Failed to create incident.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Declare Incident"
      description="Publish an incident update to your status page and tracking feeds."
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {errorMessage && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--status-down-subtle)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "var(--status-down-text)",
              fontSize: "0.8125rem",
            }}
          >
            {errorMessage}
          </div>
        )}

        <Input
          label="Incident Title"
          placeholder="e.g. Elevated API Latency on Checkout"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          helperText="A clear summary of the degradation or outage."
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Select
            label="Impact Severity"
            value={impact}
            onChange={(e) => setImpact(e.target.value as IncidentImpact)}
            options={[
              { value: "none", label: "None (Informational)" },
              { value: "minor", label: "Minor Degradation" },
              { value: "major", label: "Major Outage" },
              { value: "critical", label: "Critical Failure" },
            ]}
          />

          <Select
            label="Current Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as IncidentStatus)}
            options={[
              { value: "investigating", label: "Investigating" },
              { value: "identified", label: "Identified" },
              { value: "monitoring", label: "Monitoring" },
              { value: "resolved", label: "Resolved" },
            ]}
          />
        </div>

        <Textarea
          label="Initial Message"
          placeholder="We are actively investigating reports of elevated latency. Our engineering team is reviewing upstream providers."
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          rows={3}
          helperText="Detailed message presented to users on your public status page."
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isLoading ? "Publishing..." : "Publish Incident"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
