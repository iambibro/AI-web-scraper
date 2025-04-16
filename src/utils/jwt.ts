import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { AppError } from './AppError';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const generateToken = (payload: any): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as StringValue | number
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AppError('Invalid token', 401);
  }
}; 