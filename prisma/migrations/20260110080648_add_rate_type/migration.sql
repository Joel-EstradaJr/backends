-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "rateType" TEXT;

-- AlterTable
ALTER TABLE "Quota_Policy" ALTER COLUMN "EndDate" SET DEFAULT (CURRENT_TIMESTAMP + interval '1 year');
