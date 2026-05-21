"use client";

import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          aria-label="Close modal"
          id="confirm-modal-close"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex-shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-modal-title"
              className="text-lg font-semibold text-[#F9FAFB]"
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-[#9CA3AF] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <Button
            id="confirm-modal-cancel"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            id="confirm-modal-confirm"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
