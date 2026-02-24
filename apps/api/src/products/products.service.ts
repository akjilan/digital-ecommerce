import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "../embedding/embedding.service";
import type { Product, Prisma } from "@prisma/client";
import type { CreateProductDto, UpdateProductDto } from "./dto/product.dto";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Map a Prisma Product row to the shape consumed by the rest of the app.
 *  The key bridge: DB column `userId` ↔ app field `ownerId`. */
function toProduct(p: Product): Product & { ownerId?: string } {
  const { userId, ...rest } = p;
  return { ...rest, userId, ownerId: userId ?? undefined };
}

export interface ProductFilters {
  q?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  type?: string;
  region?: string;
  sizes?: string[];
  colors?: string[];
  sort?: "price_asc" | "price_desc" | "newest";
}

export interface PaginatedProducts {
  data: ReturnType<typeof toProduct>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) { }

  // ── Public catalogue ─────────────────────────────────────────────────────

  async findAll(filters: ProductFilters): Promise<PaginatedProducts> {
    const {
      q,
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      inStock,
      type,
      region,
      sizes,
      colors,
      sort = "newest",
    } = filters;

    // Build the where clause dynamically
    const where: Prisma.ProductWhereInput = {
      status: "active",
    };

    // Full-text search (case-insensitive) on title + description
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // In-stock only
    if (inStock === true) {
      where.stock = { gt: 0 };
    }

    // Product type filter
    if (type && (type === "physical" || type === "digital")) {
      (where as any).type = type;
    }

    // Region filter
    if (region) {
      (where as any).region = region;
    }

    // Array filters using hasSome (matches if product has at least one of the values)
    if (sizes && sizes.length > 0) {
      (where as any).sizes = { hasSome: sizes };
    }

    if (colors && colors.length > 0) {
      (where as any).colors = { hasSome: colors };
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const skip = (page - 1) * limit;

    // Single transaction for both queries (avoids N+1)
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          price: true,
          stock: true,
          status: true,
          images: true,
          currency: true,
          type: true,
          region: true,
          sizes: true,
          colors: true,
        } as any,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: (data as any).map(toProduct),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string): Promise<ReturnType<typeof toProduct> | undefined> {
    const p = await this.prisma.product.findUnique({ where: { slug } });
    return p ? toProduct(p) : undefined;
  }

  async findById(id: string): Promise<ReturnType<typeof toProduct> | undefined> {
    const p = await this.prisma.product.findUnique({ where: { id } });
    return p ? toProduct(p) : undefined;
  }

  /** Returns all products (all statuses) owned by a specific user */
  async findByOwner(ownerId: string): Promise<ReturnType<typeof toProduct>[]> {
    const rows = await this.prisma.product.findMany({
      where: { userId: ownerId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  async create(dto: CreateProductDto, ownerId?: string): Promise<ReturnType<typeof toProduct>> {
    const slug = slugify(dto.title);
    const p = await this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        price: dto.price,
        currency: dto.currency ?? "USD",
        images: dto.images ?? [],
        stock: dto.stock ?? 0,
        status: dto.status ?? "draft",
        type: dto.type ?? "physical",
        region: dto.region ?? null,
        sizes: dto.sizes ?? [],
        colors: dto.colors ?? [],
        ...(ownerId && { userId: ownerId }),
      } as any,
    });

    return toProduct(p);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ReturnType<typeof toProduct> | undefined> {
    try {
      const p = await this.prisma.product.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title, slug: slugify(dto.title) }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.stock !== undefined && { stock: dto.stock }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.images !== undefined && { images: dto.images }),
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.region !== undefined && { region: dto.region }),
          ...(dto.sizes !== undefined && { sizes: dto.sizes }),
          ...(dto.colors !== undefined && { colors: dto.colors }),
        } as any,
      });

      return toProduct(p);
    } catch {
      return undefined;
    }
  }


  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // ── Wishlist ─────────────────────────────────────────────────────────────

  async toggleWishlist(userId: string, productId: string) {
    const existing = await (this.prisma as any).wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await (this.prisma as any).wishlist.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      await (this.prisma as any).wishlist.create({
        data: { userId, productId },
      });
      return { saved: true };
    }
  }

  async getWishlist(userId: string): Promise<ReturnType<typeof toProduct>[]> {
    const wishlistItems = await (this.prisma as any).wishlist.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return wishlistItems.map((item: any) => toProduct(item.product));
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const count = await (this.prisma as any).wishlist.count({
      where: { userId, productId },
    });
    return count > 0;
  }
}
