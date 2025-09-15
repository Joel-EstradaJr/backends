import { NextRequest, NextResponse } from "next/server";
import prisma from "@/client"; // make sure your Prisma client is properly exported

export const GET = async (request: NextRequest) => {
  try {
  const employees = await prisma.employee.findMany({
      select: {
    employeeNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        phone: true,
        suffix: true,
        positionId: true,
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

    // Map Prisma data to your interface
    const result = employees.map(emp => {
      const fullName = [
        emp.firstName,
        emp.middleName,
        emp.lastName,
        emp.suffix,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        middleName: emp.middleName ?? "",
        lastName: emp.lastName,
        phone: emp.phone,
        position: emp.position?.positionName || "",
        departmentId: emp.position?.department?.id ?? 0,
        department: emp.position?.department?.departmentName || "",
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("FETCH_EMPLOYEES_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
};

export const OPTIONS = () =>
  new NextResponse(null, { status: 204 }); // for CORS preflight
