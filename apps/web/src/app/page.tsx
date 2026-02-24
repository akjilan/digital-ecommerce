import Link from "next/link";
import { ArrowRight, ShoppingBag, Zap, Shield, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
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
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          textAlign: "center",
        }}
      >
        {/* Gradient blob */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.12), transparent)",
            pointerEvents: "none",
          }}
        />

        <div className="container">
          {/* Pill badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "9999px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg)",
              padding: "0.375rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--muted-fg)",
              marginBottom: "2rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "9999px",
                backgroundColor: "var(--color-primary)",
                animation: "pulse 2s infinite",
              }}
            />
            Now in Beta — Free to use
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "48rem",
              margin: "0 auto",
              color: "var(--fg)",
            }}
          >
            Shop the Future of <br />
            <span
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              E-Commerce
            </span>
          </h1>

          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "1.125rem",
              color: "var(--muted-fg)",
              maxWidth: "36rem",
              marginInline: "auto",
              lineHeight: 1.7,
            }}
          >
            Discover premium tech products curated for modern professionals. Fast shipping, secure
            payments, and an experience you&apos;ll love.
          </p>

          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <Link href="/products" className="btn btn-primary btn-lg">
              <ShoppingBag style={{ width: "1.25rem", height: "1.25rem" }} />
              Shop Now
            </Link>
            <Link href="/auth/register" className="btn btn-outline btn-lg">
              Create Free Account
              <ArrowRight style={{ width: "1rem", height: "1rem" }} />
            </Link>
          </div>

          {/* Trust badges */}
          <div
            style={{
              marginTop: "3.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            {[
              { icon: Zap, label: "Fast Delivery" },
              { icon: Shield, label: "Secure Checkout" },
              { icon: Star, label: "Top Rated" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  padding: "0.625rem 1.125rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Icon style={{ width: "1rem", height: "1rem", color: "var(--color-primary)" }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--muted-bg)",
          padding: "2rem 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
              textAlign: "center",
            }}
          >
            {[
              { value: "15+", label: "Products" },
              { value: "100%", label: "Secure" },
              { value: "24/7", label: "Support" },
              { value: "Free", label: "Returns" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "var(--color-primary)",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{ fontSize: "0.875rem", color: "var(--muted-fg)", marginTop: "0.375rem" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <Badge variant="secondary" style={{ marginBottom: "0.75rem" }}>
                Featured
              </Badge>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--fg)",
                }}
              >
                Handpicked for You
              </h2>
              <p style={{ color: "var(--muted-fg)", marginTop: "0.375rem" }}>
                Our most popular products this week
              </p>
            </div>
            <Link href="/products" className="btn btn-outline btn-sm">
              View all <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div
              style={{
                borderRadius: "1rem",
                border: "2px dashed var(--border)",
                padding: "6rem 2rem",
                textAlign: "center",
              }}
            >
              <ShoppingBag
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  color: "var(--muted-fg)",
                  margin: "0 auto 1rem",
                }}
              />
              <p style={{ color: "var(--muted-fg)", fontWeight: 500 }}>
                Start the API server to see products
              </p>
              <Link
                href="/products"
                className="btn btn-outline btn-sm"
                style={{ marginTop: "1rem" }}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section style={{ padding: "0 0 5rem" }}>
        <div className="container">
          <div
            style={{
              borderRadius: "1.5rem",
              padding: "4rem 2rem",
              textAlign: "center",
              background: "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
              color: "#fff",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 800,
                marginBottom: "1rem",
              }}
            >
              Ready to start shopping?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "1.0625rem",
                marginBottom: "2rem",
                maxWidth: "28rem",
                marginInline: "auto",
              }}
            >
              Create a free account and get access to exclusive deals and early product launches.
            </p>
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}
            >
              <Link
                href="/auth/register"
                className="btn btn-lg"
                style={{ backgroundColor: "#fff", color: "var(--color-primary)", fontWeight: 700 }}
              >
                Get Started Free
              </Link>
              <Link
                href="/products"
                className="btn btn-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                }}
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
