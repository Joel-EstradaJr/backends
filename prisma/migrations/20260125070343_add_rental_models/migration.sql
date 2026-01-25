-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "Quota_Policy" ALTER COLUMN "EndDate" SET DEFAULT (CURRENT_TIMESTAMP + interval '1 year');

-- CreateTable
CREATE TABLE "Rental" (
    "RentalID" TEXT NOT NULL,
    "RentalStatus" "RentalStatus" NOT NULL DEFAULT 'pending',
    "RentalType" TEXT,
    "RentalDate" TIMESTAMP(3) NOT NULL,
    "ReturnDate" TIMESTAMP(3),
    "PickupLocation" TEXT,
    "DropoffLocation" TEXT,
    "TotalAmount" DECIMAL(65,30),
    "Notes" TEXT,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("RentalID")
);

-- CreateTable
CREATE TABLE "RentalAssignment" (
    "RentalAssignmentID" TEXT NOT NULL,
    "RentalID" TEXT NOT NULL,
    "BusID" TEXT,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "RentalAssignment_pkey" PRIMARY KEY ("RentalAssignmentID")
);

-- CreateTable
CREATE TABLE "RentalEmployee" (
    "id" TEXT NOT NULL,
    "RentalAssignmentID" TEXT NOT NULL,
    "EmployeeID" TEXT NOT NULL,
    "Role" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalEmployee_RentalAssignmentID_EmployeeID_key" ON "RentalEmployee"("RentalAssignmentID", "EmployeeID");

-- AddForeignKey
ALTER TABLE "RentalAssignment" ADD CONSTRAINT "RentalAssignment_RentalID_fkey" FOREIGN KEY ("RentalID") REFERENCES "Rental"("RentalID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalAssignment" ADD CONSTRAINT "RentalAssignment_BusID_fkey" FOREIGN KEY ("BusID") REFERENCES "bus"("bus_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalEmployee" ADD CONSTRAINT "RentalEmployee_RentalAssignmentID_fkey" FOREIGN KEY ("RentalAssignmentID") REFERENCES "RentalAssignment"("RentalAssignmentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalEmployee" ADD CONSTRAINT "RentalEmployee_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
