"use client";

import { useState, useEffect } from "react";
import { X, Loader2, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product, CreateProductPayload, UpdateProductPayload } from "@/lib/products";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductFormModalProps {
  /** null = create mode, Product = edit mode */
  product?: Product | null;
  onClose: () => void;
  onSubmit: (payload: CreateProductPayload | UpdateProductPayload) => Promise<void>;
}

// ─── Field component (DRY) ────────────────────────────────────────────────────

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label htmlFor={id} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--fg)" }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: "0.75rem", color: "var(--muted-fg)", marginTop: "0.125rem" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductFormModal({ product, onClose, onSubmit }: ProductFormModalProps) {
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [imageUrl, setImageUrl] = useState(product?.images?.[0] ?? "");
  const [status, setStatus] = useState<"active" | "draft" | "archived">(product?.status ?? "draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedPrice = parseFloat(price);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Enter a valid price");
      return;
    }

    const payload: CreateProductPayload = {
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: parseInt(stock, 10) || 0,
      status,
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: "100%",
          maxWidth: "32rem",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "1.75rem",
          animation: "fadeIn 0.15s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
              <PackagePlus style={{ width: "1rem", height: "1rem", color: "#fff" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--fg)" }}>
                {isEdit ? "Edit Product" : "Add New Product"}
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--muted-fg)", marginTop: "0.1rem" }}>
                {isEdit
                  ? "Update your product details"
                  : "Fill in the details to list a new product"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ flexShrink: 0 }}
            aria-label="Close"
          >
            <X style={{ width: "1rem", height: "1rem" }} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}
        >
          <Field id="pm-title" label="Product Title">
            <input
              id="pm-title"
              className="input"
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ borderRadius: "0.625rem" }}
            />
          </Field>

          <Field
            id="pm-description"
            label="Description"
            hint="Brief, honest description visible to buyers"
          >
            <textarea
              id="pm-description"
              className="input"
              placeholder="Describe your product…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                borderRadius: "0.625rem",
                resize: "vertical",
                height: "auto",
                padding: "0.625rem 0.875rem",
                lineHeight: 1.6,
              }}
            />
          </Field>

          {/* Price + Stock side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <Field id="pm-price" label="Price (USD)">
              <input
                id="pm-price"
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                style={{ borderRadius: "0.625rem" }}
              />
            </Field>

            <Field id="pm-stock" label="Stock Quantity">
              <input
                id="pm-stock"
                className="input"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={{ borderRadius: "0.625rem" }}
              />
            </Field>
          </div>

          <Field id="pm-image" label="Image URL" hint="Paste a direct image URL (optional)">
            <input
              id="pm-image"
              className="input"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ borderRadius: "0.625rem" }}
            />
          </Field>

          <Field id="pm-status" label="Status">
            <select
              id="pm-status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              style={{ borderRadius: "0.625rem", cursor: "pointer" }}
            >
              <option value="draft">Draft — not visible to public</option>
              <option value="active">Active — visible in catalogue</option>
              <option value="archived">Archived — hidden from catalogue</option>
            </select>
          </Field>

          {/* Error */}
          {error && (
            <div
              style={{
                borderRadius: "0.625rem",
                backgroundColor: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                color: "var(--color-destructive)",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--border)",
              marginTop: "0.25rem",
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-[0.625rem]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-[0.625rem] min-w-[7.5rem] gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
