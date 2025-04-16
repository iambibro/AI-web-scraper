import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      let searchTerms = query;

      try {
        // Attempt to use Gemini to enhance the search query
        const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
        const prompt = `Extract key search terms from: ${query}`;
        const result = await model.generateContent(prompt);
        const enhancedTerms = await result.response.text();
        if (enhancedTerms) {
          searchTerms = enhancedTerms;
        }
      } catch (aiError) {
        console.log('AI enhancement failed, using original query:', aiError);
        // Continue with original search terms
      }

      // Perform text search using PostgreSQL
      const searchResults = await prisma.scrape.findMany({
        where: {
          userId,
          OR: [
            {
              title: {
                contains: searchTerms,
                mode: 'insensitive',
              },
            },
            {
              url: {
                contains: searchTerms,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        status: 'success',
        data: {
          query: query,
          searchTerms: searchTerms,
          results: searchResults,
        },
      });
    } catch (error) {
      console.error('Search error:', error);
      next(error);
    }
  },
}; 