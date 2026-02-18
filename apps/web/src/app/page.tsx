import Link from "next/link";
import { ArrowRight, ShoppingBag, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Badge variant="secondary" className="mb-4">
          🚀 Now in Beta
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          The Modern <span className="text-primary">E-Commerce</span> Platform
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
          Discover premium tech products. Fast, secure, and beautifully designed for the modern
          shopper.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/products">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Shop Now
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/register">Get Started Free</Link>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2 bg-background/80 border border-border rounded-full px-4 py-2">
            <Zap className="h-4 w-4 text-primary" /> Fast Delivery
          </div>
          <div className="flex items-center gap-2 bg-background/80 border border-border rounded-full px-4 py-2">
            <Shield className="h-4 w-4 text-primary" /> Secure Checkout
          </div>
          <div className="flex items-center gap-2 bg-background/80 border border-border rounded-full px-4 py-2">
            <ShoppingBag className="h-4 w-4 text-primary" /> 15+ Products
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Handpicked for you</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Start the API server to see featured products.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-video overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images[0] ?? "https://picsum.photos/800/600"}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                        {product.stock > 10 ? "In Stock" : `${product.stock} left`}
                      </Badge>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
