import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Loan Management API',
    version: '1.0.0',
    description: 'API documentation for Loan Management System',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Bearer token authorization',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/swagger/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);