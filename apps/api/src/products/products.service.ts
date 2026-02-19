import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Product } from "@prisma/client";
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

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  // ── Public catalogue ─────────────────────────────────────────────────────

  async findAll(
    q?: string,
    page = 1,
    limit = 12,
  ): Promise<{ data: ReturnType<typeof toProduct>[]; total: number; page: number; limit: number }> {
    const where = {
      status: "active",
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: data.map(toProduct), total, page, limit };
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
        ...(ownerId && { userId: ownerId }),
      },
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
        },
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
}
