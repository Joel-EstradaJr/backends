import { PrismaClient, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

// Helpers
const dec = (v: number) => v; // use plain numbers for Decimal fields
const randPick = <T>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

async function main() {
		const db = prisma as any; // alias for newly added models before prisma generate
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

			// FTMS data
			db.itemTransaction.deleteMany(),
			db.receiptItem.deleteMany(),
			db.receipt.deleteMany(),
			db.item.deleteMany(),
			db.unit.deleteMany(),

			// Inventory/Bus depend on User via created_by, so delete them before Users
			prisma.bus.deleteMany(),
			prisma.inventoryItem.deleteMany(),
			prisma.category.deleteMany(),

			// HR data
			prisma.benefit.deleteMany(),
			prisma.deduction.deleteMany(),
			prisma.attendance.deleteMany(),

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
		"Inventory",
		"Human Resources",
		"Finance"
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
		{ positionName: "HR Specialist", dept: "Human Resources" },
		{ positionName: "Payroll Officer", dept: "Finance" },
		{ positionName: "Accountant", dept: "Finance" },
		{ positionName: "Inventory Specialist", dept: "Inventory" },
		{ positionName: "Warehouse Clerk", dept: "Inventory" },
	];
		const positions = [] as { id: number; positionName: string }[];
	for (const spec of positionSpecs) {
		const dept = departments.find((d) => d.departmentName === spec.dept)!;
		const p = await prisma.position.create({
			data: { positionName: spec.positionName, departmentId: dept.id },
		});
		positions.push(p);
	}

	// Create 20 employees for endpoints
	const firstNames = [
		"Joel",
		"Nerie Ann",
		"Carl Aldrey",
		"Christelle Ann",
		"Brian",
		"Kristine Mae",
		"Yuan Exequiel",
		"Bette Anjanelle",
		"John Mark",
		"Lei Ann",
		"Richard Jason",
		"Ashley Gene",
		"Crystalyn",
		"Clarisse Irish",
		"Rhian Jolius",
		"Julia",
		"Mae Loraine",
		"Rocket",
		"Bruno",
		"Depunggal",
	];

	const middleNames = [
		"Robes",
		"Sarabillo",
		"Anderson",
		"Taylors",
		"Senora",
		"Castillo",
		"Jefferson",
		"Benjamin",
		"Cruz",
		"Selecta",
		"Montalban",
		"Louise",
		"Ramos",
		"",
		"",
		"Evangelista",
		"",
		"D.",
		"",
		"Ka",
	];

	const lastNames = [
		"Estrada Jr.",
		"Bravo-Estrada",
		"Bergado",
		"Dacapias",
		"Caube",
		"Cleofas",
		"Evangelista",
		"Cabarles",
		"Garces",
		"Cornetto",
		"Aquino",
		"Equipelag",
		"Danga",
		"Jotojot-Paller",
		"Baldomar",
		"Ababa",
		"Dela Torre",
		"Golden Retriever",
		"Mars",
		"Yawa",
	];

		const employees: Array<Awaited<ReturnType<typeof prisma.employee.create>>> = [];
	const today = new Date();
	// We want 20 employees in 5 groups of 4 each:
	// - 4 Drivers (Operations)
	// - 4 Conductors (Operations)
	// - 4 Finance (Payroll Officer/Accountant)
	// - 4 Inventory (Inventory Specialist/Warehouse Clerk)
	// - 4 HR (HR Specialist)
	const driverPos = positions.find((p) => p.positionName === "Driver");
	const conductorPos = positions.find((p) => p.positionName === "Conductor");
	const financePositions = positions.filter((p) => ["Payroll Officer", "Accountant"].includes(p.positionName));
	const inventoryPositions = positions.filter((p) => ["Inventory Specialist", "Warehouse Clerk"].includes(p.positionName));
	const hrPos = positions.find((p) => p.positionName === "HR Specialist");

	for (let i = 0; i < 20; i++) {
		let pos;
		if (i < 4) pos = driverPos!; // 0-3 Drivers
		else if (i < 8) pos = conductorPos!; // 4-7 Conductors
		else if (i < 12) pos = randPick(financePositions); // 8-11 Finance
		else if (i < 16) pos = randPick(inventoryPositions); // 12-15 Inventory
		else pos = hrPos!; // 16-19 HR

		const e = await prisma.employee.create({
			data: ({
					employeeNumber: `EMP-${String(i + 1).padStart(4, "0")}`,
			firstName: firstNames[i % firstNames.length],
			lastName: lastNames[i % lastNames.length],
			middleName: middleNames[i % middleNames.length],
			suffix: i % 7 === 0 ? "Jr." : null,
			birthdate: addDays(today, -(365 * (25 + (i % 15)))),
			hiredate: addDays(today, -365 - i * 10),
			terminationDate: i % 19 === 0 ? addDays(today, -30) : null,
			terminationReason: i % 19 === 0 ? "End of contract" : null,
			basicRate: dec(500 + i * 25),
			rateType: randPick(["Monthly", "Daily", "Weekly", "Semi-Monthly"]),
			employeeStatus: i % 19 === 0 ? "inactive" : "active",
			employeeType: i % 5 === 0 ? "contract" : "regular",
			employeeClassification: i % 4 === 0 ? "Rank-and-File" : "Supervisory",
			phone: (() => {
				const rest = Math.floor(100000000 + Math.random() * 900000000)
					.toString()
					.padStart(9, "0");
				const digits = `09${rest}`; // total 11 digits
				return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
			})(),
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

	// Benefit & Deduction Names
	const benefitNames = [
		"Service Incentive Leave",
		"Holiday Pay",
		"13th Month Pay",
		"Safety",
		"Additional",
		"Meal Allowance",
		"Transport Allowance",
		"Health Insurance",
		"Performance Bonus",
		"Overtime Pay",
	];
	const deductionNames = [
		"Cash Advance",
		"PAG-IBIG",
		"SSS",
		"PhilHealth",
		"Damage",
		"Shortage",
		"Tax",
		"Loan Repayment",
		"Late Penalty",
		"Other Deduction",
	];

	// Benefits & Deductions: exactly 1 each per employee
	for (const e of employees) {
		const benefitName = randPick(benefitNames);
		await prisma.benefit.create({
			data: {
				employeeId: e.id,
				name: benefitName,
				value: dec(750),
				frequency: randPick(["Once", "Monthly", "Daily", "Weekly", "Annually"]),
				effectiveDate: addDays(today, -60),
				endDate: null,
				isActive: true,
			},
		});

		const deductionName = randPick(deductionNames);
		await prisma.deduction.create({
			data: {
				employeeId: e.id,
				name: deductionName,
				value: dec(200),
				frequency: randPick(["Once", "Monthly", "Daily", "Weekly", "Annually"]),
				effectiveDate: addDays(today, -90),
				endDate: null,
				isActive: true,
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

	// 3b) FTMS Units, Items, Receipts, Transactions
	const unitUpserts = [
		{ id: "UNIT", name: "Unit" },
		{ id: "PCS", name: "pcs" },
		{ id: "BOX", name: "Box" },
		{ id: "LITER", name: "liter" },
		{ id: "KG", name: "kg" },
		{ id: "SET", name: "set" },
		{ id: "PAIRS", name: "pairs" },
		{ id: "ROLLS", name: "rolls" },
		{ id: "SETS", name: "sets" },
	];
	for (const u of unitUpserts) {
		await db.unit.upsert({ where: { id: u.id }, update: { name: u.name, isdeleted: false }, create: u });
	}
	const units = await db.unit.findMany();
	const unitByName = Object.fromEntries(units.map((u: any) => [u.name.toLowerCase(), u.id]));

	// Add another category for FTMS items
	const catInv = await prisma.category.upsert({
		where: { category_id: "CAT002" },
		update: {},
		create: { category_id: "CAT002", category_name: "Inventory" },
	});

	// Define 50 items with specific names and units
	const itemDefs: Array<{ id: string; name: string; unit: string }> = [
		{ id: "ITEM-0001", name: "Diesel Fuel", unit: "liter" },
		{ id: "ITEM-0002", name: "Engine Oil", unit: "liter" },
		{ id: "ITEM-0003", name: "Coolant", unit: "liter" },
		{ id: "ITEM-0004", name: "Grease", unit: "kg" },
		{ id: "ITEM-0005", name: "Brake Fluid", unit: "liter" },
		{ id: "ITEM-0006", name: "Bus Tires", unit: "pcs" },
		{ id: "ITEM-0007", name: "Air Filters", unit: "pcs" },
		{ id: "ITEM-0008", name: "Fuel Filters", unit: "pcs" },
		{ id: "ITEM-0009", name: "Brake Pads", unit: "set" },
		{ id: "ITEM-0010", name: "Headlight Bulbs", unit: "pcs" },
		{ id: "ITEM-0011", name: "Windshield Wipers", unit: "pcs" },
		{ id: "ITEM-0012", name: "Side Mirrors", unit: "pcs" },
		{ id: "ITEM-0013", name: "Seat Covers", unit: "pcs" },
		{ id: "ITEM-0014", name: "Floor Mats", unit: "pcs" },
		{ id: "ITEM-0015", name: "Window Glass Cleaner", unit: "liter" },
		{ id: "ITEM-0016", name: "Uniform Shirts", unit: "pcs" },
		{ id: "ITEM-0017", name: "Uniform Pants", unit: "pcs" },
		{ id: "ITEM-0018", name: "Reflective Vests", unit: "pcs" },
		{ id: "ITEM-0019", name: "Safety Helmets", unit: "pcs" },
		{ id: "ITEM-0020", name: "Protective Gloves", unit: "pairs" },
		{ id: "ITEM-0021", name: "Transmission Fluid", unit: "liter" },
		{ id: "ITEM-0022", name: "Hydraulic Oil", unit: "liter" },
		{ id: "ITEM-0023", name: "Power Steering Fluid", unit: "liter" },
		{ id: "ITEM-0024", name: "Spark Plugs", unit: "pcs" },
		{ id: "ITEM-0025", name: "Timing Belts", unit: "pcs" },
		{ id: "ITEM-0026", name: "Engine Belts", unit: "pcs" },
		{ id: "ITEM-0027", name: "Radiators", unit: "pcs" },
		{ id: "ITEM-0028", name: "Alternators", unit: "pcs" },
		{ id: "ITEM-0029", name: "Batteries", unit: "pcs" },
		{ id: "ITEM-0030", name: "Starter Motors", unit: "pcs" },
		{ id: "ITEM-0031", name: "First Aid Kits", unit: "pcs" },
		{ id: "ITEM-0032", name: "Fire Extinguishers", unit: "pcs" },
		{ id: "ITEM-0033", name: "Emergency Triangles", unit: "pcs" },
		{ id: "ITEM-0034", name: "Reflective Stickers", unit: "rolls" },
		{ id: "ITEM-0035", name: "Bus Tool Kits", unit: "sets" },
		{ id: "ITEM-0036", name: "Cleaning Detergent", unit: "liter" },
		{ id: "ITEM-0037", name: "Mops", unit: "pcs" },
		{ id: "ITEM-0038", name: "Buckets", unit: "pcs" },
		{ id: "ITEM-0039", name: "Brooms", unit: "pcs" },
		{ id: "ITEM-0040", name: "Disinfectant Spray", unit: "liter" },
		{ id: "ITEM-0041", name: "Bus Seats", unit: "pcs" },
		{ id: "ITEM-0042", name: "Seat Belts", unit: "pcs" },
		{ id: "ITEM-0043", name: "Overhead Fans", unit: "pcs" },
		{ id: "ITEM-0044", name: "AC Filters", unit: "pcs" },
		{ id: "ITEM-0045", name: "Curtains", unit: "pcs" },
		{ id: "ITEM-0046", name: "GPS Devices", unit: "pcs" },
		{ id: "ITEM-0047", name: "Two-Way Radios", unit: "pcs" },
		{ id: "ITEM-0048", name: "CCTV Cameras", unit: "pcs" },
		{ id: "ITEM-0049", name: "Ticket Printers", unit: "pcs" },
		{ id: "ITEM-0050", name: "Fare Cards", unit: "pcs" },
	];

	const ftmsItems = [] as any[];
	for (const def of itemDefs) {
		const unitId = unitByName[def.unit] ?? units[0].id;
		ftmsItems.push(
			await db.item.upsert({
				where: { item_id: def.id },
				update: { item_name: def.name, unit_id: unitId, category_id: catInv.category_id, isdeleted: false },
				create: { item_id: def.id, item_name: def.name, unit_id: unitId, category_id: catInv.category_id },
			}),
		);
	}

	const receiptA = await db.receipt.upsert({ where: { receipt_id: "RCPT-20250914" }, update: { isdeleted: false }, create: { receipt_id: "RCPT-20250914" } });

	// Create receipt items for all seeded items (unprocessed)
	for (const it of ftmsItems) {
		await db.receiptItem.upsert({
			where: { receipt_id_item_id: { receipt_id: receiptA.receipt_id, item_id: it.item_id } },
			update: { isInventoryProcessed: false, isdeleted: false },
			create: { receipt_id: receiptA.receipt_id, item_id: it.item_id, isInventoryProcessed: false },
		});
	}

	// Grouped transactions ITX-1001..ITX-1010
	const txnDefs: Array<{ id: string; date: string; itemIdx: number[]; qty: number[] }> = [
		{ id: "ITX-1001", date: "2025-09-14T08:15:00.000Z", itemIdx: [0,1,2,3,4], qty: [1500,80,40,20,25] },
		{ id: "ITX-1002", date: "2025-09-14T09:00:00.000Z", itemIdx: [5,6,7,8,9], qty: [10,15,20,8,30] },
		{ id: "ITX-1003", date: "2025-09-14T09:45:00.000Z", itemIdx: [10,11,12,13,14], qty: [25,12,40,35,50] },
		{ id: "ITX-1004", date: "2025-09-14T10:20:00.000Z", itemIdx: [15,16,17,18,19], qty: [60,60,40,25,50] },
		{ id: "ITX-1005", date: "2025-09-14T11:00:00.000Z", itemIdx: [20,21,22,23,24], qty: [60,70,30,100,10] },
		{ id: "ITX-1006", date: "2025-09-14T11:30:00.000Z", itemIdx: [25,26,27,28,29], qty: [15,5,6,12,4] },
		{ id: "ITX-1007", date: "2025-09-14T12:00:00.000Z", itemIdx: [30,31,32,33,34], qty: [20,15,30,10,12] },
		{ id: "ITX-1008", date: "2025-09-14T12:45:00.000Z", itemIdx: [35,36,37,38,39], qty: [100,20,15,25,60] },
		{ id: "ITX-1009", date: "2025-09-14T13:30:00.000Z", itemIdx: [40,41,42,43,44], qty: [12,30,8,20,40] },
		{ id: "ITX-1010", date: "2025-09-14T14:15:00.000Z", itemIdx: [45,46,47,48,49], qty: [6,10,8,5,500] },
	];
	for (const t of txnDefs) {
		for (let k = 0; k < t.itemIdx.length; k++) {
			const idx = t.itemIdx[k];
			await db.itemTransaction.create({
				data: {
					transaction_id: t.id,
					transaction_date: new Date(t.date),
					item_id: ftmsItems[idx].item_id,
					receipt_id: receiptA.receipt_id,
					quantity: dec(t.qty[k]),
				},
			});
		}
	}

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
				Payment_Method: j % 2 === 0 ? PaymentMethod.Cash : PaymentMethod.Reimbursement,
				IsExpenseRecorded: j % 2 === 0, // alternate
				IsRevenueRecorded: j % 3 === 0, // every third recorded
			},
		});
	}

		// Counts for FTMS entities
		const ftmsCounts = await Promise.all([
			db.unit.count(),
			db.item.count(),
			db.receipt.count(),
			db.receiptItem.count(),
			db.itemTransaction.count(),
		]);

		console.log("Seeding completed:");
		console.log({
		departments: departmentNames.length,
		positions: positionSpecs.length,
		employees: employees.length,


		stops: stops.length,
		routes: routes.length,
		buses: buses.length,
		busAssignments: busAssignments.length,
		regularAssignments: regularAssignments.length,
		quotaPolicies: quotaPolicies.length,
			ftms_units: ftmsCounts[0],
			ftms_items: ftmsCounts[1],
			ftms_receipts: ftmsCounts[2],
			ftms_receiptItems: ftmsCounts[3],
			ftms_itemTransactions: ftmsCounts[4],
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

