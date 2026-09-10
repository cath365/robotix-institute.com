import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  sensorData: z.record(z.unknown()).optional(),
  status: z.enum(['online', 'offline', 'busy']).optional(),
});

// Get device by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const device = await prisma.ioTDevice.findUnique({
      where: { id: params.id },
    });

    if (!device) {
      return NextResponse.json(
        createErrorResponse('Device not found'),
        { status: 404 }
      );
    }

    // Only owner can view device details
    if (device.userId !== user.userId) {
      return NextResponse.json(
        createErrorResponse('Forbidden'),
        { status: 403 }
      );
    }

    return NextResponse.json(createApiResponse({
      ...device,
      sensorData: device.sensorData ? JSON.parse(device.sensorData) : null,
    }));
  } catch (error) {
    console.error('Get device error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Update device (sensor data, status, name)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 120, 60000)) { // Higher rate for sensor updates
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const device = await prisma.ioTDevice.findUnique({
      where: { id: params.id },
    });

    if (!device) {
      return NextResponse.json(
        createErrorResponse('Device not found'),
        { status: 404 }
      );
    }

    if (device.userId !== user.userId) {
      return NextResponse.json(
        createErrorResponse('Forbidden'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { name, sensorData, status } = validation.data;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (sensorData) updateData.sensorData = JSON.stringify(sensorData);
    if (status) {
      updateData.status = status;
      if (status === 'online') {
        updateData.lastSeen = new Date();
      }
    }

    const updated = await prisma.ioTDevice.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(createApiResponse({
      ...updated,
      sensorData: updated.sensorData ? JSON.parse(updated.sensorData) : null,
    }));
  } catch (error) {
    console.error('Update device error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Delete device
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const device = await prisma.ioTDevice.findUnique({
      where: { id: params.id },
    });

    if (!device) {
      return NextResponse.json(
        createErrorResponse('Device not found'),
        { status: 404 }
      );
    }

    if (device.userId !== user.userId) {
      return NextResponse.json(
        createErrorResponse('Forbidden'),
        { status: 403 }
      );
    }

    await prisma.ioTDevice.delete({
      where: { id: params.id },
    });

    return NextResponse.json(createApiResponse({ message: 'Device deleted successfully' }));
  } catch (error) {
    console.error('Delete device error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
