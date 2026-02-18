"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Users, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getToken, getUser, clearAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";
import Link from "next/link";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || !user) {
      router.push("/auth/login");
      return;
    }
    if (user.role !== "admin") {
      toast({ title: "Access denied", description: "Admin only", variant: "destructive" });
      router.push("/");
      return;
    }
    fetch(`${BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: { users: AdminUser[] }) => setUsers(data.users))
      .catch(() => {
        clearAuth();
        router.push("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router, toast]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
            </div>
            <p className="text-[var(--color-muted-foreground)] text-sm ml-10">
              {users.length} total users · {adminCount} admin{adminCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" asChild className="rounded-xl self-start sm:self-auto">
            <Link href="/admin/products">
              <Package className="mr-2 h-4 w-4" /> Products Admin
            </Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, color: "var(--color-primary)" },
            { label: "Admins", value: adminCount, color: "#7c3aed" },
            { label: "Regular Users", value: users.length - adminCount, color: "#10b981" },
            { label: "Active Today", value: users.length, color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
            >
              <div className="text-2xl font-bold" style={{ color }}>
                {value}
              </div>
              <div className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
          <div className="flex items-center gap-2 p-6 border-b border-[var(--color-border)]">
            <Users className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            <h2 className="font-semibold">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)]">
                    User
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)] hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)]">
                    Role
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)] hidden md:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const initials = u.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-[var(--color-border)]/50 hover:bg-[var(--color-muted)]/30 transition-colors ${i === users.length - 1 ? "border-b-0" : ""}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{
                              background:
                                u.role === "admin"
                                  ? "linear-gradient(135deg, var(--color-primary), #7c3aed)"
                                  : "linear-gradient(135deg, #10b981, #059669)",
                            }}
                          >
                            {initials}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[var(--color-muted-foreground)] hidden sm:table-cell">
                        {u.email}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-[var(--color-muted-foreground)] text-xs hidden md:table-cell">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="py-16 text-center text-[var(--color-muted-foreground)]">
                No users registered yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
