-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('Available', 'OutOfStock', 'Discontinued');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('Issue', 'Return');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Completed');

-- CreateEnum
CREATE TYPE "BodyBuilder" AS ENUM ('Isuzu', 'Toyota', 'Hyundai', 'Mitsubishi', 'Other');

-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('Aircon', 'NonAircon', 'Jeepney', 'Van');

-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('Active', 'Inactive', 'Maintenance', 'Disposed');

-- CreateEnum
CREATE TYPE "BusCondition" AS ENUM ('Excellent', 'Good', 'Fair', 'Poor');

-- CreateEnum
CREATE TYPE "AcquisitionMethod" AS ENUM ('Purchase', 'Donation', 'Lease');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('Registered', 'Unregistered', 'Expired', 'Pending');

-- CreateEnum
CREATE TYPE "BusSource" AS ENUM ('Dealer', 'Private', 'Auction', 'Other');

-- CreateEnum
CREATE TYPE "BusOperationStatus" AS ENUM ('Ready', 'NotReady', 'InTransit', 'Maintenance');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Card', 'Digital', 'Mixed');

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "employeeStatus" TEXT NOT NULL,
    "hiredate" TIMESTAMP(3) NOT NULL,
    "terminationDate" TIMESTAMP(3),
    "basicRate" DECIMAL(65,30) NOT NULL,
    "positionId" INTEGER,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "positionName" TEXT NOT NULL,
    "departmentId" INTEGER,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "departmentName" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benefit" (
    "id" SERIAL NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "frequency" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "benefitTypeId" INTEGER NOT NULL,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BenefitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deduction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "frequency" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "deductionTypeId" INTEGER NOT NULL,

    CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeductionType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DeductionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "streetAddress" TEXT,
    "barangay" TEXT,
    "city" TEXT,
    "province" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "securityQuestionId" INTEGER NOT NULL,
    "securityAnswer" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "details" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "item_id" VARCHAR(20) NOT NULL,
    "category_id" TEXT NOT NULL,
    "item_name" VARCHAR(100) NOT NULL,
    "unit_measure" VARCHAR(20) NOT NULL,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 0,
    "status" "InventoryStatus" NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "batches" (
    "batch_id" VARCHAR(20) NOT NULL,
    "item_id" TEXT NOT NULL,
    "f_item_id" VARCHAR(20) NOT NULL,
    "usable_quantity" INTEGER NOT NULL DEFAULT 0,
    "defective_quantity" INTEGER NOT NULL DEFAULT 0,
    "missing_quantity" INTEGER NOT NULL DEFAULT 0,
    "remarks" VARCHAR(255),
    "expiration_date" TIMESTAMP(3),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" VARCHAR(20) NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "employee_requests" (
    "request_id" VARCHAR(20) NOT NULL,
    "item_id" TEXT NOT NULL,
    "emp_id" INTEGER NOT NULL,
    "request_type" "RequestType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "req_purpose" VARCHAR(255) NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "expected_return_date" TIMESTAMP(3),
    "actual_return_date" TIMESTAMP(3),
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "employee_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "bus" (
    "bus_id" VARCHAR(20) NOT NULL,
    "item_id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "body_number" VARCHAR(20) NOT NULL,
    "body_builder" "BodyBuilder" NOT NULL,
    "bus_type" "BusType" NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "status" "BusStatus" NOT NULL,
    "chasis_number" VARCHAR(50) NOT NULL,
    "engine_number" VARCHAR(50) NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "year_model" INTEGER NOT NULL,
    "route" VARCHAR(10),
    "condition" "BusCondition" NOT NULL,
    "acquisition_date" TIMESTAMP(3) NOT NULL,
    "acquisition_method" "AcquisitionMethod" NOT NULL,
    "warranty_expiration_date" TIMESTAMP(3),
    "registration_status" "RegistrationStatus" NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "bus_pkey" PRIMARY KEY ("bus_id")
);

-- CreateTable
CREATE TABLE "SecondHandDetails" (
    "s_bus_id" TEXT NOT NULL,
    "previous_owner" TEXT NOT NULL,
    "previous_owner_contact" TEXT NOT NULL,
    "source" "BusSource" NOT NULL,
    "odometer_reading" INTEGER NOT NULL,
    "last_registration_date" TIMESTAMP(3) NOT NULL,
    "last_maintenance_date" TIMESTAMP(3) NOT NULL,
    "bus_condition_notes" TEXT,

    CONSTRAINT "SecondHandDetails_pkey" PRIMARY KEY ("s_bus_id")
);

-- CreateTable
CREATE TABLE "BrandNewDetails" (
    "b_bus_id" TEXT NOT NULL,
    "dealer_name" TEXT NOT NULL,
    "dealer_contact" TEXT NOT NULL,

    CONSTRAINT "BrandNewDetails_pkey" PRIMARY KEY ("b_bus_id")
);

