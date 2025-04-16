import { Router } from 'express';
import { scrapeController } from '../controllers/scrape.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { body, query, param } from 'express-validator';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Scrape a new URL
router.post(
  '/',
  [
    body('url')
      .isURL()
      .withMessage('Valid URL is required')
      .trim()
      .toLowerCase(),
  ],
  validateRequest,
  scrapeController.scrape
);

// Get all scrapes with pagination and search
router.get(
  '/',
  [
    query('title')
      .optional()
      .trim()
      .escape(),
    query('url')
      .optional()
      .trim()
      .escape(),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
  ],
  validateRequest,
  scrapeController.getScrapes
);

// Delete a scrape
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Valid scrape ID is required'),
  ],
  validateRequest,
  scrapeController.deleteScrape
);

export default router; 