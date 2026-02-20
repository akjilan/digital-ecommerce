-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colors" TEXT[],
ADD COLUMN     "region" TEXT,
ADD COLUMN     "sizes" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'physical';

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_region_idx" ON "Product"("region");
