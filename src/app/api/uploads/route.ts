import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

const MAX_BYTES = parseInt(process.env.MAX_FILE_SIZE_BYTES || '10485760', 10); // 10 MB default
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');

// Magic-byte signatures for the file types we accept. Trusting the client
// content-type would let attackers upload anything (e.g. an HTML file disguised
// as image/png to perform stored XSS via direct hotlink).
const SIGNATURES: { mime: string; ext: string; magic: number[][] }[] = [
  { mime: 'image/png',  ext: '.png',  magic: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]] },
  { mime: 'image/jpeg', ext: '.jpg',  magic: [[0xff, 0xd8, 0xff]] },
  { mime: 'image/webp', ext: '.webp', magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF (further check below)
  { mime: 'image/gif',  ext: '.gif',  magic: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]] },
  { mime: 'audio/mpeg', ext: '.mp3',  magic: [[0x49, 0x44, 0x33], [0xff, 0xfb], [0xff, 0xf3], [0xff, 0xf2]] },
  { mime: 'audio/wav',  ext: '.wav',  magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF (further check below)
  { mime: 'audio/ogg',  ext: '.ogg',  magic: [[0x4f, 0x67, 0x67, 0x53]] },
  { mime: 'application/pdf', ext: '.pdf', magic: [[0x25, 0x50, 0x44, 0x46, 0x2d]] },
];

function detectKind(buf: Buffer) {
  for (const sig of SIGNATURES) {
    for (const m of sig.magic) {
      let ok = true;
      for (let i = 0; i < m.length; i++) {
        if (buf[i] !== m[i]) { ok = false; break; }
      }
      if (!ok) continue;
      // For WEBP / WAV: bytes 8-11 must confirm the RIFF subtype
      if (sig.mime === 'image/webp') {
        if (buf.length < 12) continue;
        if (
          buf[8] !== 0x57 || buf[9] !== 0x45 ||
          buf[10] !== 0x42 || buf[11] !== 0x50
        ) continue;
      }
      if (sig.mime === 'audio/wav') {
        if (buf.length < 12) continue;
        if (
          buf[8] !== 0x57 || buf[9] !== 0x41 ||
          buf[10] !== 0x56 || buf[11] !== 0x45
        ) continue;
      }
      return sig;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter(`upload:${user.userId}:${ip}`, 30, 60_000)) {
    return NextResponse.json(createErrorResponse('Too many uploads, slow down'), { status: 429 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(createErrorResponse('No file provided'), { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        createErrorResponse(`File too large. Max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.`),
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectKind(buffer);
    if (!detected) {
      return NextResponse.json(
        createErrorResponse('Unsupported file type. Allowed: PNG, JPEG, WebP, GIF, MP3, WAV, OGG, PDF.'),
        { status: 415 }
      );
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const filename = `${Date.now()}_${hash}${detected.ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json(
      createApiResponse({
        url: publicUrl,
        filename,
        mime: detected.mime,
        size: buffer.length,
      }, 'Upload successful')
    );
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json(createErrorResponse('Upload failed'), { status: 500 });
  }
}
