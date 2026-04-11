import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type PixelButtonVariant =
  | "primary"
  | "diamond"
  | "secondary"
  | "danger"
  | "success"
  | "outline"
  | "authPrimary"
  | "authSecondary"
  | "discord";

export type PixelButtonSize = "sm" | "md" | "lg";

export interface PixelButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  size?: PixelButtonSize;
  variant?: PixelButtonVariant;
}

const BUTTON_BASE_CLASSES =
  "relative inline-flex items-center justify-center border-2 uppercase transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-70";

const VARIANT_CLASSES: Record<PixelButtonVariant, string> = {
  primary:
    "font-display tracking-wider bg-primary hover:bg-primary-hover text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  diamond:
    "font-display tracking-wider bg-fs-diamond text-background border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:brightness-110",
  secondary:
    "font-display tracking-wider bg-secondary hover:bg-secondary-hover text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  danger:
    "font-display tracking-wider bg-danger hover:bg-danger-hover text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  success:
    "font-display tracking-wider bg-success hover:bg-success-hover text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  outline:
    "font-display tracking-wider bg-transparent border-fs-diamond text-accent-cyan shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-accent-cyan/10",
  authPrimary:
    "font-body text-lg font-bold tracking-[0.12em] border-emerald-700 bg-emerald-500 text-zinc-950 shadow-[4px_4px_0px_0px_#047857] hover:bg-emerald-400",
  authSecondary:
    "font-body text-lg font-bold tracking-[0.12em] border-zinc-600 bg-zinc-800 text-zinc-100 shadow-[4px_4px_0px_0px_#18181b] hover:bg-zinc-700",
  discord:
    "font-body text-lg font-bold tracking-[0.12em] border-[#4752C4] bg-[#5865F2] text-white shadow-[4px_4px_0px_0px_#3b44a3] hover:bg-[#4b56d1]",
};

const SIZE_CLASSES: Record<PixelButtonSize, string> = {
  sm: "px-2 py-1 text-[8px]",
  md: "px-4 py-2 text-[10px]",
  lg: "px-6 py-3 text-xs",
};

const joinClasses = (...values: Array<string | undefined>): string =>
  values.filter(Boolean).join(" ");

export default function PixelButton({
  children,
  className,
  disabled = false,
  href,
  onClick,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: PixelButtonProps) {
  const sizeClass =
    variant === "authPrimary" || variant === "authSecondary" || variant === "discord"
      ? "px-6 py-3"
      : SIZE_CLASSES[size];

  const classes = joinClasses(BUTTON_BASE_CLASSES, VARIANT_CLASSES[variant], sizeClass, className);

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} type={type} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
