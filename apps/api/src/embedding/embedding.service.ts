import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HfInference } from "@huggingface/inference";

/**
 * EmbeddingService
 *
 * Generates 384-dimensional sentence embeddings using
 * HuggingFace's all-MiniLM-L6-v2 model via the Inference API.
 *
 * - No OpenAI key required.
 * - HF_TOKEN is optional (rate-limited but works without one for low traffic).
 * - Model: sentence-transformers/all-MiniLM-L6-v2 → 384-dim vectors.
 */
@Injectable()
export class EmbeddingService {
    private readonly logger = new Logger(EmbeddingService.name);
    private readonly hf: HfInference;
    private readonly MODEL = "sentence-transformers/all-MiniLM-L6-v2";

    constructor(private readonly config: ConfigService) {
        const token = this.config.get<string>("HF_TOKEN"); // optional
        this.hf = new HfInference(token);
    }

    /**
     * Generate a 384-dimensional embedding vector for the given text.
     * Uses mean-pooling over all token embeddings (standard for sentence transformers).
     */
    async generateEmbedding(text: string): Promise<number[]> {
        // Truncate to avoid exceeding the model's 512-token context window
        const input = text.slice(0, 1000).trim();

        const result = await this.hf.featureExtraction({
            model: this.MODEL,
            inputs: input,
        });

        // featureExtraction can return number[] or number[][]
        // For a single input string it returns number[][] (tokens × dims) or number[] (pooled)
        // We always want a flat 384-dim vector
        if (Array.isArray(result) && Array.isArray(result[0])) {
            // 2D: shape [tokens, 384] — mean-pool over tokens
            return this.meanPool(result as number[][]);
        }

        // Already 1D pooled — return directly
        return result as number[];
    }

    /** Mean-pool a 2D matrix [tokens × dims] → 1D [dims] */
    private meanPool(matrix: number[][]): number[] {
        if (matrix.length === 0) return [];
        const dims = matrix[0].length;
        const sum = new Array<number>(dims).fill(0);
        for (const row of matrix) {
            for (let i = 0; i < dims; i++) {
                sum[i] += row[i];
            }
        }
        return sum.map((v) => v / matrix.length);
    }
}
