import { NextRequest, NextResponse } from "next/server";
import prisma from "@/client"; // Prisma client

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // check if ?id=123 was passed

    if (id) {
      // === Fetch employee by ID ===
      const emp = await prisma.employee.findUnique({
        where: { employeeNumber: id }, // change to `id: Number(id)` if it's numeric PK
        select: {
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
      });

      if (!emp) {
        return NextResponse.json(
          { error: `Employee with ID ${id} not found` },
          { status: 404 }
        );
      }

      const result = {
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        middleName: emp.middleName ?? "",
        lastName: emp.lastName,
        phone: emp.phone,
        position: emp.position?.positionName || "",
        barangay: emp.barangay,
        zipCode: emp.zipCode,
        departmentId: emp.position?.department?.id ?? 0,
        department: emp.position?.department?.departmentName || "",
      };

      return NextResponse.json(result, { status: 200 });
    } else {
      // === Fetch all employees ===
      const employees = await prisma.employee.findMany({
        select: {
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
                  departmentName: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      const result = employees.map((emp) => ({
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        middleName: emp.middleName ?? "",
        lastName: emp.lastName,
        phone: emp.phone,
        position: emp.position?.positionName || "",
        barangay: emp.barangay,
        zipCode: emp.zipCode,
        departmentId: emp.position?.department?.id ?? 0,
        department: emp.position?.department?.departmentName || "",
      }));

      return NextResponse.json({ employees: result }, { status: 200 });
    }
  } catch (error) {
    console.error("FETCH_EMPLOYEES_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
};

export const OPTIONS = () =>
  new NextResponse(null, { status: 204 }); // CORS preflight
