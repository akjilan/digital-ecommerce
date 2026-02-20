"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = React.createContext<ToastContextValue | null>(null);

// ─── Icon helper ──────────────────────────────────────────────────────────────

function ToastIcon({ variant }: { variant?: "default" | "destructive" }) {
  if (variant === "destructive") {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "color-mix(in srgb, #ef4444 18%, transparent)" }}
      >
        <AlertCircle className="h-4 w-4" style={{ color: "#ef4444" }} />
      </div>
    );
  }
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
      style={{
        background: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
      }}
    >
      <CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...item, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}

        {toasts.map((t) => (
          <Toast key={t.id} variant={t.variant} open>
            {/* Icon — top-left */}
            <ToastIcon variant={t.variant} />

            {/* Text block */}
            <div className="flex flex-col min-w-0 flex-1">
              {t.title && <ToastTitle>{t.title}</ToastTitle>}
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>

            {/* Close button */}
            <ToastClose />
          </Toast>
        ))}

        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastContextProvider");
  return ctx;
}
