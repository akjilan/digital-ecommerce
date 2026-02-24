import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Groq from "groq-sdk";
import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "../embedding/embedding.service";

/* ─── Shape of a row returned by the pgvector similarity query ────────────── */
interface ProductRow {
    id: string;
    title: string;
    price: number;
    stock: number;
    description: string;
    currency: string;
    type: string;
    sizes: string[];
    colors: string[];
    distance: number;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private groq: Groq;
    private model: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        private readonly embeddingService: EmbeddingService,
    ) {
        this.groq = new Groq({
            apiKey: this.config.get<string>("GROQ_API_KEY"),
        });
        this.model = this.config.get<string>("AI_MODEL") ?? "llama-3.1-8b-instant";
    }

    async chat(message: string, userId?: string): Promise<string> {
        // ── 1. Retrieve products for context ─────────────────────────────────
        // Simplified retrieval: just get the latest 5 active products
        // (Reverted from pgvector similarity search as requested)
        const fallback = await this.prisma.product.findMany({
            where: { status: "active" },
            take: 30,
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
        });
        const products = fallback.map((p) => ({ ...p, distance: 0 }));

        // ── 3. Build compact product context block ────────────────────────────
        const formatProduct = (p: ProductRow): string => {
            const currency = p.currency ?? "USD";
            const stockLabel = p.stock > 0 ? `In stock (${p.stock})` : "Out of stock";
            const extras: string[] = [];
            if (p.type) extras.push(`Type: ${p.type}`);
            if (p.sizes?.length) extras.push(`Sizes: ${p.sizes.join(", ")}`);
            if (p.colors?.length) extras.push(`Colors: ${p.colors.join(", ")}`);
            const extraStr = extras.length ? ` | ${extras.join(" | ")}` : "";
            return `• ${p.title} — ${currency} ${p.price.toFixed(2)} | ${stockLabel}${extraStr}\n  ${p.description.slice(0, 120)}`;
        };

        const productContext =
            products.length > 0
                ? products.map(formatProduct).join("\n\n")
                : "No matching products found in catalog.";

        // ── 4. System prompt ──────────────────────────────────────────────────
        const systemPrompt = `You are a friendly, knowledgeable ecommerce AI assistant.

SEMANTICALLY RELEVANT PRODUCTS (top 5 matches for the user's query):
${productContext}

INSTRUCTIONS:
- Reference products by their EXACT name and price from the list above.
- If multiple products fit the query, briefly list them.
- If the list shows "No matching products", say so and suggest returning to browse the full catalog.
- Keep replies to 2–4 sentences. Be concise and helpful.
- NEVER invent products or prices not shown above.
- For non-product questions (shipping, returns, account help) give a short helpful answer.
- If you cannot confidently match a product, list the closest 1–2 from above rather than saying we don't carry it.`;

        // ── 5. Load recent conversation history (auth users) ─────────────────
        const history = userId
            ? await this.prisma.chatMessage.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { role: true, content: true },
            })
            : [];

        const formattedHistory = history
            .reverse()
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        // ── 6. Call Groq LLM ──────────────────────────────────────────────────
        let reply: string;
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
            reply = "I'm having trouble connecting right now. Please try again in a moment.";
        }

        // ── 7. Persist for authenticated users ────────────────────────────────
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
            take: 10,
            select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
            },
        });
    }
}
