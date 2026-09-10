import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';

const execFile = promisify(execFileCallback);
const HOST = process.env.ROBOTIX_ARDUINO_BRIDGE_HOST || '127.0.0.1';
const PORT = Number(process.env.ROBOTIX_ARDUINO_BRIDGE_PORT || 3210);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

function sanitizeSketchName(name) {
  return (name || 'Blink').replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

async function runArduinoCli(args, options = {}) {
  return execFile('arduino-cli', args, {
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  });
}

async function getArduinoCliVersion() {
  try {
    const { stdout } = await runArduinoCli(['version']);
    return stdout.trim();
  } catch {
    return '';
  }
}

function mapDetectedPorts(raw) {
  const detectedPorts = raw?.detected_ports || raw?.ports || [];
  return detectedPorts.flatMap((entry) => {
    const port = entry.port || entry;
    const matchingBoards = entry.matching_boards || entry.boards || [];
    if (!matchingBoards.length) {
      return [{
        port: port.address || port.label || 'Unknown',
        label: port.label || port.address || 'Unknown board',
        protocol: port.protocol || '',
      }];
    }

    return matchingBoards.map((board) => ({
      port: port.address || port.label || 'Unknown',
      label: `${board.name || board.fqbn || 'Board'}${port.label ? ` (${port.label})` : ''}`,
      fqbn: board.fqbn || '',
      protocol: port.protocol || '',
    }));
  });
}

async function listBoards() {
  const { stdout } = await runArduinoCli(['board', 'list', '--json']);
  const parsed = JSON.parse(stdout);
  return mapDetectedPorts(parsed);
}

async function prepareSketch({ title, code }) {
  const sketchName = sanitizeSketchName(title);
  const tempRoot = await mkdir(path.join(os.tmpdir(), `robotix-bridge-${Date.now()}`), { recursive: true });
  const sketchDir = path.join(tempRoot, sketchName);
  await mkdir(sketchDir, { recursive: true });
  await writeFile(path.join(sketchDir, `${sketchName}.ino`), code, 'utf8');
  return { sketchName, sketchDir, tempRoot };
}

async function verifySketch({ title, code, fqbn }) {
  const { sketchDir, tempRoot } = await prepareSketch({ title, code });
  try {
    const result = await runArduinoCli(['compile', '--fqbn', fqbn, sketchDir]);
    return {
      ok: true,
      stdout: result.stdout,
      stderr: result.stderr,
      fqbn,
    };
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function uploadSketch({ title, code, fqbn, port }) {
  if (!port) {
    throw new Error('A serial port is required for upload.');
  }

  const { sketchDir, tempRoot } = await prepareSketch({ title, code });
  try {
    const compile = await runArduinoCli(['compile', '--fqbn', fqbn, sketchDir]);
    const upload = await runArduinoCli(['upload', '-p', port, '--fqbn', fqbn, sketchDir]);
    return {
      ok: true,
      stdout: [compile.stdout, upload.stdout].filter(Boolean).join('\n'),
      stderr: [compile.stderr, upload.stderr].filter(Boolean).join('\n'),
      fqbn,
      port,
    };
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 404, { ok: false, message: 'Not found.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    if (req.method === 'GET' && req.url === '/health') {
      const version = await getArduinoCliVersion();
      sendJson(res, 200, {
        ok: Boolean(version),
        message: version
          ? `Uploader bridge online. ${version}`
          : 'arduino-cli is not installed or not available on PATH.',
        version,
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/boards') {
      const boards = await listBoards();
      sendJson(res, 200, { ok: true, boards });
      return;
    }

    if (req.method === 'POST' && req.url === '/verify') {
      const payload = await readBody(req);
      const result = await verifySketch(payload);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'POST' && req.url === '/upload') {
      const payload = await readBody(req);
      const result = await uploadSketch(payload);
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { ok: false, message: 'Unknown endpoint.' });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      message: error instanceof Error ? error.message : 'Bridge error.',
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Robotix Arduino Bridge listening on http://${HOST}:${PORT}`);
});
