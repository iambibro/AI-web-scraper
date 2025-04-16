"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middlewares/errorHandler");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
exports.authController = {
    async register(req, res, next) {
        try {
            const { email, password } = req.body;
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new errorHandler_1.AppError(400, 'Email already registered');
            }
            // Hash password
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                },
            });
            // Generate JWT token
            const token = (0, jwt_1.generateToken)({ userId: user.id });
            res.status(201).json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // Find user
            const user = await prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new errorHandler_1.AppError(401, 'Invalid email or password');
            }
            // Verify password
            const isValidPassword = await bcrypt_1.default.compare(password, user.password);
            if (!isValidPassword) {
                throw new errorHandler_1.AppError(401, 'Invalid email or password');
            }
            // Generate JWT token
            const token = (0, jwt_1.generateToken)({ userId: user.id });
            res.json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
};
