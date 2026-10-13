"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      id,
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

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

    const inputStyle: React.CSSProperties = {
      width: "100%",
      height: "40px",
      paddingLeft: leftIcon ? "2.5rem" : "0.875rem",
      paddingRight: rightIcon ? "2.5rem" : "0.875rem",
      backgroundColor: "var(--bg-surface-elevated)",
      border: `1px solid ${error ? "var(--status-down)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      color: "var(--text-primary)",
      fontSize: "0.875rem",
      outline: "none",
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
      <div style={containerStyle} className="statusping-input-group">
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <div style={wrapperStyle}>
          {leftIcon && (
            <span
              style={{
                position: "absolute",
                left: "0.75rem",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            style={inputStyle}
            className={`statusping-input ${className}`}
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
          {rightIcon && (
            <span
              style={{
                position: "absolute",
                right: "0.75rem",
                display: "flex",
                alignItems: "center",
                color: "var(--text-muted)",
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {(error || helperText) && <p style={helperStyle}>{error || helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
