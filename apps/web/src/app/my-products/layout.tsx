"use client";

import { Loader2 } from "lucide-react";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function MyProductsLayout({ children }: { children: React.ReactNode }) {
  const { checking } = useAuthGuard(true, "/auth/login");

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
