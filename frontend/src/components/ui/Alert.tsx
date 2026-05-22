"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  error: {
    bg: "bg-status-error/10",
    border: "border-status-error/30",
    text: "text-status-error",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  success: {
    bg: "bg-status-success/10",
    border: "border-status-success/30",
    text: "text-status-success",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary-light",
    icon: <Info className="h-4 w-4" />,
  },
};

export function Alert({
  variant = "error",
  message,
  onDismiss,
  className,
}: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm animate-fade-in",
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      <span className="flex-shrink-0 mt-0.5">{config.icon}</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
