"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel – decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white"
        style={{ background: "linear-gradient(135deg, #7c3aed, var(--color-primary))" }}
      >
        <ShoppingBag className="h-14 w-14 mb-6 opacity-90" />
        <h2 className="text-3xl font-bold mb-3">Join us today</h2>
        <p className="text-white/70 text-center max-w-xs text-base leading-relaxed">
          Create your free account and start shopping premium tech products instantly.
        </p>
        <div className="mt-10 space-y-3 w-full max-w-xs">
          {[
            "✓ Free to create an account",
            "✓ Exclusive member discounts",
            "✓ Order tracking & history",
            "✓ Priority customer support",
          ].map((f) => (
            <div key={f} className="text-sm text-white/80 font-medium">
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">digital-ecommerce</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create account</h1>
            <p className="text-[var(--color-muted-foreground)] mt-1.5">
              Join thousands of happy shoppers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className="rounded-xl h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          password.length >= i * 2
                            ? password.length >= 8
                              ? "#22c55e"
                              : "#f59e0b"
                            : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-[var(--color-destructive)]/10 border border-[var(--color-destructive)]/20 px-4 py-3 text-sm text-[var(--color-destructive)]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[var(--color-primary)] hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
