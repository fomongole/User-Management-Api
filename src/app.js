import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));

app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'User Auth API is running securely!' });
});
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;