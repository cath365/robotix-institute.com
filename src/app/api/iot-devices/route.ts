import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const deviceSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  deviceType: z.enum(['esp32', 'arduino', 'raspberry_pi']),
  mqttTopic: z.string().min(1, 'MQTT topic is required'),
});

const sensorUpdateSchema = z.object({
  sensorData: z.record(z.unknown()),
  status: z.enum(['online', 'offline', 'busy']).optional(),
});

// Get user's IoT devices
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const status = searchParams.get('status');
    const deviceType = searchParams.get('type');

    const where: Record<string, unknown> = { userId: user.userId };
    if (status) where.status = status;
    if (deviceType) where.deviceType = deviceType;

    const [devices, total] = await Promise.all([
      prisma.ioTDevice.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ioTDevice.count({ where }),
    ]);

    // Parse sensor data JSON
    const devicesWithParsedData = devices.map(d => ({
      ...d,
      sensorData: d.sensorData ? JSON.parse(d.sensorData) : null,
    }));

    return NextResponse.json(createPaginatedResponse(devicesWithParsedData, total, pagination));
  } catch (error) {
    console.error('Get IoT devices error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// Register a new IoT device
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 10, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = deviceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { name, deviceType, mqttTopic } = validation.data;

    // Check if MQTT topic already exists
    const existing = await prisma.ioTDevice.findUnique({
      where: { mqttTopic },
    });

    if (existing) {
      return NextResponse.json(
        createErrorResponse('MQTT topic already in use'),
        { status: 409 }
      );
    }

    const device = await prisma.ioTDevice.create({
      data: {
        userId: user.userId,
        name,
        deviceType,
        mqttTopic,
        status: 'offline',
      },
    });

    return NextResponse.json(createApiResponse(device), { status: 201 });
  } catch (error) {
    console.error('Register device error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
