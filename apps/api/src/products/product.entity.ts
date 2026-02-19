export interface Product {
  id: string;
  /** undefined = system-seeded product (no owner) */
  ownerId?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  stock: number;
  status: "active" | "draft" | "archived";
  createdAt: Date;
}

export type PublicProduct = Product;

