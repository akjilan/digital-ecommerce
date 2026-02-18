export class CreateProductDto {
  title!: string;
  description!: string;
  price!: number;
  currency?: string;
  images?: string[];
  stock?: number;
  status?: "active" | "draft" | "archived";
}

export class UpdateProductDto {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  status?: "active" | "draft" | "archived";
}

export class ProductQueryDto {
  q?: string;
  page?: string;
  limit?: string;
}
