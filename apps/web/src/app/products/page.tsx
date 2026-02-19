"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Package, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductSkeleton } from "@/components/product-card";
import type { Product, ProductsResponse } from "@/lib/products";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const LIMIT = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
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

  function clearSearch() {
    setSearch("");
    setQuery("");
    setPage(1);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--muted-bg)" }}>
        <div className="container py-10">
          <h1
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "var(--fg)" }}
          >
            Products
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-fg)" }}>
            {loading
              ? "Loading…"
              : total > 0
                ? `${total} products available`
                : "Browse our catalogue"}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* ── Search + filter bar ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: "var(--muted-fg)" }}
              />
              <Input
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "2.25rem" }}
              />
            </div>
            <Button type="submit">Search</Button>
            {query && (
              <Button type="button" variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </form>

          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-fg)" }}>
            <SlidersHorizontal className="h-4 w-4" />
            {loading ? "Loading…" : `${total} results`}
          </div>
        </div>

        {/* ── Grid ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "var(--muted-bg)" }}
            >
              <Package className="h-8 w-8" style={{ color: "var(--muted-fg)" }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
                No products found
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--muted-fg)" }}>
                {query
                  ? `No results for "${query}" — try a different term`
                  : "Start the API server to see products"}
              </p>
            </div>
            {query && (
              <Button variant="outline" onClick={clearSearch}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-1 text-sm"
                      style={{ color: "var(--muted-fg)" }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className="btn btn-sm"
                      style={{
                        minWidth: "2rem",
                        backgroundColor: page === p ? "var(--color-primary)" : "transparent",
                        color: page === p ? "#fff" : "var(--fg)",
                        border: page === p ? "none" : "1.5px solid var(--border)",
                      }}
                    >
                      {p}
                    </button>
                  ),
                )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
