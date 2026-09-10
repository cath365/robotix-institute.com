import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import {
  createApiResponse,
  createErrorResponse,
  getClientIP,
  rateLimiter,
  sanitizeInput,
  validateInput,
} from '@/lib/api-utils';
import { sendOpsNotification } from '@/lib/mailer';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_PROOF_BYTES = 4 * 1024 * 1024;

const proofSchema = z.object({
  orderId: z.string().max(120).optional().default(''),
  parentName: z.string().min(2, 'Parent name is required').max(120),
  parentEmail: z.string().email('A valid parent email is required').max(160),
  parentPhone: z.string().min(9, 'Parent phone is required').max(40),
  amount: z.number().positive('Payment amount is required'),
  method: z.string().min(2, 'Payment method is required').max(80),
  reference: z.string().max(140).optional().default(''),
  note: z.string().max(1200).optional().default(''),
});

const proofStatusSchema = z.object({
  proofId: z.string().min(1, 'Payment proof ID is required'),
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
});

const proofSelect = {
  id: true,
  orderId: true,
  parentName: true,
  parentEmail: true,
  parentPhone: true,
  amount: true,
  method: true,
  reference: true,
  note: true,
  status: true,
  proofDataUrl: true,
  proofMime: true,
  proofName: true,
  proofSize: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
  order: {
    select: {
      id: true,
      total: true,
      amountPaid: true,
      paymentStatus: true,
      phone: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
} as const;

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function detectProofMime(bytes: Uint8Array) {
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }
  return null;
}

async function parseProofFile(file: File | null) {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_PROOF_BYTES) {
    throw new Error('Payment proof must be 4MB or smaller.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const detectedMime = detectProofMime(bytes);
  if (!detectedMime) {
    throw new Error('Upload a receipt screenshot/photo or PDF proof.');
  }

  return {
    proofDataUrl: `data:${detectedMime};base64,${Buffer.from(arrayBuffer).toString('base64')}`,
    proofMime: detectedMime,
    proofName: sanitizeInput(file.name || 'payment-proof').slice(0, 180),
    proofSize: file.size,
  };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!rateLimiter(`payment-proof:${ip}`, 8, 60_000)) {
      return NextResponse.json(createErrorResponse('Too many payment proof submissions. Please wait a minute.'), { status: 429 });
    }

    const formData = await request.formData();
    const amount = Number(getFormValue(formData, 'amount'));
    const validation = validateInput(proofSchema, {
      orderId: getFormValue(formData, 'orderId'),
      parentName: getFormValue(formData, 'parentName'),
      parentEmail: getFormValue(formData, 'parentEmail'),
      parentPhone: getFormValue(formData, 'parentPhone'),
      amount,
      method: getFormValue(formData, 'method'),
      reference: getFormValue(formData, 'reference'),
      note: getFormValue(formData, 'note'),
    });

    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const payload = validation.data!;
    const file = formData.get('proof');
    const parsedFile = await parseProofFile(file instanceof File ? file : null);
    const reference = sanitizeInput(payload.reference ?? '');
    if (!parsedFile && !reference) {
      return NextResponse.json(createErrorResponse('Add a receipt screenshot/PDF or a transaction reference.'), { status: 400 });
    }

    const orderId = sanitizeInput(payload.orderId ?? '');
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
      if (!order) {
        return NextResponse.json(createErrorResponse('That order ID was not found. Leave it blank if payment was arranged offline.'), { status: 404 });
      }
    }

    const proof = await prisma.paymentProof.create({
      data: {
        orderId: orderId || null,
        parentName: sanitizeInput(payload.parentName),
        parentEmail: sanitizeInput(payload.parentEmail).toLowerCase(),
        parentPhone: sanitizeInput(payload.parentPhone),
        amount: payload.amount,
        method: sanitizeInput(payload.method),
        reference: reference || null,
        note: sanitizeInput(payload.note ?? ''),
        ...parsedFile,
      },
      select: proofSelect,
    });

    try {
      await sendOpsNotification({
        subject: `Payment proof submitted: K${payload.amount.toFixed(2)}`,
        preheader: 'A parent has submitted mobile money/payment proof for accounts review.',
        replyTo: proof.parentEmail,
        text: `Parent: ${proof.parentName}\nEmail: ${proof.parentEmail}\nPhone: ${proof.parentPhone}\nAmount: K${proof.amount}\nMethod: ${proof.method}\nReference: ${proof.reference || 'Not provided'}\nOrder: ${proof.orderId || 'Offline payment'}\n\n${proof.note || ''}`,
        html: `
          <h2 style="margin:0 0 12px;">New payment proof</h2>
          <p><strong>Parent:</strong> ${proof.parentName}</p>
          <p><strong>Email:</strong> ${proof.parentEmail}</p>
          <p><strong>Phone:</strong> ${proof.parentPhone}</p>
          <p><strong>Amount:</strong> K${proof.amount}</p>
          <p><strong>Method:</strong> ${proof.method}</p>
          <p><strong>Reference:</strong> ${proof.reference || 'Not provided'}</p>
          <p><strong>Order:</strong> ${proof.orderId || 'Offline payment'}</p>
          <p>Open the accounts panel to review and verify the proof.</p>
        `,
      });
    } catch (error) {
      console.error('payment proof notification email error:', error);
    }

    return NextResponse.json(createApiResponse({ proofId: proof.id }, 'Payment proof submitted for accounts review.'), { status: 201 });
  } catch (error) {
    console.error('payment proofs POST error:', error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Internal server error'),
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN', 'ACCOUNTANT']);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const where = status ? { status } : {};

    const proofs = await prisma.paymentProof.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: proofSelect,
    });

    return NextResponse.json(createApiResponse({ proofs }));
  } catch (error) {
    console.error('payment proofs GET error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const denied = await requireRole(user, ['ADMIN', 'ACCOUNTANT']);
    if (denied) return denied;

    const body = await request.json();
    const validation = validateInput(proofStatusSchema, body);
    if (!validation.success) {
      return NextResponse.json(createErrorResponse('Validation failed', validation.errors), { status: 400 });
    }

    const payload = validation.data!;
    const proof = await prisma.paymentProof.findUnique({
      where: { id: payload.proofId },
      select: { id: true, orderId: true, amount: true, method: true, reference: true, status: true },
    });

    if (!proof) {
      return NextResponse.json(createErrorResponse('Payment proof was not found'), { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (payload.status === 'VERIFIED' && proof.orderId && proof.status !== 'VERIFIED') {
        const order = await tx.order.findUnique({
          where: { id: proof.orderId },
          select: { id: true, total: true, amountPaid: true },
        });

        if (order) {
          const nextAmountPaid = Math.min(order.total, order.amountPaid + proof.amount);
          await tx.order.update({
            where: { id: order.id },
            data: {
              amountPaid: nextAmountPaid,
              paymentStatus: nextAmountPaid >= order.total ? 'PAID' : 'PARTIAL',
              paymentMethod: proof.method,
              paymentReference: proof.reference || undefined,
              paidAt: nextAmountPaid >= order.total ? new Date() : null,
            },
          });
        }
      }

      return tx.paymentProof.update({
        where: { id: payload.proofId },
        data: {
          status: payload.status,
          verifiedAt: payload.status === 'VERIFIED' ? new Date() : null,
        },
        select: proofSelect,
      });
    });

    return NextResponse.json(createApiResponse(updated, 'Payment proof updated.'));
  } catch (error) {
    console.error('payment proofs PATCH error:', error);
    return NextResponse.json(createErrorResponse('Internal server error'), { status: 500 });
  }
}
