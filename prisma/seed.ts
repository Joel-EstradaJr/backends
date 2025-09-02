import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helpers
const dec = (v: number) => v;
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);

async function main() {
	// Clean only what we seed
	await prisma.$transaction([
		prisma.ticketBusTrip.deleteMany(),
		prisma.busTrip.deleteMany(),
		prisma.fixed.deleteMany(),
		prisma.percentage.deleteMany(),
		prisma.quota_Policy.deleteMany(),
		prisma.regularBusAssignment.deleteMany(),
		prisma.busAssignment.deleteMany(),
		prisma.route.deleteMany(),
		prisma.stop.deleteMany(),
		prisma.bus.deleteMany(),
		prisma.benefit.deleteMany(),
		prisma.deduction.deleteMany(),
		prisma.attendance.deleteMany(),
		prisma.benefitType.deleteMany(),
		prisma.deductionType.deleteMany(),
		prisma.position.deleteMany(),
		prisma.department.deleteMany(),
	]);

	// Minimal HR: 2 departments, 3 positions
	const deptOps = await prisma.department.create({ data: { departmentName: "Operations" } });
	const deptHR = await prisma.department.create({ data: { departmentName: "Human Resources" } });

	const posDriver = await prisma.position.create({ data: { positionName: "Driver", departmentId: deptOps.id } });
	const posConductor = await prisma.position.create({ data: { positionName: "Conductor", departmentId: deptOps.id } });
	const posPayroll = await prisma.position.create({ data: { positionName: "Payroll Officer", departmentId: deptHR.id } });

	// Employees (5)
	const today = new Date();
	const makeEmp = async (n: number, posId: number) =>
		prisma.employee.create({
			data: {
				employeeNumber: `EMP${String(n).padStart(4, "0")}`,
				firstName: `First${n}`,
				lastName: `Last${n}`,
				birthdate: addDays(today, -(365 * (25 + (n % 10)))),
				hiredate: addDays(today, -400),
				basicRate: dec(500 + n * 50),
				phone: `09${100000000 + n}`,
				barangay: "Bgy 1",
				streetAddress: `Street ${n}`,
				city: "City",
				province: "Province",
				zipCode: "1234",
				country: "PH",
				positionId: posId,
			},
		});

	const e1 = await makeEmp(1, posDriver.id);
	const e2 = await makeEmp(2, posDriver.id);
	const e3 = await makeEmp(3, posConductor.id);
	const e4 = await makeEmp(4, posConductor.id);
	const e5 = await makeEmp(5, posPayroll.id);

	// Attendance (1-2 each)
	await prisma.attendance.createMany({
		data: [
			{ employeeId: e1.id, date: addDays(today, -2), status: "Present" },
			{ employeeId: e1.id, date: addDays(today, -1), status: "Present" },
			{ employeeId: e2.id, date: addDays(today, -1), status: "On Leave" },
		],
		skipDuplicates: true,
	});

	// Benefit & Deduction types (minimal)
	const btMeal = await prisma.benefitType.create({ data: { name: "Meal Allowance" } });
	const btHealth = await prisma.benefitType.create({ data: { name: "Health Insurance" } });
	const dtTax = await prisma.deductionType.create({ data: { name: "Tax" } });
	const dtSSS = await prisma.deductionType.create({ data: { name: "SSS" } });

	// Benefits/Deductions (active)
	await prisma.benefit.createMany({
		data: [
			{ employeeId: e1.id, value: dec(500), frequency: "Monthly", effectiveDate: addDays(today, -60), isActive: true, benefitTypeId: btMeal.id },
			{ employeeId: e2.id, value: dec(700), frequency: "Monthly", effectiveDate: addDays(today, -60), isActive: true, benefitTypeId: btHealth.id },
		],
	});
	await prisma.deduction.createMany({
		data: [
			{ employeeId: e1.id, type: "Tax", value: dec(200), frequency: "Monthly", effectiveDate: addDays(today, -90), isActive: true, deductionTypeId: dtTax.id },
			{ employeeId: e2.id, type: "SSS", value: dec(150), frequency: "Monthly", effectiveDate: addDays(today, -90), isActive: true, deductionTypeId: dtSSS.id },
		],
	});

	// Operations minimal to support op_bus-trip-details
	const start = await prisma.stop.create({ data: { StopID: "STOP001", StopName: "Start", latitude: "14.1", longitude: "121.1" } });
	const end = await prisma.stop.create({ data: { StopID: "STOP002", StopName: "End", latitude: "14.2", longitude: "121.2" } });
	const route = await prisma.route.create({ data: { RouteID: "ROUTE001", RouteName: "Route 1", StartStopID: start.StopID, EndStopID: end.StopID } });

	const bus = await prisma.bus.create({
		data: {
			bus_id: "BUS001",
			item_id: "ITEM001",
			plate_number: "ABC-1001",
			body_number: "BN-001",
			body_builder: "Isuzu",
			bus_type: "Aircon",
			manufacturer: "Generic Motors",
			status: "Active",
			chasis_number: "CHS-100001",
			engine_number: "ENG-200001",
			seat_capacity: 40,
			model: "Model-2020",
			year_model: 2020,
			route: "R1",
			condition: "Good",
			acquisition_date: addDays(today, -365),
			acquisition_method: "Purchase",
			registration_status: "Registered",
			created_by: 1, // dummy, not used by endpoints
		},
	});

	const assignment = await prisma.busAssignment.create({ data: { BusAssignmentID: "ASSIGN001", BusID: bus.bus_id, RouteID: route.RouteID, Status: "Ready" } });
	await prisma.regularBusAssignment.create({ data: { RegularBusAssignmentID: "RASSIGN001", DriverID: e1.id, ConductorID: e3.id, BusAssignmentID: assignment.BusAssignmentID } });

	await prisma.busTrip.createMany({
		data: [
			{ BusTripID: "TRIP-001-1", RegularBusAssignmentID: "RASSIGN001", DispatchedAt: addDays(today, -2), TripExpense: dec(1000), Sales: dec(3000), Payment_Method: "Cash", IsExpenseRecorded: false, IsRevenueRecorded: false },
			{ BusTripID: "TRIP-001-2", RegularBusAssignmentID: "RASSIGN001", DispatchedAt: addDays(today, -1), TripExpense: dec(1200), Sales: dec(3200), Payment_Method: "Card", IsExpenseRecorded: true, IsRevenueRecorded: false },
		],
	});

	console.log("Minimal seed completed");
}

main().catch((e) => { console.error("Seed error:", e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

