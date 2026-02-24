"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  User,
  LogOut,
  Save,
  KeyRound,
  Mail,
  AtSign,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getToken,
  clearAuth,
  apiMe,
  apiUpdateProfile,
  setAuth,
  type User as AuthUser,
  apiGetWishlist,
  apiToggleWishlist,
} from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";
import { Heart, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    // Layout guard already ensures a token exists before this page mounts.
    // We still call apiMe() to validate the token hasn't expired and to
    // fetch the latest user data from the server.
    const token = getToken()!;

    // Fetch profile
    apiMe(token)
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        setName(freshUser.name);
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        clearAuth();
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));

    // Fetch wishlist
    apiGetWishlist(token)
      .then((items) => setWishlist(items))
      .catch((err) => console.error("Wishlist fetch error:", err))
      .finally(() => setWishlistLoading(false));
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !user) return;
    setSaving(true);
    try {
      const updates: { name?: string; password?: string } = {};
      if (name !== user.name) updates.name = name;
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "New password and confirm password must be the same",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
        if (newPassword.length < 8) {
          toast({
            title: "Password too short",
            description: "Password must be at least 8 characters",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
        updates.password = newPassword;
      }
      if (Object.keys(updates).length === 0) {
        toast({ title: "No changes", description: "Nothing to update" });
        return;
      }
      const { user: updated } = await apiUpdateProfile(token, updates);
      setUser(updated);
      setAuth(updated, token);
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Update failed",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearAuth();
    toast({ title: "Signed out", description: "See you next time!" });
    router.push("/");
  }

  async function handleUnsave(productId: string) {
    const token = getToken();
    if (!token) return;

    try {
      await apiToggleWishlist(token, productId);
      setWishlist((prev) => prev.filter((item) => item.id !== productId));
      toast({
        title: "Removed from saves",
        description: "The product has been removed from your saved list.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove item from saved list.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
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

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ minHeight: "calc(100vh - 4rem)", padding: "3.5rem 0 5rem" }}>
      <div className="container" style={{ maxWidth: "44rem" }}>
        {/* ── Page header ──────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.375rem",
              }}
            >
              Account
            </p>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "var(--fg)",
                lineHeight: 1.15,
              }}
            >
              My Profile
            </h1>
            <p style={{ color: "var(--muted-fg)", marginTop: "0.375rem", fontSize: "0.9375rem" }}>
              Manage your personal information and security settings
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ height: "2.5rem", padding: "0 1.125rem", borderRadius: "0.625rem" }}
          >
            <LogOut style={{ width: "0.9rem", height: "0.9rem" }} />
            Sign out
          </button>
        </div>

        {/* ── Identity card ────────────────────────────────────── */}
        <div
          className="card"
          style={{
            padding: "1.75rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle gradient accent */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(59,130,246,0.07), transparent)",
              pointerEvents: "none",
            }}
          />

          {/* Avatar */}
          <div
            style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "1rem",
              background: "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.375rem",
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
              letterSpacing: "-0.02em",
            }}
          >
            {initials}
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                flexWrap: "wrap",
                marginBottom: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--fg)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </span>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--muted-fg)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </p>
          </div>
        </div>

        {/* ── Info tiles row ───────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.875rem",
            marginBottom: "1.25rem",
          }}
        >
          {[
            { icon: AtSign, label: "Username", value: user.name },
            { icon: Mail, label: "Email", value: user.email },
            { icon: ShieldCheck, label: "Role", value: user.role },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card" style={{ padding: "1rem 1.125rem" }}>
              <div
                style={{
                  width: "2.125rem",
                  height: "2.125rem",
                  borderRadius: "0.625rem",
                  backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <Icon
                  style={{ width: "0.9375rem", height: "0.9375rem", color: "var(--color-primary)" }}
                />
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted-fg)",
                  marginBottom: "0.2rem",
                  fontWeight: 500,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--fg)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Edit form card ───────────────────────────────────── */}
        <div className="card" style={{ padding: "1.75rem" }}>
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.75rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.625rem",
                background: "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Pencil style={{ width: "0.875rem", height: "0.875rem", color: "#fff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--fg)" }}>
                Edit Profile
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--muted-fg)", marginTop: "0.1rem" }}>
                Update your name or change your password
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            {/* Full Name */}
            <div style={{ marginBottom: "1.375rem" }}>
              <label
                htmlFor="profile-name"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--fg)",
                  marginBottom: "0.5rem",
                }}
              >
                <User style={{ width: "0.875rem", height: "0.875rem", color: "var(--muted-fg)" }} />
                Full Name
              </label>
              <input
                id="profile-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                style={{ borderRadius: "0.625rem" }}
              />
            </div>

            {/* Email (read-only) */}
            <div style={{ marginBottom: "1.375rem" }}>
              <label
                htmlFor="profile-email"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--fg)",
                  marginBottom: "0.5rem",
                }}
              >
                <Mail style={{ width: "0.875rem", height: "0.875rem", color: "var(--muted-fg)" }} />
                Email Address
              </label>
              <input
                id="profile-email"
                className="input"
                value={user.email}
                disabled
                style={{ borderRadius: "0.625rem", opacity: 0.55, cursor: "not-allowed" }}
              />
              <p
                style={{
                  fontSize: "0.78125rem",
                  color: "var(--muted-fg)",
                  marginTop: "0.4rem",
                  paddingLeft: "0.125rem",
                }}
              >
                Email address cannot be changed
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                margin: "1.625rem 0",
              }}
            />

            {/* New Password */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="new-password"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--fg)",
                  marginBottom: "0.5rem",
                }}
              >
                <KeyRound
                  style={{ width: "0.875rem", height: "0.875rem", color: "var(--muted-fg)" }}
                />
                New Password
              </label>
              <input
                id="new-password"
                className="input"
                type="password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                style={{ borderRadius: "0.625rem" }}
              />
              <p
                style={{
                  fontSize: "0.78125rem",
                  color: "var(--muted-fg)",
                  marginTop: "0.4rem",
                  paddingLeft: "0.125rem",
                }}
              >
                Minimum 8 characters required
              </p>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label
                htmlFor="confirm-password"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--fg)",
                  marginBottom: "0.5rem",
                }}
              >
                <KeyRound
                  style={{ width: "0.875rem", height: "0.875rem", color: "var(--muted-fg)" }}
                />
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                className="input"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                style={{
                  borderRadius: "0.625rem",
                  borderColor:
                    confirmPassword && newPassword && confirmPassword !== newPassword
                      ? "var(--color-destructive)"
                      : undefined,
                  boxShadow:
                    confirmPassword && newPassword && confirmPassword !== newPassword
                      ? "0 0 0 3px color-mix(in srgb, var(--color-destructive) 18%, transparent)"
                      : undefined,
                }}
              />
              {confirmPassword && newPassword && confirmPassword !== newPassword && (
                <p
                  style={{
                    fontSize: "0.78125rem",
                    color: "var(--color-destructive)",
                    marginTop: "0.4rem",
                    paddingLeft: "0.125rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword && confirmPassword === newPassword && (
                <p
                  style={{
                    fontSize: "0.78125rem",
                    color: "var(--color-success)",
                    marginTop: "0.4rem",
                    paddingLeft: "0.125rem",
                  }}
                >
                  ✓ Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingTop: "0.25rem",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-md"
                style={{ borderRadius: "0.625rem", minWidth: "8.5rem" }}
              >
                {saving ? (
                  <>
                    <Loader2
                      style={{
                        width: "0.9rem",
                        height: "0.9rem",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save style={{ width: "0.9rem", height: "0.9rem" }} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Saved products section ─────────────────────────────────── */}
        <div style={{ marginTop: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.625rem",
                background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart
                style={{
                  width: "0.875rem",
                  height: "0.875rem",
                  color: "#fff",
                  fill: "currentColor",
                }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--fg)" }}>
                Saved Products
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--muted-fg)", marginTop: "0.1rem" }}>
                Items you've bookmarked for later
              </p>
            </div>
          </div>

          {wishlistLoading ? (
            <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading your saves...</p>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-fg mb-1">No saved products yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Products you save will appear here for easy access.
              </p>
              <Button variant="outline" size="sm" asChild className="rounded-xl">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="card"
                  style={{
                    padding: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "4rem",
                      height: "4rem",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      backgroundColor: "var(--muted)",
                      flexShrink: 0,
                    }}
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-semibold text-fg hover:text-primary transition-colors block truncate"
                    >
                      {product.title}
                    </Link>
                    <p className="text-sm font-bold text-primary">
                      {product.currency} {product.price.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleUnsave(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
