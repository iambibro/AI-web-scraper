import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './config/swagger.json';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/auth.routes';
import scrapeRoutes from './routes/scrape.routes';
import { searchRoutes } from './routes/search.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/search', searchRoutes);

// Error handling
app.use(errorHandler);

export default app; 