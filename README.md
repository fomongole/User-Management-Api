# User Authentication & Management API

A production-ready, secure RESTful API built with **Node.js**, **Express**, and **MongoDB**.  
This project demonstrates advanced backend concepts including **JWT authentication**, **Role-Based Access Control (RBAC)**, **secure password handling**, **email verification simulation**, and **containerization with Docker**.

---

## Features

### Core Authentication & Security
- **JWT Authentication** – Secure stateless authentication using JSON Web Tokens
- **Password Hashing** – Industry-standard bcrypt hashing for password storage
- **Security Headers** – Implemented via Helmet to protect against common vulnerabilities
- **CORS Configuration** – Controlled Cross-Origin Resource Sharing for client security

### User Management
- **User Registration** – Secure sign-up with duplicate email prevention
- **Email Verification** – Token-based email verification simulation using Crypto & Nodemailer
- **Profile Management** – Users can view, update, and delete their own profiles
- **RBAC (Admin Access)** – Admin-only routes for user management

### DevOps & Quality
- **Dockerized** – Fully containerized for consistent deployments
- **Integration Tests** – Jest & Supertest ensure API reliability
- **MVC Architecture** – Clean separation of concerns

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas)
- **ODM:** Mongoose
- **Auth:** JWT, Bcrypt
- **Testing:** Jest, Supertest
- **DevOps:** Docker
- **Utilities:** Nodemailer, Winston, Dotenv

---

## Installation & Local Setup

### Prerequisites
- Node.js **v18+**
- MongoDB Atlas connection string
- Docker (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/user-auth-api.git
cd user-auth-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_smtp_user
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=noreply@example.com
FROM_NAME=AuthService
```

### 4. Run the Server

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

---

## 🐳 Running with Docker

### Build the Image
```bash
docker build -t user-auth-api .
```

### Run the Container
```bash
docker run -p 5000:5000 --env-file .env user-auth-api
```

API available at **http://localhost:5000**

---

## Running Tests

```bash
npm test
```

> Ensure `.env` is configured correctly — tests require a database connection.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|------|---------|-------------|------|
| POST | `/api/auth/register` | Register user & send verification email | ❌ |
| POST | `/api/auth/login` | Login & receive JWT | ❌ |
| PUT | `/api/auth/verifyemail/:token` | Verify email using token | ❌ |

### User Operations

| Method | Endpoint | Description | Auth |
|------|---------|-------------|------|
| GET | `/api/auth/profile` | Get user profile | ✅ User |
| PUT | `/api/auth/profile` | Update name/password | ✅ User |
| DELETE | `/api/auth/profile` | Delete own account | ✅ User |

### Admin Operations

| Method | Endpoint | Description | Auth |
|------|---------|-------------|------|
| GET | `/api/auth/users` | Get all users | ✅ Admin |
| DELETE | `/api/auth/users/:id` | Delete user by ID | ✅ Admin |

---

## Project Structure

```text
user-auth-api/
├── src/
│   ├── config/         # Database connection
│   ├── controllers/    # Business logic
│   ├── middlewares/    # Auth & error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Helpers (Email, tokens, etc.)
│   ├── app.js          # Express app
│   └── server.js       # Entry point
├── tests/              # Integration tests
├── .env
├── Dockerfile
└── package.json
```

---

## License

Licensed under the **MIT License**.
