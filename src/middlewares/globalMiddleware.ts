import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import express from 'express';

// Rate limiting configuration
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Global error handler
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

// Global middleware setup
export const setupGlobalMiddleware = (app: express.Application) => {
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(limiter);
  app.use(express.json());
};