import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    message: 'Dummy Backend API is running',
    version: '1.0.0',
    endpoints: {
      employees: '/api/clean/hr_employees',
      payroll: '/api/clean/hr_payroll',
      busTrips: '/api/clean/op_bus-trip-details'
    }
  })
}
