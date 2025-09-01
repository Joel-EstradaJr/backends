import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/client';

export const GET = async (request: NextRequest) => {
  try {
    // Test query to see exact data types
    const testData = await prisma.busTrip.findFirst({
      select: {
        BusTripID: true,
        TripExpense: true,
        Sales: true,
        IsExpenseRecorded: true,
        IsRevenueRecorded: true,
      },
    });

    const response = {
      test_data: testData,
      data_types: {
        TripExpense: {
          value: testData?.TripExpense,
          type: typeof testData?.TripExpense,
          constructor: testData?.TripExpense?.constructor?.name,
        },
        Sales: {
          value: testData?.Sales,
          type: typeof testData?.Sales,
          constructor: testData?.Sales?.constructor?.name,
        },
      },
      json_serialized: {
        trip_fuel_expense: testData?.TripExpense ?? null,
        trip_revenue: testData?.Sales ?? null,
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};

export const OPTIONS = () => new NextResponse(null, { status: 204 });
