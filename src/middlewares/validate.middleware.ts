import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'joi';
import { AppError } from './errorHandler';

export const validate = (schema: AnySchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(new AppError(400, message));
    }

    next();
  };
}; 