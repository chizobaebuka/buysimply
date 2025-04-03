# Loan Management System API

A RESTful API for managing loans, built with Node.js, Express, and TypeScript.

## Features

- User Authentication (JWT)
- Loan Management (Create, Read, Delete)
- Swagger API Documentation
- Rate Limiting
- Error Handling
- TypeScript Support

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
JWT_SECRET=your_jwt_secret
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

API documentation is available via Swagger UI at:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Authentication

All protected routes require a JWT token. To get a token:

1. Login using `/api/auth/login`
2. Include the token in the Authorization header:
   `Authorization: Bearer <your_token>`

### Available Endpoints

#### Authentication & User Management
- POST `/api/auth/signup` - Register new staff member
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/users` - Get all users (Super Admin only)
- GET `/api/auth/users/:userId` - Get user by ID (Super Admin only)
- DELETE `/api/auth/users/:userId` - Delete user (Super Admin only)

#### Loans
- GET `/api/loans` - Get all loans
- POST `/api/loans` - Create a new loan
- GET `/api/loans/expired` - Get expired loans
- GET `/api/loans/:userEmail/get` - Get loans by user email
- DELETE `/api/loans/:loanId/delete` - Delete a loan

## Testing the API

### Using Swagger UI

1. Navigate to [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
2. Login using the authentication endpoint
3. Click the "Authorize" button and enter your token
4. Test any endpoint using the interactive UI

### Using cURL

Register a new staff member:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "staff"
  }'
```

Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

Get all loans:
```bash
curl -X GET http://localhost:3000/api/loans \
  -H "Authorization: Bearer <your_token>"
```

Create a new loan:
```bash
curl -X POST http://localhost:3000/api/loans \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "5000",
    "maturityDate": "2024-12-31",
    "applicant": {
      "name": "John Doe",
      "email": "john@example.com",
      "telephone": "1234567890"
    }
  }'
```

Get all users:
```bash
curl -X GET http://localhost:3000/api/auth/users \
  -H "Authorization: Bearer <your_token>"
```

Get user by ID:
```bash
curl -X GET http://localhost:3000/api/auth/users/1 \
  -H "Authorization: Bearer <your_token>"
```

Delete user:
```bash
curl -X DELETE http://localhost:3000/api/auth/users/1 \
  -H "Authorization: Bearer <your_token>"
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per 15 minutes for general endpoints
- 5 requests per 15 minutes for authentication endpoints

## Development

### Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build the project
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── models/         # Database models
├── routes/         # Route definitions
├── swagger/        # Swagger documentation
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── app.ts         # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
