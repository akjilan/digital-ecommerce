/**
 * Prisma seed script — run with: pnpm exec prisma db seed
 * Upserts 15 demo products and 2 default users (idempotent).
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PRODUCTS = [
    {
        title: "Desk Mat XL",
        slug: "desk-mat-xl",
        description: "900 × 400 mm stitched desk mat with non-slip rubber base — 12 colour options.",
        price: 24.99,
        stock: 400,
        status: "active",
        images: ["https://picsum.photos/seed/mat/800/600"],
    },
];

async function main() {
    console.log("Seeding database …");

    // ── Seed users ────────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash("Admin1234!", 12);
    await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@example.com",
            password: adminHash,
            role: "admin",
        },
    });

    const userHash = await bcrypt.hash("User1234!", 12);
    await prisma.user.upsert({
        where: { email: "user@example.com" },
        update: {},
        create: {
            name: "Test User",
            email: "user@example.com",
            password: userHash,
            role: "user",
        },
    });

    console.log("✔ Users seeded");

    // ── Seed products ─────────────────────────────────────────────────────────
    for (const product of DEMO_PRODUCTS) {
        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {},
            create: { ...product, currency: "USD" },
        });
    }

    console.log(`✔ ${DEMO_PRODUCTS.length} products seeded`);
    console.log("✅ Done");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
