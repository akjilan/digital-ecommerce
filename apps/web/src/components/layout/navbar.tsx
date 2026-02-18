"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getUser, clearAuth, type User as AuthUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

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
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        backgroundColor: "var(--bg)",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.08)" : "none",
        backdropFilter: "blur(12px)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", height: "4rem", gap: "1rem" }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            fontWeight: 700,
            fontSize: "1.0625rem",
            textDecoration: "none",
            color: "var(--fg)",
            flexShrink: 0,
          }}
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
          <span className="hidden sm:block">digital-ecommerce</span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            marginLeft: "1rem",
            flex: 1,
          }}
          className="hidden md:flex"
        >
          <Link href="/products" className="btn btn-ghost btn-sm">
            Products
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin/users" className="btn btn-ghost btn-sm">
              Admin
            </Link>
          )}
        </nav>

        {/* Spacer on mobile */}
        <div style={{ flex: 1 }} className="md:hidden" />

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ThemeToggle />

          {user ? (
            <div className="hidden md:flex" style={{ alignItems: "center", gap: "0.5rem" }}>
              <Link
                href="/profile"
                className="btn btn-ghost btn-sm"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <User style={{ width: "0.875rem", height: "0.875rem" }} />
                <span
                  style={{
                    maxWidth: "8rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </span>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin/users" className="btn btn-ghost btn-icon" aria-label="Admin">
                  <LayoutDashboard style={{ width: "1rem", height: "1rem" }} />
                </Link>
              )}
              <button
                className="btn btn-ghost btn-icon"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <LogOut style={{ width: "1rem", height: "1rem" }} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex" style={{ alignItems: "center", gap: "0.5rem" }}>
              <Link href="/auth/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="btn btn-ghost btn-icon md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X style={{ width: "1.25rem", height: "1.25rem" }} />
            ) : (
              <Menu style={{ width: "1.25rem", height: "1.25rem" }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            borderTop: "1px solid var(--border)",
            backgroundColor: "var(--bg)",
            padding: "1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <Link
            href="/products"
            onClick={() => setMobileOpen(false)}
            className="btn btn-ghost"
            style={{ justifyContent: "flex-start" }}
          >
            Products
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="btn btn-ghost"
                style={{ justifyContent: "flex-start", gap: "0.5rem" }}
              >
                <User style={{ width: "1rem", height: "1rem" }} /> {user.name}
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin/users"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-ghost"
                  style={{ justifyContent: "flex-start", gap: "0.5rem" }}
                >
                  <LayoutDashboard style={{ width: "1rem", height: "1rem" }} /> Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{
                  justifyContent: "flex-start",
                  gap: "0.5rem",
                  color: "var(--color-destructive)",
                }}
              >
                <LogOut style={{ width: "1rem", height: "1rem" }} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="btn btn-ghost"
                style={{ justifyContent: "flex-start" }}
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary"
                style={{ justifyContent: "flex-start" }}
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
