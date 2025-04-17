import { pipeline } from '@xenova/transformers';

export class EmbeddingService {
    private static instance: EmbeddingService;
    private model: any;
    private isInitialized: boolean = false;

    private constructor() {}

    public static async getInstance(): Promise<EmbeddingService> {
        if (!EmbeddingService.instance) {
            EmbeddingService.instance = new EmbeddingService();
            await EmbeddingService.instance.initialize();
        }
        return EmbeddingService.instance;
    }

    private async initialize() {
        if (!this.isInitialized) {
            try {
                // Load the sentence-transformers model
                this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                this.isInitialized = true;
                console.log('Embedding model initialized successfully');
            } catch (error) {
                console.error('Failed to initialize embedding model:', error);
                throw error;
            }
        }
    }

    /**
     * Generate embeddings for a given text
     * @param text The text to generate embeddings for
     * @returns Promise<number[]> The embedding vector
     */
    async generateEmbedding(text: string): Promise<number[]> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // Generate embeddings
            const output = await this.model(text, {
                pooling: 'mean',
                normalize: true,
            });

            // Convert to array of numbers
            return Array.from(output.data);
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error('Failed to generate embedding');
        }
    }

    /**
     * Generate embeddings for multiple texts
     * @param texts Array of texts to generate embeddings for
     * @returns Promise<number[][]> Array of embedding vectors
     */
    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        return Promise.all(texts.map(text => this.generateEmbedding(text)));
    }

    /**
     * Calculate cosine similarity between two vectors
     * @param vec1 First vector
     * @param vec2 Second vector
     * @returns number Cosine similarity score
     */
    calculateSimilarity(vec1: number[], vec2: number[]): number {
        if (vec1.length !== vec2.length) {
            throw new Error('Vectors must have the same length');
        }

        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

        return dotProduct / (magnitude1 * magnitude2);
    }
} 