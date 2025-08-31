# Dummy Backends API

A Next.js API project with Prisma and PostgreSQL for managing HR and Operations data.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

3. **Setup database:**
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

- `GET /api/clean/hr_employees` - Employee data
- `GET /api/clean/hr_payroll` - Payroll data  
- `GET /api/clean/op_bus-trip-details` - Bus trip details

## 🗄️ Database Schema

The project uses PostgreSQL with Prisma ORM. Key models include:
- Employee management (HR)
- Payroll and benefits
- Bus operations and assignments
- Inventory management

## 🚢 Deployment

### Vercel + Railway Setup

1. **Railway (Database):**
   - Create new project on Railway
   - Add PostgreSQL plugin
   - Copy DATABASE_URL from Railway dashboard

2. **Vercel (Frontend/API):**
   - Connect GitHub repository to Vercel
   - Add environment variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
   - Deploy

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Deployment:** Vercel + Railway

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="your-domain.com"
```
