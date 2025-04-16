"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const AppError_1 = require("../utils/AppError");
const jwt_1 = require("../utils/jwt");
const authMiddleware = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw new AppError_1.AppError('Authentication token is required', 401);
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            next(error);
        }
        else {
            next(new AppError_1.AppError('Invalid authentication token', 401));
        }
    }
};
exports.authMiddleware = authMiddleware;