-- CreateTable
CREATE TABLE "bus_other_files" (
    "bus_files_id" VARCHAR(20) NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "date_uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bus_id" TEXT NOT NULL,

    CONSTRAINT "bus_other_files_pkey" PRIMARY KEY ("bus_files_id")
);

-- CreateTable
CREATE TABLE "Quota_Policy" (
    "QuotaPolicyID" TEXT NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EndDate" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + interval '1 year'),
    "RegularBusAssignmentID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "Quota_Policy_pkey" PRIMARY KEY ("QuotaPolicyID")
);

-- CreateTable
CREATE TABLE "Fixed" (
    "FQuotaPolicyID" TEXT NOT NULL,
    "Quota" DOUBLE PRECISION NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "Fixed_pkey" PRIMARY KEY ("FQuotaPolicyID")
);

-- CreateTable
CREATE TABLE "Percentage" (
    "PQuotaPolicyID" TEXT NOT NULL,
    "Percentage" DOUBLE PRECISION NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "Percentage_pkey" PRIMARY KEY ("PQuotaPolicyID")
);

-- CreateTable
CREATE TABLE "Stop" (
    "StopID" TEXT NOT NULL,
    "StopName" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("StopID")
);

-- CreateTable
CREATE TABLE "Route" (
    "RouteID" TEXT NOT NULL,
    "StartStopID" TEXT NOT NULL,
    "EndStopID" TEXT NOT NULL,
    "RouteName" TEXT NOT NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("RouteID")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "RouteStopID" TEXT NOT NULL,
    "RouteID" TEXT NOT NULL,
    "StopID" TEXT NOT NULL,
    "StopOrder" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("RouteStopID")
);

-- CreateTable
CREATE TABLE "BusAssignment" (
    "BusAssignmentID" TEXT NOT NULL,
    "BusID" TEXT NOT NULL,
    "RouteID" TEXT NOT NULL,
    "Battery" BOOLEAN NOT NULL DEFAULT false,
    "Lights" BOOLEAN NOT NULL DEFAULT false,
    "Oil" BOOLEAN NOT NULL DEFAULT false,
    "Water" BOOLEAN NOT NULL DEFAULT false,
    "Break" BOOLEAN NOT NULL DEFAULT false,
    "Air" BOOLEAN NOT NULL DEFAULT false,
    "Gas" BOOLEAN NOT NULL DEFAULT false,
    "Engine" BOOLEAN NOT NULL DEFAULT false,
    "TireCondition" BOOLEAN NOT NULL DEFAULT false,
    "Self_Driver" BOOLEAN NOT NULL DEFAULT false,
    "Self_Conductor" BOOLEAN NOT NULL DEFAULT false,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "Status" "BusOperationStatus" NOT NULL DEFAULT 'NotReady',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "BusAssignment_pkey" PRIMARY KEY ("BusAssignmentID")
);

-- CreateTable
CREATE TABLE "RegularBusAssignment" (
    "RegularBusAssignmentID" TEXT NOT NULL,
    "DriverID" INTEGER NOT NULL,
    "ConductorID" INTEGER NOT NULL,
    "BusAssignmentID" TEXT NOT NULL,
    "LatestBusTripID" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegularBusAssignment_pkey" PRIMARY KEY ("RegularBusAssignmentID")
);

-- CreateTable
CREATE TABLE "BusTrip" (
    "BusTripID" TEXT NOT NULL,
    "RegularBusAssignmentID" TEXT NOT NULL,
    "DispatchedAt" TIMESTAMP(3),
    "TripExpense" DECIMAL(65,30),
    "Sales" DECIMAL(65,30),
    "Payment_Method" "PaymentMethod",
    "IsExpenseRecorded" BOOLEAN NOT NULL DEFAULT false,
    "IsRevenueRecorded" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "BusTrip_pkey" PRIMARY KEY ("BusTripID")
);

-- CreateTable
CREATE TABLE "TicketType" (
    "TicketTypeID" TEXT NOT NULL,
    "TypeName" TEXT NOT NULL,
    "Price" DECIMAL(65,30) NOT NULL,
    "Description" TEXT,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("TicketTypeID")
);

