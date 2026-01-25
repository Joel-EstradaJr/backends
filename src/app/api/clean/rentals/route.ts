// endpoints/clean/rentals/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/client';

// Type alias for dynamic model access
const db = prisma as any;

// Helper to format employee object
const formatEmployee = (emp: any, role?: string) => ({
  employeeId: emp.id,
  employeeNumber: emp.employeeNumber,
  firstName: emp.firstName,
  middleName: emp.middleName || '',
  lastName: emp.lastName,
  phone: emp.phone,
  position: emp.position?.positionName || role || '',
  barangay: emp.barangay,
  zipCode: emp.zipCode,
  departmentId: emp.position?.department?.id ?? 0,
  department: emp.position?.department?.departmentName || '',
  role: role || emp.position?.positionName || '',
});

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    // Build where clause for filtering
    const whereClause: any = { IsDeleted: false };
    if (status) {
      whereClause.rental = { RentalStatus: status };
    }

    if (id) {
      // Fetch single rental assignment by ID
      const rentalAssignment = await db.rentalAssignment.findUnique({
        where: { RentalAssignmentID: id },
        select: {
          RentalAssignmentID: true,
          BusID: true,
          bus: {
            select: {
              bus_id: true,
              plate_number: true,
              bus_type: true,
              body_number: true,
            },
          },
          rental: {
            select: {
              RentalID: true,
              RentalStatus: true,
              RentalType: true,
              RentalDate: true,
              ReturnDate: true,
              PickupLocation: true,
              DropoffLocation: true,
              TotalAmount: true,
              Notes: true,
            },
          },
          employees: {
            select: {
              Role: true,
              employee: {
                select: {
                  id: true,
                  employeeNumber: true,
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  phone: true,
                  barangay: true,
                  zipCode: true,
                  position: {
                    select: {
                      positionName: true,
                      department: {
                        select: {
                          id: true,
                          departmentName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!rentalAssignment) {
        return NextResponse.json(
          { error: `Rental assignment with ID ${id} not found` },
          { status: 404 }
        );
      }

      const result = {
        assignment_id: rentalAssignment.RentalAssignmentID,
        bus_id: rentalAssignment.bus?.bus_id || null,
        bus_plate_number: rentalAssignment.bus?.plate_number || 'Unknown',
        bus_type: rentalAssignment.bus?.bus_type || 'Unknown',
        body_number: rentalAssignment.bus?.body_number || 'Unknown',
        rental_status: rentalAssignment.rental?.RentalStatus || 'pending',
        rental_details: {
          rental_id: rentalAssignment.rental?.RentalID,
          rental_type: rentalAssignment.rental?.RentalType,
          rental_date: rentalAssignment.rental?.RentalDate?.toISOString(),
          return_date: rentalAssignment.rental?.ReturnDate?.toISOString() || null,
          pickup_location: rentalAssignment.rental?.PickupLocation,
          dropoff_location: rentalAssignment.rental?.DropoffLocation,
          total_amount: rentalAssignment.rental?.TotalAmount ? Number(rentalAssignment.rental.TotalAmount) : null,
          notes: rentalAssignment.rental?.Notes,
        },
        employees: rentalAssignment.employees.map((re: any) => formatEmployee(re.employee, re.Role || undefined)),
      };

      return NextResponse.json(result, { status: 200 });
    } else {
      // Fetch all rental assignments
      const rentalAssignments = await db.rentalAssignment.findMany({
        where: { IsDeleted: false },
        select: {
          RentalAssignmentID: true,
          BusID: true,
          bus: {
            select: {
              bus_id: true,
              plate_number: true,
              bus_type: true,
              body_number: true,
            },
          },
          rental: {
            select: {
              RentalID: true,
              RentalStatus: true,
              RentalType: true,
              RentalDate: true,
              ReturnDate: true,
              PickupLocation: true,
              DropoffLocation: true,
              TotalAmount: true,
              Notes: true,
            },
          },
          employees: {
            select: {
              Role: true,
              employee: {
                select: {
                  id: true,
                  employeeNumber: true,
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  phone: true,
                  barangay: true,
                  zipCode: true,
                  position: {
                    select: {
                      positionName: true,
                      department: {
                        select: {
                          id: true,
                          departmentName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { CreatedAt: 'desc' },
      });

      const result = rentalAssignments.map((ra: any) => ({
        assignment_id: ra.RentalAssignmentID,
        bus_id: ra.bus?.bus_id || null,
        bus_plate_number: ra.bus?.plate_number || 'Unknown',
        bus_type: ra.bus?.bus_type || 'Unknown',
        body_number: ra.bus?.body_number || 'Unknown',
        rental_status: ra.rental?.RentalStatus || 'pending',
        rental_details: {
          rental_id: ra.rental?.RentalID,
          rental_type: ra.rental?.RentalType,
          rental_date: ra.rental?.RentalDate?.toISOString(),
          return_date: ra.rental?.ReturnDate?.toISOString() || null,
          pickup_location: ra.rental?.PickupLocation,
          dropoff_location: ra.rental?.DropoffLocation,
          total_amount: ra.rental?.TotalAmount ? Number(ra.rental.TotalAmount) : null,
          notes: ra.rental?.Notes,
        },
        employees: ra.employees.map((re: any) => formatEmployee(re.employee, re.Role || undefined)),
      }));

      return NextResponse.json(result, { status: 200 });
    }
  } catch (error) {
    console.error('FETCH_RENTALS_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rentals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.rental_date) {
      return NextResponse.json(
        { error: 'rental_date is required' },
        { status: 400 }
      );
    }

    // Generate unique IDs
    const rentalCount = await db.rental.count();
    const rentalId = `RENT-${Date.now().toString(36)}${String(rentalCount + 1).padStart(4, '0')}`;
    const assignmentId = `RA-${Date.now().toString(36)}${String(rentalCount + 1).padStart(4, '0')}`;

    // Create rental with assignment in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the rental
      const rental = await tx.rental.create({
        data: {
          RentalID: rentalId,
          RentalStatus: body.status || 'pending',
          RentalType: body.rental_type || null,
          RentalDate: new Date(body.rental_date),
          ReturnDate: body.return_date ? new Date(body.return_date) : null,
          PickupLocation: body.pickup_location || null,
          DropoffLocation: body.dropoff_location || null,
          TotalAmount: body.total_amount || null,
          Notes: body.notes || null,
        },
      });

      // Create the rental assignment
      const rentalAssignment = await tx.rentalAssignment.create({
        data: {
          RentalAssignmentID: assignmentId,
          RentalID: rental.RentalID,
          BusID: body.bus_id || null,
        },
      });

      // Add employees if provided
      if (body.employee_ids && Array.isArray(body.employee_ids)) {
        for (const empData of body.employee_ids) {
          const empId = typeof empData === 'string' ? empData : empData.id;
          const role = typeof empData === 'object' ? empData.role : null;
          
          await tx.rentalEmployee.create({
            data: {
              RentalAssignmentID: rentalAssignment.RentalAssignmentID,
              EmployeeID: empId,
              Role: role,
            },
          });
        }
      }

      return { rental, rentalAssignment };
    });

    return NextResponse.json({
      assignment_id: result.rentalAssignment.RentalAssignmentID,
      rental_id: result.rental.RentalID,
      message: 'Rental created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('CREATE_RENTAL_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to create rental', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.assignment_id) {
      return NextResponse.json(
        { error: 'assignment_id is required' },
        { status: 400 }
      );
    }

    // Find the rental assignment
    const existing = await db.rentalAssignment.findUnique({
      where: { RentalAssignmentID: body.assignment_id },
      include: { rental: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: `Rental assignment ${body.assignment_id} not found` },
        { status: 404 }
      );
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Update rental if rental fields provided
      if (existing.rental && (body.status || body.rental_type || body.notes)) {
        await tx.rental.update({
          where: { RentalID: existing.RentalID },
          data: {
            RentalStatus: body.status || existing.rental.RentalStatus,
            RentalType: body.rental_type !== undefined ? body.rental_type : existing.rental.RentalType,
            Notes: body.notes !== undefined ? body.notes : existing.rental.Notes,
            ReturnDate: body.return_date ? new Date(body.return_date) : existing.rental.ReturnDate,
            TotalAmount: body.total_amount !== undefined ? body.total_amount : existing.rental.TotalAmount,
          },
        });
      }

      // Update bus assignment if provided
      if (body.bus_id !== undefined) {
        await tx.rentalAssignment.update({
          where: { RentalAssignmentID: body.assignment_id },
          data: { BusID: body.bus_id },
        });
      }

      return { success: true };
    });

    return NextResponse.json({ message: 'Rental updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('UPDATE_RENTAL_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update rental', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};
