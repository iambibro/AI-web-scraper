"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeController = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const generative_ai_1 = require("@google/generative-ai");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middlewares/errorHandler");
const prisma = new client_1.PrismaClient();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
exports.scrapeController = {
    async scrape(req, res, next) {
        var _a;
        let browser = null;
        try {
            const { url } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.AppError(401, 'User not authenticated');
            }
            if (!url) {
                throw new errorHandler_1.AppError(400, 'URL is required');
            }
            console.log(`Starting scrape for URL: ${url}`);
            // Check if URL already exists for this user
            const existingScrape = await prisma.scrape.findFirst({
                where: {
                    userId,
                    url,
                },
            });
            if (existingScrape) {
                throw new errorHandler_1.AppError(400, 'URL already scraped for this user');
            }
            // Launch Puppeteer with minimal configuration
            console.log('Launching browser...');
            browser = await puppeteer_1.default.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            // Set a reasonable timeout
            page.setDefaultNavigationTimeout(30000);
            // Set user agent to avoid being blocked
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            console.log('Navigating to URL...');
            try {
                await page.goto(url, {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError(400, 'Failed to load URL. Please check if the URL is valid and accessible.');
            }
            // Extract content with better error handling
            console.log('Extracting content...');
            let title, content;
            try {
                title = await page.title();
                content = await page.evaluate(() => {
                    var _a, _b;
                    return {
                        text: document.body.innerText,
                        links: Array.from(document.querySelectorAll('a')).map(a => a.href),
                        images: Array.from(document.querySelectorAll('img')).map(img => img.src),
                        meta: {
                            description: ((_a = document.querySelector('meta[name="description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) || '',
                            keywords: ((_b = document.querySelector('meta[name="keywords"]')) === null || _b === void 0 ? void 0 : _b.getAttribute('content')) || '',
                        }
                    };
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError(500, 'Failed to extract content from the webpage');
            }
            // Process content with Gemini
            console.log('Processing content with Gemini...');
            let cleanData;
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                const prompt = `Please analyze and summarize the following webpage content in a structured JSON format. Focus on key information, main topics, and important details:\n\n${content.text}`;
                const result = await model.generateContent(prompt);
                cleanData = await result.response.text();
                // Validate JSON response
                JSON.parse(cleanData);
            }
            catch (error) {
                console.error('Gemini processing error:', error);
                cleanData = {
                    error: 'Failed to process content with AI',
                    rawContent: content.text.substring(0, 1000) // Store first 1000 chars as fallback
                };
            }
            // Store in database
            console.log('Storing data in database...');
            const scrape = await prisma.scrape.create({
                data: {
                    userId,
                    url,
                    title,
                    cleanData: typeof cleanData === 'string' ? JSON.parse(cleanData) : cleanData,
                },
            });
            console.log('Scrape completed successfully');
            res.status(201).json({
                status: 'success',
                data: scrape,
            });
        }
        catch (error) {
            console.error('Error in scrape controller:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            next(error);
        }
        finally {
            if (browser) {
                try {
                    await browser.close();
                    console.log('Browser closed');
                }
                catch (error) {
                    console.error('Error closing browser:', error);
                }
            }
        }
    },
    async getScrapes(req, res, next) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { title, url, page = 1, limit = 10 } = req.query;
            if (!userId) {
                throw new errorHandler_1.AppError(401, 'User not authenticated');
            }
            const where = { userId };
            if (title)
                where.title = { contains: title, mode: 'insensitive' };
            if (url)
                where.url = { contains: url, mode: 'insensitive' };
            const [scrapes, total] = await Promise.all([
                prisma.scrape.findMany({
                    where,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: (Number(page) - 1) * Number(limit),
                    take: Number(limit),
                }),
                prisma.scrape.count({ where })
            ]);
            res.json({
                status: 'success',
                data: {
                    scrapes,
                    pagination: {
                        total,
                        page: Number(page),
                        limit: Number(limit),
                        pages: Math.ceil(total / Number(limit))
                    }
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async deleteScrape(req, res, next) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { id } = req.params;
            if (!userId) {
                throw new errorHandler_1.AppError(401, 'User not authenticated');
            }
            if (!id) {
                throw new errorHandler_1.AppError(400, 'Scrape ID is required');
            }
            const scrape = await prisma.scrape.findFirst({
                where: {
                    id,
                    userId,
                },
            });
            if (!scrape) {
                throw new errorHandler_1.AppError(404, 'Scrape not found');
            }
            await prisma.scrape.delete({
                where: {
                    id,
                },
            });
            res.json({
                status: 'success',
                data: null,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
