// endpoints\clean\hr_payroll\route.txt

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/client";
import { withCors } from "@/lib/withcors";
import { authenticateRequest } from "@/lib/auth";

export const GET = withCors(async (request: NextRequest) => {
  // Temporarily disable auth for testing - uncomment for production
  // const { error, user, status } = await authenticateRequest(request);
  // if (error) {
  //   return NextResponse.json({ error }, { status });
  // }

  try {
    // Query params
    const { searchParams } = new URL(request.url);
    const employeeNumber = searchParams.get("employee_number");
    const payrollPeriodStart = searchParams.get("payroll_period_start");
    const payrollPeriodEnd = searchParams.get("payroll_period_end");

    // Find employees excluding Driver and PAO positions
    const employees = await prisma.employee.findMany({
      where: {
        ...(employeeNumber ? { employeeNumber } : {}),
        position: {
          positionName: {
            notIn: ["Driver", "PAO"],
          },
        },
      },
      select: {
        employeeNumber: true,
        basicRate: true,
        rateType: true,
        attendances: {
          where: payrollPeriodStart && payrollPeriodEnd
            ? {
                date: {
                  gte: new Date(payrollPeriodStart),
                  lte: new Date(payrollPeriodEnd),
                },
              }
            : {},
          select: {
            date: true,
            status: true,
          },
        },
        benefits: {
          where: {
            isActive: true,
          },
          select: {
            value: true,
            frequency: true,
            effectiveDate: true,
            endDate: true,
            isActive: true,
            benefitType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        deductions: {
          where: {
            isActive: true,
          },
          select: {
            value: true,
            frequency: true,
            effectiveDate: true,
            endDate: true,
            isActive: true,
            deductionType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform data to match the required payload structure
    const transformedEmployees = employees.map((employee: any) => ({
      payroll_period_start: payrollPeriodStart || "",
      payroll_period_end: payrollPeriodEnd || "",
      employee_number: employee.employeeNumber,
      basic_rate: employee.basicRate ? employee.basicRate.toString() : "",
      rate_type: employee.rateType || "",
      attendances: employee.attendances.map((att: any) => ({
        date: att.date.toISOString().split("T")[0],
        status: att.status,
      })),
      benefits: employee.benefits.map((benefit: any) => ({
        value: benefit.value.toString(),
        frequency: benefit.frequency || "",
        effective_date: benefit.effectiveDate.toISOString().split("T")[0],
        end_date: benefit.endDate ? benefit.endDate.toISOString().split("T")[0] : null,
        is_active: benefit.isActive,
        benefit_type: {
          id: benefit.benefitType.id.toString(),
          name: benefit.benefitType.name,
        },
      })),
      deductions: employee.deductions.map((deduction: any) => ({
        value: deduction.value.toString(),
        frequency: deduction.frequency || "",
        effective_date: deduction.effectiveDate.toISOString().split("T")[0],
        end_date: deduction.endDate ? deduction.endDate.toISOString().split("T")[0] : null,
        is_active: deduction.isActive,
        deduction_type: {
          id: deduction.deductionType.id.toString(),
          name: deduction.deductionType.name,
        },
      })),
    }));

    return NextResponse.json(transformedEmployees, { status: 200 });
  } catch (err) {
    console.error("PAYROLL_ENDPOINT_ERROR", err);
    return NextResponse.json(
      { error: "Failed to fetch payroll data" },
      { status: 500 }
    );
  }
});

export const OPTIONS = withCors(() =>
  Promise.resolve(new NextResponse(null, { status: 204 }))
);
