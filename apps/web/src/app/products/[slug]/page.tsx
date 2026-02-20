import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Star,
  Truck,
  ShieldCheck,
  Globe,
  Tag,
  LayoutGrid,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/products";
import { ProductOptions } from "./ProductOptions";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const stockLabel =
    product.stock === 0
      ? "Out of Stock"
      : product.stock <= 10
        ? `Only ${product.stock} left`
        : "In Stock";

  const stockVariant =
    product.stock === 0 ? "destructive" : product.stock <= 10 ? "outline" : "secondary";

  // Build "details" rows for the info grid
  const details: { label: string; value: string; icon: React.ElementType }[] = [
    {
      label: "Type",
      value: product.type === "digital" ? "Digital" : "Physical",
      icon: product.type === "digital" ? Monitor : Package,
    },
    { label: "SKU", value: product.id.slice(0, 8).toUpperCase(), icon: Tag },
    { label: "Stock", value: `${product.stock} units`, icon: LayoutGrid },
    { label: "Currency", value: product.currency, icon: Globe },
    ...(product.region ? [{ label: "Region", value: product.region, icon: Globe }] : []),
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 md:py-12">
      <div className="container">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2 rounded-xl">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Image panel ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl overflow-hidden border aspect-square"
              style={{
                borderColor: "var(--border)",
                background: "var(--muted)",
              }}
            >
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-20 w-20" style={{ color: "var(--muted-fg)" }} />
                </div>
              )}
            </div>

            {/* Thumbnail strip (additional images) */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((src, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border overflow-hidden shrink-0 w-20 h-20"
                    style={{ borderColor: "var(--border)", background: "var(--muted)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Details panel ───────────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant={stockVariant}>{stockLabel}</Badge>
              <Badge variant="outline" className="capitalize">
                {product.type}
              </Badge>
              {product.region && (
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  {product.region}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-1.5 mt-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm ml-1" style={{ color: "var(--muted-fg)" }}>
                4.8 (128 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-4xl font-extrabold" style={{ color: "var(--color-primary)" }}>
                {product.currency} {product.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <p className="mt-6 leading-relaxed text-base" style={{ color: "var(--muted-fg)" }}>
              {product.description}
            </p>

            {/* Interactive: colours, sizes, CTA — client component */}
            <div className="mt-8">
              <ProductOptions
                productId={product.id}
                sizes={product.sizes ?? []}
                colors={product.colors ?? []}
                stock={product.stock}
              />
            </div>

            {/* Perks */}
            <div className="mt-8 space-y-3">
              {[
                { icon: Truck, text: "Free shipping on orders over $50" },
                { icon: ShieldCheck, text: "30-day hassle-free returns" },
                { icon: Star, text: "2-year manufacturer warranty" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--muted-fg)" }}
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                  </div>
                  {text}
                </div>
              ))}
            </div>

            {/* Product Details grid */}
            <div
              className="mt-8 rounded-2xl border p-5"
              style={{
                borderColor: "var(--border)",
                background: "color-mix(in srgb, var(--muted) 40%, transparent)",
              }}
            >
              <h3
                className="text-sm font-semibold mb-4 tracking-wide uppercase"
                style={{ color: "var(--muted-fg)" }}
              >
                Product Details
              </h3>
              <div className="space-y-3">
                {details.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--muted-fg)" }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
