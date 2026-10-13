"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      children,
      className = "",
      id,
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

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

    const wrapperStyle: React.CSSProperties = {
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: "100%",
    };

    const selectStyle: React.CSSProperties = {
      width: "100%",
      height: "40px",
      paddingLeft: "0.875rem",
      paddingRight: "2.5rem",
      backgroundColor: "var(--bg-surface-elevated)",
      border: `1px solid ${error ? "var(--status-down)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      color: "var(--text-primary)",
      fontSize: "0.875rem",
      outline: "none",
      appearance: "none",
      transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      ...style,
    };

    const helperStyle: React.CSSProperties = {
      fontSize: "0.75rem",
      color: error ? "var(--status-down)" : "var(--text-muted)",
    };

    return (
      <div style={containerStyle} className="statusping-select-group">
        {label && (
          <label htmlFor={selectId} style={labelStyle}>
            {label}
          </label>
        )}
        <div style={wrapperStyle}>
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            style={selectStyle}
            className={`statusping-select ${className}`}
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
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    style={{ backgroundColor: "#171b2b", color: "#f8fafc" }}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span
            style={{
              position: "absolute",
              right: "0.75rem",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
              color: "var(--text-muted)",
            }}
          >
            <ChevronDown size={16} />
          </span>
        </div>
        {(error || helperText) && <p style={helperStyle}>{error || helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
