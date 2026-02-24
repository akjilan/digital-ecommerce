import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { EmbeddingModule } from "../embedding/embedding.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, EmbeddingModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule { }
