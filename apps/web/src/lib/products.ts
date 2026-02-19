// ─── Types ────────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface Product {
    id: string;
    ownerId?: string;
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

export interface CreateProductPayload {
    title: string;
    description: string;
    price: number;
    stock?: number;
    status?: "active" | "draft" | "archived";
    images?: string[];
    currency?: string;
}

export interface UpdateProductPayload {
    title?: string;
    description?: string;
    price?: number;
    stock?: number;
    status?: "active" | "draft" | "archived";
    images?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders(token: string): Record<string, string> {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

async function handleResponse<T>(res: Response): Promise<T> {
    const data = await res.json();
    if (!res.ok) {
        throw new Error((data as { message?: string }).message ?? "Request failed");
    }
    return data as T;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch paginated public product catalogue (active products only) */
export async function getProducts(params?: {
    q?: string;
    page?: number;
    limit?: number;
}): Promise<ProductsResponse> {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetch(`${BASE}/products?${query.toString()}`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json() as Promise<ProductsResponse>;
}

/** Fetch a single product by slug */
export async function getProductBySlug(slug: string): Promise<Product> {
    const res = await fetch(`${BASE}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Product not found");
    return res.json() as Promise<Product>;
}

// ─── Authenticated API ────────────────────────────────────────────────────────

/** Fetch all products created by the authenticated user (all statuses) */
export async function getMyProducts(token: string): Promise<Product[]> {
    const res = await fetch(`${BASE}/products/mine`, {
        headers: authHeaders(token),
        cache: "no-store",
    });
    return handleResponse<Product[]>(res);
}

/** Create a new product owned by the authenticated user */
export async function createProduct(
    token: string,
    payload: CreateProductPayload,
): Promise<Product> {
    const res = await fetch(`${BASE}/products`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
    return handleResponse<Product>(res);
}

/** Update an existing product (owner or admin only) */
export async function updateProduct(
    token: string,
    id: string,
    payload: UpdateProductPayload,
): Promise<Product> {
    const res = await fetch(`${BASE}/products/${id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
    return handleResponse<Product>(res);
}

/** Delete a product (owner or admin only) */
export async function deleteProduct(token: string, id: string): Promise<void> {
    const res = await fetch(`${BASE}/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { message?: string }).message ?? "Delete failed");
    }
}
