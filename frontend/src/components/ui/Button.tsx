"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontWeight: 500,
      borderRadius: "var(--radius-md)",
      cursor: disabled || isLoading ? "not-allowed" : "pointer",
      opacity: disabled || isLoading ? 0.6 : 1,
      transition: "all var(--transition-fast)",
      outline: "none",
      userSelect: "none",
      whiteSpace: "nowrap",
      position: "relative",
      textDecoration: "none",
      ...style,
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        fontSize: "0.8125rem",
        padding: "0.4rem 0.75rem",
        height: "32px",
      },
      md: {
        fontSize: "0.875rem",
        padding: "0.55rem 1rem",
        height: "40px",
      },
      lg: {
        fontSize: "1rem",
        padding: "0.75rem 1.5rem",
        height: "48px",
      },
    };

    // Variant styles
    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: "var(--primary)",
        color: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3), var(--shadow-glow-primary)",
        border: "1px solid rgba(255,255,255,0.15)",
      },
      secondary: {
        backgroundColor: "var(--bg-surface-elevated)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-default)",
      },
      outline: {
        backgroundColor: "transparent",
        color: "var(--text-primary)",
        border: "1px solid var(--border-default)",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "var(--text-secondary)",
        border: "1px solid transparent",
      },
      danger: {
        backgroundColor: "var(--status-down)",
        color: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3), var(--shadow-glow-down)",
        border: "1px solid rgba(255,255,255,0.15)",
      },
    };

    const combinedStyle = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={combinedStyle}
        className={`statusping-btn ${className}`}
        onMouseEnter={(e) => {
          if (disabled || isLoading) return;
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = "var(--primary-hover)";
            e.currentTarget.style.transform = "translateY(-1px)";
          } else if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
          } else if (variant === "outline") {
            e.currentTarget.style.backgroundColor = "var(--bg-surface)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
          } else if (variant === "ghost") {
            e.currentTarget.style.backgroundColor = "var(--bg-surface)";
            e.currentTarget.style.color = "var(--text-primary)";
          } else if (variant === "danger") {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (disabled || isLoading) return;
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = "var(--primary)";
            e.currentTarget.style.transform = "translateY(0)";
          } else if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = "var(--bg-surface-elevated)";
            e.currentTarget.style.borderColor = "var(--border-default)";
          } else if (variant === "outline") {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "var(--border-default)";
          } else if (variant === "ghost") {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          } else if (variant === "danger") {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
        {...props}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {!isLoading && leftIcon && <span>{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
