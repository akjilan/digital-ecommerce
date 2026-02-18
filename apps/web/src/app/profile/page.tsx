"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, LogOut, Save, KeyRound, Mail, AtSign } from "lucide-react";
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
} from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    apiMe(token)
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        setName(freshUser.name);
      })
      .catch(() => {
        clearAuth();
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
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
        if (newPassword.length < 8) {
          toast({
            title: "Error",
            description: "Password must be at least 8 characters",
            variant: "destructive",
          });
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
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
    <div className="min-h-[calc(100vh-4rem)] py-10">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              Manage your account settings
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="rounded-xl">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
          <div className="flex items-center gap-5">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-primary), #7c3aed)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold truncate">{user.name}</h2>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              </div>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5 truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--color-border)]">
            {[
              { icon: AtSign, label: "Username", value: user.name },
              { icon: Mail, label: "Email", value: user.email },
              { icon: User, label: "Role", value: user.role },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[var(--color-muted-foreground)]">{label}</div>
                  <div className="text-sm font-medium truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Edit Profile</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
              Update your name or change your password
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                value={user.email}
                disabled
                className="rounded-xl h-11 opacity-60"
              />
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-password">
                <KeyRound className="inline h-3.5 w-3.5 mr-1" />
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-xl h-11"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving} className="rounded-xl h-11 px-6">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
