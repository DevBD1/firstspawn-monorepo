import React from "react";

interface WLCardProps {
  children: React.ReactNode;
  className?: string;
}

export function WLCard({ children, className = "" }: WLCardProps) {
  const baseStyles =
    "relative bg-bg-panel border border-border rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 flex flex-col transition-all duration-120";

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
}
