import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "./dto/product.dto";
import type { RequestWithUser } from "../auth/jwt.strategy";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // ── Public endpoints ─────────────────────────────────────────────────────

  /** GET /products — paginated public catalogue with full filter support */
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "12", 10)));

    // Parse numeric filters
    const minPrice = query.minPrice !== undefined ? parseFloat(query.minPrice) : undefined;
    const maxPrice = query.maxPrice !== undefined ? parseFloat(query.maxPrice) : undefined;

    // Parse boolean
    const inStock = query.inStock === "true" ? true : undefined;

    // Parse array filters (comma-separated)
    const sizes =
      query.sizes && query.sizes.trim().length > 0
        ? query.sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

    const colors =
      query.colors && query.colors.trim().length > 0
        ? query.colors.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined;

    // Validate sort value
    const validSorts = ["price_asc", "price_desc", "newest"] as const;
    type SortType = (typeof validSorts)[number];
    const sort: SortType = validSorts.includes(query.sort as SortType)
      ? (query.sort as SortType)
      : "newest";

    return this.productsService.findAll({
      q: query.q,
      page,
      limit,
      minPrice: !isNaN(minPrice as number) ? minPrice : undefined,
      maxPrice: !isNaN(maxPrice as number) ? maxPrice : undefined,
      inStock,
      type: query.type,
      region: query.region,
      sizes,
      colors,
      sort,
    });
  }

  // ── Protected / fixed-path endpoints (must come BEFORE :slug / :id) ──────

  /**
   * GET /products/mine
   * Returns all products (all statuses) created by the authenticated user.
   * MUST be before ":slug" so Express doesn't treat "mine" as a slug.
   */
  @UseGuards(JwtAuthGuard)
  @Get("mine")
  findMine(@Request() req: RequestWithUser) {
    return this.productsService.findByOwner(req.user.id);
  }

  /**
   * GET /products/wishlist
   * Returns the signed-in user's saved products.
   * MUST be before ":slug" so Express doesn't treat "wishlist" as a slug.
   */
  @UseGuards(JwtAuthGuard)
  @Get("wishlist")
  async getWishlist(@Request() req: RequestWithUser) {
    return this.productsService.getWishlist(req.user.id);
  }

  // ── Dynamic :slug / :id endpoints ────────────────────────────────────────

  /** GET /products/:slug — single product detail (public) */
  @Get(":slug")
  async findOne(@Param("slug") slug: string) {
    const product = await this.productsService.findBySlug(slug);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  /**
   * GET /products/:id/wishlist — check if product is in wishlist
   * Nested under :id so it doesn't conflict with the top-level /wishlist route.
   */
  @UseGuards(JwtAuthGuard)
  @Get(":id/wishlist")
  async checkWishlist(@Request() req: RequestWithUser, @Param("id") id: string) {
    const isSaved = await this.productsService.isInWishlist(req.user.id, id);
    return { isSaved };
  }

  /**
   * POST /products
   * Any authenticated user can create a product.
   * The product's ownerId is automatically set to the caller's user id.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: RequestWithUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(dto, req.user.id);
  }

  /**
   * POST /products/:id/wishlist — toggle save status
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/wishlist")
  @HttpCode(HttpStatus.OK)
  async toggleWishlist(@Request() req: RequestWithUser, @Param("id") id: string) {
    return this.productsService.toggleWishlist(req.user.id, id);
  }

  /**
   * PATCH /products/:id
   * Owner or admin can update. Uses id (not slug) for reliable lookup.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(
    @Request() req: RequestWithUser,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const product = await this.productsService.findById(id);
    if (!product) throw new NotFoundException("Product not found");

    const isOwner = product.ownerId === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) throw new ForbiddenException("Not allowed");

    return this.productsService.update(id, dto);
  }

  /**
   * DELETE /products/:id
   * Owner or admin can delete.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: RequestWithUser, @Param("id") id: string) {
    const product = await this.productsService.findById(id);
    if (!product) throw new NotFoundException("Product not found");

    const isOwner = product.ownerId === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) throw new ForbiddenException("Not allowed");

    await this.productsService.delete(id);
  }
}
