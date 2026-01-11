/*
  Warnings:

  - You are about to drop the column `benefitTypeId` on the `Benefit` table. All the data in the column will be lost.
  - You are about to drop the column `deductionTypeId` on the `Deduction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Deduction` table. All the data in the column will be lost.
  - You are about to drop the `BenefitType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeductionType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Benefit` table without a default value. This is not possible if the table is not empty.
  - Made the column `frequency` on table `Benefit` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `Deduction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Benefit" DROP CONSTRAINT "Benefit_benefitTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Deduction" DROP CONSTRAINT "Deduction_deductionTypeId_fkey";

-- AlterTable
ALTER TABLE "Benefit" DROP COLUMN "benefitTypeId",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "frequency" SET NOT NULL;

-- AlterTable
ALTER TABLE "Deduction" DROP COLUMN "deductionTypeId",
DROP COLUMN "type",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quota_Policy" ALTER COLUMN "EndDate" SET DEFAULT (CURRENT_TIMESTAMP + interval '1 year');

-- DropTable
DROP TABLE "BenefitType";

-- DropTable
DROP TABLE "DeductionType";
