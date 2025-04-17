import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/appError';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingService } from '../services/embeddingService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
  };
}

export const scrape = async (req: AuthenticatedRequest, res: Response) => {
  const { url } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Get page title
    const title = await page.title();

    // Get page content
    const content = await page.evaluate(() => {
      return document.body.innerText;
    });

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let cleanData;
    try {
      // Process content with AI
      const result = await model.generateContent(
        `Please clean and structure this content, focusing on key information and removing unnecessary elements: ${content}`
      );
      const response = await result.response;
      cleanData = {
        processedContent: response.text(),
        rawContent: content,
      };
    } catch (error) {
      console.error('AI processing error:', error);
      cleanData = {
        error: error instanceof Error ? error.message : 'Failed to process content with AI',
        rawContent: content,
      };
    }

    // Generate embedding for semantic search
    const embeddingService = await EmbeddingService.getInstance();
    const embedding = await embeddingService.generateEmbedding(
      `${title} ${cleanData.processedContent || cleanData.rawContent}`
    );

    // Store in database
    const scrape = await prisma.scrape.create({
      data: {
        userId,
        url,
        title,
        cleanData,
        embedding,
      },
    });

    res.status(201).json({
      status: 'success',
      data: scrape,
    });
  } catch (error) {
    throw new AppError('Failed to scrape URL', 500);
  } finally {
    await browser.close();
  }
};

export const getScrapes = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { title, url, page = 1, limit = 10 } = req.query;

  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = { userId };

  if (title) {
    where.title = { contains: title as string, mode: 'insensitive' };
  }

  if (url) {
    where.url = { contains: url as string, mode: 'insensitive' };
  }

  const [scrapes, total] = await Promise.all([
    prisma.scrape.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.scrape.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      scrapes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

export const deleteScrape = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const scrape = await prisma.scrape.findFirst({
    where: { id, userId },
  });

  if (!scrape) {
    throw new AppError('Scrape not found', 404);
  }

  await prisma.scrape.delete({
    where: { id },
  });

  res.status(200).json({
    status: 'success',
    data: null,
  });
}; 