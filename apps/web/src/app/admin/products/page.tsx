"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Plus, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken, getUser } from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";
import type { Product } from "@/lib/products";

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
    fetchProducts();
  }, [router]);

  function fetchProducts() {
    fetch(`${BASE}/products?limit=50`)
      .then((r) => r.json())
      .then((data: ProductsResponse) => setProducts(data.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
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
      fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Create failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" /> Products Admin
            </h1>
            <p className="text-muted-foreground mt-1">{products.length} products</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/admin/users">← Users</a>
            </Button>
            <Button onClick={() => setShowCreate((v) => !v)}>
              <Plus className="mr-2 h-4 w-4" /> New Product
            </Button>
          </div>
        </div>

        {/* Create form */}
        {showCreate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="prod-title">Title</Label>
                  <Input
                    id="prod-title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="prod-desc">Description</Label>
                  <Input
                    id="prod-desc"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-price">Price (USD)</Label>
                  <Input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-stock">Stock</Label>
                  <Input
                    id="prod-stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products table */}
        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>Manage your product catalogue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium line-clamp-1">{p.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.slug}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-primary">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">{p.stock}</td>
                      <td className="py-3 px-4">
                        <Badge variant={p.status === "active" ? "default" : "secondary"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer">
                            <Pencil className="h-4 w-4" />
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
