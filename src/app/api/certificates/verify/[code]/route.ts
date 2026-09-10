import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params {
  params: { code: string };
}

// Verify certificate by code
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { code } = params;

    const certificate = await prisma.certificate.findUnique({
      where: { certCode: code },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        createErrorResponse('Certificate not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(createApiResponse({
      valid: true,
      certificate: {
        title: certificate.title,
        issuedTo: `${certificate.user.firstName} ${certificate.user.lastName}`,
        issueDate: certificate.issueDate,
        certCode: certificate.certCode,
      },
    }));
  } catch (error) {
    console.error('Verify certificate error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
