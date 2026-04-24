"use client";

import React from "react";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "orange" | "gold";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function PixelButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: PixelButtonProps) {
  const baseStyles =
    "font-display uppercase tracking-widest border-4 border-black transition-all duration-0 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none inline-flex items-center justify-center";

  const variantStyles = {
    primary: "bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary-hover",
    secondary:
      "bg-secondary text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-secondary-hover",
    success: "bg-success text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-success-hover",
    danger: "bg-danger text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-danger-hover",
    orange: "bg-fs-orange text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    gold: "bg-fs-gold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
