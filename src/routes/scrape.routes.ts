import { Router } from 'express';
import { scrape, getScrapes, deleteScrape } from '../controllers/scrape.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { body, query, param } from 'express-validator';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Scrape:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         url:
 *           type: string
 *           format: uri
 *         title:
 *           type: string
 *         cleanData:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/scrape:
 *   post:
 *     summary: Scrape a URL
 *     tags: [Scrape]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: URL scraped successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scrape'
 *       400:
 *         description: Invalid URL
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, scrape);

/**
 * @swagger
 * /api/scrape:
 *   get:
 *     summary: Get all scraped URLs
 *     tags: [Scrape]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by title
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         description: Filter by URL
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of scraped URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     scrapes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Scrape'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getScrapes);

/**
 * @swagger
 * /api/scrape/{id}:
 *   delete:
 *     summary: Delete a scraped URL
 *     tags: [Scrape]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Scrape ID
 *     responses:
 *       200:
 *         description: Scrape deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scrape not found
 */
router.delete('/:id', authMiddleware, deleteScrape);

export default router; 