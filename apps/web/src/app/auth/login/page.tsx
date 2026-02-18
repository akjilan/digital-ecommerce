"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel – decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-primary), #7c3aed)" }}
      >
        <ShoppingBag className="h-14 w-14 mb-6 opacity-90" />
        <h2 className="text-3xl font-bold mb-3">Welcome back</h2>
        <p className="text-white/70 text-center max-w-xs text-base leading-relaxed">
          Sign in to access your orders, wishlist, and exclusive member deals.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-xs">
          {["Fast Delivery", "Secure Pay", "Easy Returns", "24/7 Support"].map((f) => (
            <div
              key={f}
              className="rounded-xl bg-white/10 backdrop-blur px-4 py-3 text-sm font-medium text-center"
            >
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sign in</h1>
            <p className="text-[var(--color-muted-foreground)] mt-1.5">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-[var(--color-primary)] hover:underline font-semibold"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
