"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scrape_controller_1 = require("../controllers/scrape.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_middleware_1.authMiddleware);
// Scrape a new URL
router.post('/', [
    (0, express_validator_1.body)('url')
        .isURL()
        .withMessage('Valid URL is required')
        .trim()
        .toLowerCase(),
], validateRequest_1.validateRequest, scrape_controller_1.scrapeController.scrape);
// Get all scrapes with pagination and search
router.get('/', [
    (0, express_validator_1.query)('title')
        .optional()
        .trim()
        .escape(),
    (0, express_validator_1.query)('url')
        .optional()
        .trim()
        .escape(),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),
], validateRequest_1.validateRequest, scrape_controller_1.scrapeController.getScrapes);
// Delete a scrape
router.delete('/:id', [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Valid scrape ID is required'),
], validateRequest_1.validateRequest, scrape_controller_1.scrapeController.deleteScrape);
exports.default = router;
