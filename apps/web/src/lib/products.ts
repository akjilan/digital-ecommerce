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
    type: "physical" | "digital";
    region?: string;
    sizes: string[];
    colors: string[];
    createdAt: string;
}

export interface ProductsResponse {
    data: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type SortOption = "newest" | "price_asc" | "price_desc";

export interface ProductFilters {
    q?: string;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    type?: "physical" | "digital" | "";
    region?: string;
    sizes?: string[];
    colors?: string[];
    sort?: SortOption;
}

export interface CreateProductPayload {
    title: string;
    description: string;
    price: number;
    stock?: number;
    status?: "active" | "draft" | "archived";
    images?: string[];
    currency?: string;
    type?: "physical" | "digital";
    region?: string;
    sizes?: string[];
    colors?: string[];
}

export interface UpdateProductPayload {
    title?: string;
    description?: string;
    price?: number;
    stock?: number;
    status?: "active" | "draft" | "archived";
    images?: string[];
    type?: "physical" | "digital";
    region?: string;
    sizes?: string[];
    colors?: string[];
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

/** Fetch paginated public product catalogue with full filter support */
export async function getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const query = new URLSearchParams();
    if (filters?.q) query.set("q", filters.q);
    if (filters?.page) query.set("page", String(filters.page));
    if (filters?.limit) query.set("limit", String(filters.limit));
    if (filters?.minPrice !== undefined) query.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined) query.set("maxPrice", String(filters.maxPrice));
    if (filters?.inStock) query.set("inStock", "true");
    if (filters?.type) query.set("type", filters.type);
    if (filters?.region) query.set("region", filters.region);
    if (filters?.sizes?.length) query.set("sizes", filters.sizes.join(","));
    if (filters?.colors?.length) query.set("colors", filters.colors.join(","));
    if (filters?.sort) query.set("sort", filters.sort);

    const res = await fetch(`${BASE}/products?${query.toString()}`, {
        cache: "no-store",
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