-- CreateTable
CREATE TABLE "TicketBusTrip" (
    "TicketBusTripID" TEXT NOT NULL,
    "BusTripID" TEXT NOT NULL,
    "TicketTypeID" TEXT NOT NULL,
    "QuantitySold" INTEGER NOT NULL,
    "TotalAmount" DECIMAL(65,30) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedBy" TEXT,
    "UpdatedBy" TEXT,

    CONSTRAINT "TicketBusTrip_pkey" PRIMARY KEY ("TicketBusTripID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BenefitType_name_key" ON "BenefitType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeductionType_name_key" ON "DeductionType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityQuestion_question_key" ON "SecurityQuestion"("question");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "bus_plate_number_key" ON "bus"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_body_number_key" ON "bus"("body_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_chasis_number_key" ON "bus"("chasis_number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_engine_number_key" ON "bus"("engine_number");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_RouteID_StopID_key" ON "RouteStop"("RouteID", "StopID");

-- CreateIndex
CREATE INDEX "BusAssignment_BusID_idx" ON "BusAssignment"("BusID");

-- CreateIndex
CREATE UNIQUE INDEX "RegularBusAssignment_BusAssignmentID_key" ON "RegularBusAssignment"("BusAssignmentID");

-- CreateIndex
CREATE UNIQUE INDEX "RegularBusAssignment_LatestBusTripID_key" ON "RegularBusAssignment"("LatestBusTripID");

-- CreateIndex
CREATE INDEX "RegularBusAssignment_DriverID_idx" ON "RegularBusAssignment"("DriverID");

-- CreateIndex
CREATE INDEX "RegularBusAssignment_ConductorID_idx" ON "RegularBusAssignment"("ConductorID");

-- CreateIndex
CREATE UNIQUE INDEX "TicketBusTrip_BusTripID_TicketTypeID_key" ON "TicketBusTrip"("BusTripID", "TicketTypeID");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_benefitTypeId_fkey" FOREIGN KEY ("benefitTypeId") REFERENCES "BenefitType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_deductionTypeId_fkey" FOREIGN KEY ("deductionTypeId") REFERENCES "DeductionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_securityQuestionId_fkey" FOREIGN KEY ("securityQuestionId") REFERENCES "SecurityQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus" ADD CONSTRAINT "bus_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus" ADD CONSTRAINT "bus_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecondHandDetails" ADD CONSTRAINT "SecondHandDetails_s_bus_id_fkey" FOREIGN KEY ("s_bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandNewDetails" ADD CONSTRAINT "BrandNewDetails_b_bus_id_fkey" FOREIGN KEY ("b_bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus_other_files" ADD CONSTRAINT "bus_other_files_bus_id_fkey" FOREIGN KEY ("bus_id") REFERENCES "bus"("bus_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quota_Policy" ADD CONSTRAINT "Quota_Policy_RegularBusAssignmentID_fkey" FOREIGN KEY ("RegularBusAssignmentID") REFERENCES "RegularBusAssignment"("RegularBusAssignmentID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixed" ADD CONSTRAINT "Fixed_FQuotaPolicyID_fkey" FOREIGN KEY ("FQuotaPolicyID") REFERENCES "Quota_Policy"("QuotaPolicyID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Percentage" ADD CONSTRAINT "Percentage_PQuotaPolicyID_fkey" FOREIGN KEY ("PQuotaPolicyID") REFERENCES "Quota_Policy"("QuotaPolicyID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_StartStopID_fkey" FOREIGN KEY ("StartStopID") REFERENCES "Stop"("StopID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_EndStopID_fkey" FOREIGN KEY ("EndStopID") REFERENCES "Stop"("StopID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_RouteID_fkey" FOREIGN KEY ("RouteID") REFERENCES "Route"("RouteID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_StopID_fkey" FOREIGN KEY ("StopID") REFERENCES "Stop"("StopID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusAssignment" ADD CONSTRAINT "BusAssignment_RouteID_fkey" FOREIGN KEY ("RouteID") REFERENCES "Route"("RouteID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularBusAssignment" ADD CONSTRAINT "RegularBusAssignment_BusAssignmentID_fkey" FOREIGN KEY ("BusAssignmentID") REFERENCES "BusAssignment"("BusAssignmentID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularBusAssignment" ADD CONSTRAINT "RegularBusAssignment_LatestBusTripID_fkey" FOREIGN KEY ("LatestBusTripID") REFERENCES "BusTrip"("BusTripID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularBusAssignment" ADD CONSTRAINT "RegularBusAssignment_DriverID_fkey" FOREIGN KEY ("DriverID") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularBusAssignment" ADD CONSTRAINT "RegularBusAssignment_ConductorID_fkey" FOREIGN KEY ("ConductorID") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusTrip" ADD CONSTRAINT "BusTrip_RegularBusAssignmentID_fkey" FOREIGN KEY ("RegularBusAssignmentID") REFERENCES "RegularBusAssignment"("RegularBusAssignmentID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketBusTrip" ADD CONSTRAINT "TicketBusTrip_BusTripID_fkey" FOREIGN KEY ("BusTripID") REFERENCES "BusTrip"("BusTripID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketBusTrip" ADD CONSTRAINT "TicketBusTrip_TicketTypeID_fkey" FOREIGN KEY ("TicketTypeID") REFERENCES "TicketType"("TicketTypeID") ON DELETE RESTRICT ON UPDATE CASCADE;
