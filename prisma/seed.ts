import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Departments
  const itDept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      departmentName: 'Information Technology',
    },
  })

  const hrDept = await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: {
      departmentName: 'Human Resources',
    },
  })

  const opsDept = await prisma.department.upsert({
    where: { id: 3 },
    update: {},
    create: {
      departmentName: 'Operations',
    },
  })

  // Create Positions
  const devPosition = await prisma.position.upsert({
    where: { id: 1 },
    update: {},
    create: {
      positionName: 'Software Developer',
      departmentId: itDept.id,
    },
  })

  const hrPosition = await prisma.position.upsert({
    where: { id: 2 },
    update: {},
    create: {
      positionName: 'HR Specialist',
      departmentId: hrDept.id,
    },
  })

  const driverPosition = await prisma.position.upsert({
    where: { id: 3 },
    update: {},
    create: {
      positionName: 'Bus Driver',
      departmentId: opsDept.id,
    },
  })

  const conductorPosition = await prisma.position.upsert({
    where: { id: 4 },
    update: {},
    create: {
      positionName: 'Bus Conductor',
      departmentId: opsDept.id,
    },
  })

  // Create sample employees
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { employeeNumber: 'EMP001' },
      update: {},
      create: {
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        employeeStatus: 'Active',
        hiredate: new Date('2023-01-15'),
        basicRate: 50000.00,
        positionId: devPosition.id,
      },
    }),
    
    prisma.employee.upsert({
      where: { employeeNumber: 'EMP002' },
      update: {},
      create: {
        employeeNumber: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        employeeStatus: 'Active',
        hiredate: new Date('2023-02-01'),
        basicRate: 45000.00,
        positionId: hrPosition.id,
      },
    }),

    prisma.employee.upsert({
      where: { employeeNumber: 'EMP003' },
      update: {},
      create: {
        employeeNumber: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        employeeStatus: 'Active',
        hiredate: new Date('2023-03-10'),
        basicRate: 35000.00,
        positionId: driverPosition.id,
      },
    }),

    prisma.employee.upsert({
      where: { employeeNumber: 'EMP004' },
      update: {},
      create: {
        employeeNumber: 'EMP004',
        firstName: 'Sarah',
        lastName: 'Williams',
        employeeStatus: 'Active',
        hiredate: new Date('2023-03-15'),
        basicRate: 30000.00,
        positionId: conductorPosition.id,
      },
    }),
  ])

  // Create benefit and deduction types
  const benefitType = await prisma.benefitType.upsert({
    where: { name: 'Health Insurance' },
    update: {},
    create: {
      name: 'Health Insurance',
    },
  })

  const deductionType = await prisma.deductionType.upsert({
    where: { name: 'Tax' },
    update: {},
    create: {
      name: 'Tax',
    },
  })

  // Create sample benefits and deductions for employees
  for (const employee of employees) {
    await prisma.benefit.upsert({
      where: { 
        id: employee.id 
      },
      update: {},
      create: {
        value: 5000.00,
        frequency: 'Monthly',
        effectiveDate: new Date('2023-01-01'),
        isActive: true,
        employeeId: employee.id,
        benefitTypeId: benefitType.id,
      },
    })

    await prisma.deduction.upsert({
      where: { 
        id: employee.id 
      },
      update: {},
      create: {
        type: 'Percentage',
        value: 10.00,
        frequency: 'Monthly',
        effectiveDate: new Date('2023-01-01'),
        isActive: true,
        employeeId: employee.id,
        deductionTypeId: deductionType.id,
      },
    })
  }

  // Create sample routes and stops
  const startStop = await prisma.stop.upsert({
    where: { StopID: 'STOP001' },
    update: {},
    create: {
      StopID: 'STOP001',
      StopName: 'Central Terminal',
      latitude: '14.5995',
      longitude: '120.9842',
    },
  })

  const endStop = await prisma.stop.upsert({
    where: { StopID: 'STOP002' },
    update: {},
    create: {
      StopID: 'STOP002',
      StopName: 'North Terminal',
      latitude: '14.6500',
      longitude: '121.0300',
    },
  })

  const route = await prisma.route.upsert({
    where: { RouteID: 'ROUTE001' },
    update: {},
    create: {
      RouteID: 'ROUTE001',
      RouteName: 'Central-North Express',
      StartStopID: startStop.StopID,
      EndStopID: endStop.StopID,
    },
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
