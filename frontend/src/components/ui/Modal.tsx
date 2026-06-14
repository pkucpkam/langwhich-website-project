"use client";

import React, { useEffect } from "react";
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ModalVariant = "info" | "success" | "warning" | "error" | "danger";

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string | React.ReactNode;
  variant?: ModalVariant;
  
  // If onConfirm is provided, the modal acts as a confirm modal; otherwise, a simple alert modal
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  
  onClose: () => void;
  loading?: boolean;
  
  children?: React.ReactNode;
}

const variantConfig: Record<
  ModalVariant,
  {
    bg: string;
    border: string;
    text: string;
    btnClass: "primary" | "secondary" | "outline" | "danger" | "ghost";
    icon: React.ReactNode;
  }
> = {
  success: {
    bg: "bg-status-success/10",
    border: "border-status-success/20",
    text: "text-status-success",
    btnClass: "primary",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  error: {
    bg: "bg-status-error/10",
    border: "border-status-error/20",
    text: "text-status-error",
    btnClass: "danger",
    icon: <AlertCircle className="h-5 w-5" />,
  },
  warning: {
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
    text: "text-status-warning",
    btnClass: "primary",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  danger: {
    bg: "bg-status-error/10",
    border: "border-status-error/20",
    text: "text-status-error",
    btnClass: "danger",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary-light",
    btnClass: "primary",
    icon: <Info className="h-5 w-5" />,
  },
};

export function Modal({
  isOpen,
  title,
  description,
  variant = "info",
  onConfirm,
  confirmLabel,
  cancelLabel = "Cancel",
  onClose,
  loading = false,
  children,
}: ModalProps) {
  // Listen for Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const config = variantConfig[variant];
  const isConfirmMode = !!onConfirm;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-border bg-neutral-card p-6 shadow-2xl animate-slide-up focus:outline-none">
        {/* Close Button */}
        {!loading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-border/50 text-text-secondary hover:text-text-primary transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        )}

        {/* Header Icon + Text */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-2.5 rounded-xl border flex-shrink-0 flex items-center justify-center",
              config.bg,
              config.border,
              config.text
            )}
          >
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="modal-title"
              className="text-lg font-bold text-text-primary tracking-tight leading-snug"
            >
              {title}
            </h3>
            {description && (
              <div className="mt-1.5 text-sm text-text-secondary leading-relaxed font-medium">
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Custom Children Content */}
        {children && <div className="mt-4">{children}</div>}

        {/* Modal Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          {isConfirmMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={config.btnClass}
                size="sm"
                onClick={onConfirm}
                isLoading={loading}
              >
                {confirmLabel || (variant === "danger" ? "Delete" : "Confirm")}
              </Button>
            </>
          ) : (
            <Button
              variant={config.btnClass}
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="px-6"
            >
              {confirmLabel || "OK"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
