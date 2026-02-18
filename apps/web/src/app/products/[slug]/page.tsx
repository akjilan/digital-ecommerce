import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, ShoppingCart, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/products";

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
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-muted)] aspect-square">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-20 w-20 text-[var(--color-muted-foreground)]" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Status badge */}
            <div className="mb-4">
              <Badge variant={product.stock > 10 ? "secondary" : "destructive"}>
                {product.stock > 0
                  ? product.stock > 10
                    ? "✓ In Stock"
                    : `Only ${product.stock} left`
                  : "Out of Stock"}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating placeholder */}
            <div className="flex items-center gap-1.5 mt-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-[var(--color-muted-foreground)] ml-1">
                4.8 (128 reviews)
              </span>
            </div>

            <div className="mt-6 pb-6 border-b border-[var(--color-border)]">
              <span className="text-4xl font-extrabold text-[var(--color-primary)]">
                {product.currency} {product.price.toFixed(2)}
              </span>
            </div>

            <p className="mt-6 text-[var(--color-muted-foreground)] leading-relaxed text-base">
              {product.description}
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 h-12 rounded-xl text-base font-bold"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-xl">
                Save for Later
              </Button>
            </div>

            {/* Perks */}
            <div className="mt-8 space-y-3">
              {[
                { icon: Truck, text: "Free shipping on orders over $50" },
                { icon: Package, text: "30-day hassle-free returns" },
                { icon: Star, text: "2-year manufacturer warranty" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)]"
                >
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  {text}
                </div>
              ))}
            </div>

            {/* Meta */}
            <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">SKU</span>
                <span className="font-mono font-medium">
                  {product.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Stock</span>
                <span className="font-medium">{product.stock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Currency</span>
                <span className="font-medium">{product.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
