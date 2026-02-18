"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Package, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductsResponse } from "@/lib/products";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-[var(--color-muted)]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[var(--color-muted)] rounded-full w-3/4" />
        <div className="h-3 bg-[var(--color-muted)] rounded-full w-full" />
        <div className="h-3 bg-[var(--color-muted)] rounded-full w-2/3" />
        <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
          <div className="h-5 bg-[var(--color-muted)] rounded-full w-16" />
          <div className="h-5 bg-[var(--color-muted)] rounded-full w-14" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (query) params.set("q", query);
      const res = await fetch(`${BASE}/products?${params.toString()}`);
      const data = (await res.json()) as ProductsResponse;
      setProducts(data.data);
      setTotal(data.total);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Page header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
        <div className="container py-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Products</h1>
          <p className="text-[var(--color-muted-foreground)] mt-2">
            {total > 0 ? `${total} products available` : "Browse our catalogue"}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <Input
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Button type="submit" className="rounded-xl">
              Search
            </Button>
            {query && (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSearch("");
                  setQuery("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </form>
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <SlidersHorizontal className="h-4 w-4" />
            {loading ? "Loading…" : `${total} results`}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-16 w-16 rounded-2xl bg-[var(--color-muted)] flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-[var(--color-muted-foreground)]" />
            </div>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-[var(--color-muted-foreground)] mt-1 text-sm">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                  <div className="aspect-[4/3] overflow-hidden bg-[var(--color-muted)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0] ?? "https://picsum.photos/800/600"}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-1 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                      <span className="text-base font-bold text-[var(--color-primary)]">
                        ${product.price.toFixed(2)}
                      </span>
                      <Badge
                        variant={product.stock > 10 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {product.stock > 10 ? "In Stock" : `${product.stock} left`}
                      </Badge>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </Button>
            <span className="text-sm text-[var(--color-muted-foreground)] px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
