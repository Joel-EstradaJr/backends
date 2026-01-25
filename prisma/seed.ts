import { PrismaClient, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

// Helpers
const dec = (v: number) => v; // use plain numbers for Decimal fields
const randPick = <T>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
const generateId = (prefix: string, index: number) => `${prefix}-${Date.now().toString(36)}${String(index).padStart(4, '0')}`;

// Employee data - extended to include drivers and conductors (at least 20 operations employees)
const employeeData = [
  // Human Resource
  { employeeNumber: "EMP-2024-NKFN57", firstName: "Juan", middleName: "Reyes", lastName: "Dela Cruz", phone: "09171234567", position: "HR Officer", barangay: "Barangay Uno", zipCode: "1100", departmentId: 1, department: "Human Resource" },
  { employeeNumber: "EMP-2025-6WQEDZ", firstName: "Cecilia", middleName: "Rubio", lastName: "Danga", phone: "09214170057", position: "HR Assistant", barangay: "17", zipCode: "1400", departmentId: 1, department: "Human Resource" },
  { employeeNumber: "EMP-2025-8QGB8W", firstName: "Crystalyn", middleName: "Rubio", lastName: "Danga", phone: "09458904285", position: "HR Officer", barangay: "178", zipCode: "1400", departmentId: 1, department: "Human Resource" },
  { employeeNumber: "EMP-2022-X6UCLL", firstName: "Danilo", middleName: "Pascual", lastName: "Panganiban", phone: "09171234567", position: "HR Officer", barangay: "Brgy. Central", zipCode: "1100", departmentId: 1, department: "Human Resource" },
  
  // Finance
  { employeeNumber: "EMP-2023-FIN-001", firstName: "Brian", middleName: "Soriano", lastName: "Caube", phone: "09214170057", position: "Accountant", barangay: "Muzon West", zipCode: "3023", departmentId: 2, department: "Finance" },
  { employeeNumber: "EMP-2022-Y6LOM3", firstName: "Efren", middleName: "Bautista", lastName: "Batungbakal", phone: "09215678901", position: "Finance Assistant", barangay: "Brgy. Loyola", zipCode: "1108", departmentId: 2, department: "Finance" },
  { employeeNumber: "EMP-2023-7B6KXI", firstName: "Jose", middleName: "Rizal", lastName: "Mercado", phone: "09271234567", position: "Accountant", barangay: "Brgy. Poblacion", zipCode: "4027", departmentId: 2, department: "Finance" },
  { employeeNumber: "EMP-2022-VKMJZV", firstName: "Andres", middleName: "Supremo", lastName: "Bonifacio", phone: "09359012345", position: "Accountant", barangay: "Brgy. 101", zipCode: "1012", departmentId: 2, department: "Finance" },
  
  // Inventory
  { employeeNumber: "EMP-20260111-000005", firstName: "Omar", middleName: "", lastName: "Abro", phone: "09124578365", position: "Inventory Manager", barangay: "Baclaran", zipCode: "1300", departmentId: 3, department: "Inventory" },
  { employeeNumber: "EMP-2023-INV-010", firstName: "Christelle Ann", middleName: "Alonso", lastName: "Dacapias", phone: "09214170057", position: "Inventory Clerk", barangay: "Brgy. 176", zipCode: "4514", departmentId: 3, department: "Inventory" },
  { employeeNumber: "EMP-2023-6LCER4", firstName: "Maria", middleName: "Lopez", lastName: "Santos", phone: "9969241241", position: "Inventory Clerk", barangay: "Barangay Dos", zipCode: "1100", departmentId: 3, department: "Inventory" },
  { employeeNumber: "EMP-20260111-000001", firstName: "Catherine", middleName: "Daulo", lastName: "Bergado", phone: "09205357783", position: "Inventory Manager", barangay: "Santo Cristo", zipCode: "3023", departmentId: 3, department: "Inventory" },
  
  // Operations - Drivers (20+)
  { employeeNumber: "EMP-2021-OPS-D001", firstName: "Mario", middleName: "Ramos", lastName: "Perez", phone: "+639389025401", position: "Driver", barangay: "Santo Niño", zipCode: "1100", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2021-OPS-D002", firstName: "Ricardo", middleName: "Santos", lastName: "Cruz", phone: "+639171234501", position: "Driver", barangay: "Sapang Palay", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2021-OPS-D003", firstName: "Eduardo", middleName: "Reyes", lastName: "Garcia", phone: "+639182345602", position: "Driver", barangay: "Tungkong Mangga", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2022-OPS-D004", firstName: "Roberto", middleName: "Lopez", lastName: "Martinez", phone: "+639193456703", position: "Driver", barangay: "Fatima III", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2022-OPS-D005", firstName: "Antonio", middleName: "Castro", lastName: "Hernandez", phone: "+639204567804", position: "Driver", barangay: "Holy Spirit", zipCode: "3740", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2022-OPS-D006", firstName: "Francisco", middleName: "Bautista", lastName: "Gonzales", phone: "+639215678905", position: "Driver", barangay: "Muzon West", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2023-OPS-D007", firstName: "Carlos", middleName: "Fernandez", lastName: "Reyes", phone: "+639226789006", position: "Driver", barangay: "Santo Cristo", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2023-OPS-D008", firstName: "Miguel", middleName: "Rodriguez", lastName: "Santos", phone: "+639237890107", position: "Driver", barangay: "Bancal", zipCode: "3020", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2023-OPS-D009", firstName: "Pedro", middleName: "Villanueva", lastName: "Torres", phone: "+639248901208", position: "Driver", barangay: "Claro", zipCode: "3024", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2023-OPS-D010", firstName: "Ramon", middleName: "Aquino", lastName: "Ramos", phone: "+639259012309", position: "Driver", barangay: "Malamig", zipCode: "1010", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2024-OPS-D011", firstName: "Luis", middleName: "Mendoza", lastName: "Diaz", phone: "+639260123410", position: "Driver", barangay: "Brgy. Central", zipCode: "1100", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2024-OPS-D012", firstName: "Fernando", middleName: "Soriano", lastName: "Lim", phone: "+639271234511", position: "Driver", barangay: "Brgy. Loyola", zipCode: "1108", departmentId: 4, department: "Operations" },
  
  // Operations - Conductors (20+)
  { employeeNumber: "EMP-2021-OPS-C001", firstName: "Jose", middleName: "Navarro", lastName: "Domingo", phone: "+639100001001", position: "Conductor", barangay: "Santo Niño", zipCode: "1100", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2021-OPS-C002", firstName: "Manuel", middleName: "Tolentino", lastName: "Cruz", phone: "+639100001002", position: "Conductor", barangay: "Sapang Palay", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2021-OPS-C003", firstName: "Alfredo", middleName: "Pascual", lastName: "Flores", phone: "+639100001003", position: "Conductor", barangay: "Tungkong Mangga", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2022-OPS-C004", firstName: "Benjamin", middleName: "Estrada", lastName: "Morales", phone: "+639100001004", position: "Conductor", barangay: "Fatima III", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2022-OPS-C005", firstName: "Gregorio", middleName: "Valencia", lastName: "Aguilar", phone: "+639100001005", position: "Conductor", barangay: "Holy Spirit", zipCode: "3740", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2022-OPS-C006", firstName: "Ernesto", middleName: "Miranda", lastName: "Medina", phone: "+639100001006", position: "Conductor", barangay: "Muzon West", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2023-OPS-C007", firstName: "Alberto", middleName: "Jimenez", lastName: "Vargas", phone: "+639100001007", position: "Conductor", barangay: "Santo Cristo", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2023-OPS-C008", firstName: "Arturo", middleName: "Salazar", lastName: "Castillo", phone: "+639100001008", position: "Conductor", barangay: "Bancal", zipCode: "3020", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2023-OPS-C009", firstName: "Rolando", middleName: "Guerrero", lastName: "Ortega", phone: "+639100001009", position: "Conductor", barangay: "Claro", zipCode: "3024", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2023-OPS-C010", firstName: "Oscar", middleName: "Delgado", lastName: "Fuentes", phone: "+639100001010", position: "Conductor", barangay: "Malamig", zipCode: "1010", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2024-OPS-C011", firstName: "Cesar", middleName: "Romero", lastName: "Navarro", phone: "+639100001011", position: "Conductor", barangay: "Brgy. Central", zipCode: "1100", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2024-OPS-C012", firstName: "Nestor", middleName: "Cabrera", lastName: "Espinosa", phone: "+639100001012", position: "Conductor", barangay: "Brgy. Loyola", zipCode: "1108", departmentId: 4, department: "Operations" },
  
  // Operations - Managers and Dispatchers
  { employeeNumber: "EMP-2023-OPS-001", firstName: "John Mark", middleName: "Alonso", lastName: "Garces", phone: "09987654321", position: "Operations Manager", barangay: "Santo Cristo", zipCode: "3023", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2020-FZW5ID", firstName: "Mariano", middleName: "Castro", lastName: "Dela Cruz", phone: "09204567890", position: "Operations Manager", barangay: "Brgy. Mayamot", zipCode: "1870", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-20260112-000002", firstName: "Cherisha", middleName: "", lastName: "Centeno", phone: "09971356784", position: "Dispatcher", barangay: "Bancal", zipCode: "3020", departmentId: 4, department: "Operations" },
  { employeeNumber: "EMP-2024-DSP-001", firstName: "Lorna", middleName: "Cruz", lastName: "Rivera", phone: "09456781234", position: "Dispatcher", barangay: "Santo Cristo", zipCode: "3023", departmentId: 4, department: "Operations" },
];

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
    
    // Rental data
    db.rentalEmployee.deleteMany(),
    db.rentalAssignment.deleteMany(),
    db.rental.deleteMany(),

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

  // 2) HR Core: Departments with specific IDs
  const departmentMap: Record<string, number> = {
    "Human Resource": 1,
    "Finance": 2,
    "Inventory": 3,
    "Operations": 4,
  };

  const departments = [] as { id: number; departmentName: string }[];
  for (const [departmentName, id] of Object.entries(departmentMap)) {
    const d = await prisma.department.create({ data: { departmentName } });
    departments.push({ id: d.id, departmentName });
  }

  // Create a mapping from department name to actual DB ID
  const deptNameToId: Record<string, number> = {};
  for (const d of departments) {
    deptNameToId[d.departmentName] = d.id;
  }

  // Extract unique positions from employee data
  const uniquePositions = new Set<string>();
  employeeData.forEach(emp => uniquePositions.add(emp.position));

  // Create positions with department associations
  const positionMap: Record<string, number> = {};
  for (const positionName of Array.from(uniquePositions)) {
    // Find the department for this position from the first employee that has it
    const emp = employeeData.find(e => e.position === positionName);
    const deptId = deptNameToId[emp!.department];
    
    const p = await prisma.position.create({
      data: { positionName, departmentId: deptId },
    });
    positionMap[positionName] = p.id;
  }

  // Create employees from the exact data
  const today = new Date();
  const employees: Array<Awaited<ReturnType<typeof prisma.employee.create>>> = [];

  for (let i = 0; i < employeeData.length; i++) {
    const empData = employeeData[i];
    const positionId = positionMap[empData.position];

    const e = await prisma.employee.create({
      data: {
        employeeNumber: empData.employeeNumber,
        firstName: empData.firstName,
        lastName: empData.lastName,
        middleName: empData.middleName || null,
        suffix: null,
        birthdate: addDays(today, -(365 * (25 + (i % 15)))),
        hiredate: addDays(today, -365 - i * 10),
        terminationDate: null,
        terminationReason: null,
        basicRate: dec(500 + i * 25),
        rateType: randPick(["Weekly"]),
        employeeStatus: "active",
        employeeType: i % 5 === 0 ? "contract" : "regular",
        employeeClassification: i % 4 === 0 ? "Rank-and-File" : "Supervisory",
        phone: empData.phone,
        email: `emp${i + 1}@example.com`,
        emergencyContactName: i % 2 === 0 ? "EC Name" : null,
        emergencyContactNo: i % 2 === 0 ? "09123456789" : null,
        barangay: empData.barangay,
        streetAddress: `Street ${i + 1}`,
        city: "City",
        province: "Province",
        zipCode: empData.zipCode,
        country: "PH",
        positionId: positionId,
        expireDate: i % 6 === 0 ? addDays(today, 365) : null,
        licenseNo: i % 3 === 0 ? `LIC-${1000 + i}` : null,
        licenseType: i % 3 === 0 ? "Driver" : null,
        restrictionCodes: i % 3 === 0 ? ["1", "2"] : [],
      } as any,
    });
    employees.push(e);
  }

  // Attendance: Jan 12-17, 2026 for each employee (some present, some absent)
  for (let empIdx = 0; empIdx < employees.length; empIdx++) {
    const e = employees[empIdx];
    for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
      const attendanceDate = addDays(today, dayOffset);
      // Vary attendance: use employee index and day to determine status
      const shouldBeAbsent = (empIdx + dayOffset) % 5 === 0; // ~20% absent rate
      await prisma.attendance.create({
        data: {
          employeeId: e.id,
          date: attendanceDate,
          status: shouldBeAbsent ? "Absent" : "Present",
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
  for (let empIdx = 0; empIdx < employees.length; empIdx++) {
    const e = employees[empIdx];
    const benefitName = randPick(benefitNames);
    // Benefit effectiveDate varies within Jan 12-17 range
    const benefitDayOffset = empIdx % 6; // 0-5 days from today
    await prisma.benefit.create({
      data: {
        employeeId: e.id,
        name: benefitName,
        value: dec(750),
        frequency: randPick(["Once", "Monthly", "Daily", "Weekly", "Annually"]),
        effectiveDate: addDays(today, benefitDayOffset),
        endDate: null,
        isActive: true,
      },
    });

    const deductionName = randPick(deductionNames);
    // Deduction effectiveDate varies within Jan 12-17 range
    const deductionDayOffset = (empIdx + 3) % 6; // 0-5 days from today, offset for variety
    await prisma.deduction.create({
      data: {
        employeeId: e.id,
        name: deductionName,
        value: dec(200),
        frequency: randPick(["Once", "Monthly", "Daily", "Weekly", "Annually"]),
        effectiveDate: addDays(today, deductionDayOffset),
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

  // 4) Operations: Stops, Routes, Buses, Assignments, Quotas, Trips, Rentals
  
  // Route names for bus trips
  const routeNames = [
    "Sapang Palay - PITX",
    "Sapang Palay - Cubao",
    "San Jose Del Monte - Fairview",
    "Tungkong Mangga - Monumento",
    "Muzon - SM North EDSA",
    "Grotto - Divisoria",
    "Sapang Palay - Lawton",
    "San Jose - LRT Monumento",
    "Tungkong Mangga - Quezon Ave",
    "Sapang Palay - Baclaran",
    "SJDM - Pasay Rotonda",
    "Grotto - Quiapo",
  ];
  
  // Stops (24 to support 12 routes with start/end)
  const stops = [] as { StopID: string; StopName: string }[];
  const stopNames = [
    "Sapang Palay Terminal", "PITX Terminal",
    "Sapang Palay Main", "Cubao MRT",
    "San Jose Del Monte", "Fairview Terminal",
    "Tungkong Mangga", "Monumento LRT",
    "Muzon Terminal", "SM North EDSA",
    "Grotto Terminal", "Divisoria Market",
    "Sapang Palay South", "Lawton Terminal",
    "San Jose Terminal", "LRT Monumento",
    "Tungkong Mangga East", "Quezon Ave Terminal",
    "Sapang Palay North", "Baclaran LRT",
    "SJDM Main", "Pasay Rotonda",
    "Grotto Main", "Quiapo Church",
  ];
  
  for (let i = 0; i < stopNames.length; i++) {
    const s = await prisma.stop.create({
      data: {
        StopID: `STOP${String(i + 1).padStart(3, "0")}`,
        StopName: stopNames[i],
        latitude: `14.${700 + (i * 5)}`,
        longitude: `121.${100 + (i * 3)}`,
      },
    });
    stops.push(s);
  }

  // Routes (12)
  const routes = [] as { RouteID: string; RouteName: string }[];
  for (let i = 0; i < 12; i++) {
    const start = stops[i * 2];
    const end = stops[i * 2 + 1];
    const r = await prisma.route.create({
      data: {
        RouteID: `ROUTE${String(i + 1).padStart(3, "0")}`,
        RouteName: routeNames[i] || `Route ${i + 1}: ${start.StopName} -> ${end.StopName}`,
        StartStopID: start.StopID,
        EndStopID: end.StopID,
      },
    });
    routes.push(r);
  }

  // Buses (25 - exceeding 20 minimum)
  const busTypes = ["Aircon", "NonAircon"] as const;
  const bodyBuilders = ["Isuzu", "Toyota", "Hyundai", "Mitsubishi"] as const;
  const buses = [] as { bus_id: string; plate_number: string; body_number: string; bus_type: string }[];
  
  for (let i = 1; i <= 25; i++) {
    const plateNum = `PLATE-${String(i).padStart(4, "0")}`;
    const bodyNum = `BODY-${String(i).padStart(4, "0")}`;
    const busType = i % 3 === 0 ? "NonAircon" : "Aircon";
    
    const b = await prisma.bus.create({
      data: {
        bus_id: `BUS${String(i).padStart(3, "0")}`,
        item_id: invItem.item_id,
        plate_number: plateNum,
        body_number: bodyNum,
        body_builder: randPick(bodyBuilders),
        bus_type: busType,
        manufacturer: randPick(["Isuzu Motors", "Hyundai", "Mitsubishi Fuso", "Hino"]),
        status: "Active",
        chasis_number: `CHS-${100000 + i}`,
        engine_number: `ENG-${200000 + i}`,
        seat_capacity: 40 + (i % 5) * 2, // 40-48 seats
        model: `Model-${2015 + (i % 5)}`,
        year_model: 2018 + (i % 7),
        route: routes[i % routes.length]?.RouteID.replace("ROUTE", "R") || `R${i}`,
        condition: randPick(["Excellent", "Good"]),
        acquisition_date: addDays(today, -365 * (1 + (i % 4))),
        acquisition_method: "Purchase",
        warranty_expiration_date: addDays(today, 365 * 2),
        registration_status: "Registered",
        created_by: user.id,
      },
    });
    buses.push({ bus_id: b.bus_id, plate_number: plateNum, body_number: bodyNum, bus_type: busType });
  }

  // BusAssignments (20) - one per bus for first 20 buses
  const busAssignments = [] as { BusAssignmentID: string; BusID: string }[];
  for (let i = 1; i <= 20; i++) {
    const a = await prisma.busAssignment.create({
      data: {
        BusAssignmentID: `BA-${Date.now().toString(36)}${String(i).padStart(4, "0")}`,
        BusID: buses[i - 1].bus_id,
        RouteID: routes[(i - 1) % routes.length].RouteID,
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

  // Find drivers and conductors from our employee data
  const driverEmployees = employees.filter((e, idx) => employeeData[idx].position === "Driver");
  const conductorEmployees = employees.filter((e, idx) => employeeData[idx].position === "Conductor");
  
  // If no drivers/conductors in the data, use first employees as fallback
  const driversToUse = driverEmployees.length > 0 ? driverEmployees : employees.slice(0, 10);
  const conductorsToUse = conductorEmployees.length > 0 ? conductorEmployees : employees.slice(10, 20);

  // RegularBusAssignments (20) - linking drivers and conductors
  const regularAssignments = [] as { RegularBusAssignmentID: string }[];
  for (let i = 1; i <= 20; i++) {
    const driver = driversToUse[(i - 1) % driversToUse.length];
    const conductor = conductorsToUse[(i - 1) % conductorsToUse.length];
    const ra = await prisma.regularBusAssignment.create({
      data: {
        RegularBusAssignmentID: `RA-${Date.now().toString(36)}${String(i).padStart(4, "0")}`,
        DriverID: driver.id,
        ConductorID: conductor.id,
        BusAssignmentID: busAssignments[i - 1].BusAssignmentID,
      },
    });
    regularAssignments.push(ra);
  }

  // Quota Policies (20): alternate Fixed and Percentage
  const quotaPolicies = [] as { QuotaPolicyID: string; RegularBusAssignmentID: string }[];
  for (let i = 1; i <= 20; i++) {
    const qp = await prisma.quota_Policy.create({
      data: {
        QuotaPolicyID: `QP-${Date.now().toString(36)}${String(i).padStart(4, "0")}`,
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
          Quota: 5000 + (i % 5) * 500, // 5000-7000
        },
      });
    } else {
      await prisma.percentage.create({
        data: {
          PQuotaPolicyID: qp.QuotaPolicyID,
          Percentage: 0.08 + (i % 5) * 0.02, // 8% - 16%
        },
      });
    }
  }

  // Bus Trips: 2 per regular assignment (40 total trips)
  const paymentMethods: PaymentMethod[] = ["Cash", "Reimbursement"];
  const busTrips = [] as { BusTripID: string; RegularBusAssignmentID: string }[];
  
  for (let i = 0; i < regularAssignments.length; i++) {
    const ra = regularAssignments[i];
    for (let j = 1; j <= 2; j++) {
      const dispatchedAt = addDays(today, -(i + j));
      const tripExpense = 150 + (i * 10) + (j * 25); // 175-545 range
      const tripRevenue = 800 + (i * 50) + (j * 100); // 950-2800 range
      
      const bt = await prisma.busTrip.create({
        data: {
          BusTripID: `BT-${Date.now().toString(36)}${String(i * 2 + j).padStart(4, "0")}`,
          RegularBusAssignmentID: ra.RegularBusAssignmentID,
          DispatchedAt: dispatchedAt,
          TripExpense: dec(tripExpense),
          Sales: dec(tripRevenue),
          Payment_Method: paymentMethods[j % 2],
          IsExpenseRecorded: j % 3 === 0,
          IsRevenueRecorded: j % 4 === 0,
        },
      });
      busTrips.push(bt);
    }
  }

  // 5) Rentals (20 rentals with assignments and employees)
  const rentalStatuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"] as const;
  const rentalTypes = ["Corporate Event", "Wedding", "School Trip", "Private Tour", "Airport Transfer", "City Tour"];
  const pickupLocations = ["Sapang Palay Terminal", "SM City San Jose", "Tungkong Mangga", "Grotto Terminal", "Muzon Town Center"];
  const dropoffLocations = ["PITX Terminal", "MOA Complex", "Tagaytay City", "Batangas Port", "Subic Bay", "Clark Airport"];
  
  const rentals = [] as { RentalID: string }[];
  const rentalAssignments = [] as { RentalAssignmentID: string }[];
  
  for (let i = 1; i <= 20; i++) {
    // Create rental
    const rentalStatus = i <= 5 ? "completed" : rentalStatuses[(i - 1) % rentalStatuses.length];
    const rentalDate = addDays(today, -(30 - i)); // Past 30 days
    const returnDate = i <= 15 ? addDays(rentalDate, 1) : null;
    const totalAmount = 5000 + (i * 500); // 5500-15000 range
    
    const rental = await db.rental.create({
      data: {
        RentalID: `RENT-${Date.now().toString(36)}${String(i).padStart(4, "0")}`,
        RentalStatus: rentalStatus,
        RentalType: rentalTypes[(i - 1) % rentalTypes.length],
        RentalDate: rentalDate,
        ReturnDate: returnDate,
        PickupLocation: pickupLocations[(i - 1) % pickupLocations.length],
        DropoffLocation: dropoffLocations[(i - 1) % dropoffLocations.length],
        TotalAmount: dec(totalAmount),
        Notes: i % 3 === 0 ? `Rental booking #${i} - Special request: extra luggage space` : null,
        IsDeleted: false,
      },
    });
    rentals.push(rental);
    
    // Create rental assignment (some with bus, some without for pending/cancelled)
    const hasBus = rentalStatus !== "cancelled" && rentalStatus !== "pending";
    const busIdx = hasBus ? ((i - 1) % buses.length) + 20 : null; // Use buses 21-25 for rentals
    const busId = hasBus && buses[busIdx ?? 0] ? buses[Math.min(busIdx ?? 0, buses.length - 1)].bus_id : null;
    
    const ra = await db.rentalAssignment.create({
      data: {
        RentalAssignmentID: `RA-rental-${Date.now().toString(36)}${String(i).padStart(4, "0")}`,
        RentalID: rental.RentalID,
        BusID: busId,
        IsDeleted: false,
      },
    });
    rentalAssignments.push(ra);
    
    // Assign employees to rental (1 driver + 1 conductor for each)
    if (rentalStatus !== "cancelled") {
      const driverIdx = (i - 1) % driversToUse.length;
      const conductorIdx = (i - 1) % conductorsToUse.length;
      
      await db.rentalEmployee.create({
        data: {
          RentalAssignmentID: ra.RentalAssignmentID,
          EmployeeID: driversToUse[driverIdx].id,
          Role: "Driver",
        },
      });
      
      await db.rentalEmployee.create({
        data: {
          RentalAssignmentID: ra.RentalAssignmentID,
          EmployeeID: conductorsToUse[conductorIdx].id,
          Role: "Conductor",
        },
      });
      
      // Add an attendant for some rentals
      if (i % 3 === 0 && employees.length > 5) {
        await db.rentalEmployee.create({
          data: {
            RentalAssignmentID: ra.RentalAssignmentID,
            EmployeeID: employees[4].id, // Use an HR/Finance employee as attendant
            Role: "Attendant",
          },
        });
      }
    }
  }

  // Counts for FTMS entities
  const ftmsCounts = await Promise.all([
    db.unit.count(),
    db.item.count(),
    db.receipt.count(),
    db.receiptItem.count(),
    db.itemTransaction.count(),
  ]);

  // Counts for rental entities
  const rentalCounts = await Promise.all([
    db.rental.count(),
    db.rentalAssignment.count(),
    db.rentalEmployee.count(),
  ]);

  console.log("Seeding completed:");
  console.log({
    departments: departments.length,
    positions: Object.keys(positionMap).length,
    employees: employees.length,
    stops: stops.length,
    routes: routes.length,
    buses: buses.length,
    busAssignments: busAssignments.length,
    regularAssignments: regularAssignments.length,
    quotaPolicies: quotaPolicies.length,
    busTrips: busTrips.length,
    rentals: rentalCounts[0],
    rentalAssignments: rentalCounts[1],
    rentalEmployees: rentalCounts[2],
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

