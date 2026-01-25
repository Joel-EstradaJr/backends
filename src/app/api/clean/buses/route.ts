// endpoints/clean/buses/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/client';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch single bus by ID
      const bus = await prisma.bus.findUnique({
        where: { bus_id: id },
        select: {
          bus_id: true,
          plate_number: true,
          body_number: true,
          bus_type: true,
          seat_capacity: true,
        },
      });

      if (!bus) {
        return NextResponse.json(
          { error: `Bus with ID ${id} not found` },
          { status: 404 }
        );
      }

      // Transform to match required payload format
      const result = {
        id: bus.bus_id,
        license_plate: bus.plate_number,
        body_number: bus.body_number,
        type: bus.bus_type === 'Aircon' ? 'AIRCONDITIONED' : bus.bus_type?.toUpperCase() || 'UNKNOWN',
        capacity: bus.seat_capacity,
      };

      return NextResponse.json(result, { status: 200 });
    } else {
      // Fetch all buses
      const buses = await prisma.bus.findMany({
        select: {
          bus_id: true,
          plate_number: true,
          body_number: true,
          bus_type: true,
          seat_capacity: true,
        },
        orderBy: { date_created: 'desc' },
      });

      // Transform to match required payload format
      const result = buses.map((bus, index) => ({
        id: index + 1, // Numeric ID for the payload
        bus_id: bus.bus_id,
        license_plate: bus.plate_number,
        body_number: bus.body_number,
        type: bus.bus_type === 'Aircon' ? 'AIRCONDITIONED' : bus.bus_type?.toUpperCase() || 'UNKNOWN',
        capacity: bus.seat_capacity,
      }));

      return NextResponse.json({ buses: result }, { status: 200 });
    }
  } catch (error) {
    console.error('FETCH_BUSES_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.license_plate || !body.body_number) {
      return NextResponse.json(
        { error: 'license_plate and body_number are required' },
        { status: 400 }
      );
    }

    // For creating a bus, we need an inventory item and user - get defaults
    const defaultUser = await prisma.user.findFirst();
    const defaultInventoryItem = await prisma.inventoryItem.findFirst();

    if (!defaultUser || !defaultInventoryItem) {
      return NextResponse.json(
        { error: 'System not properly initialized - missing user or inventory item' },
        { status: 500 }
      );
    }

    // Generate a unique bus ID
    const busCount = await prisma.bus.count();
    const busId = `BUS${String(busCount + 1).padStart(3, '0')}`;

    // Map type back to BusType enum
    let busType: 'Aircon' | 'NonAircon' | 'Jeepney' | 'Van' = 'NonAircon';
    if (body.type === 'AIRCONDITIONED' || body.type === 'Aircon') {
      busType = 'Aircon';
    } else if (body.type === 'NonAircon' || body.type === 'NONAIRCON') {
      busType = 'NonAircon';
    }

    const bus = await prisma.bus.create({
      data: {
        bus_id: busId,
        item_id: defaultInventoryItem.item_id,
        plate_number: body.license_plate,
        body_number: body.body_number,
        body_builder: 'Other',
        bus_type: busType,
        manufacturer: body.manufacturer || 'Generic',
        status: 'Active',
        chasis_number: `CHS-${Date.now()}`,
        engine_number: `ENG-${Date.now()}`,
        seat_capacity: body.capacity || 45,
        model: body.model || 'Standard',
        year_model: body.year_model || new Date().getFullYear(),
        condition: 'Good',
        acquisition_date: new Date(),
        acquisition_method: 'Purchase',
        registration_status: 'Registered',
        created_by: defaultUser.id,
      },
    });

    const result = {
      id: busCount + 1,
      bus_id: bus.bus_id,
      license_plate: bus.plate_number,
      body_number: bus.body_number,
      type: bus.bus_type === 'Aircon' ? 'AIRCONDITIONED' : bus.bus_type?.toUpperCase(),
      capacity: bus.seat_capacity,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('CREATE_BUS_ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to create bus', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};
