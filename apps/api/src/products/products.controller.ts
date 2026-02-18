import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "./dto/product.dto";
import type { RequestWithUser } from "../auth/jwt.strategy";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "12", 10)));
    return this.productsService.findAll(query.q, page, limit);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    const product = this.productsService.findBySlug(slug);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: RequestWithUser, @Body() dto: CreateProductDto) {
    if (req.user.role !== "admin") throw new ForbiddenException("Admin only");
    return this.productsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Request() req: RequestWithUser, @Param("id") id: string, @Body() dto: UpdateProductDto) {
    if (req.user.role !== "admin") throw new ForbiddenException("Admin only");
    const updated = this.productsService.update(id, dto);
    if (!updated) throw new NotFoundException("Product not found");
    return updated;
  }
}
