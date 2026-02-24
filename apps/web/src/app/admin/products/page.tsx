"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Plus, X, ExternalLink, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken, getUser } from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";
import type { Product } from "@/lib/products";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ProductsResponse {
  data: Product[];
  total: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", stock: "" });

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || !user || user.role !== "admin") {
      router.push("/auth/login");
      return;
    }
    void fetchProducts();
  }, [router]);

  async function fetchProducts() {
    try {
      const res = await fetch(`${BASE}/products?limit=50`);
      const data = (await res.json()) as ProductsResponse;
      setProducts(data.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setCreating(true);
    try {
      const res = await fetch(`${BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
          status: "active",
        }),
      });
      if (!res.ok) throw new Error("Failed to create product");
      toast({ title: "Product created!", description: form.title });
      setForm({ title: "", description: "", price: "", stock: "" });
      setShowCreate(false);
      await fetchProducts();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Create failed",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const activeCount = products.filter((p) => p.status === "active").length;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Product Management</h1>
            </div>
            <p className="text-[var(--color-muted-foreground)] text-sm ml-10">
              {products.length} products · {activeCount} active
            </p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" /> Users
              </Link>
            </Button>
            <Button onClick={() => setShowCreate((v) => !v)} className="rounded-xl">
              {showCreate ? (
                <>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> New Product
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: products.length, color: "var(--color-primary)" },
            { label: "Active", value: activeCount, color: "#10b981" },
            { label: "Inactive", value: products.length - activeCount, color: "#f59e0b" },
            {
              label: "Low Stock",
              value: products.filter((p) => p.stock <= 10).length,
              color: "#ef4444",
            },
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

        {/* Create form */}
        {showCreate && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
            <h2 className="text-lg font-bold mb-5">Create New Product</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="prod-title">Title</Label>
                <Input
                  id="prod-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Product name"
                  required
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="prod-desc">Description</Label>
                <Input
                  id="prod-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short product description"
                  required
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-price">Price (USD)</Label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  required
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-stock">Stock</Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                  required
                  className="rounded-xl h-11"
                />
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button type="submit" disabled={creating} className="rounded-xl h-11 px-6">
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Create Product
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl h-11"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
          <div className="flex items-center gap-2 p-6 border-b border-[var(--color-border)]">
            <Package className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            <h2 className="font-semibold">All Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)]">
                    Product
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)]">
                    Price
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)] hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)]">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--color-muted-foreground)]">
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--color-border)]/50 hover:bg-[var(--color-muted)]/30 transition-colors ${i === products.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium line-clamp-1">{p.title}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)] font-mono mt-0.5">
                        {p.slug}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[var(--color-primary)]">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <span
                        className={
                          p.stock <= 10
                            ? "text-[var(--color-destructive)] font-semibold"
                            : "text-[var(--color-foreground)]"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={p.status === "active" ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Button variant="ghost" size="icon" asChild className="rounded-lg">
                        <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="py-16 text-center text-[var(--color-muted-foreground)]">
                No products yet — create your first one above
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
