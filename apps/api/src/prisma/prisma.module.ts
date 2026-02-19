import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/** Declared global so every feature module can inject PrismaService
 *  without importing PrismaModule explicitly. */
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
