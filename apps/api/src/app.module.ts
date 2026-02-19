import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { AdminController } from "./admin/admin.controller";
import { SeedModule } from "./seed/seed.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    SeedModule,
  ],
  controllers: [AppController, AdminController],
  providers: [],
})
export class AppModule { }

