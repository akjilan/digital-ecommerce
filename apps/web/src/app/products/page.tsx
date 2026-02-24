"use client";

import { useCallback, useEffect, useMemo, useRef, useState, memo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, ProductSkeleton } from "@/components/product-card";
import type { Product, ProductsResponse, ProductFilters, SortOption } from "@/lib/products";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const LIMIT = 12;

// ─── Constants ────────────────────────────────────────────────────────────────
const REGIONS = ["US", "EU", "Asia"];
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "120cm", "140cm", "160cm"];
const ALL_COLORS = [
  "Black",
  "White",
  "Silver",
  "Red",
  "Rose Gold",
  "Space Grey",
  "Midnight Blue",
  "Walnut",
  "Navy",
  "Green",
  "Pink",
];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

// ─── URL ↔ Filter helpers ─────────────────────────────────────────────────────
function filtersToSearchParams(f: ProductFilters, page: number): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (page > 1) p.set("page", String(page));
  if (f.minPrice !== undefined) p.set("minPrice", String(f.minPrice));
  if (f.maxPrice !== undefined) p.set("maxPrice", String(f.maxPrice));
  if (f.inStock) p.set("inStock", "true");
  if (f.type) p.set("type", f.type);
  if (f.region) p.set("region", f.region);
  if (f.sizes?.length) p.set("sizes", f.sizes.join(","));
  if (f.colors?.length) p.set("colors", f.colors.join(","));
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  return p;
}

function searchParamsToFilters(sp: URLSearchParams): ProductFilters {
  return {
    q: sp.get("q") ?? undefined,
    minPrice: sp.get("minPrice") ? parseFloat(sp.get("minPrice")!) : undefined,
    maxPrice: sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")!) : undefined,
    inStock: sp.get("inStock") === "true",
    type: (sp.get("type") as ProductFilters["type"]) ?? undefined,
    region: sp.get("region") ?? undefined,
    sizes: sp.get("sizes") ? sp.get("sizes")!.split(",") : [],
    colors: sp.get("colors") ? sp.get("colors")!.split(",") : [],
    sort: (sp.get("sort") as SortOption) ?? "newest",
  };
}

function hasActiveFilters(f: ProductFilters): boolean {
  return !!(
    f.q ||
    f.minPrice !== undefined ||
    f.maxPrice !== undefined ||
    f.inStock ||
    f.type ||
    f.region ||
    f.sizes?.length ||
    f.colors?.length ||
    (f.sort && f.sort !== "newest")
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}

const CheckboxGroup = memo(({ label, options, selected, onChange }: CheckboxGroupProps) => {
  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);
  }

  return (
    <div className="filter-section">
      <p className="filter-label">{label}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`filter-chip ${active ? "filter-chip-active" : ""}`}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
});
CheckboxGroup.displayName = "CheckboxGroup";

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

interface SidebarProps {
  filters: ProductFilters;
  searchInput: string;
  onSearchChange: (v: string) => void;
  onChange: (f: Partial<ProductFilters>) => void;
  onClear: () => void;
  isActive: boolean;
}

