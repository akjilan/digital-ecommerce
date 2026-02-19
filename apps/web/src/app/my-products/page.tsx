"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Package,
  Pencil,
  Trash2,
  Loader2,
  PackageCheck,
  PackageX,
  Clock,
} from "lucide-react";
import { ProductFormModal } from "@/components/product-form-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { getToken } from "@/lib/auth";
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/lib/products";

// ─── Status badge helper ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  Product["status"],
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  active: {
    label: "Active",
    color: "var(--color-success)",
    bg: "rgba(34,197,94,0.1)",
    icon: PackageCheck,
  },
  draft: {
    label: "Draft",
    color: "var(--muted-fg)",
    bg: "var(--muted-bg)",
    icon: Clock,
  },
  archived: {
    label: "Archived",
    color: "var(--color-destructive)",
    bg: "rgba(239,68,68,0.08)",
    icon: PackageX,
  },
};

function StatusBadge({ status }: { status: Product["status"] }) {
  const s = STATUS_STYLES[status];
  const Icon = s.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.2rem 0.625rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: s.color,
        backgroundColor: s.bg,
      }}
    >
      <Icon style={{ width: "0.75rem", height: "0.75rem" }} />
      {s.label}
    </span>
  );
}

// ─── My Products page ─────────────────────────────────────────────────────────

export default function MyProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Data fetching ───────────────────────────────────────────────────────

  const loadProducts = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMyProducts(token);
      setProducts(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  // ── Handlers ────────────────────────────────────────────────────────────

  async function handleCreate(payload: CreateProductPayload | UpdateProductPayload) {
    const token = getToken()!;
    const created = await createProduct(token, payload as CreateProductPayload);
    setProducts((prev) => [created, ...prev]);
    toast({ title: "Product added!", description: `"${created.title}" is now listed.` });
  }

  async function handleUpdate(payload: CreateProductPayload | UpdateProductPayload) {
    if (!editTarget) return;
    const token = getToken()!;
    const updated = await updateProduct(token, editTarget.id, payload as UpdateProductPayload);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    toast({ title: "Product updated!", description: "Changes have been saved." });
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    const token = getToken()!;
    setDeletingId(product.id);
    try {
      await deleteProduct(token, product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast({ title: "Product deleted", description: `"${product.title}" was removed.` });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditTarget(product);
    setModalOpen(true);
  }

  // ── Derived stats ───────────────────────────────────────────────────────

  const activeCount = products.filter((p) => p.status === "active").length;
  const draftCount = products.filter((p) => p.status === "draft").length;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "calc(100vh - 4rem)" }}>
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--muted-bg)" }}>
        <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
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
                My Store
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
                My Products
              </h1>
              <p style={{ color: "var(--muted-fg)", marginTop: "0.375rem", fontSize: "0.9375rem" }}>
                {loading
                  ? "Loading your products…"
                  : `${products.length} products · ${activeCount} active · ${draftCount} draft`}
              </p>
            </div>

            <Button onClick={openCreate} className="rounded-xl h-11 px-5 gap-2">
              <Plus style={{ width: "1rem", height: "1rem" }} />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        {/* ── Loading skeletons ──────────────────────────────────────── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton card"
                style={{ height: "5.5rem", borderRadius: "1rem" }}
              />
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────── */}
        {!loading && products.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "6rem 2rem",
              textAlign: "center",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                width: "4rem",
                height: "4rem",
                borderRadius: "1.25rem",
                backgroundColor: "var(--muted-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed var(--border)",
              }}
            >
              <Package style={{ width: "1.75rem", height: "1.75rem", color: "var(--muted-fg)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--fg)" }}>
                No products yet
              </h3>
              <p style={{ color: "var(--muted-fg)", marginTop: "0.375rem", fontSize: "0.9375rem" }}>
                Add your first product and it will appear here.
              </p>
            </div>
            <Button onClick={openCreate} className="rounded-xl gap-2">
              <Plus style={{ width: "1rem", height: "1rem" }} />
              Add your first product
            </Button>
          </div>
        )}

        {/* ── Product list ───────────────────────────────────────────── */}
        {!loading && products.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "3.75rem",
                    height: "3.75rem",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    flexShrink: 0,
                    backgroundColor: "var(--muted-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0] ?? `https://picsum.photos/seed/${product.id}/120/120`}
                    alt={product.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: "var(--fg)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.title}
                    </span>
                    <StatusBadge status={product.status} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 800,
                        color: "var(--color-primary)",
                      }}
                    >
                      ${product.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: "0.8125rem", color: "var(--muted-fg)" }}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}
                >
                  <button
                    onClick={() => openEdit(product)}
                    className="btn btn-outline btn-icon"
                    style={{ borderRadius: "0.625rem" }}
                    aria-label="Edit product"
                  >
                    <Pencil style={{ width: "0.875rem", height: "0.875rem" }} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    className="btn btn-icon"
                    style={{
                      borderRadius: "0.625rem",
                      border: "1.5px solid rgba(239,68,68,0.3)",
                      color: "var(--color-destructive)",
                      backgroundColor: "transparent",
                    }}
                    aria-label="Delete product"
                  >
                    {deletingId === product.id ? (
                      <Loader2
                        style={{
                          width: "0.875rem",
                          height: "0.875rem",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : (
                      <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      {modalOpen && (
        <ProductFormModal
          product={editTarget}
          onClose={() => setModalOpen(false)}
          onSubmit={editTarget ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
