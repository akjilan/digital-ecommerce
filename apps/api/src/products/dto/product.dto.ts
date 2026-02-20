// ─── Product DTOs ─────────────────────────────────────────────────────────────

export class CreateProductDto {
  title!: string;
  description!: string;
  price!: number;
  currency?: string;
  images?: string[];
  stock?: number;
  status?: "active" | "draft" | "archived";
  type?: "physical" | "digital";
  region?: string;
  sizes?: string[];
  colors?: string[];
}

export class UpdateProductDto {
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

export class ProductQueryDto {
  /** Full-text search on title + description */
  q?: string;
  page?: string;
  limit?: string;
  /** Minimum price filter */
  minPrice?: string;
  /** Maximum price filter */
  maxPrice?: string;
  /** "true" = only in-stock products */
  inStock?: string;
  /** physical | digital */
  type?: string;
  /** US | EU | Asia */
  region?: string;
  /** Comma-separated sizes, e.g. "S,M,L" */
  sizes?: string;
  /** Comma-separated colors, e.g. "Black,White" */
  colors?: string;
  /** price_asc | price_desc | newest */
  sort?: string;
}
