"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0] ?? `https://picsum.photos/seed/${product.id}/800/600`}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="">
          <div className="flex flex-1 flex-col px-5 py-5 gap-2">
            {/* Title */}
            <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
              {product.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
              <span className="text-xl font-extrabold text-primary tracking-tight">
                ${product.price.toFixed(2)}
              </span>
              <Badge variant={product.stock > 10 ? "secondary" : "destructive"}>
                {product.stock > 10 ? "In Stock" : `${product.stock} left`}
              </Badge>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 rounded-full w-3/4 bg-muted" />
        <div className="h-3 rounded-full w-full bg-muted" />
        <div className="h-3 rounded-full w-2/3 bg-muted" />
        <div className="flex justify-between items-center pt-3 mt-1 border-t border-border">
          <div className="h-5 rounded-full w-16 bg-muted" />
          <div className="h-5 rounded-full w-14 bg-muted" />
        </div>
      </div>
    </div>
  );
}
