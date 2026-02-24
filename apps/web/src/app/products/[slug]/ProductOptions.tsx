"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "./SaveButton";

interface ProductOptionsProps {
  productId: string;
  sizes: string[];
  colors: string[];
  stock: number;
}

export function ProductOptions({ productId, sizes, colors, stock }: ProductOptionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);

  return (
    <div className="space-y-6">
      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold tracking-wide" style={{ color: "var(--fg)" }}>
              Colour
            </span>
            {selectedColor && (
              <span className="text-sm" style={{ color: "var(--muted-fg)" }}>
                {selectedColor}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150"
                  style={{
                    borderColor: isSelected ? "var(--color-primary)" : "var(--border)",
                    background: isSelected
                      ? "color-mix(in srgb, var(--color-primary) 10%, transparent)"
                      : "var(--card)",
                    color: isSelected ? "var(--color-primary)" : "var(--muted-fg)",
                    fontWeight: isSelected ? 700 : 500,
                    boxShadow: isSelected ? "0 0 0 1.5px var(--color-primary)" : undefined,
                  }}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold tracking-wide" style={{ color: "var(--fg)" }}>
              Size
            </span>
            {selectedSize && (
              <span className="text-sm" style={{ color: "var(--muted-fg)" }}>
                {selectedSize}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="min-w-[3rem] px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150"
                  style={{
                    borderColor: isSelected ? "var(--color-primary)" : "var(--border)",
                    background: isSelected
                      ? "color-mix(in srgb, var(--color-primary) 10%, transparent)"
                      : "var(--card)",
                    color: isSelected ? "var(--color-primary)" : "var(--muted-fg)",
                    fontWeight: isSelected ? 700 : 500,
                    boxShadow: isSelected ? "0 0 0 1.5px var(--color-primary)" : undefined,
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          size="lg"
          className="flex-1 h-12 rounded-xl text-base font-bold"
          disabled={stock === 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
        <SaveButton productId={productId} />
      </div>
    </div>
  );
}
