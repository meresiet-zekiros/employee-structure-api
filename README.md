# Employee Hierarchy API

A RESTful API built with NestJS and TypeScript for managing organizational position hierarchies. Supports CRUD operations, unlimited-depth tree structures, soft deletes, and cycle detection.

## ✨ Features

- Create, read, update, and delete employee positions
- Hierarchical tree queries with unlimited depth
- Soft deletes with `deletedAt` audit tracking
- Cycle detection to prevent circular parent-child references
- Input validation using `class-validator` and DTOs
- Interactive Swagger documentation at `/api`
- Comprehensive unit and end-to-end tests

## 🛠️ Tech Stack

- **Framework:** NestJS 10 + TypeScript
- **Database:** PostgreSQL + TypeORM
- **Validation:** `class-validator`, `class-transformer`
- **Documentation:** Swagger/OpenAPI 3.0
- **Testing:** Jest + Supertest

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd employee-structure-api
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root and add your database credentials:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=employee_hierarchy
NODE_ENV=development
```

### 3. Create the Database

```bash
createdb employee_hierarchy
```
*(Or use your preferred PostgreSQL client to create the database)*

### 4. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The server will start on [http://localhost:3000](http://localhost:3000).

## 📚 API Documentation

Interactive Swagger UI is available at: [http://localhost:3000/api](http://localhost:3000/api)

### Endpoints


| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/positions` | Create a new position |
| **GET** | `/positions/tree` | Get full hierarchy tree |
| **GET** | `/positions/:id` | Get position by ID |
| **GET** | `/positions/:id/children` | Get direct children of a position |
| **PUT** | `/positions/:id` | Update a position |
| **DELETE** | `/positions/:id` | Soft-delete a position |

## 🧪 Testing

Run the test suites using npm scripts:

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🗂️ Project Structure

```text
src/
├── main.ts
├── app.module.ts
└── positions/
    ├── dto/
    │   ├── create-position.dto.ts
    │   └── update-position.dto.ts
    ├── entities/
    │   └── position.entity.ts
    ├── positions.controller.ts
    ├── positions.service.ts
    └── positions.module.ts
```
