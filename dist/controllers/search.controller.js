"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const generative_ai_1 = require("@google/generative-ai");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middlewares/errorHandler");
const prisma = new client_1.PrismaClient();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
exports.searchController = {
    async search(req, res, next) {
        var _a;
        try {
            const { query } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                throw new errorHandler_1.AppError(401, 'User not authenticated');
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
        }
        catch (error) {
            next(error);
        }
    },
};
