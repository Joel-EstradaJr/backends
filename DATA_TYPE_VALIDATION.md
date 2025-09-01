# 🧪 Data Type Validation Test

## Expected vs Actual Financial Data Types

Based on the raw endpoint analysis:

### **Raw Endpoint Code:**
```typescript
trip_fuel_expense: trip?.TripExpense ?? null,
trip_revenue: trip?.Sales ?? null,
```

### **Prisma Schema:**
```prisma
TripExpense  Decimal?
Sales        Decimal?
```

### **Expected Behavior:**
- Prisma `Decimal` fields should serialize to **numbers** in JSON
- Values: `1500.00` → `1500` (number)
- Null values: `null` → `null`

### **Test Results:**
1. **Financial Values**: Should be `number` or `null`
2. **Assignment Value**: Should be `number` or `null` 
3. **Boolean Flags**: Should be `boolean`
4. **String Fields**: Should be `string` or `null`

### **Validation URLs:**
- Main endpoint: http://localhost:3000/api/clean/op_bus-trip-details
- Data type test: http://localhost:3000/api/test-data-types

### **Raw Endpoint Output Structure (Expected):**
```json
[
  {
    "assignment_id": "BA001",
    "bus_trip_id": "BT001",
    "bus_route": "Central-North Express",
    "is_revenue_recorded": true,
    "is_expense_recorded": false,
    "date_assigned": "2023-09-01T08:00:00.000Z",
    "trip_fuel_expense": 1500,          // ← NUMBER
    "trip_revenue": 3500,               // ← NUMBER  
    "assignment_type": "Boundary",
    "assignment_value": 2000,           // ← NUMBER
    "payment_method": "Cash",
    "driver_name": "Mike Johnson",
    "conductor_name": "Sarah Williams",
    "bus_plate_number": "ABC-123",
    "bus_type": "Aircon",
    "body_number": "BODY001"
  }
]
```

The financial values should be **numbers**, not strings, when returned from Prisma Decimal fields.
