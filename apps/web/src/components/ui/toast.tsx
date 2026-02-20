"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

/** Viewport — pinned to top-right */
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/** Root toast card */
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: "default" | "destructive";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      // base
      "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-sm px-4 py-3.5 pr-10",
      "data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2 data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=closed]:fade-out-80",
      "transition-all duration-200",
      variant === "destructive"
        ? ["bg-[color-mix(in_srgb,#ef4444_12%,var(--card))] border-red-500/30", "text-[var(--fg)]"]
        : [
            "bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--card))] border-[var(--border)]",
            "text-[var(--fg)]",
          ],
      className,
    )}
    {...props}
  />
));
Toast.displayName = ToastPrimitives.Root.displayName;

/** Close button */
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2.5 top-2.5 rounded-lg p-1",
      "opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity",
      "text-[var(--muted-fg)] hover:text-[var(--fg)]",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

/** Title — bold, normal size */
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-snug", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

/** Description — muted, slightly smaller */
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs leading-relaxed mt-0.5", className)}
    style={{ color: "var(--muted-fg)" }}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export { ToastProvider, ToastViewport, Toast, ToastClose, ToastTitle, ToastDescription };
