import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = "", elevated = false, style, ...props }: CardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: elevated ? "var(--bg-surface-elevated)" : "var(--bg-surface)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-lg)",
    boxShadow: elevated ? "var(--shadow-lg)" : "var(--shadow-md)",
    overflow: "hidden",
    transition: "border-color var(--transition-normal), box-shadow var(--transition-normal)",
    ...style,
  };

  return (
    <div style={cardStyle} className={`statusping-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const headerStyle: React.CSSProperties = {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    ...style,
  };

  return (
    <div style={headerStyle} className={className} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const titleStyle: React.CSSProperties = {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    letterSpacing: "-0.01em",
    ...style,
  };

  return (
    <h3 style={titleStyle} className={className} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const descStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "var(--text-muted)",
    ...style,
  };

  return (
    <p style={descStyle} className={className} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const contentStyle: React.CSSProperties = {
    padding: "1.5rem",
    ...style,
  };

  return (
    <div style={contentStyle} className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const footerStyle: React.CSSProperties = {
    padding: "1rem 1.5rem",
    borderTop: "1px solid var(--border-subtle)",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    ...style,
  };

  return (
    <div style={footerStyle} className={className} {...props}>
      {children}
    </div>
  );
}
