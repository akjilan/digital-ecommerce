"use client";

import { Loader2 } from "lucide-react";
import { useAuthGuard } from "@/lib/use-auth-guard";

/**
 * Auth layout — wraps /auth/login and /auth/register.
 * If the user already has a valid token they are immediately
 * redirected to the homepage instead of seeing the auth pages.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { checking } = useAuthGuard(
    false, // requireAuth = false → this is a PUBLIC/auth route
    "/", // already logged in? send them home
  );

  if (checking) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 4rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2
          style={{
            width: "2rem",
            height: "2rem",
            animation: "spin 1s linear infinite",
            color: "var(--color-primary)",
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
