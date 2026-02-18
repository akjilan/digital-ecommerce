"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} style={{ display: "block", textDecoration: "none" }}>
      <article
        className="card"
        style={{
          overflow: "hidden",
          transition: "transform 0.2s, box-shadow 0.2s",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        }}
      >
        {/* Image */}
        <div
          style={{
            aspectRatio: "4/3",
            overflow: "hidden",
            backgroundColor: "var(--muted-bg)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0] ?? `https://picsum.photos/seed/${product.id}/800/600`}
            alt={product.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.35s",
            }}
          />
        </div>

        {/* Body */}
        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <h3
            style={{
              fontWeight: 600,
              fontSize: "0.9375rem",
              lineHeight: 1.4,
              color: "var(--fg)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.title}
          </h3>

          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--muted-fg)",
              marginTop: "0.375rem",
              flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--color-primary)",
              }}
            >
              ${product.price.toFixed(2)}
            </span>
            <Badge variant={product.stock > 10 ? "secondary" : "destructive"}>
              {product.stock > 10 ? "In Stock" : `${product.stock} left`}
            </Badge>
          </div>
        </div>
      </article>
    </Link>
  );
}
