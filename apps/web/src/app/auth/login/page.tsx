"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiLogin, setAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, accessToken } = await apiLogin(email, password);
      setAuth(user, accessToken);
      toast({ title: "Welcome back!", description: `Signed in as ${user.name}` });
      router.push(user.role === "admin" ? "/admin/users" : "/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 4rem)" }}>
      {/* Left decorative panel */}
      <div
        style={{
          display: "none",
          flex: "0 0 50%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          background: "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
          color: "#fff",
        }}
        className="lg:flex"
      >
        <ShoppingBag
          style={{ width: "3.5rem", height: "3.5rem", marginBottom: "1.5rem", opacity: 0.9 }}
        />
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>Welcome back</h2>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: "20rem",
            lineHeight: 1.7,
          }}
        >
          Sign in to access your orders, wishlist, and exclusive member deals.
        </p>
        <div
          style={{
            marginTop: "2.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            width: "100%",
            maxWidth: "20rem",
          }}
        >
          {["Fast Delivery", "Secure Pay", "Easy Returns", "24/7 Support"].map((f) => (
            <div
              key={f}
              style={{
                borderRadius: "0.75rem",
                backgroundColor: "rgba(255,255,255,0.12)",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "26rem" }}>
          {/* Mobile logo */}
          <div
            className="lg:hidden"
            style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "2rem" }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                borderRadius: "0.5rem",
                backgroundColor: "var(--color-primary)",
              }}
            >
              <ShoppingBag style={{ width: "1rem", height: "1rem", color: "#fff" }} />
            </span>
            <span style={{ fontWeight: 700, fontSize: "1.0625rem" }}>DIGISUPERSHOP</span>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--fg)",
              }}
            >
              Sign in
            </h1>
            <p style={{ color: "var(--muted-fg)", marginTop: "0.375rem" }}>
              Enter your credentials to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div style={{ position: "relative" }}>
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted-fg)",
                    padding: 0,
                    display: "flex",
                  }}
                  tabIndex={-1}
                >
                  {showPw ? (
                    <EyeOff style={{ width: "1rem", height: "1rem" }} />
                  ) : (
                    <Eye style={{ width: "1rem", height: "1rem" }} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  borderRadius: "0.625rem",
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  color: "var(--color-destructive)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                height: "2.875rem",
                fontSize: "1rem",
                fontWeight: 700,
                marginTop: "0.25rem",
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }}
                  />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p
            style={{
              marginTop: "1.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--muted-fg)",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
