import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/client';

export const GET = async (request: NextRequest) => {
  try {
    // Get a summary of all data
    const [employees, departments, routes, buses, assignments] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.route.count(),
      prisma.bus.count(),
      prisma.busAssignment.count(),
    ]);

    const summary = {
      database_status: 'Connected',
      tables: {
        employees,
        departments,
        routes,
        buses,
        bus_assignments: assignments,
      },
      endpoints: {
        employees: '/api/clean/hr_employees',
        payroll: '/api/clean/hr_payroll',
        bus_trips: '/api/clean/op_bus-trip-details',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error('DATABASE_STATUS_ERROR:', error);
    return NextResponse.json(
      { error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};

export const OPTIONS = () => new NextResponse(null, { status: 204 });
