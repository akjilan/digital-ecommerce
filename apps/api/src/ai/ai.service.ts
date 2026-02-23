import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Groq from "groq-sdk";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private groq: Groq;
    private model: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        this.groq = new Groq({
            apiKey: this.config.get<string>("GROQ_API_KEY"),
        });
        this.model = this.config.get<string>("AI_MODEL") ?? "llama-3.1-8b-instant";
    }

    async chat(message: string, userId?: string): Promise<string> {
        // ── 1. Load FULL active product catalog (up to 60 products) ──────────
        // We intentionally load all active products so the LLM can reason
        // semantically — e.g. "smart watch" → "Fitness Tracker".
        // We use a two-layer query: keyword-matched products rise to the top
        // so they appear first in the prompt, then we append the rest.
        const [matched, all] = await Promise.all([
            // Keyword match — loose, so at least something shows first
            this.prisma.product.findMany({
                where: {
                    status: "active",
                    OR: [
                        { title: { contains: message.slice(0, 40), mode: "insensitive" } },
                        { description: { contains: message.slice(0, 40), mode: "insensitive" } },
                    ],
                },
                take: 10,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    stock: true,
                    description: true,
                    currency: true,
                    type: true,
                    sizes: true,
                    colors: true,
                },
            }),
            // Full catalog — always loaded regardless of search term
            this.prisma.product.findMany({
                where: { status: "active" },
                take: 25,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    stock: true,
                    description: true,
                    currency: true,
                    type: true,
                    sizes: true,
                    colors: true,
                },
            }),
        ]);

        // Deduplicate: matched products first, then the rest
        const matchedIds = new Set(matched.map((p) => p.id));
        const remaining = all.filter((p) => !matchedIds.has(p.id));
        const products = [...matched, ...remaining].slice(0, 20);

        // ── 2. Build product catalog block ────────────────────────────────────
        const formatProduct = (p: (typeof products)[0]) => {
            const currency = p.currency ?? "USD";
            const stockLabel = p.stock > 0 ? `In stock (${p.stock})` : "Out of stock";
            const extras: string[] = [];
            if (p.type) extras.push(`Type: ${p.type}`);
            if (p.sizes?.length) extras.push(`Sizes: ${p.sizes.join(", ")}`);
            if (p.colors?.length) extras.push(`Colors: ${p.colors.join(", ")}`);
            const extraStr = extras.length ? ` | ${extras.join(" | ")}` : "";
            return `• ${p.title} — ${currency} ${p.price.toFixed(2)} | ${stockLabel}${extraStr}\n  ${p.description.slice(0, 120)}`;
        };

        const catalogBlock =
            products.length > 0
                ? products.map(formatProduct).join("\n\n")
                : "No products currently in the catalog.";

        // ── 3. System prompt ──────────────────────────────────────────────────
        const systemPrompt = `You are a friendly, knowledgeable ecommerce AI assistant for our online store.

PRODUCT CATALOG (complete list of all active products):
${catalogBlock}

INSTRUCTIONS:
- ALWAYS check the product catalog above before saying we don't carry something.
- Use semantic reasoning — "smart watch" matches "Fitness Tracker", "running shoes" matches "Athletic Sneakers", etc.
- When a product exists, mention its EXACT name and price from the catalog.
- If multiple products are relevant, list them briefly.
- If something truly is not in the catalog, say so and suggest the closest match from the catalog.
- Keep responses concise (2–4 sentences max) and helpful.
- NEVER invent products or prices not in the catalog above.
- For non-product questions (shipping, returns, etc.) give a short, helpful answer.
- If you cannot confidently match a product, prefer listing the top 2 closest products from the catalog rather than saying we don't carry it.`;

        // ── 4. Call Groq ──────────────────────────────────────────────────────
        let reply: string;
        const history = userId
            ? await this.prisma.chatMessage.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 6,
            })
            : [];

        const formattedHistory = history.reverse().map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));
        try {
            const completion = await this.groq.chat.completions.create({
                model: this.model,
                temperature: 0.4,
                max_tokens: 400,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...formattedHistory,
                    { role: "user", content: message },
                ],
            });
            reply =
                completion.choices[0]?.message?.content?.trim() ??
                "I'm sorry, I couldn't process that request. Please try again.";
        } catch (err) {
            this.logger.error("Groq API error", err);
            reply = "I'm having trouble connecting to the AI right now. Please try again in a moment.";
        }

        // ── 5. Persist for authenticated users ────────────────────────────────
        if (userId) {
            await this.prisma.chatMessage.createMany({
                data: [
                    { userId, role: "user", content: message },
                    { userId, role: "assistant", content: reply },
                ],
            });
        }

        return reply;
    }

    async getHistory(userId: string) {
        return this.prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
            take: 20,
            select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
            },
        });
    }
}
