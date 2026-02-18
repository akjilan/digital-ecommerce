"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRegister, setAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { user, accessToken } = await apiRegister(name, email, password);
      setAuth(user, accessToken);
      toast({ title: "Account created!", description: `Welcome, ${user.name}!` });
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const strength =
    password.length === 0
      ? 0
      : password.length < 4
        ? 1
        : password.length < 8
          ? 2
          : password.length < 12
            ? 3
            : 4;
  const strengthColor = ["transparent", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

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
          background: "linear-gradient(135deg, #7c3aed 0%, var(--color-primary) 100%)",
          color: "#fff",
        }}
        className="lg:flex"
      >
        <ShoppingBag
          style={{ width: "3.5rem", height: "3.5rem", marginBottom: "1.5rem", opacity: 0.9 }}
        />
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          Join us today
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: "20rem",
            lineHeight: 1.7,
          }}
        >
          Create your free account and start shopping premium tech products instantly.
        </p>
        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            width: "100%",
            maxWidth: "20rem",
          }}
        >
          {[
            "✓ Free to create an account",
            "✓ Exclusive member discounts",
            "✓ Order tracking & history",
            "✓ Priority customer support",
          ].map((f) => (
            <div
              key={f}
              style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}
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
            <span style={{ fontWeight: 700, fontSize: "1.0625rem" }}>digital-ecommerce</span>
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
              Create account
            </h1>
            <p style={{ color: "var(--muted-fg)", marginTop: "0.375rem" }}>
              Join thousands of happy shoppers
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
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
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.5rem" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: "0.25rem",
                        flex: 1,
                        borderRadius: "9999px",
                        backgroundColor: i <= strength ? strengthColor : "var(--border)",
                        transition: "background-color 0.2s",
                      }}
                    />
                  ))}
                </div>
              )}
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
                  />{" "}
                  Creating account…
                </>
              ) : (
                "Create account"
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
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
