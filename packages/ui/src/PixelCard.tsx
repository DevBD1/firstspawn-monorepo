import React from "react";

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "primary" | "dark";
  bezel?: boolean;
}

export function PixelCard({
  children,
  className = "",
  variant = "panel",
  bezel = true,
}: PixelCardProps) {
  const baseStyles =
    "relative border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col";

  const variantStyles = {
    panel: "bg-bg-panel text-foreground",
    primary: "bg-primary text-black",
    dark: "bg-background text-foreground",
  };

  const bezelStyles = bezel
    ? "before:absolute before:inset-[1px] before:border-2 before:border-muted/20 before:pointer-events-none"
    : "";

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${bezelStyles} ${className}`}>
      {children}
    </div>
  );
}