const FilterSidebar = memo(
  ({ filters, searchInput, onSearchChange, onChange, onClear, isActive }: SidebarProps) => {
    const [localMin, setLocalMin] = useState(
      filters.minPrice !== undefined ? String(filters.minPrice) : "",
    );
    const [localMax, setLocalMax] = useState(
      filters.maxPrice !== undefined ? String(filters.maxPrice) : "",
    );

    // Sync local price state when filters reset externally
    useEffect(() => {
      setLocalMin(filters.minPrice !== undefined ? String(filters.minPrice) : "");
      setLocalMax(filters.maxPrice !== undefined ? String(filters.maxPrice) : "");
    }, [filters.minPrice, filters.maxPrice]);

    function applyPrice() {
      const min = localMin ? parseFloat(localMin) : undefined;
      const max = localMax ? parseFloat(localMax) : undefined;
      onChange({ minPrice: min, maxPrice: max });
    }

    return (
      <aside className="filter-sidebar">
        <div className="filter-sidebar-header">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
              Filters
            </span>
          </div>
          {isActive && (
            <button onClick={onClear} className="filter-clear-btn" aria-label="Clear all filters">
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* ── Search ── */}
        <div className="filter-section">
          <p className="filter-label">Search</p>
          <div className="relative mt-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
              style={{ color: "var(--muted-fg)" }}
            />
            <input
              id="products-search"
              type="search"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              className="filter-input"
              style={{ paddingLeft: "2rem" }}
            />
          </div>
        </div>

        {/* ── Sort ── */}
        <div className="filter-section">
          <p className="filter-label">Sort by</p>
          <select
            id="products-sort"
            value={filters.sort ?? "newest"}
            onChange={(e) => onChange({ sort: e.target.value as SortOption })}
            className="filter-input mt-1"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-divider" />

        {/* ── Price Range ── */}
        <div className="filter-section">
          <p className="filter-label">Price range</p>
          <div className="flex gap-2 mt-1 items-center">
            <input
              type="number"
              placeholder="Min"
              value={localMin}
              min={0}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={applyPrice}
              className="filter-input"
              style={{ minWidth: 0 }}
            />
            <span style={{ color: "var(--muted-fg)", fontSize: "0.75rem" }}>–</span>
            <input
              type="number"
              placeholder="Max"
              value={localMax}
              min={0}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={applyPrice}
              className="filter-input"
              style={{ minWidth: 0 }}
            />
          </div>
        </div>

        {/* ── In Stock ── */}
        <div className="filter-section">
          <label className="filter-toggle-row" htmlFor="instock-toggle">
            <span className="filter-label" style={{ margin: 0 }}>
              In stock only
            </span>
            <button
              id="instock-toggle"
              role="switch"
              aria-checked={!!filters.inStock}
              onClick={() => onChange({ inStock: !filters.inStock })}
              className={`filter-switch ${filters.inStock ? "filter-switch-on" : ""}`}
            >
              <span className="filter-switch-thumb" />
            </button>
          </label>
        </div>

        <div className="filter-divider" />

        {/* ── Product Type ── */}
        <div className="filter-section">
          <p className="filter-label">Product type</p>
          <div className="flex flex-col gap-1.5 mt-2">
            {(["", "physical", "digital"] as const).map((v) => {
              const label = v === "" ? "All" : v.charAt(0).toUpperCase() + v.slice(1);
              const active = (filters.type ?? "") === v;
              return (
                <label key={v} className="filter-radio-row">
                  <input
                    type="radio"
                    name="product-type"
                    value={v}
                    checked={active}
                    onChange={() => onChange({ type: v })}
                    className="filter-radio"
                  />
                  <span style={{ color: "var(--fg)", fontSize: "0.875rem" }}>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ── Region ── */}
        <div className="filter-section">
          <p className="filter-label">Region</p>
          <select
            id="products-region"
            value={filters.region ?? ""}
            onChange={(e) => onChange({ region: e.target.value || undefined })}
            className="filter-input mt-1"
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-divider" />

        {/* ── Sizes ── */}
        <CheckboxGroup
          label="Sizes"
          options={ALL_SIZES}
          selected={filters.sizes ?? []}
          onChange={(v) => onChange({ sizes: v })}
        />

        {/* ── Colors ── */}
        <CheckboxGroup
          label="Colors"
          options={ALL_COLORS}
          selected={filters.colors ?? []}
          onChange={(v) => onChange({ colors: v })}
        />
      </aside>
    );
  },
);
FilterSidebar.displayName = "FilterSidebar";

// ─── Active filter badges ────────────────────────────────────────────────────

function ActiveFilterBadges({
  filters,
  onRemove,
}: {
  filters: ProductFilters;
  onRemove: (key: keyof ProductFilters, value?: string) => void;
}) {
  const badges: { label: string; key: keyof ProductFilters; value?: string }[] = [];
  if (filters.q) badges.push({ label: `"${filters.q}"`, key: "q" });
  if (filters.minPrice !== undefined)
    badges.push({ label: `Min $${filters.minPrice}`, key: "minPrice" });
  if (filters.maxPrice !== undefined)
    badges.push({ label: `Max $${filters.maxPrice}`, key: "maxPrice" });
  if (filters.inStock) badges.push({ label: "In Stock", key: "inStock" });
  if (filters.type) badges.push({ label: filters.type, key: "type" });
  if (filters.region) badges.push({ label: filters.region, key: "region" });
  if (filters.sort && filters.sort !== "newest")
    badges.push({
      label: SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? filters.sort,
      key: "sort",
    });
  filters.sizes?.forEach((s) => badges.push({ label: `Size: ${s}`, key: "sizes", value: s }));
  filters.colors?.forEach((c) => badges.push({ label: `Color: ${c}`, key: "colors", value: c }));

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {badges.map((b, i) => (
        <span key={i} className="active-filter-badge">
          {b.label}
          <button
            onClick={() => onRemove(b.key, b.value)}
            className="active-filter-badge-x"
            aria-label={`Remove filter ${b.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = memo(
  ({
    page,
    totalPages,
    onPage,
  }: {
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
        acc.push(p);
        return acc;
      }, []);

    return (
      <div className="flex items-center justify-center gap-2 mt-12 pb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          id="pagination-prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="px-1 text-sm" style={{ color: "var(--muted-fg)" }}>
              …
            </span>
          ) : (
            <button
              key={p}
              id={`pagination-page-${p}`}
              onClick={() => onPage(p as number)}
              className="btn btn-sm"
              style={{
                minWidth: "2rem",
                backgroundColor: page === p ? "var(--color-primary)" : "transparent",
                color: page === p ? "#fff" : "var(--fg)",
                border: page === p ? "none" : "1.5px solid var(--border)",
              }}
              aria-current={page === p ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
          id="pagination-next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  },
);
Pagination.displayName = "Pagination";

// ─── Main Page Content ────────────────────────────────────────────────────────

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive state from URL params on mount and when URL changes
  const initialFilters = useMemo(
    () => searchParamsToFilters(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const initialPage = parseInt(searchParams.get("page") ?? "1", 10);

  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [searchInput, setSearchInput] = useState(initialFilters.q ?? "");
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Debounce ref for search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch products ─────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (f: ProductFilters, pg: number) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (f.q) p.set("q", f.q);
      if (pg > 1) p.set("page", String(pg));
      p.set("limit", String(LIMIT));
      if (f.minPrice !== undefined) p.set("minPrice", String(f.minPrice));
      if (f.maxPrice !== undefined) p.set("maxPrice", String(f.maxPrice));
      if (f.inStock) p.set("inStock", "true");
      if (f.type) p.set("type", f.type);
      if (f.region) p.set("region", f.region);
      if (f.sizes?.length) p.set("sizes", f.sizes.join(","));
      if (f.colors?.length) p.set("colors", f.colors.join(","));
      if (f.sort) p.set("sort", f.sort);

      const res = await fetch(`${BASE}/products?${p.toString()}`);
      const data = (await res.json()) as ProductsResponse;
      setProducts(data.data);
      setPagination({ total: data.pagination.total, totalPages: data.pagination.totalPages });
    } catch {
      setProducts([]);
      setPagination({ total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync URL when filters change
  const syncUrl = useCallback(
    (f: ProductFilters, pg: number) => {
      const params = filtersToSearchParams(f, pg);
      router.replace(`/products${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [router],
  );

  // ── Filter change handler ──────────────────────────────────────────────
  function applyFilters(partial: Partial<ProductFilters>, resetPage = true) {
    const next = { ...filters, ...partial };
    const nextPage = resetPage ? 1 : page;
    setFilters(next);
    setPage(nextPage);
    syncUrl(next, nextPage);
    void fetchProducts(next, nextPage);
  }

  // ── Search debounce ────────────────────────────────────────────────────
  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters({ q: value || undefined });
    }, 400);
  }

  // ── Page change ────────────────────────────────────────────────────────
  function handlePage(pg: number) {
    setPage(pg);
    syncUrl(filters, pg);
    void fetchProducts(filters, pg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Clear all filters ──────────────────────────────────────────────────
  function clearAll() {
    const empty: ProductFilters = { sort: "newest" };
    setFilters(empty);
    setSearchInput("");
    setPage(1);
    router.replace("/products", { scroll: false });
    void fetchProducts(empty, 1);
  }

  // ── Remove single filter badge ─────────────────────────────────────────
  function removeBadge(key: keyof ProductFilters, value?: string) {
    if (key === "sizes" && value) {
      applyFilters({ sizes: filters.sizes?.filter((s) => s !== value) });
    } else if (key === "colors" && value) {
      applyFilters({ colors: filters.colors?.filter((c) => c !== value) });
    } else if (key === "inStock") {
      applyFilters({ inStock: false });
    } else if (key === "sort") {
      applyFilters({ sort: "newest" });
    } else {
      applyFilters({ [key]: undefined });
    }
  }

  // ── Initial fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    void fetchProducts(initialFilters, initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = hasActiveFilters(filters);

  return (
    <>
      {/* ── Mobile filter drawer overlay */}
      {mobileOpen && (
        <div
          className="mobile-filter-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="min-h-[calc(100vh-4rem)]">
        {/* ── Page header ──────────────────────────────────────────────── */}
        <div
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--muted-bg)" }}
        >
          <div className="container py-8">
            <div className="flex items-end justify-between">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-extrabold tracking-tight"
                  style={{ color: "var(--fg)" }}
                >
                  Products
                </h1>
                <p className="mt-1 text-sm" style={{ color: "var(--muted-fg)" }}>
                  {loading
                    ? "Loading…"
                    : pagination.total > 0
                      ? `${pagination.total} product${pagination.total !== 1 ? "s" : ""} found`
                      : "No products found"}
                </p>
              </div>

              {/* Mobile: open filter button */}
              <Button
                variant="outline"
                className="lg:hidden flex items-center gap-2"
                onClick={() => setMobileOpen(true)}
                id="mobile-filter-btn"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {active && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 flex items-center justify-center text-xs"
                  >
                    •
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Main layout: sidebar + grid ──────────────────────────────── */}
        <div className="container py-8">
          <div className="products-layout">
            {/* ── Desktop Sidebar ─────────────────────────────────────── */}
            <div className="hidden lg:block sticky top-20">
              <FilterSidebar
                filters={filters}
                searchInput={searchInput}
                onSearchChange={handleSearchChange}
                onChange={(p) => applyFilters(p)}
                onClear={clearAll}
                isActive={active}
              />
            </div>

            {/* ── Mobile Sidebar Drawer ───────────────────────────────── */}
            <div
              className={`mobile-filter-drawer ${mobileOpen ? "mobile-filter-drawer-open" : ""}`}
            >
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="font-semibold" style={{ color: "var(--fg)" }}>
                  Filters
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg"
                  style={{ color: "var(--muted-fg)" }}
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                <FilterSidebar
                  filters={filters}
                  searchInput={searchInput}
                  onSearchChange={handleSearchChange}
                  onChange={(p) => {
                    applyFilters(p);
                    setMobileOpen(false);
                  }}
                  onClear={() => {
                    clearAll();
                    setMobileOpen(false);
                  }}
                  isActive={active}
                />
              </div>
            </div>

            {/* ── Product grid area ───────────────────────────────────── */}
            <div className="min-w-0">
              {/* Active filter badges */}
              <ActiveFilterBadges filters={filters} onRemove={removeBadge} />

              {/* Grid */}
              {loading ? (
                <div className="product-grid">
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
                      {active
                        ? "Try adjusting or clearing your filters"
                        : "Start the API server to see products"}
                    </p>
                  </div>
                  {active && (
                    <Button variant="outline" onClick={clearAll} id="empty-clear-btn">
                      Clear all filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <Pagination page={page} totalPages={pagination.totalPages} onPage={handlePage} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  // Assuming Suspense is imported at the top of the file, e.g.,
  // import { ..., Suspense } from "react";
  return (
    <Suspense
      fallback={
        <div className="container py-32 flex flex-col items-center justify-center text-center">
          <ProductSkeleton />
          <p className="mt-4 text-sm" style={{ color: "var(--muted-fg)" }}>
            Loading products...
          </p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
