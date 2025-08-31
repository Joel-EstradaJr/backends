# Database Deployment Commands
# Run these AFTER setting up your Railway PostgreSQL database

# 1. Push schema to database (creates tables)
npx prisma db push

# 2. Generate Prisma client
npx prisma generate

# 3. Seed the database with initial data
npm run db:seed

# 4. Test the connection
npx tsx scripts/test-db.ts

# 5. Start development server
npm run dev
