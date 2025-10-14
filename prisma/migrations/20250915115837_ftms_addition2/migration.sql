/*
  Warnings:

  - The primary key for the `item_transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Quota_Policy" ALTER COLUMN "EndDate" SET DEFAULT (CURRENT_TIMESTAMP + interval '1 year');

-- AlterTable
ALTER TABLE "item_transactions" DROP CONSTRAINT "item_transactions_pkey",
ADD CONSTRAINT "item_transactions_pkey" PRIMARY KEY ("transaction_id", "item_id");

-- CreateIndex
CREATE INDEX "item_transactions_transaction_date_idx" ON "item_transactions"("transaction_date");
