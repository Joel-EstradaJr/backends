-- AlterTable
ALTER TABLE "Quota_Policy" ALTER COLUMN "EndDate" SET DEFAULT (CURRENT_TIMESTAMP + interval '1 year');

-- CreateTable
CREATE TABLE "units" (
    "id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "item_id" VARCHAR(20) NOT NULL,
    "item_name" VARCHAR(100) NOT NULL,
    "unit_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "receipt_id" VARCHAR(20) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("receipt_id")
);

-- CreateTable
CREATE TABLE "receipt_items" (
    "id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "isInventoryProcessed" BOOLEAN NOT NULL DEFAULT false,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_transactions" (
    "transaction_id" VARCHAR(30) NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "item_id" TEXT NOT NULL,
    "receipt_id" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "item_transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receipt_items_receipt_id_item_id_key" ON "receipt_items"("receipt_id", "item_id");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_items" ADD CONSTRAINT "receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("receipt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_items" ADD CONSTRAINT "receipt_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transactions" ADD CONSTRAINT "item_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_transactions" ADD CONSTRAINT "item_transactions_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("receipt_id") ON DELETE SET NULL ON UPDATE CASCADE;
