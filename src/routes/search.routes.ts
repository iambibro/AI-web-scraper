import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { searchSchema } from '../validations/search.validation';

const router = Router();

router.use(authMiddleware);
router.post('/', validate(searchSchema), searchController.search);

export const searchRoutes = router; 