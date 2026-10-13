"use client";

import React, { forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      className = "",
      id,
      style,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "0.375rem",
      width: "100%",
    };

    const labelStyle: React.CSSProperties = {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "var(--text-secondary)",
    };

    const textareaStyle: React.CSSProperties = {
      width: "100%",
      padding: "0.75rem 0.875rem",
      backgroundColor: "var(--bg-surface-elevated)",
      border: `1px solid ${error ? "var(--status-down)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      color: "var(--text-primary)",
      fontSize: "0.875rem",
      lineHeight: "1.5",
      outline: "none",
      resize: "vertical",
      transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? "not-allowed" : "text",
      ...style,
    };

    const helperStyle: React.CSSProperties = {
      fontSize: "0.75rem",
      color: error ? "var(--status-down)" : "var(--text-muted)",
    };

    return (
      <div style={containerStyle} className="statusping-textarea-group">
        {label && (
          <label htmlFor={textareaId} style={labelStyle}>
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          rows={rows}
          style={textareaStyle}
          className={`statusping-textarea ${className}`}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "var(--border-focus)";
              e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-subtle)";
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
          {...props}
        />
        {(error || helperText) && <p style={helperStyle}>{error || helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
