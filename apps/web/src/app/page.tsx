import Link from "next/link";
import { ArrowRight, ShoppingBag, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProducts, type Product } from "@/lib/products";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data } = await getProducts({ limit: 6 });
    return data;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent)",
          }}
        />

        <div className="container py-20 md:py-28 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-1.5 text-sm font-medium text-[var(--color-muted-foreground)] mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]" />
            </span>
            Now in Beta — Free to use
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Shop the Future of{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--color-primary), #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              E-Commerce
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[var(--color-muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Discover premium tech products curated for modern professionals. Fast shipping, secure
            payments, and an experience you&apos;ll love.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl shadow-lg">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-xl">
              <Link href="/auth/register">
                Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-14 flex flex-wrap gap-6 justify-center">
            {[
              { icon: Zap, label: "Fast Delivery" },
              { icon: Shield, label: "Secure Checkout" },
              { icon: Star, label: "Top Rated" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm font-medium shadow-sm"
              >
                <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-muted)]/40">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "15+", label: "Products" },
              { value: "100%", label: "Secure" },
              { value: "24/7", label: "Support" },
              { value: "Free", label: "Returns" },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <div className="text-3xl font-extrabold text-[var(--color-primary)]">{value}</div>
                <div className="text-sm text-[var(--color-muted-foreground)]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">
                Featured
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Handpicked for You</h2>
              <p className="text-[var(--color-muted-foreground)] mt-2">
                Our most popular products this week
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/products">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-24 text-center">
              <ShoppingBag className="h-10 w-10 text-[var(--color-muted-foreground)] mx-auto mb-3" />
              <p className="text-[var(--color-muted-foreground)] font-medium">
                Start the API server to see products
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1.5 line-clamp-2 flex-1">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
                        <span className="text-xl font-bold text-[var(--color-primary)]">
                          ${product.price.toFixed(2)}
                        </span>
                        <Badge variant={product.stock > 10 ? "secondary" : "destructive"}>
                          {product.stock > 10 ? "In Stock" : `${product.stock} left`}
                        </Badge>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/products">
                View all products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container">
          <div
            className="rounded-3xl p-10 md:p-16 text-center text-white"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), #7c3aed)",
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start shopping?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Create a free account and get access to exclusive deals and early product launches.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-[var(--color-primary)] hover:bg-white/90 h-12 px-8 rounded-xl font-bold"
              >
                <Link href="/auth/register">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 text-white hover:bg-white/10 h-12 px-8 rounded-xl"
              >
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
