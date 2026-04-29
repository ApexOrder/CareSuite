# CareSuite - Enterprise Care Management System

## Deployment Guide

### 1. Prerequisites
- Node.js 20+
- PostgreSQL (Recommended for production) or SQLite

### 2. Environment Setup
Copy `.env.example` to `.env` and configure the following:
- `DATABASE_URL`: Your production database connection string.
- `JWT_SECRET`: A strong random string for session security.
- `GEMINI_API_KEY`: Required for AI features.
- `NODE_ENV`: Set to `production`.

### 3. Database Migration
If switching to PostgreSQL:
1. Update `provider = "postgresql"` in `prisma/schema.prisma`.
2. Run `npx prisma migrate dev` to generate migrations.
3. In production, run `npx prisma migrate deploy`.

### 4. Build and Start
```bash
# Install dependencies
npm install

# Build the application (Vite + Prisma Client)
npm run build

# Start the production server
npm start
```

## Production Optimizations Included
- **Helmet**: Security headers enabled.
- **Compression**: Gzip compression for all API responses.
- **Error Handling**: Global error boundary with redacted stack traces in production.
- **Static Assets**: Vite-optimized production build served via Express.
