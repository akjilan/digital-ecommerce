// ─── Product DTOs ─────────────────────────────────────────────────────────────
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  IsArray,
  IsEnum,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { Type, Transform } from "class-transformer";

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsIn(["active", "draft", "archived"])
  status?: "active" | "draft" | "archived";

  @IsOptional()
  @IsIn(["physical", "digital"])
  type?: "physical" | "digital";

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsIn(["active", "draft", "archived"])
  status?: "active" | "draft" | "archived";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsIn(["physical", "digital"])
  type?: "physical" | "digital";

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];
}

export class ProductQueryDto {
  /** Full-text search on title + description */
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  /** Minimum price filter */
  @IsOptional()
  @IsString()
  minPrice?: string;

  /** Maximum price filter */
  @IsOptional()
  @IsString()
  maxPrice?: string;

  /** "true" = only in-stock products */
  @IsOptional()
  @IsString()
  inStock?: string;

  /** physical | digital */
  @IsOptional()
  @IsString()
  type?: string;

  /** US | EU | Asia */
  @IsOptional()
  @IsString()
  region?: string;

  /** Comma-separated sizes, e.g. "S,M,L" */
  @IsOptional()
  @IsString()
  sizes?: string;

  /** Comma-separated colors, e.g. "Black,White" */
  @IsOptional()
  @IsString()
  colors?: string;

  /** price_asc | price_desc | newest */
  @IsOptional()
  @IsString()
  sort?: string;
}
