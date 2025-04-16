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

      // Use Gemini to enhance the search query
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Extract key search terms from: ${query}`;
      const result = await model.generateContent(prompt);
      const searchTerms = await result.response.text();

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
        data: searchResults,
      });
    } catch (error) {
      next(error);
    }
  },
}; 