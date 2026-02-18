import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--color-border)]",
          "bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)]",
          "placeholder:text-[var(--color-muted-foreground)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
