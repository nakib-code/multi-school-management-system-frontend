"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidthClass = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`safe-bottom relative max-h-[90dvh] w-full ${maxWidthClass} overflow-y-auto rounded-t-[18px] border bg-background p-3.5 shadow-xl sm:rounded-[11px] sm:p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-muted sm:hidden" />
        <div className="mb-3.5 flex items-start justify-between gap-3 border-b pb-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
