import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';
import { EmbeddingService } from '../services/embeddingService';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const userId = req.user?.userId;

      console.log('Search request received:', { query, userId });

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!query) {
        throw new AppError('Search query is required', 400);
      }

      // Generate embedding for the search query
      const embeddingService = await EmbeddingService.getInstance();
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Perform vector similarity search
      const searchResults = await prisma.$queryRaw`
        SELECT 
          id,
          title,
          url,
          clean_data,
          created_at,
          embedding <=> ${queryEmbedding}::vector as similarity
        FROM "Scrape"
        WHERE user_id = ${userId}
        ORDER BY embedding <=> ${queryEmbedding}::vector
        LIMIT 10
      `;

      console.log('Search results:', searchResults);

      res.json({
        status: 'success',
        data: {
          query: query,
          results: searchResults,
        },
      });
    } catch (error) {
      console.error('Search error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      next(error);
    }
  },
}; 