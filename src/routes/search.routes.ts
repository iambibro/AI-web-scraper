import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { searchSchema } from '../validations/search.validation';

const router = Router();

/**
 * @swagger
 * /api/search:
 *   post:
 *     summary: Search through scraped content
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 */
router.use(authMiddleware);
router.post('/', validate(searchSchema), searchController.search);

export const searchRoutes = router; 