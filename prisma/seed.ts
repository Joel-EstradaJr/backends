import { PrismaClient, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

// Helpers
const dec = (v: number) => v; // use plain numbers for Decimal fields
const randPick = <T>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

async function main() {
		// 1) Clean existing data (in dependency order to satisfy FK constraints)
		await prisma.$transaction([
			// Operations and related junctions first
			prisma.ticketBusTrip.deleteMany(),
			prisma.busTrip.deleteMany(),
			prisma.fixed.deleteMany(),
			prisma.percentage.deleteMany(),
			prisma.quota_Policy.deleteMany(),
			prisma.regularBusAssignment.deleteMany(),
			prisma.busAssignment.deleteMany(),
			prisma.routeStop.deleteMany(),
			prisma.route.deleteMany(),
			prisma.stop.deleteMany(),

			// Inventory/Bus depend on User via created_by, so delete them before Users
			prisma.bus.deleteMany(),
			prisma.inventoryItem.deleteMany(),
			prisma.category.deleteMany(),

			// HR data
			prisma.benefit.deleteMany(),
			prisma.deduction.deleteMany(),
			prisma.attendance.deleteMany(),
			prisma.benefitType.deleteMany(),
			prisma.deductionType.deleteMany(),

			// Auth and core HR
			prisma.user.deleteMany(),
			prisma.employee.deleteMany(),
			prisma.position.deleteMany(),
			prisma.department.deleteMany(),
			prisma.role.deleteMany(),
			prisma.securityQuestion.deleteMany(),
		]);


	// 2) HR Core: Departments, Positions, Employees (+ attendance, benefits, deductions)
	const departmentNames = [
		"Operations",
		"Human Resources",
		"Finance",
		"Maintenance",
		"IT",
		"Logistics",
		"Safety",
		"Customer Service",
		"Procurement",
		"Compliance",
	];
		const departments = [] as { id: number; departmentName: string }[];
	for (const departmentName of departmentNames) {
		const d = await prisma.department.create({ data: { departmentName } });
		departments.push(d);
	}

	const positionSpecs = [
		{ positionName: "Driver", dept: "Operations" },
		{ positionName: "Conductor", dept: "Operations" },
		{ positionName: "Dispatcher", dept: "Operations" },
		{ positionName: "Mechanic", dept: "Maintenance" },
		{ positionName: "HR Specialist", dept: "Human Resources" },
		{ positionName: "Payroll Officer", dept: "Finance" },
		{ positionName: "Accountant", dept: "Finance" },
		{ positionName: "IT Support", dept: "IT" },
		{ positionName: "Logistics Coordinator", dept: "Logistics" },
		{ positionName: "Safety Officer", dept: "Safety" },
	];
		const positions = [] as { id: number; positionName: string }[];
	for (const spec of positionSpecs) {
		const dept = departments.find((d) => d.departmentName === spec.dept)!;
		const p = await prisma.position.create({
			data: { positionName: spec.positionName, departmentId: dept.id },
		});
		positions.push(p);
	}

	// Create 10 employees (5 drivers, 5 conductors) for endpoints
	const firstNames = [
		"Juan",
		"Maria",
		"Jose",
		"Ana",
		"Pedro",
		"Liza",
		"Carlos",
		"Rosa",
		"Miguel",
		"Elena",
		"Mario",
		"Carmen",
	];
	const lastNames = [
		"Santos",
		"Reyes",
		"Cruz",
		"Bautista",
		"Garcia",
		"Torres",
		"Navarro",
		"Ramos",
		"Mendoza",
		"Villanueva",
		"Aquino",
		"Dela Cruz",
	];

		const employees: Array<Awaited<ReturnType<typeof prisma.employee.create>>> = [];
	const today = new Date();
	for (let i = 0; i < 10; i++) {
		const isDriver = i < 5; // first 5 as drivers
		const isConductor = i >= 5 && i < 10; // next 5 as conductors
		const pos = isDriver
			? positions.find((p) => p.positionName === "Driver")!
			: isConductor
			? positions.find((p) => p.positionName === "Conductor")!
			: randPick(positions);

				const e = await prisma.employee.create({
					data: ({
					employeeNumber: `EMP${String(i + 1).padStart(4, "0")}`,
					firstName: firstNames[i % firstNames.length],
					lastName: lastNames[i % lastNames.length],
					middleName: i % 3 === 0 ? "M" : null,
					suffix: i % 7 === 0 ? "Jr." : null,
					birthdate: addDays(today, -(365 * (25 + (i % 15)))),
					hiredate: addDays(today, -365 - i * 10),
					terminationDate: i % 11 === 0 ? addDays(today, -30) : null,
					terminationReason: i % 11 === 0 ? "End of contract" : null,
					basicRate: dec(500 + i * 25),
					employeeStatus: i % 11 === 0 ? "inactive" : "active",
					employeeType: i % 5 === 0 ? "contract" : "regular",
					employeeClassification: i % 4 === 0 ? "Rank-and-File" : "Supervisory",
					phone: `09${Math.floor(100000000 + Math.random() * 899999999)}`,
					email: `emp${i + 1}@example.com`,
					emergencyContactName: i % 2 === 0 ? "EC Name" : null,
					emergencyContactNo: i % 2 === 0 ? "09123456789" : null,
					barangay: "Barangay 1",
					streetAddress: `Street ${i + 1}`,
					city: "City",
					province: "Province",
					zipCode: "1234",
					country: "PH",
					positionId: pos.id,
					expireDate: i % 6 === 0 ? addDays(today, 365) : null,
					licenseNo: i % 3 === 0 ? `LIC-${1000 + i}` : null,
					licenseType: i % 3 === 0 ? "Driver" : null,
					restrictionCodes: i % 3 === 0 ? ["1", "2"] : [],
					}) as any,
			});
		employees.push(e);
	}

	// Attendance: 1 per employee (~10 total)
	for (const e of employees) {
		for (let j = 0; j < 1; j++) {
							await prisma.attendance.create({
								data: {
									employeeId: e.id,
								date: addDays(today, -1),
								status: "Present",
									isHoliday: false,
								},
							});
		}
	}

	// Benefit & Deduction Types (>=10 each)
	const benefitTypeNames = [
		"Meal Allowance",
		"Transport Allowance",
		"Health Insurance",
		"Life Insurance",
		"Housing Allowance",
		"Phone Allowance",
		"Education Assistance",
		"Performance Bonus",
		"Overtime Pay",
		"Hazard Pay",
	];
	const deductionTypeNames = [
		"Tax",
		"SSS",
		"PhilHealth",
		"Pag-IBIG",
		"Loan Repayment",
		"Late Penalty",
		"Uniform Deduction",
		"Advance Deduction",
		"Health Deduction",
		"Other Deduction",
	];

	const benefitTypes = [] as { id: number; name: string }[];
	for (const name of benefitTypeNames) {
		benefitTypes.push(await prisma.benefitType.create({ data: { name } }));
	}
	const deductionTypes = [] as { id: number; name: string }[];
	for (const name of deductionTypeNames) {
		deductionTypes.push(await prisma.deductionType.create({ data: { name } }));
	}

	// Benefits & Deductions: exactly 1 each per employee (~10 per table), active
	for (const e of employees) {
		const bt = randPick(benefitTypes);
		await prisma.benefit.create({
			data: {
				employeeId: e.id,
				value: dec(750),
				frequency: "Monthly",
				effectiveDate: addDays(today, -60),
				endDate: null,
				isActive: true,
				benefitTypeId: bt.id,
			},
		});

		const dt = randPick(deductionTypes);
		await prisma.deduction.create({
			data: {
				employeeId: e.id,
				type: dt.name,
				value: dec(200),
				frequency: "Monthly",
				effectiveDate: addDays(today, -90),
				endDate: null,
				isActive: true,
				deductionTypeId: dt.id,
			},
		});
	}

	// 3) Minimal auth + inventory prerequisites to satisfy Bus FKs
	const role = await prisma.role.create({ data: { name: "Admin" } });
	const sec = await prisma.securityQuestion.create({ data: { question: "Mother's maiden name?" } });

	// Make first employee a user for created_by
	const firstEmp = employees[0];
	const user = await prisma.user.create({
		data: {
			employeeId: firstEmp.id,
			email: "admin@example.com",
			password: "$2a$10$abcdefghijklmnopqrstuv", // dummy bcrypt hash-like string
			firstName: firstEmp.firstName,
			lastName: firstEmp.lastName,
			birthdate: addDays(today, -365 * 30),
			roleId: role.id,
			securityQuestionId: sec.id,
			securityAnswer: "secret",
			mustChangePassword: false,
		},
	});

	const category = await prisma.category.create({
		data: { category_id: "CAT001", category_name: "Vehicles" },
	});

	const invItem = await prisma.inventoryItem.create({
		data: {
			item_id: "ITEMBUS001",
			category_id: category.category_id,
			item_name: "Bus Stock Item",
			unit_measure: "unit",
			current_stock: 100,
			reorder_level: 10,
			status: "Available",
			created_by: user.id,
		},
	});

	// 4) Operations: Stops, Routes, Buses, Assignments, Quotas, Trips
	// Stops (20)
	const stops = [] as { StopID: string }[];
	for (let i = 1; i <= 20; i++) {
		const s = await prisma.stop.create({
			data: {
				StopID: `STOP${String(i).padStart(3, "0")}`,
				StopName: `Stop ${i}`,
				latitude: `14.${100 + i}`,
				longitude: `121.${200 + i}`,
			},
		});
		stops.push(s);
	}

	// Routes (10)
	const routes = [] as { RouteID: string }[];
	for (let i = 1; i <= 10; i++) {
		const start = stops[(i - 1) * 2];
		const end = stops[(i - 1) * 2 + 1];
		const r = await prisma.route.create({
			data: {
				RouteID: `ROUTE${String(i).padStart(3, "0")}`,
				RouteName: `Route ${i}: ${start.StopID} -> ${end.StopID}`,
				StartStopID: start.StopID,
				EndStopID: end.StopID,
			},
		});
		routes.push(r);
	}

	// Buses (10)
	const busTypes = ["Aircon", "NonAircon"] as const;
	const bodyBuilders = ["Isuzu", "Toyota", "Hyundai", "Mitsubishi"] as const;
	const buses = [] as { bus_id: string }[];
	for (let i = 1; i <= 10; i++) {
		const b = await prisma.bus.create({
			data: {
				bus_id: `BUS${String(i).padStart(3, "0")}`,
				item_id: invItem.item_id, // reuse same inventory item
				plate_number: `ABC-${1000 + i}`,
				body_number: `BN-${String(i).padStart(3, "0")}`,
				body_builder: randPick(bodyBuilders),
				bus_type: randPick(busTypes),
				manufacturer: "Generic Motors",
				status: "Active",
				chasis_number: `CHS-${100000 + i}`,
				engine_number: `ENG-${200000 + i}`,
				seat_capacity: 40 + (i % 5) * 2,
				model: `Model-${2010 + (i % 10)}`,
				year_model: 2015 + (i % 8),
				route: `R${i}`,
				condition: "Good",
				acquisition_date: addDays(today, -365 * (3 + (i % 3))),
				acquisition_method: "Purchase",
				warranty_expiration_date: addDays(today, 365 * 1),
				registration_status: "Registered",
				created_by: user.id,
			},
		});
		buses.push(b);
	}

	// BusAssignments (10) one per bus/route
	const busAssignments = [] as { BusAssignmentID: string; BusID: string }[];
	for (let i = 1; i <= 10; i++) {
		const a = await prisma.busAssignment.create({
			data: {
				BusAssignmentID: `ASSIGN${String(i).padStart(3, "0")}`,
				BusID: buses[i - 1].bus_id,
				RouteID: routes[i - 1].RouteID,
				Battery: true,
				Lights: true,
				Oil: true,
				Water: true,
				Break: true,
				Air: true,
				Gas: true,
				Engine: true,
				TireCondition: true,
				Self_Driver: false,
				Self_Conductor: false,
				IsDeleted: false,
				Status: "Ready",
			},
		});
		busAssignments.push(a);
	}

	// RegularBusAssignments (10) with drivers and conductors from our employees
	const driverEmployees = employees.filter((e) => {
		const p = positions.find((p) => p.id === e.positionId);
		return p?.positionName === "Driver";
	});
	const conductorEmployees = employees.filter((e) => {
		const p = positions.find((p) => p.id === e.positionId);
		return p?.positionName === "Conductor";
	});
	const regularAssignments = [] as { RegularBusAssignmentID: string }[];
	for (let i = 1; i <= 10; i++) {
		const driver = driverEmployees[i % driverEmployees.length];
		const conductor = conductorEmployees[i % conductorEmployees.length];
		const ra = await prisma.regularBusAssignment.create({
			data: {
				RegularBusAssignmentID: `RASSIGN${String(i).padStart(3, "0")}`,
				DriverID: driver.id,
				ConductorID: conductor.id,
				BusAssignmentID: busAssignments[i - 1].BusAssignmentID,
			},
		});
		regularAssignments.push(ra);
	}

	// Quota Policies (>=10): alternate Fixed and Percentage; cover last month to next month
	const quotaPolicies = [] as { QuotaPolicyID: string; RegularBusAssignmentID: string }[];
	for (let i = 1; i <= 10; i++) {
		const qp = await prisma.quota_Policy.create({
			data: {
				QuotaPolicyID: `QP${String(i).padStart(3, "0")}`,
				StartDate: addDays(today, -30),
				EndDate: addDays(today, 30),
				RegularBusAssignmentID: regularAssignments[i - 1].RegularBusAssignmentID,
			},
		});
		quotaPolicies.push(qp);

		if (i % 2 === 0) {
			await prisma.fixed.create({
				data: {
					FQuotaPolicyID: qp.QuotaPolicyID,
					Quota: 5000 + (i % 3) * 1000,
				},
			});
		} else {
			await prisma.percentage.create({
				data: {
					PQuotaPolicyID: qp.QuotaPolicyID,
					Percentage: 0.1 * (1 + (i % 3)), // 10% - 30%
				},
			});
		}
	}

	// Bus Trips: 1 per regular assignment (~10 total); ensure TripExpense & Sales set; vary recorded flags
	for (let i = 0; i < regularAssignments.length; i++) {
		const ra = regularAssignments[i];
		const j = 1;
		const dispatchedAt = addDays(today, -(i + j));
		await prisma.busTrip.create({
			data: {
				BusTripID: `TRIP-${String(i + 1).padStart(3, "0")}-${j}`,
				RegularBusAssignmentID: ra.RegularBusAssignmentID,
				DispatchedAt: dispatchedAt,
				TripExpense: dec(1000 + i * 50 + j * 20),
				Sales: dec(3000 + i * 100 + j * 50),
			Payment_Method: j % 2 === 0 ? PaymentMethod.Cash : PaymentMethod.Mixed,
				IsExpenseRecorded: j % 2 === 0, // alternate
				IsRevenueRecorded: j % 3 === 0, // every third recorded
			},
		});
	}

	console.log("Seeding completed:");
	console.log({
		departments: departmentNames.length,
		positions: positionSpecs.length,
		employees: employees.length,
		benefitTypes: benefitTypes.length,
		deductionTypes: deductionTypes.length,
		stops: stops.length,
		routes: routes.length,
		buses: buses.length,
		busAssignments: busAssignments.length,
		regularAssignments: regularAssignments.length,
		quotaPolicies: quotaPolicies.length,
	});
}

main()
	.catch((e) => {
		console.error("Seed error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

