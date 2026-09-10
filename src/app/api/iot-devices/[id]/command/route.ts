import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: { id: string };
}

const commandSchema = z.object({
  command: z.string().min(1, 'Command is required'),
  params: z.record(z.unknown()).optional().default({}),
});

// Send command to device (would integrate with MQTT)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter(ip, 60, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many commands'),
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

    if (device.status === 'offline') {
      return NextResponse.json(
        createErrorResponse('Device is offline'),
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = commandSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { command, params: cmdParams } = validation.data;

    // In production, this would publish to MQTT
    // await mqttClient.publish(device.mqttTopic + '/command', JSON.stringify({ command, params: cmdParams }));

    // For now, simulate the command acknowledgment
    const commandPayload = {
      topic: device.mqttTopic + '/command',
      command,
      params: cmdParams,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    return NextResponse.json(createApiResponse({
      message: 'Command sent successfully',
      ...commandPayload,
    }));
  } catch (error) {
    console.error('Send command error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
