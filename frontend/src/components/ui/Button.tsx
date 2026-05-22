"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-background",
  secondary:
    "bg-neutral-card text-text-primary border border-neutral-border hover:bg-neutral-border focus:ring-2 focus:ring-neutral-border focus:ring-offset-2 focus:ring-offset-neutral-background",
  outline:
    "bg-transparent text-primary border border-primary hover:bg-primary-light/10 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-background",
  danger:
    "bg-status-error text-white hover:bg-red-600 focus:ring-2 focus:ring-status-error focus:ring-offset-2 focus:ring-offset-neutral-background",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-neutral-border/50 focus:ring-2 focus:ring-neutral-border focus:ring-offset-2 focus:ring-offset-neutral-background",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm h-9",
  md: "px-6 py-2 text-base h-10",
  lg: "px-8 py-3 text-base h-12",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-all duration-200 focus:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
