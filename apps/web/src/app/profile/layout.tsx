"use client";

import { Loader2 } from "lucide-react";
import { useAuthGuard } from "@/lib/use-auth-guard";

/**
 * Profile layout — wraps /profile/*.
 * If the user does NOT have a valid token they are immediately
 * redirected to the login page instead of seeing the profile.
 */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { checking } = useAuthGuard(
    true, // requireAuth = true → this is a PRIVATE route
    "/auth/login", // not logged in? send to login
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
