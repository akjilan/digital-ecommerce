/// <reference types="node" />
/**
 * scripts/generate-product-embeddings.ts
 *
 * Standalone script — generates 384-dim sentence embeddings for every active
 * product and saves them via raw SQL UPDATE (pgvector format).
 *
 * Run from apps/api/:
 *   npx ts-node --project tsconfig.scripts.json scripts/generate-product-embeddings.ts
 *
 * Or via the package.json script:
 *   pnpm --filter @ecommerce/api embed:products
 */
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import { PrismaClient } from "@prisma/client";
import { HfInference } from "@huggingface/inference";

const prisma = new PrismaClient();
const hf = new HfInference(process.env["HF_TOKEN"]); // optional token
const MODEL = "sentence-transformers/all-MiniLM-L6-v2";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function meanPool(matrix: number[][]): number[] {
    if (matrix.length === 0) return [];
    const dims = matrix[0].length;
    const sum = new Array<number>(dims).fill(0);
    for (const row of matrix) {
        for (let i = 0; i < dims; i++) sum[i] += row[i];
    }
    return sum.map((v) => v / matrix.length);
}

async function embed(text: string): Promise<number[]> {
    const input = text.slice(0, 1000).trim();
    const result = await hf.featureExtraction({ model: MODEL, inputs: input });

    if (Array.isArray(result) && Array.isArray(result[0])) {
        return meanPool(result as number[][]);
    }
    return result as number[];
}

function toVectorLiteral(vec: number[]): string {
    return `[${vec.join(",")}]`;
}

/* ── Main ─────────────────────────────────────────────────────────────────── */

async function main() {
    // Ensure pgvector extension is enabled
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("✔ pgvector extension enabled\n");

    const products = await prisma.product.findMany({
        select: { id: true, title: true, description: true },
    });

    console.log(`🔢 Generating embeddings for ${products.length} products...\n`);

    let success = 0;
    let failed = 0;

    for (const product of products) {
        const text = `${product.title}. ${product.description}`;
        try {
            const vec = await embed(text);
            const literal = toVectorLiteral(vec);

            await prisma.$executeRawUnsafe(
                `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
                literal,
                product.id,
            );

            success++;
            console.log(`  ✅ [${success}/${products.length}] ${product.title}`);
        } catch (err) {
            failed++;
            const msg = err instanceof Error ? err.message : String(err);
            console.log(`  ❌ Failed: ${product.title} — ${msg}`);
        }

        // Small delay to respect HF free-tier rate limits
        await new Promise<void>((r) => setTimeout(r, 350));
    }

    console.log(`\n✨ Done — ${success} succeeded, ${failed} failed.\n`);
}

main()
    .catch((err) => {
        console.error("Fatal:", err);
        process.exit(1);
    })
    .finally(() => void prisma.$disconnect());
