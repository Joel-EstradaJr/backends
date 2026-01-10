# Payroll Endpoint Implementation

## Overview
This document describes the implementation of the GET payroll endpoint that returns employee payroll data with benefits, deductions, and attendance information.

## Endpoint URL
```
GET /api/clean/hr_payroll
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employee_number` | string | No | Filter results for a specific employee (e.g., EMP-0001) |
| `payroll_period_start` | string | No | Start date for attendance filtering (YYYY-MM-DD format) |
| `payroll_period_end` | string | No | End date for attendance filtering (YYYY-MM-DD format) |

## Response Structure

```json
[
  {
    "payroll_period_start": "2025-12-01",
    "payroll_period_end": "2025-12-31",
    "employee_number": "EMP-0009",
    "basic_rate": "700",
    "rate_type": "Daily",
    "attendances": [
      {
        "date": "2026-01-09",
        "status": "Present"
      }
    ],
    "benefits": [
      {
        "value": "750",
        "frequency": "Daily",
        "effective_date": "2025-11-11",
        "end_date": null,
        "is_active": true,
        "benefit_type": {
          "id": "19",
          "name": "Performance Bonus"
        }
      }
    ],
    "deductions": [
      {
        "value": "200",
        "frequency": "Daily",
        "effective_date": "2025-10-12",
        "end_date": null,
        "is_active": true,
        "deduction_type": {
          "id": "19",
          "name": "Late Penalty"
        }
      }
    ]
  }
]
```

## Field Definitions

### Rate Types
- `Monthly`
- `Daily`
- `Weekly`
- `Semi-Monthly`

### Attendance Status
- `Present`
- `Absent`
- `Leave`

### Benefit Types
- Service Incentive Leave
- Holiday Pay
- 13th Month Pay
- Safety
- Additional
- Meal Allowance
- Transport Allowance
- Health Insurance
- Performance Bonus
- Overtime Pay

### Deduction Types
- Cash Advance
- PAG-IBIG
- SSS
- PhilHealth
- Damage
- Shortage
- Tax
- Loan Repayment
- Late Penalty
- Other Deduction

### Frequency Values
- `Once`
- `Monthly`
- `Daily`
- `Weekly`
- `Yearly`

## Excluded Roles
The following employee positions are **excluded** from the payroll endpoint:
- **Driver** (positions 1-4: EMP-0001 to EMP-0004)
- **PAO** (if any exist)

## Database Changes

### Schema Updates
Added `rateType` field to the `Employee` model:
```prisma
model Employee {
  // ... other fields
  basicRate   Decimal?
  rateType    String?
  // ... other fields
}
```

### Seed Data
- 20 employees created with various positions
- Each employee has:
  - A rate_type (Monthly, Daily, Weekly, or Semi-Monthly)
  - 1 attendance record
  - 1 active benefit
  - 1 active deduction

## Example Requests

### Get all employees' payroll data
```bash
curl http://localhost:3000/api/clean/hr_payroll
```

### Get specific employee's payroll data
```bash
curl http://localhost:3000/api/clean/hr_payroll?employee_number=EMP-0009
```

### Get payroll data with date filtering
```bash
curl "http://localhost:3000/api/clean/hr_payroll?payroll_period_start=2025-12-01&payroll_period_end=2026-01-31"
```

### Combine employee and date filters
```bash
curl "http://localhost:3000/api/clean/hr_payroll?employee_number=EMP-0009&payroll_period_start=2025-12-01&payroll_period_end=2026-01-31"
```

## Testing Results

✅ Total employees returned: 16 (EMP-0005 to EMP-0020)
✅ Drivers (EMP-0001 to EMP-0004) successfully excluded
✅ Rate types properly assigned
✅ Benefits and deductions included
✅ Attendance filtering by date range works
✅ Employee number filtering works

## Files Modified

1. **prisma/schema.prisma**
   - Added `rateType` field to Employee model

2. **prisma/seed.ts**
   - Added rate_type to employee creation
   - Updated benefit types to match requirements
   - Updated deduction types to match requirements
   - Added proper frequency values

3. **src/app/api/clean/hr_payroll/route.ts**
   - Complete rewrite to match required payload structure
   - Added driver/PAO exclusion
   - Added query parameter support
   - Proper date filtering for attendances
   - Correct field naming (snake_case)

## Migration
```bash
npx prisma migrate dev --name add_rate_type
npm run db:seed
```
