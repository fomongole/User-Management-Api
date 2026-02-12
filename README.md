# Scalable User Auth & Management API

A high-performance, production-ready RESTful API built with **Node.js**, **Express**, **MongoDB**, and **Redis**.

This project has been architected for scalability using **Docker Compose**, featuring **NGINX Load Balancing**, **Redis Caching**, **Advanced Validation**, and **Role-Based Access Control (RBAC)**.

---

## 🚀 Key Features

### 🏗️ Scalable Architecture
- **Load Balancing** – **NGINX** reverse proxy distributes traffic (Port 80) to backend containers.
- **High-Performance Caching** – **Redis** implements the "Cache-Aside" strategy to reduce DB load by ~80%.
- **Containerized Stack** – Multi-container setup (App, Mongo, Redis, Nginx) orchestrated via Docker Compose.

### 🛡️ Core Security & Auth
- **JWT Authentication** – Secure stateless authentication with Bearer tokens.
- **Input Validation** – Robust request sanitization using **express-validator** (middleware layer).
- **Security Headers** – Helmet.js integration for HTTP security.
- **CORS Protection** – Configurable origin access for frontend integration.

### 👤 User Management
- **Console-Based Email Simulation** – Verification links printed to container logs (no external SMTP needed for dev).
- **Profile Management** – Secure update/delete flows with automatic **Cache Invalidation**.
- **Admin Seeding** – Automated script to generate Super Admin users securely.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime** | Node.js v18+ |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Caching** | Redis (In-Memory Data Store) |
| **Load Balancer** | NGINX |
| **Validation** | Express-Validator |
| **DevOps** | Docker, Docker Compose |
| **Testing** | Postman, Jest (Integration) |

---

## 🧪 Testing the API

**Base URL**  
http://localhost:80 (Proxied via NGINX)

### Authentication Endpoints

| Method | Endpoint | Description | Validation |
|------|--------|------------|------------|
| POST | /api/auth/register | Register new user | ✅ Name, Email, Pwd |
| POST | /api/auth/login | Login & get Token | ✅ Email, Pwd |
| PUT | /api/auth/verifyemail/:token | Verify Account | ❌ |

### User Endpoints (Requires Bearer Token)

| Method | Endpoint | Description | Cache Strategy |
|------|--------|------------|----------------|
| GET | /api/auth/profile | Get own profile | ⚡ Redis Hit/Miss |
| PUT | /api/auth/profile | Update profile | 🗑️ Invalidates Cache |
| DELETE | /api/auth/profile | Delete account | 🗑️ Invalidates Cache |

### Admin Endpoints (Requires Admin Token)

| Method | Endpoint | Description |
|------|--------|------------|
| GET | /api/auth/users | List all users |
| DELETE | /api/auth/users/:id | Ban/Delete user |

---

## 📂 Project Structure

```plaintext
user-auth-api/
├── nginx/                  # NGINX Configuration
│   └── nginx.conf          # Load Balancer settings
├── src/
│   ├── config/             # DB & Redis connection logic
│   ├── controllers/        # Business logic
│   ├── middlewares/        # Auth, Error, & Validation Middleware
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Routes
│   ├── utils/              # Token generation helpers
│   ├── validators/         # Express-Validator rules
│   ├── seeder.js           # Admin User Seed Script
│   └── server.js           # Entry Point
├── .env                    # Environment Variables
├── docker-compose.yml      # Orchestration Config
├── Dockerfile              # App Container Config
└── package.json
```

## 📜 License

Licensed under the MIT License.
