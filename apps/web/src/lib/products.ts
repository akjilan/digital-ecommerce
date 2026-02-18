const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    stock: number;
    status: "active" | "draft" | "archived";
    createdAt: string;
}

export interface ProductsResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
}

export async function getProducts(params?: {
    q?: string;
    page?: number;
    limit?: number;
}): Promise<ProductsResponse> {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetch(`${BASE}/products?${query.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json() as Promise<ProductsResponse>;
}

export async function getProductBySlug(slug: string): Promise<Product> {
    const res = await fetch(`${BASE}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Product not found");
    return res.json() as Promise<Product>;
}
