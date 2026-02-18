"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getUser, clearAuth, type User as AuthUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = () => setUser(getUser());
    handler();
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    clearAuth();
    setMobileOpen(false);
    router.push("/");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-md shadow-sm"
          : "bg-[var(--color-background)]/80 backdrop-blur-sm",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:block">digital-ecommerce</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/products"
            className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors"
          >
            Products
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin/users"
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile" className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
              </Button>
              {user.role === "admin" && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin/users" aria-label="Admin dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4 space-y-1">
          <Link
            href="/products"
            onClick={() => setMobileOpen(false)}
            className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-accent)] transition-colors"
          >
            Products
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-accent)] transition-colors"
              >
                <User className="h-4 w-4" /> {user.name}
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin/users"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-accent)] transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-accent)] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
