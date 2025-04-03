
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import loanRoutes from './routes/loanRoutes';
import { setupGlobalMiddleware, globalErrorHandler } from './middlewares/globalMiddleware';
import { swaggerSpec } from './config/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup global middleware
setupGlobalMiddleware(app);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

// Global error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

