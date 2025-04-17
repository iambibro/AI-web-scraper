import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/appError';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('Authentication token is required', 401);
    }

    const decoded = verifyToken(token) as {
      userId: string;
    };

    req.user = {
      id: decoded.userId,
      userId: decoded.userId
    };
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
}; 