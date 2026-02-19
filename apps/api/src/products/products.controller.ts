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

  /** GET /products — paginated public catalogue (active only) */
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "12", 10)));
    return this.productsService.findAll(query.q, page, limit);
  }

  // ── Protected endpoints ──────────────────────────────────────────────────

  /**
   * GET /products/mine
   * Returns all products (all statuses) created by the authenticated user.
   * Must be defined BEFORE ":slug" so Express doesn't treat "mine" as a slug.
   */
  @UseGuards(JwtAuthGuard)
  @Get("mine")
  findMine(@Request() req: RequestWithUser) {
    return this.productsService.findByOwner(req.user.id);
  }

  /** GET /products/:slug — single product detail (public) */
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    const product = this.productsService.findBySlug(slug);
    if (!product) throw new NotFoundException("Product not found");
    return product;
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
   * PATCH /products/:id
   * Owner or admin can update. Uses id (not slug) for reliable lookup.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Request() req: RequestWithUser,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const product = this.productsService.findById(id);
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
  remove(@Request() req: RequestWithUser, @Param("id") id: string) {
    const product = this.productsService.findById(id);
    if (!product) throw new NotFoundException("Product not found");

    const isOwner = product.ownerId === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) throw new ForbiddenException("Not allowed");

    this.productsService.delete(id);
  }
}
