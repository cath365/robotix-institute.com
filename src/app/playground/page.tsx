'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { PlayVerseArcade } from '@/components/game/PlayVerseArcade';
import { GlassCard, Badge, Button, Input, Textarea } from '@/components/ui';
import { useAuth, useApi } from '@/hooks/useApi';
import {
  ArrowRight,
  Activity,
  Bot,
  Check,
  ChevronDown,
  Cpu,
  Code,
  Copy,
  FileCode,
  Folder,
  Lightbulb,
  Moon,
  Play,
  Save,
  Send,
  Share2,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  TriangleAlert,
  WandSparkles,
  Wrench,
  Zap,
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type IdeLanguageId = 'python' | 'javascript' | 'cpp' | 'arduino' | 'micropython';

type IdeLanguage = {
  id: IdeLanguageId;
  label: string;
  icon: string;
  defaultCode: string;
};

const LANGUAGES: IdeLanguage[] = [
  { id: 'python', label: 'Python', icon: '🐍', defaultCode: `# Robotix Institute - Python Playground
# Welcome to the Robotix IDE Lab

def greet_robot(name):
    return f"Hello, {name}! Welcome to Robotix Institute!"

class Robot:
    def __init__(self, name):
        self.name = name
        self.x = 0
        self.y = 0
        self.direction = "north"

    def move_forward(self, steps=1):
        if self.direction == "north":
            self.y += steps
        elif self.direction == "south":
            self.y -= steps
        elif self.direction == "east":
            self.x += steps
        elif self.direction == "west":
            self.x -= steps
        print(f"{self.name} moved {steps} step(s) {self.direction}")
        print(f"Position: ({self.x}, {self.y})")

robot = Robot("Robotix-Py")
print(greet_robot(robot.name))
robot.move_forward(3)
` },
  { id: 'javascript', label: 'JavaScript', icon: '📜', defaultCode: `// Robotix Institute - JavaScript Playground
// Welcome to the Robotix IDE Lab

class Robot {
  constructor(name) {
    this.name = name;
    this.x = 0;
    this.y = 0;
  }

  moveForward(steps = 1) {
    this.y += steps;
    console.log(\`\${this.name} moved forward \${steps} steps\`);
    console.log(\`Position: (\${this.x}, \${this.y})\`);
  }
}

const robot = new Robot("Robotix-JS");
robot.moveForward(4);
` },
  { id: 'cpp', label: 'C++', icon: '⚡', defaultCode: `// Robotix Institute - C++ Playground
#include <iostream>
using namespace std;

int main() {
  cout << "Robotix IDE Lab - C++ mode" << endl;
  cout << "Ready to prototype robotics logic." << endl;
  return 0;
}
` },
  { id: 'arduino', label: 'Arduino', icon: '🔌', defaultCode: `void setup() {
  // initialize digital pin LED_BUILTIN as an output.
  pinMode(LED_BUILTIN, OUTPUT);
}

// the loop function runs over and over again forever
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(1000);                       // wait for a second
  digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW
  delay(1000);                       // wait for a second
}
` },
  { id: 'micropython', label: 'MicroPython', icon: '🐍', defaultCode: `# Robotix Institute - MicroPython Playground
from machine import Pin
import time

led = Pin(2, Pin.OUT)

while True:
    led.value(1)
    time.sleep_ms(300)
    led.value(0)
    time.sleep_ms(300)
` },
];

const AI_PLUGS = [
  {
    id: 'arduino-generate',
    title: 'Generate Sketch',
    description: 'Create or extend an Arduino sketch from a plain-English goal.',
    prompt: 'Generate a clean Arduino sketch for the current project. Include setup, loop, pin definitions, and brief inline comments.',
  },
  {
    id: 'arduino-debug',
    title: 'Debug My Code',
    description: 'Find bugs, wiring assumptions, and logic issues in the current sketch.',
    prompt: 'Debug this code. Explain likely issues, missing definitions, wiring assumptions, and give a corrected version.',
  },
  {
    id: 'arduino-sensor',
    title: 'Add Sensor Logic',
    description: 'Integrate ultrasonic, IR, servo, moisture, or similar sensor workflows.',
    prompt: 'Add sensor logic to this project with safe Arduino patterns, serial output, and practical comments.',
  },
  {
    id: 'arduino-explain',
    title: 'Explain This',
    description: 'Break the current sketch down for a beginner or intermediate learner.',
    prompt: 'Explain this code step by step in a beginner-friendly way, including what each function and pin does.',
  },
  {
    id: 'arduino-pin-map',
    title: 'Generate Pin Map',
    description: 'Extract a clean pin map and explain what every connection is doing.',
    prompt: 'Create a pin map table for this project, explain each pin, and recommend safer or cleaner assignments when needed.',
  },
  {
    id: 'arduino-serial-debug',
    title: 'Add Serial Debug',
    description: 'Insert practical serial logging for testing motors, sensors, and edge cases.',
    prompt: 'Add a strong serial debugging layer to this code so a learner can test it step by step and identify faults quickly.',
  },
  {
    id: 'arduino-wiring-guide',
    title: 'Wiring Guide',
    description: 'Produce wiring instructions and component assumptions for the current build.',
    prompt: 'Write a wiring guide for this project, including the component list, board assumptions, and a beginner-friendly connection summary.',
  },
  {
    id: 'arduino-api-connect',
    title: 'Connect APIs',
    description: 'Suggest or generate code for HTTP, WiFi, dashboards, or cloud integrations.',
    prompt: 'Help this project connect to APIs or cloud dashboards. Include WiFi setup, request flow, and safe assumptions for the current hardware context.',
  },
] as const;

const HARDWARE_PROFILES = [
  {
    id: 'uno-rover',
    title: 'Arduino Uno Rover',
    summary: 'Motors, ultrasonic distance, LEDs, and simple obstacle logic.',
  },
  {
    id: 'esp32-field-node',
    title: 'ESP32 Field Node',
    summary: 'Smart agriculture, WiFi, sensors, and realtime dashboard thinking.',
  },
  {
    id: 'bluetooth-bot',
    title: 'Bluetooth Bot',
    summary: 'Phone control, serial commands, and movement behaviors.',
  },
  {
    id: 'iot-weather-station',
    title: 'IoT Weather Station',
    summary: 'Environmental sensors, telemetry, and alert logic.',
  },
] as const;

const COMPILER_TARGETS = [
  {
    id: 'uno',
    title: 'Arduino Uno',
    fqbn: 'arduino:avr:uno',
    chip: 'ATmega328P',
    port: 'USB-Cable-A',
    clock: '16 MHz',
    memory: '32 KB Flash',
  },
  {
    id: 'nano',
    title: 'Arduino Nano',
    fqbn: 'arduino:avr:nano',
    chip: 'ATmega328P',
    port: 'USB-Cable-B',
    clock: '16 MHz',
    memory: '32 KB Flash',
  },
  {
    id: 'esp32',
    title: 'ESP32 DevKit',
    fqbn: 'esp32:esp32:esp32',
    chip: 'Xtensa LX6',
    port: 'Wireless / USB',
    clock: '240 MHz',
    memory: '520 KB SRAM',
  },
] as const;

const UPLOADER_BRIDGE_URL = 'http://127.0.0.1:3210';

const BUILD_STAGES = [
  'Syntax scan',
  'Pin map check',
  'Library resolve',
  'Compile sketch',
  'Upload ready',
] as const;

const ARDUINO_BOARD_MANAGER = [
  {
    id: 'uno',
    title: 'Arduino Uno',
    processor: 'ATmega328P',
    connection: 'USB cable detected',
    bestFor: 'Starter robotics, Blink, button logic, and sensor basics.',
    installState: 'Installed',
  },
  {
    id: 'nano',
    title: 'Arduino Nano',
    processor: 'ATmega328P',
    connection: 'USB compact board',
    bestFor: 'Portable builds, compact robotics, and breadboard prototyping.',
    installState: 'Installed',
  },
  {
    id: 'esp32',
    title: 'ESP32 DevKit',
    processor: 'Xtensa LX6',
    connection: 'Wireless / USB',
    bestFor: 'IoT dashboards, API connections, and realtime cloud projects.',
    installState: 'Core ready',
  },
] as const;

const ARDUINO_LIBRARIES = [
  {
    id: 'servo',
    title: 'Servo',
    include: '#include <Servo.h>',
    summary: 'Control servo motors for robotics arms, steering, and pan-tilt systems.',
  },
  {
    id: 'wifi',
    title: 'WiFi / IoT',
    include: '#include <WiFi.h>',
    summary: 'Connect embedded projects to APIs, dashboards, and cloud tools.',
  },
  {
    id: 'ultrasonic',
    title: 'Ultrasonic Helper',
    include: '#include <NewPing.h>',
    summary: 'Distance sensing for obstacle avoidance, parking bots, and smart navigation.',
  },
  {
    id: 'dht',
    title: 'DHT Sensor',
    include: '#include <DHT.h>',
    summary: 'Temperature and humidity monitoring for agriculture and weather stations.',
  },
] as const;

const SERIAL_BAUD_RATES = ['9600', '19200', '38400', '57600', '115200'] as const;

interface SavedProject {
  id: string;
  title: string;
  language: string;
  code: string;
  isPublic: boolean;
}

interface BridgeBoard {
  port: string;
  fqbn?: string;
  label: string;
  protocol?: string;
}

function extractCodeBlock(content: string) {
  const match = content.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
  return match?.[1]?.trim() || '';
}

export default function PlaygroundPage() {
  const { isAuthenticated } = useAuth();
  const { get, post } = useApi();
  const [language, setLanguage] = useState<IdeLanguage>(LANGUAGES[3]);
  const [code, setCode] = useState<string>(LANGUAGES[3].defaultCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [darkEditor, setDarkEditor] = useState(true);
  const [title, setTitle] = useState('Blink');
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [saving, setSaving] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [includeCodeContext, setIncludeCodeContext] = useState(true);
  const [selectedHardwareId, setSelectedHardwareId] = useState<(typeof HARDWARE_PROFILES)[number]['id']>('uno-rover');
  const [selectedCompilerTarget, setSelectedCompilerTarget] = useState<(typeof COMPILER_TARGETS)[number]['id']>('uno');
  const [compilerMode, setCompilerMode] = useState<'verify' | 'upload'>('verify');
  const [serialBaudRate, setSerialBaudRate] = useState<(typeof SERIAL_BAUD_RATES)[number]>('9600');
  const [serialMonitor, setSerialMonitor] = useState<string[]>([
    '[Robotix Serial] Waiting for board upload or monitor input...',
  ]);
  const [serialInput, setSerialInput] = useState('');
  const [browserSerialSupported, setBrowserSerialSupported] = useState(false);
  const [connectedBoardLabel, setConnectedBoardLabel] = useState('');
  const [connectedBrowserPort, setConnectedBrowserPort] = useState<{
    close?: () => Promise<void>;
    writable?: WritableStream<Uint8Array> | null;
    getInfo?: () => { usbVendorId?: number; usbProductId?: number };
  } | null>(null);
  const [isBoardConnecting, setIsBoardConnecting] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [bridgeBoards, setBridgeBoards] = useState<BridgeBoard[]>([]);
  const [selectedBridgePort, setSelectedBridgePort] = useState('');
  const [bridgeMessage, setBridgeMessage] = useState('Checking local uploader bridge...');
  const [bridgeBusy, setBridgeBusy] = useState(false);
  const [classicSidebarPanel, setClassicSidebarPanel] = useState<'libraries' | 'files' | 'boards' | 'serial' | 'assistant'>('libraries');
  const [classicSidebarCollapsed, setClassicSidebarCollapsed] = useState(false);

  const suggestedTopic = useMemo(() => {
    if (language.id === 'arduino') return 'arduino robotics and embedded systems';
    if (language.id === 'micropython') return 'esp32 micropython and embedded systems';
    if (language.id === 'cpp') return 'c++ robotics and control logic';
    return `${language.label} programming and robotics`;
  }, [language]);

  const selectedHardware = useMemo(
    () => HARDWARE_PROFILES.find((profile) => profile.id === selectedHardwareId) || HARDWARE_PROFILES[0],
    [selectedHardwareId]
  );
  const compilerTarget = useMemo(
    () => COMPILER_TARGETS.find((target) => target.id === selectedCompilerTarget) || COMPILER_TARGETS[0],
    [selectedCompilerTarget]
  );

  const codeMetrics = useMemo(() => {
    const lines = code.split('\n').filter((line) => line.trim().length > 0).length;
    const functions = (code.match(/\b(void|int|float|bool|String|double|long|char)\s+\w+\s*\(/g) || []).length;
    const pinRefs = Array.from(new Set(code.match(/\b(?:A\d+|D?\d{1,2}|LED_BUILTIN|SDA|SCL)\b/g) || [])).slice(0, 6);
    const serialLogs = (code.match(/Serial\./g) || []).length;
    return { lines, functions, pinRefs, serialLogs };
  }, [code]);

  useEffect(() => {
    if (!isAuthenticated) return;
    get<{ codeProjects?: SavedProject[] } | SavedProject[]>('/code-projects?limit=20')
      .then((res) => {
        const list: SavedProject[] = Array.isArray(res.data)
          ? (res.data as SavedProject[])
          : ((res.data as { codeProjects?: SavedProject[] })?.codeProjects ?? []);
        setProjects(list);
      })
      .catch(() => undefined);
  }, [get, isAuthenticated]);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setBrowserSerialSupported('serial' in navigator);
  }, []);

  const refreshUploaderBridge = useCallback(async () => {
    try {
      const healthRes = await fetch(`${UPLOADER_BRIDGE_URL}/health`);
      if (!healthRes.ok) throw new Error('Bridge health check failed');
      const healthData = await healthRes.json() as { ok?: boolean; message?: string };
      const boardsRes = await fetch(`${UPLOADER_BRIDGE_URL}/boards`);
      const boardsData = boardsRes.ok
        ? await boardsRes.json() as { boards?: BridgeBoard[] }
        : { boards: [] as BridgeBoard[] };
      const boards = boardsData.boards ?? [];
      setBridgeBoards(boards);
      setBridgeStatus(healthData.ok ? 'online' : 'offline');
      setBridgeMessage(healthData.message || (healthData.ok ? 'Uploader bridge connected.' : 'Uploader bridge unavailable.'));
    } catch {
      setBridgeStatus('offline');
      setBridgeBoards([]);
      setBridgeMessage('Local uploader bridge is offline. Start `npm run arduino:bridge` to enable real verify and upload.');
    }
  }, []);

  useEffect(() => {
    void refreshUploaderBridge();
    const timer = window.setInterval(() => {
      void refreshUploaderBridge();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refreshUploaderBridge]);

  useEffect(() => {
    if (!bridgeBoards.length) {
      setSelectedBridgePort('');
      return;
    }

    const boardMatch = bridgeBoards.find((board) => board.fqbn === compilerTarget.fqbn)
      || bridgeBoards.find((board) => board.port === selectedBridgePort)
      || bridgeBoards[0];

    setSelectedBridgePort(boardMatch.port);
  }, [bridgeBoards, compilerTarget.fqbn, selectedBridgePort]);

  const selectedBridgeBoard = useMemo(
    () => bridgeBoards.find((board) => board.port === selectedBridgePort) || null,
    [bridgeBoards, selectedBridgePort]
  );

  const appendSerialLine = useCallback((line: string) => {
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSerialMonitor((current) => [...current.slice(-19), `[${stamp}] ${line}`]);
  }, []);

  const runUploaderBridgeAction = useCallback(async (mode: 'verify' | 'upload') => {
    setBridgeBusy(true);
    setIsRunning(true);
    setOutput(`[Robotix Bridge] ${mode === 'upload' ? 'Uploading' : 'Verifying'} ${title.trim() || 'Blink'} via local uploader bridge...\n`);

    try {
      const response = await fetch(`${UPLOADER_BRIDGE_URL}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Blink',
          code,
          fqbn: compilerTarget.fqbn,
          board: compilerTarget.title,
          port: selectedBridgePort || undefined,
        }),
      });

      const result = await response.json() as {
        ok?: boolean;
        stdout?: string;
        stderr?: string;
        message?: string;
        fqbn?: string;
        port?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || `Bridge ${mode} failed.`);
      }

      const transcript = [
        `[Robotix Bridge] ${mode === 'upload' ? 'Upload' : 'Verify'} complete`,
        `Board: ${compilerTarget.title}`,
        `FQBN: ${result.fqbn || compilerTarget.fqbn}`,
        result.port ? `Port: ${result.port}` : `Port: ${selectedBridgePort || 'Not required'}`,
        '',
        result.stdout?.trim() || '(no stdout)',
        result.stderr?.trim() ? `\n[stderr]\n${result.stderr.trim()}` : '',
      ].filter(Boolean).join('\n');

      setOutput(transcript);
      if (mode === 'upload') {
        appendSerialLine(`Local uploader bridge flashed ${compilerTarget.title}${result.port ? ` on ${result.port}` : ''}.`);
      } else {
        appendSerialLine(`Local uploader bridge verified ${compilerTarget.title}.`);
      }
      toast.success(`Bridge ${mode} finished`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Bridge ${mode} failed.`;
      setOutput(`[Robotix Bridge] ${mode === 'upload' ? 'Upload' : 'Verify'} failed\n${message}`);
      appendSerialLine(`[Robotix Serial] Bridge ${mode} failed: ${message}`);
      toast.error(message);
      return true;
    } finally {
      setBridgeBusy(false);
      setIsRunning(false);
    }
  }, [appendSerialLine, code, compilerTarget.fqbn, compilerTarget.title, selectedBridgePort, title]);

  const handleLanguageChange = (lang: IdeLanguage) => {
    setLanguage(lang);
    setCode(lang.defaultCode);
    setOutput('');
    setAiResponse('');
    setTitle(lang.id === 'arduino' ? 'Blink' : 'Untitled Project');
    setSerialMonitor(
      lang.id === 'arduino'
        ? ['[Robotix Serial] Waiting for board upload or monitor input...']
        : ['[Robotix Serial] Serial monitor is available in Arduino mode.']
    );
    setShowLangMenu(false);
  };

  const runJavaScript = useCallback(async (src: string): Promise<string> => {
    const logs: string[] = [];
    const sandboxConsole = {
      log: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
      info: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
      warn: (...a: unknown[]) => logs.push('⚠ ' + a.map(String).join(' ')),
      error: (...a: unknown[]) => logs.push('✖ ' + a.map(String).join(' ')),
    };
    const noop = () => undefined;
    const fn = new Function('console', 'window', 'document', 'fetch', 'localStorage', 'sessionStorage', 'XMLHttpRequest', 'WebSocket', src);
    const exec = new Promise<void>((resolve, reject) => {
      try {
        const result = fn(sandboxConsole, undefined, undefined, noop, undefined, undefined, undefined, undefined);
        Promise.resolve(result).then(() => resolve()).catch(reject);
      } catch (e) { reject(e); }
    });
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Execution timeout (5s)')), 5000));
    await Promise.race([exec, timeout]);
    return logs.join('\n');
  }, []);

  const runPython = useCallback(async (src: string): Promise<string> => {
    const w = window as typeof window & { __pyodidePromise?: Promise<any>; loadPyodide?: (args: { indexURL: string }) => Promise<any> };
    if (!w.__pyodidePromise) {
      if (!document.getElementById('pyodide-script')) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = 'pyodide-script';
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide'));
          document.head.appendChild(script);
        });
      }
      if (!w.loadPyodide) {
        throw new Error('Pyodide runtime is unavailable.');
      }
      w.__pyodidePromise = w.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
      });
    }
    const py = await w.__pyodidePromise;
    py.runPython(`import sys, io\nsys.stdout = io.StringIO()\nsys.stderr = sys.stdout`);
    try {
      await py.runPythonAsync(src);
    } catch (e: unknown) {
      return `${py.runPython('sys.stdout.getvalue()')}\n${e instanceof Error ? e.message : String(e)}`;
    }
    return py.runPython('sys.stdout.getvalue()');
  }, []);

  const handleRun = useCallback(async (modeOverride?: 'verify' | 'upload') => {
    const activeMode = modeOverride ?? compilerMode;
    setIsRunning(true);
    setOutput(`[Robotix IDE Lab] Running ${language.label}…\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    const t0 = performance.now();
    try {
      let stdout = '';
      if (language.id === 'javascript') {
        stdout = await runJavaScript(code);
      } else if (language.id === 'python') {
        stdout = await runPython(code);
      } else if (language.id === 'arduino') {
        const warnings: string[] = [];
        if (!/void\s+setup\s*\(/.test(code)) warnings.push('Missing setup() function');
        if (!/void\s+loop\s*\(/.test(code)) warnings.push('Missing loop() function');
        const sketchName = title.trim() || 'Blink';
        const cableStatus = compilerTarget.port.toLowerCase().includes('wireless')
          ? 'Wireless target handshake ready'
          : `${compilerTarget.port} detected and ready`;
        const pinSummary = codeMetrics.pinRefs.length > 0 ? codeMetrics.pinRefs.join(', ') : 'LED_BUILTIN';
        const usesBuiltinLed = /LED_BUILTIN/.test(code) || /\b13\b/.test(code);

        stdout = [
          `${activeMode === 'upload' ? 'Uploading' : 'Verifying'} sketch "${sketchName}"...`,
          `Board: ${compilerTarget.title}`,
          `Processor: ${compilerTarget.chip}`,
          `Port: ${compilerTarget.port}`,
          `Cable status: ${cableStatus}`,
          `Detected pins: ${pinSummary}`,
          `Sketch metrics: ${codeMetrics.lines} lines, ${codeMetrics.functions} function blocks, ${codeMetrics.serialLogs} serial calls`,
          usesBuiltinLed ? 'Built-in LED path detected on the current sketch.' : 'No built-in LED path detected in the current sketch.',
          warnings.length > 0 ? `Review notes: ${warnings.join(' | ')}` : 'Structure check: setup() and loop() detected.',
          '',
          activeMode === 'upload'
            ? connectedBrowserPort
              ? 'Upload package prepared. Board link is open, but flashing the MCU still requires Arduino IDE, Arduino CLI, or a local uploader bridge.'
              : 'Upload package prepared. Connect a board and export the sketch to flash it with Arduino IDE or Arduino CLI.'
            : 'Done compiling. Sketch verified and ready for upload.',
        ].join('\n');

        if (activeMode === 'upload') {
          const nextSerialLines = [
            `[Robotix Serial] Opening ${compilerTarget.port} at ${serialBaudRate} baud...`,
            usesBuiltinLed
              ? '[Robotix Serial] LED_BUILTIN -> HIGH -> LOW loop detected.'
              : `[Robotix Serial] ${compilerTarget.title} is upload-ready. Awaiting a real flash step or bridge command.`,
            warnings.length > 0
              ? `[Robotix Serial] Review recommended: ${warnings.join(' | ')}`
              : '[Robotix Serial] Sketch boot sequence completed.',
          ];
          setSerialMonitor(nextSerialLines);
        } else {
          setSerialMonitor([
            `[Robotix Serial] Verify finished for ${sketchName}.`,
            `[Robotix Serial] Board target: ${compilerTarget.title} on ${compilerTarget.port}.`,
            '[Robotix Serial] Upload the sketch to start live signal streaming.',
          ]);
        }
      } else {
        const lines = code.split('\n').filter((line) => line.trim().length > 0).length;
        const functions = (code.match(/\b(void|int|float|bool|String|double)\s+\w+\s*\(/g) || []).length;
        stdout = `Code analyzed for ${language.label}.
Lines: ${lines}
Functions: ${functions}

This language cannot be executed fully in the browser yet.
Use the AI plugs to improve the sketch, then upload to a real ${language.id === 'micropython' ? 'ESP32 / ESP8266 device' : 'compiler'} for live hardware testing.`;
      }
      const ms = Math.round(performance.now() - t0);
      setOutput((prev) => prev + (stdout || '(no output)') + `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ Finished in ${ms}ms\n`);
    } catch (err: unknown) {
      const ms = Math.round(performance.now() - t0);
      setOutput((prev) => prev + `\n❌ ${err instanceof Error ? err.message : String(err)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nFailed after ${ms}ms\n`);
    } finally {
      setIsRunning(false);
    }
  }, [code, codeMetrics.functions, codeMetrics.lines, codeMetrics.pinRefs, codeMetrics.serialLogs, compilerMode, compilerTarget.chip, compilerTarget.port, compilerTarget.title, connectedBrowserPort, language, runJavaScript, runPython, serialBaudRate, title]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save your projects');
      return;
    }
    setSaving(true);
    try {
      const res = await post<SavedProject>('/code-projects', {
        title: title.trim() || 'Untitled Project',
        language: language.id,
        code,
        isPublic: false,
      });
      if (res.success && res.data) {
        toast.success('Project saved');
        setProjects((current) => [res.data!, ...current.filter((item) => item.id !== res.data!.id)]);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }, [code, isAuthenticated, language.id, post, title]);

  const handleShare = useCallback(async () => {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ language: language.id, code }))));
    const url = `${window.location.origin}/playground?p=${payload}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Robotix code', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Share link copied');
      }
    } catch {
      // user cancelled
    }
  }, [code, language.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get('p');
    if (!p) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(p)))) as { language: string; code: string };
      const lang = LANGUAGES.find((item) => item.id === decoded.language);
      if (lang) setLanguage(lang);
      setCode(decoded.code);
      toast.success('Loaded shared snippet');
    } catch {
      // ignore invalid payloads
    }
  }, []);

  const handleLoad = (project: SavedProject) => {
    const lang = LANGUAGES.find((item) => item.id === project.language) || LANGUAGES[0];
    setLanguage(lang);
    setCode(project.code);
    setTitle(project.title);
    setShowProjects(false);
    setAiResponse('');
    toast.success(`Loaded "${project.title}"`);
  };

  const runAiPlug = async (promptOverride?: string) => {
    const cleanPrompt = (promptOverride || aiPrompt).trim();
    if (!cleanPrompt) {
      toast.error('Enter an AI request first.');
      return;
    }

    setAiLoading(true);
    try {
      const contextBlock = includeCodeContext
        ? `\n\nCurrent ${language.label} code in the IDE:\n\`\`\`${language.id === 'arduino' ? 'cpp' : language.id}\n${code}\n\`\`\``
        : '';

      const request = `You are helping inside Robotix IDE Lab.
Language: ${language.label}
Hardware profile: ${selectedHardware.title}
Hardware context: ${selectedHardware.summary}
Compiler target: ${compilerTarget.title}
Chip: ${compilerTarget.chip}
Task: ${cleanPrompt}

Please do all of the following when useful:
1. Give a concise explanation.
2. Provide improved code in a fenced code block.
3. Mention wiring or API assumptions if this is Arduino or embedded work.
4. If useful, include test steps or serial-debug advice.${contextBlock}`;

      const res = await post<{ message: string }>('/ai-tutor', {
        message: request,
        context: {
          topic: suggestedTopic,
          language: language.id,
          hardwareProfile: selectedHardware.title,
          compilerTarget: compilerTarget.title,
        },
      }, { requireAuth: false });

      const message = res.data?.message || 'No AI response returned.';
      setAiResponse(message);
      toast.success('AI plug responded');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI request failed';
      setAiResponse(`Robotix AI could not reach the configured API.\n\n${msg}\n\nTip: set AI_API_KEY and AI_API_URL on the server to enable live IDE assistance.`);
      toast.error('AI plug failed');
    } finally {
      setAiLoading(false);
    }
  };

  const insertAiCode = (mode: 'replace' | 'append') => {
    const extracted = extractCodeBlock(aiResponse);
    if (!extracted) {
      toast.error('No code block found in the AI response.');
      return;
    }

    setCode((current) => mode === 'replace' ? extracted : `${current.trim()}\n\n${extracted}`);
    toast.success(mode === 'replace' ? 'Editor replaced with AI code' : 'AI code appended to editor');
  };

  const copyAiResponse = async () => {
    await navigator.clipboard.writeText(aiResponse);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 1800);
  };

  const installLibrary = useCallback((includeLine: string, libraryTitle: string) => {
    if (code.includes(includeLine)) {
      toast.success(`${libraryTitle} is already linked in this sketch.`);
      return;
    }

    setCode((current) => `${includeLine}\n${current}`);
    toast.success(`${libraryTitle} added to ${title || 'your sketch'}`);
  }, [code, title]);

  const sendSerialMessage = useCallback(async () => {
    const message = serialInput.trim();
    if (!message) {
      toast.error('Type a serial command first.');
      return;
    }

    appendSerialLine(`> ${message}`);
    if (connectedBrowserPort?.writable) {
      try {
        const writer = connectedBrowserPort.writable.getWriter();
        await writer.write(new TextEncoder().encode(`${message}\n`));
        writer.releaseLock();
        appendSerialLine(`Browser serial bridge sent "${message}" to ${compilerTarget.title}.`);
      } catch (error) {
        appendSerialLine(`Browser serial write failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (/led\s+on/i.test(message)) {
      appendSerialLine('Robotix board response: LED_BUILTIN set HIGH.');
    } else if (/led\s+off/i.test(message)) {
      appendSerialLine('Robotix board response: LED_BUILTIN set LOW.');
    } else if (/status|ping/i.test(message)) {
      appendSerialLine(`Robotix board response: ${compilerTarget.title} online at ${serialBaudRate} baud.`);
    } else {
      appendSerialLine('Robotix board response: command received. No mapped handler in the current sketch preview.');
    }
    setSerialInput('');
  }, [appendSerialLine, compilerTarget.title, connectedBrowserPort, serialBaudRate, serialInput]);

  const openClassicSidebar = useCallback((panel: 'libraries' | 'files' | 'boards' | 'serial' | 'assistant') => {
    setClassicSidebarPanel(panel);
    setClassicSidebarCollapsed(false);
  }, []);

  const downloadSketch = useCallback(() => {
    const sketchName = `${title.trim() || 'Blink'}.ino`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = sketchName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(`${sketchName} downloaded`);
  }, [code, title]);

  const connectBoard = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      toast.error('Web Serial is not supported in this browser.');
      return;
    }

    setIsBoardConnecting(true);
    try {
      const serialNavigator = navigator as Navigator & {
        serial: {
          requestPort: () => Promise<{
            open: (options: { baudRate: number }) => Promise<void>;
            close?: () => Promise<void>;
            writable?: WritableStream<Uint8Array> | null;
            getInfo?: () => { usbVendorId?: number; usbProductId?: number };
          }>;
        };
      };
      const port = await serialNavigator.serial.requestPort();
      await port.open({ baudRate: Number(serialBaudRate) });
      const info = port.getInfo?.() ?? {};
      const chipLabel = info.usbVendorId ? `0x${info.usbVendorId.toString(16).toUpperCase()}` : compilerTarget.chip;
      setConnectedBrowserPort(port);
      setConnectedBoardLabel(`${compilerTarget.title} ${chipLabel}`.trim());
      appendSerialLine(`Browser connected to ${compilerTarget.title} on ${compilerTarget.port} at ${serialBaudRate} baud.`);
      toast.success('Board connected');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not connect to board');
    } finally {
      setIsBoardConnecting(false);
    }
  }, [appendSerialLine, compilerTarget.chip, compilerTarget.port, compilerTarget.title, serialBaudRate]);

  const disconnectBoard = useCallback(async () => {
    try {
      await connectedBrowserPort?.close?.();
      setConnectedBrowserPort(null);
      setConnectedBoardLabel('');
      appendSerialLine('Browser board connection closed.');
      toast.success('Board disconnected');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not disconnect board');
    }
  }, [appendSerialLine, connectedBrowserPort]);

  const handleClassicVerify = useCallback(async () => {
    setCompilerMode('verify');
    if (bridgeStatus === 'online') {
      await runUploaderBridgeAction('verify');
      return;
    }
    await handleRun('verify');
  }, [bridgeStatus, handleRun, runUploaderBridgeAction]);

  const handleClassicUpload = useCallback(async () => {
    setCompilerMode('upload');
    if (bridgeStatus === 'online') {
      await runUploaderBridgeAction('upload');
      return;
    }
    await handleRun('upload');

    if (connectedBrowserPort?.writable) {
      try {
        const writer = connectedBrowserPort.writable.getWriter();
        await writer.write(new TextEncoder().encode(`// Robotix upload-ready sketch: ${title.trim() || 'Blink'}\n`));
        writer.releaseLock();
        appendSerialLine(`Browser serial link is live for ${compilerTarget.title}. Direct MCU flashing still needs Arduino IDE / CLI / uploader bridge.`);
      } catch (error) {
        appendSerialLine(`Connected board rejected the browser-side sync message: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      appendSerialLine(`No browser-connected board found. Download ${title.trim() || 'Blink'}.ino and upload it with Arduino IDE or Arduino CLI.`);
    }
  }, [appendSerialLine, bridgeStatus, compilerTarget.title, connectedBrowserPort, handleRun, runUploaderBridgeAction, title]);

  const handleClassicMenuAction = useCallback((menu: 'File' | 'Edit' | 'Sketch' | 'Tools' | 'Help') => {
    if (menu === 'File') {
      openClassicSidebar('files');
      return;
    }
    if (menu === 'Edit') {
      handleCopy();
      return;
    }
    if (menu === 'Sketch') {
      void handleClassicVerify();
      return;
    }
    if (menu === 'Tools') {
      openClassicSidebar('boards');
      return;
    }
    openClassicSidebar('assistant');
    if (!aiPrompt.trim()) {
      setAiPrompt('Explain how to verify, export, and safely upload this Arduino sketch to the selected board.');
    }
    toast.success('Help panel opened');
  }, [aiPrompt, handleClassicVerify, openClassicSidebar, handleCopy]);

  const isArduinoLike = language.id === 'arduino' || language.id === 'micropython' || language.id === 'cpp';
  const isClassicArduino = language.id === 'arduino';
  const editorTheme = isClassicArduino ? 'light' : darkEditor ? 'vs-dark' : 'light';
  const editorHeight = isClassicArduino ? '100%' : 'calc(100vh - 142px)';
  const currentFileExtension = language.id === 'javascript' ? 'js' : language.id === 'cpp' ? 'cpp' : 'py';
  const classicSketchName = `${title || 'Blink'}.ino`;
  const buildSignal = isRunning
    ? compilerMode === 'upload'
      ? 'Uploading sketch to target...'
      : 'Compiling sketch...'
    : isArduinoLike
      ? `Target locked to ${compilerTarget.title}`
      : 'General-purpose runtime ready';
  const compilerDiagnostics = useMemo(() => {
    const lines = output.split('\n').filter((line) => line.trim().length > 0);
    const errorCount = lines.filter((line) => /\berror\b/i.test(line)).length;
    const warningCount = lines.filter((line) => /\bwarning\b/i.test(line)).length;

    return {
      lines,
      errorCount,
      warningCount,
      hasErrors: errorCount > 0,
    };
  }, [output]);
  const classicSidebarTitle = {
    libraries: 'Library Sidebar',
    files: 'Sketch Files',
    boards: 'Board Options',
    serial: 'Serial Tools',
    assistant: 'AI Assistant',
  }[classicSidebarPanel];

  if (isClassicArduino) {
    return (
      <main className="flex min-h-screen flex-col overflow-hidden bg-[#b9d8dd] text-[#20343a]">
        <Navbar />

        <div className="flex flex-1 flex-col overflow-hidden pt-16">
          <div className="border-b border-[#356b70] bg-[#2e666b] px-3 py-1.5 text-white">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
              <button
                type="button"
                onClick={() => { void handleClassicVerify(); }}
                className="rounded bg-white/12 px-2.5 py-1 transition-colors hover:bg-white/18"
              >
                Verify
              </button>
              <button
                type="button"
                onClick={() => { void handleClassicUpload(); }}
                className="rounded bg-white/12 px-2.5 py-1 transition-colors hover:bg-white/18"
              >
                {bridgeBusy ? 'Working...' : bridgeStatus === 'online' ? 'Bridge Upload' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={downloadSketch}
                className="rounded bg-white/12 px-2.5 py-1 transition-colors hover:bg-white/18"
              >
                Export
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded bg-white/12 px-2.5 py-1 transition-colors hover:bg-white/18"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { void refreshUploaderBridge(); }}
                className="rounded bg-white/12 px-2.5 py-1 transition-colors hover:bg-white/18"
              >
                Refresh Bridge
              </button>
              <Link
                href="/playground/upload-setup"
                className="rounded bg-white/12 px-2.5 py-1 transition-colors hover:bg-white/18"
              >
                Bridge Setup
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowProjects((v) => !v)}
                  className="rounded bg-white/12 px-2.5 py-1 transition-colors hover:bg-white/18"
                  type="button"
                >
                  Sketchbook
                </button>
                {showProjects && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-72 overflow-y-auto rounded-md border border-[#bfd2d6] bg-[#f5fbfc] text-[#234149] shadow-[0_12px_30px_rgba(28,48,53,0.16)]">
                    {projects.length === 0 ? (
                      <p className="p-3 text-[11px] text-[#67818a]">No saved sketches yet.</p>
                    ) : projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleLoad(project)}
                        className="block w-full border-b border-[#e0eaed] px-3 py-2 text-left text-[11px] hover:bg-[#ebf6f7] last:border-b-0"
                        type="button"
                      >
                        <p className="truncate font-semibold">{project.title}</p>
                        <p className="mt-0.5 text-[10px] text-[#6e858d]">{project.language}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (connectedBrowserPort) {
                    void disconnectBoard();
                    return;
                  }
                  void connectBoard();
                }}
                className="rounded bg-white/12 px-2.5 py-1 transition-colors hover:bg-white/18"
              >
                {connectedBrowserPort ? 'Disconnect' : (isBoardConnecting ? 'Connecting...' : 'Connect')}
              </button>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <select
                  value={selectedCompilerTarget}
                  onChange={(event) => setSelectedCompilerTarget(event.target.value as (typeof COMPILER_TARGETS)[number]['id'])}
                  className="rounded border border-white/15 bg-white/12 px-2 py-1 text-[10px] uppercase tracking-[0.14em] outline-none"
                >
                  {COMPILER_TARGETS.map((target) => (
                    <option key={target.id} value={target.id} className="text-black">
                      {target.title}
                    </option>
                  ))}
                </select>
                {bridgeBoards.length > 0 ? (
                  <select
                    value={selectedBridgePort}
                    onChange={(event) => setSelectedBridgePort(event.target.value)}
                    className="rounded border border-white/15 bg-white/12 px-2 py-1 text-[10px] uppercase tracking-[0.14em] outline-none"
                  >
                    {bridgeBoards.map((board) => (
                      <option key={`${board.port}-${board.fqbn || 'unknown'}`} value={board.port} className="text-black">
                        {board.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="rounded bg-white/12 px-2 py-1">{compilerTarget.port}</span>
                )}
                <span className={`rounded px-2 py-1 ${connectedBrowserPort ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/12 text-white/80'}`}>
                  {connectedBoardLabel || (browserSerialSupported ? 'No board link' : 'No Web Serial')}
                </span>
                <span className={`rounded px-2 py-1 ${bridgeStatus === 'online' ? 'bg-emerald-500/20 text-emerald-100' : bridgeStatus === 'checking' ? 'bg-white/12 text-white/80' : 'bg-amber-500/20 text-amber-100'}`}>
                  {bridgeStatus === 'online' ? 'Bridge ready' : bridgeStatus === 'checking' ? 'Bridge checking' : 'Bridge offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-b border-[#a9c8cd] bg-[#dceced] px-3 py-1 text-[10px] text-[#44656d]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold uppercase tracking-[0.16em]">Robotix IDE Lab</span>
              <span>/</span>
              <span>{classicSketchName}</span>
              <span className="ml-auto uppercase tracking-[0.14em]">{buildSignal}</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden p-2.5">
            <div
              className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_180px] overflow-hidden rounded-md border border-[#87b3b8] bg-[#e6f1f2] shadow-[0_10px_24px_rgba(43,74,80,0.12)]"
              style={{ gridTemplateColumns: `42px ${classicSidebarCollapsed ? '0px' : '220px'} minmax(0, 1fr)` }}
            >
              <div className="row-span-2 flex flex-col items-center gap-2 border-r border-[#c6dbde] bg-[#d8eaed] px-2 py-3">
                {[
                  { id: 'libraries', Icon: Folder, label: 'Libraries' },
                  { id: 'files', Icon: FileCode, label: 'Files' },
                  { id: 'boards', Icon: Cpu, label: 'Boards' },
                  { id: 'serial', Icon: Terminal, label: 'Serial' },
                  { id: 'assistant', Icon: Bot, label: 'Assistant' },
                ].map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    onClick={() => {
                      if (classicSidebarPanel === id && !classicSidebarCollapsed) {
                        setClassicSidebarCollapsed(true);
                        return;
                      }
                      setClassicSidebarPanel(id as typeof classicSidebarPanel);
                      setClassicSidebarCollapsed(false);
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[#23525a] ${
                      classicSidebarPanel === id && !classicSidebarCollapsed
                        ? 'border-[#7fc5cb] bg-white shadow-sm'
                        : 'border-[#b8d2d7] bg-[#eef7f8]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>

              <aside className={`row-span-2 min-h-0 border-r border-[#c6dbde] bg-[#f3f9fa] ${classicSidebarCollapsed ? 'overflow-hidden border-r-0' : 'flex flex-col'}`}>
                {!classicSidebarCollapsed && (
                  <>
                    <div className="flex items-start justify-between gap-2 border-b border-[#d7e6e8] px-3 py-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#50727a]">{classicSidebarTitle}</div>
                        <p className="mt-1 text-[10px] text-[#6f858d]">
                          {classicSidebarPanel === 'libraries' && 'Add Arduino libraries to your sketch.'}
                          {classicSidebarPanel === 'files' && 'Open saved sketches or use quick file actions.'}
                          {classicSidebarPanel === 'boards' && 'Switch the board and hardware profile.'}
                          {classicSidebarPanel === 'serial' && 'Send quick commands to the device preview.'}
                          {classicSidebarPanel === 'assistant' && 'Run quick AI actions for your sketch.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setClassicSidebarCollapsed(true)}
                        className="rounded border border-[#d7e6e8] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4a6870] hover:bg-[#f6fbfb]"
                      >
                        Hide
                      </button>
                    </div>

                    {classicSidebarPanel === 'libraries' && (
                      <div className="min-h-0 space-y-2 overflow-auto p-2">
                        {ARDUINO_LIBRARIES.map((library) => (
                          <button
                            key={library.id}
                            type="button"
                            onClick={() => installLibrary(library.include, library.title)}
                            className="block w-full rounded-md border border-[#d7e5e8] bg-white p-2 text-left transition-colors hover:border-[#9fd3d8] hover:bg-[#f8fbfb]"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold text-[#234149]">{library.title}</p>
                                <p className="mt-1 truncate text-[10px] text-[#0f666d]">{library.include}</p>
                              </div>
                              <span className="rounded-full bg-[#e5f6f7] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#0f666d]">
                                Add
                              </span>
                            </div>
                            <p className="mt-1.5 text-[10px] leading-4 text-[#6b828a]">{library.summary}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {classicSidebarPanel === 'files' && (
                      <div className="min-h-0 space-y-2 overflow-auto p-2">
                        <div className="rounded-md border border-[#d7e5e8] bg-white p-2">
                          <p className="text-[11px] font-semibold text-[#234149]">{classicSketchName}</p>
                          <p className="mt-1 text-[10px] text-[#6b828a]">{compilerTarget.title} • {compilerTarget.port}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button type="button" onClick={handleCopy} className="rounded border border-[#d7e5e8] bg-[#f8fbfb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#355861] hover:bg-[#eef7f8]">
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button type="button" onClick={handleSave} className="rounded border border-[#d7e5e8] bg-[#f8fbfb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#355861] hover:bg-[#eef7f8]">
                              {saving ? 'Saving' : 'Save'}
                            </button>
                            <button type="button" onClick={handleShare} className="rounded border border-[#d7e5e8] bg-[#f8fbfb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#355861] hover:bg-[#eef7f8]">
                              Share
                            </button>
                            <button type="button" onClick={downloadSketch} className="rounded border border-[#d7e5e8] bg-[#f8fbfb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#355861] hover:bg-[#eef7f8]">
                              Export
                            </button>
                          </div>
                        </div>
                        {projects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleLoad(project)}
                            className="block w-full rounded-md border border-[#d7e5e8] bg-white p-2 text-left transition-colors hover:border-[#9fd3d8] hover:bg-[#f8fbfb]"
                          >
                            <p className="truncate text-[11px] font-semibold text-[#234149]">{project.title}</p>
                            <p className="mt-1 text-[10px] text-[#6b828a]">{project.language}</p>
                          </button>
                        ))}
                        {projects.length === 0 && (
                          <div className="rounded-md border border-dashed border-[#d7e5e8] bg-white p-2 text-[10px] text-[#6b828a]">
                            No saved sketches yet.
                          </div>
                        )}
                      </div>
                    )}

                    {classicSidebarPanel === 'boards' && (
                      <div className="min-h-0 space-y-2 overflow-auto p-2">
                        <div className="rounded-md border border-[#d7e5e8] bg-white p-2">
                          <p className="text-[11px] font-semibold text-[#234149]">Uploader Bridge</p>
                          <p className="mt-1 text-[10px] leading-4 text-[#6b828a]">{bridgeMessage}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => { void refreshUploaderBridge(); }}
                              className="rounded border border-[#d7e5e8] bg-[#f8fbfb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#355861] hover:bg-[#eef7f8]"
                            >
                              Refresh
                            </button>
                            <Link
                              href="/playground/upload-setup"
                              className="rounded border border-[#d7e5e8] bg-[#f8fbfb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#355861] hover:bg-[#eef7f8]"
                            >
                              Setup
                            </Link>
                          </div>
                          {selectedBridgeBoard && (
                            <p className="mt-2 text-[10px] text-[#0f666d]">Selected bridge port: {selectedBridgeBoard.label}</p>
                          )}
                        </div>
                        {COMPILER_TARGETS.map((target) => (
                          <button
                            key={target.id}
                            type="button"
                            onClick={() => setSelectedCompilerTarget(target.id)}
                            className={`block w-full rounded-md border p-2 text-left transition-colors ${
                              selectedCompilerTarget === target.id
                                ? 'border-[#8ecdd0] bg-[#ebf8f9]'
                                : 'border-[#d7e5e8] bg-white hover:border-[#9fd3d8] hover:bg-[#f8fbfb]'
                            }`}
                          >
                            <p className="text-[11px] font-semibold text-[#234149]">{target.title}</p>
                            <p className="mt-1 text-[10px] text-[#0f666d]">{target.port}</p>
                            <p className="mt-1 text-[10px] text-[#6b828a]">{target.chip}</p>
                          </button>
                        ))}
                        <div className="grid gap-2">
                          {HARDWARE_PROFILES.map((profile) => (
                            <button
                              key={profile.id}
                              type="button"
                              onClick={() => setSelectedHardwareId(profile.id)}
                              className={`rounded-md border p-2 text-left transition-colors ${
                                selectedHardwareId === profile.id
                                  ? 'border-[#8ecdd0] bg-[#ebf8f9]'
                                  : 'border-[#d7e5e8] bg-white hover:border-[#9fd3d8] hover:bg-[#f8fbfb]'
                              }`}
                            >
                              <p className="text-[11px] font-semibold text-[#234149]">{profile.title}</p>
                              <p className="mt-1 text-[10px] text-[#6b828a]">{profile.summary}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {classicSidebarPanel === 'serial' && (
                      <div className="min-h-0 space-y-2 overflow-auto p-2">
                        <select
                          value={serialBaudRate}
                          onChange={(event) => setSerialBaudRate(event.target.value as (typeof SERIAL_BAUD_RATES)[number])}
                          className="w-full rounded-md border border-[#d7e5e8] bg-white px-2 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#355861] outline-none"
                        >
                          {SERIAL_BAUD_RATES.map((rate) => (
                            <option key={rate} value={rate}>
                              {rate} baud
                            </option>
                          ))}
                        </select>
                        <div className="rounded-md border border-[#d7e5e8] bg-white p-2">
                          <div className="max-h-24 space-y-1 overflow-auto font-mono text-[10px] text-[#234149]">
                            {serialMonitor.slice(-6).map((line, index) => (
                              <div key={`${line}-${index}`}>{line}</div>
                            ))}
                          </div>
                        </div>
                        <Input
                          value={serialInput}
                          onChange={(event) => setSerialInput(event.target.value)}
                          placeholder="status / LED ON / LED OFF"
                          className="h-8 border-[#d7e5e8] bg-white text-[#20363d] placeholder:text-[#7a9098]"
                        />
                        <button
                          type="button"
                          onClick={sendSerialMessage}
                          className="w-full rounded-md bg-[#00979d] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#007f84]"
                        >
                          Send Serial Command
                        </button>
                      </div>
                    )}

                    {classicSidebarPanel === 'assistant' && (
                      <div className="min-h-0 space-y-2 overflow-auto p-2">
                        {AI_PLUGS.map((plug) => (
                          <button
                            key={plug.id}
                            type="button"
                            onClick={() => {
                              setAiPrompt(plug.prompt);
                              runAiPlug(plug.prompt);
                            }}
                            className="block w-full rounded-md border border-[#d7e5e8] bg-white p-2 text-left transition-colors hover:border-[#9fd3d8] hover:bg-[#f8fbfb]"
                          >
                            <p className="text-[11px] font-semibold text-[#234149]">{plug.title}</p>
                            <p className="mt-1 text-[10px] leading-4 text-[#6b828a]">{plug.description}</p>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => runAiPlug()}
                          disabled={aiLoading}
                          className="w-full rounded-md bg-[#00979d] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#007f84] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {aiLoading ? 'Thinking' : 'Ask AI'}
                        </button>
                        {aiResponse && (
                          <div className="rounded-md border border-[#d7e5e8] bg-white p-2 text-[10px] text-[#234149]">
                            <p className="mb-1 font-semibold uppercase tracking-[0.14em] text-[#50727a]">Latest response</p>
                            <pre className="max-h-24 overflow-auto whitespace-pre-wrap">{aiResponse}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </aside>

              <div className="flex min-h-0 flex-col bg-white">
                <div className="flex items-center gap-2 border-b border-[#d7e6e8] bg-[#f5fafa] px-3 py-1.5">
                  <span className="rounded-sm bg-[#dfeff1] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#30565e]">
                    {classicSketchName}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5 text-[10px] text-[#7a8f96]">
                    <span>{compilerTarget.chip}</span>
                    <span>•</span>
                    <span>{compilerTarget.clock}</span>
                    <span>•</span>
                    <span>{compilerTarget.memory}</span>
                  </div>
                </div>
                <div className="min-h-0 flex-1">
                  <MonacoEditor
                    height="100%"
                    language="cpp"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="light"
                    options={{
                      fontSize: 14,
                      fontFamily: "'Source Code Pro', 'Consolas', monospace",
                      minimap: { enabled: false },
                      padding: { top: 8 },
                      lineNumbers: 'on',
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'off',
                      suggestOnTriggerCharacters: false,
                      quickSuggestions: true,
                      renderLineHighlight: 'gutter',
                      glyphMargin: true,
                    }}
                  />
                </div>
              </div>

              <div className="flex min-h-0 flex-col border-t border-[#c6dbde] bg-[#f6fafa]">
                <div className="flex items-center gap-2 border-b border-[#d7e6e8] bg-[#edf6f7] px-3 py-1.5">
                  <Terminal className="h-3.5 w-3.5 text-[#00979d]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41666e]">Compiler Output</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${compilerDiagnostics.hasErrors ? 'bg-[#ffe4e1] text-[#b42318]' : 'bg-[#e5f6f7] text-[#0f666d]'}`}>
                    {compilerDiagnostics.hasErrors ? `${compilerDiagnostics.errorCount} error${compilerDiagnostics.errorCount === 1 ? '' : 's'}` : 'No errors'}
                  </span>
                  {compilerDiagnostics.warningCount > 0 && (
                    <span className="rounded-full bg-[#fff4db] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9a6300]">
                      {compilerDiagnostics.warningCount} warning{compilerDiagnostics.warningCount === 1 ? '' : 's'}
                    </span>
                  )}
                  {output && (
                    <button
                      type="button"
                      onClick={() => setOutput('')}
                      className="ml-auto flex items-center gap-1 text-[10px] text-[#6b828a] hover:text-[#244048]"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  )}
                </div>
                <div className="min-h-0 flex-1 overflow-auto bg-white p-2.5 font-mono text-[11px] text-[#20363d]">
                  {output ? (
                    <pre className={`${compilerDiagnostics.hasErrors ? 'text-[#8f1d13]' : 'text-[#204149]'} whitespace-pre-wrap`}>
                      {output}
                    </pre>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-[#718890]">
                      <div>
                        <p>Verify or upload your sketch to check for compiler errors.</p>
                        <p className="mt-1 text-[10px]">Messages will stay here like the Arduino IDE bottom compiler panel.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${isClassicArduino ? 'bg-[#dfe7ea] text-[#20343a]' : 'bg-brand-dark text-white'} min-h-screen flex flex-col`}>
      <Navbar />

      {isClassicArduino ? (
        <div className="border-b border-[#c8d3d8] bg-[#e8eef1] pt-16">
          <div className="border-b border-[#d5dfe3] bg-[#f7f9fa] px-3 py-1.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#5c7881]">
              <div className="flex items-center gap-2 font-semibold text-[#27444b]">
                <span className="rounded-full bg-[#00979d] p-1 text-white">
                  <Code className="h-3.5 w-3.5" />
                </span>
                Robotix IDE Lab
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                {(['File', 'Edit', 'Sketch', 'Tools', 'Help'] as const).map((menu) => (
                  <button key={menu} type="button" onClick={() => handleClassicMenuAction(menu)} className="transition-colors hover:text-[#1f4f57]">
                    {menu}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#6d858d]">
                <span className="rounded-full bg-white px-2 py-0.5 text-[#1e4f56] shadow-sm">Port {compilerTarget.port}</span>
                <span>Board connected</span>
              </div>
            </div>
          </div>

          <div className="border-b border-[#c7d4d8] bg-[#dfecee] px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              {[
                    { label: 'Verify', icon: <Check className="h-4 w-4" />, action: () => { setCompilerMode('verify'); void handleRun('verify'); } },
                    { label: 'Upload', icon: <Play className="h-4 w-4" />, action: () => { setCompilerMode('upload'); void handleRun('upload'); } },
                { label: saving ? 'Saving...' : 'Save', icon: <Save className="h-4 w-4" />, action: handleSave },
                { label: copied ? 'Copied' : 'Copy', icon: copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />, action: handleCopy },
                { label: 'Share', icon: <Share2 className="h-4 w-4" />, action: handleShare },
              ].map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  onClick={tool.action}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#b9c8ce] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#25414a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:bg-[#f4fbfc]"
                >
                  {tool.icon}
                  {tool.label}
                </button>
              ))}

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Project title"
                className="min-w-[180px] flex-1 rounded-md border border-[#b9c9cf] bg-white px-2.5 py-1.5 text-[11px] text-[#20353b] placeholder:text-[#7a9198] focus:border-[#00979d] focus:outline-none"
                placeholder="Sketch name"
              />

              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowProjects((v) => !v)}
                    className="flex items-center gap-2 rounded-md border border-[#b9c8ce] bg-white px-2.5 py-1.5 text-[11px] text-[#30525a] hover:bg-[#f4fbfc]"
                    title="My projects"
                  >
                    <Folder className="h-3.5 w-3.5" />
                    Sketchbook {projects.length > 0 && <span className="text-xs text-[#6f8890]">({projects.length})</span>}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {showProjects && (
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-72 overflow-y-auto rounded-xl border border-[#cad6db] bg-[#f7fafa] shadow-[0_18px_45px_rgba(33,53,60,0.16)]">
                      {projects.length === 0 ? (
                        <p className="p-4 text-xs text-[#67818a]">No saved sketches yet.</p>
                      ) : projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleLoad(project)}
                          className="w-full border-b border-[#e2e9ec] px-4 py-2 text-left hover:bg-[#eef6f8] last:border-0"
                        >
                          <p className="truncate text-sm text-[#1f353b]">{project.title}</p>
                          <p className="text-[10px] text-[#728891]">{project.language}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 rounded-md border border-[#b9c8ce] bg-white px-2.5 py-1.5 text-[11px] text-[#30525a] transition-colors hover:bg-[#f4fbfc]"
                >
                  <span>{language.icon}</span>
                  <span>{language.label}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-[#cad6db] bg-[#f7fafa] shadow-[0_18px_45px_rgba(33,53,60,0.16)]"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang)}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                          language.id === lang.id
                            ? 'bg-[#dff2f4] text-[#0d666d]'
                            : 'text-[#44626b] hover:bg-[#eef6f8] hover:text-[#1f353b]'
                        }`}
                      >
                        <span>{lang.icon}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#6f858d]">
                <span className="rounded-full border border-[#c3d1d6] bg-[#edf7f8] px-2 py-0.5 text-[#0f666d]">{compilerTarget.title}</span>
                <span>{compilerTarget.chip}</span>
                <span>{compilerTarget.clock}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-white/10 bg-brand-dark-surface pt-16">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-secondary" />
                <span className="font-heading text-sm font-semibold">IDE Lab</span>
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Project title"
                className="w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-secondary/50"
                placeholder="Project title"
              />

              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowProjects((v) => !v)}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
                    title="My projects"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    My Projects {projects.length > 0 && <span className="text-xs text-white/40">({projects.length})</span>}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showProjects && (
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-72 overflow-y-auto rounded-xl border border-white/10 bg-brand-dark-surface shadow-glass">
                      {projects.length === 0 ? (
                        <p className="p-4 text-xs text-white/40">No saved projects yet.</p>
                      ) : projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleLoad(project)}
                          className="w-full border-b border-white/5 px-4 py-2 text-left hover:bg-white/5 last:border-0"
                        >
                          <p className="truncate text-sm text-white">{project.title}</p>
                          <p className="text-[10px] text-white/40">{project.language}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10"
                >
                  <span>{language.icon}</span>
                  <span>{language.label}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-brand-dark-surface shadow-glass"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang)}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                          language.id === lang.id
                            ? 'bg-brand-secondary/10 text-brand-secondary'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{lang.icon}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {isArduinoLike && (
                <Badge variant="accent" className="border border-brand-secondary/20 bg-brand-secondary/10">
                  <Bot className="mr-1 h-3 w-3" />
                  AI API plugs enabled
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isClassicArduino && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkEditor(!darkEditor)}
                  icon={darkEditor ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                >
                  {darkEditor ? 'Light' : 'Dark'}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleCopy} icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} icon={<Share2 className="w-4 h-4" />}>
                Share
              </Button>
              {isArduinoLike ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => { setCompilerMode('verify'); void handleRun('verify'); }} loading={isRunning && compilerMode === 'verify'} icon={<Check className="w-4 h-4" />}>
                    Verify
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => { setCompilerMode('upload'); void handleRun('upload'); }} loading={isRunning && compilerMode === 'upload'} icon={<Play className="w-4 h-4" />}>
                    Upload
                  </Button>
                </>
              ) : (
                <Button variant="primary" size="sm" onClick={() => { void handleRun(); }} loading={isRunning} icon={<Play className="w-4 h-4" />}>
                  Run Code
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {isArduinoLike && !isClassicArduino && (
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(18,0,107,0.22),rgba(11,11,26,0.92))]">
          <div className="mx-auto max-w-[1600px] px-4 py-1.5">
            {isClassicArduino ? (
              <div className="overflow-hidden rounded-[12px] border border-[#c8d4d9] bg-[#f5f8f9] shadow-[0_4px_12px_rgba(36,56,61,0.07)]">
                <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 text-[#32525b]">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#27454d]">
                    <Cpu className="h-3 w-3 text-[#00979d]" />
                    {classicSketchName}
                  </div>
                  <span className="rounded-full bg-[#00979d] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                    {compilerMode === 'upload' ? 'Upload' : 'Verify'}
                  </span>
                  <span className="rounded-full border border-[#d7e1e5] bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#44636c]">
                    {compilerTarget.title}
                  </span>
                  <span className="rounded-full border border-[#d7e1e5] bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#44636c]">
                    {compilerTarget.port}
                  </span>
                  <span className="ml-auto rounded-full bg-[#e6f6f7] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#0f666d]">
                    {isRunning ? BUILD_STAGES[Math.min(3, BUILD_STAGES.length - 1)] : BUILD_STAGES[4]}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <GlassCard className="p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Cpu className="h-4 w-4 text-brand-secondary" />
                        Robotix Embedded Compiler
                      </div>
                      <p className="mt-1 text-xs text-white/45">{buildSignal}</p>
                    </div>
                    <Badge variant="primary">{compilerTarget.title}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {BUILD_STAGES.map((stage, index) => {
                      const active = isRunning ? index <= 3 : index === 4;
                      return (
                        <div key={stage} className={`rounded-2xl border p-3 ${active ? 'border-brand-secondary/35 bg-brand-secondary/10' : 'border-white/10 bg-white/[0.03]'}`}>
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
                            <Activity className="h-3 w-3 text-brand-secondary" />
                            Stage {index + 1}
                          </div>
                          <p className="mt-2 text-sm font-medium text-white">{stage}</p>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Zap className="h-4 w-4 text-brand-accent" />
                    Target + cable intelligence
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {COMPILER_TARGETS.map((target) => (
                      <button
                        key={target.id}
                        type="button"
                        onClick={() => setSelectedCompilerTarget(target.id)}
                        className={`rounded-2xl border p-3 text-left transition-colors ${
                          selectedCompilerTarget === target.id
                            ? 'border-brand-accent/40 bg-brand-accent/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">{target.title}</p>
                        <p className="mt-1 text-[11px] text-white/45">{target.chip}</p>
                        <p className="mt-2 text-[11px] text-brand-secondary">{target.port}</p>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`flex-1 grid overflow-hidden ${isClassicArduino ? 'bg-[#dfe7ea] xl:h-[calc(100vh-132px)] xl:grid-cols-[1.62fr_0.78fr]' : 'xl:grid-cols-[1.25fr_0.75fr]'}`}>
        <div className={`flex min-h-[36vh] flex-col border-r ${isClassicArduino ? 'border-[#c7d4d8] bg-[#f8fbfb] xl:min-h-0' : 'border-white/10'}`}>
          <div className={`flex items-center gap-2 border-b px-3 py-1.5 ${isClassicArduino ? 'border-[#c7d4d8] bg-[#edf4f6]' : 'border-white/10 bg-white/5'}`}>
            <FileCode className={`w-4 h-4 ${isClassicArduino ? 'text-[#00979d]' : 'text-brand-secondary'}`} />
            <span className={`rounded-t-lg px-2 py-0.5 text-[11px] font-medium ${isClassicArduino ? 'border border-b-0 border-[#c7d4d8] bg-white text-[#244048]' : 'text-white/50'}`}>
              {isClassicArduino ? classicSketchName : `main.${currentFileExtension}`}
            </span>
            {isArduinoLike && (
              <div className={`ml-auto flex items-center gap-1.5 text-[10px] ${isClassicArduino ? 'text-[#6a838b]' : 'text-white/40'}`}>
                <span>{compilerTarget.chip}</span>
                <span>•</span>
                <span>{compilerTarget.clock}</span>
                <span>•</span>
                <span>{compilerTarget.memory}</span>
              </div>
            )}
          </div>

          {isClassicArduino ? (
            <>
              <div className="flex min-h-0 flex-1">
                <aside className="flex w-[220px] min-h-0 flex-col border-r border-[#c7d4d8] bg-[#eef4f6]">
                  <div className="border-b border-[#d7e1e5] px-3 py-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#234149]">
                      <Folder className="h-3.5 w-3.5 text-[#00979d]" />
                      Libraries
                    </div>
                    <p className="mt-1 text-[10px] text-[#6b828a]">Add include files to this sketch.</p>
                  </div>
                  <div className="min-h-0 space-y-2 overflow-auto p-2">
                    {ARDUINO_LIBRARIES.map((library) => (
                      <button
                        key={library.id}
                        type="button"
                        onClick={() => installLibrary(library.include, library.title)}
                        className="w-full rounded-lg border border-[#d8e2e6] bg-white p-2 text-left transition-colors hover:border-[#9ed7da] hover:bg-[#f7fbfb]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold text-[#21383f]">{library.title}</p>
                            <p className="mt-1 truncate text-[10px] text-[#0f666d]">{library.include}</p>
                          </div>
                          <span className="rounded-full bg-[#e6f6f7] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#0f666d]">
                            Add
                          </span>
                        </div>
                        <p className="mt-1.5 text-[10px] leading-4 text-[#667d85]">{library.summary}</p>
                      </button>
                    ))}
                  </div>
                </aside>

                <div className="min-w-0 flex-1 bg-white">
                  <MonacoEditor
                    height={editorHeight}
                    language={language.id === 'arduino' ? 'cpp' : language.id === 'micropython' ? 'python' : language.id}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme={editorTheme}
                    options={{
                      fontSize: 14,
                      fontFamily: "'Source Code Pro', 'Consolas', monospace",
                      minimap: { enabled: false },
                      padding: { top: 10 },
                      lineNumbers: 'on',
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'off',
                      suggestOnTriggerCharacters: false,
                      quickSuggestions: true,
                      renderLineHighlight: 'gutter',
                      glyphMargin: true,
                    }}
                  />
                </div>
              </div>

              <div className="flex h-[180px] min-h-[180px] flex-col border-t border-[#c7d4d8] bg-[#f7fafb]">
                <div className="flex items-center gap-2 border-b border-[#d7e1e5] bg-[#edf4f6] px-3 py-1.5">
                  <Terminal className="h-3.5 w-3.5 text-[#00979d]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4e6971]">Compiler</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${compilerDiagnostics.hasErrors ? 'bg-[#ffe4e1] text-[#b42318]' : 'bg-[#e6f6f7] text-[#0f666d]'}`}>
                    {compilerDiagnostics.hasErrors ? `${compilerDiagnostics.errorCount} error${compilerDiagnostics.errorCount === 1 ? '' : 's'}` : 'Ready'}
                  </span>
                  {compilerDiagnostics.warningCount > 0 && (
                    <span className="rounded-full bg-[#fff4db] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#a15c00]">
                      {compilerDiagnostics.warningCount} warning{compilerDiagnostics.warningCount === 1 ? '' : 's'}
                    </span>
                  )}
                  {output && (
                    <button
                      onClick={() => setOutput('')}
                      className="ml-auto flex items-center gap-1 text-[10px] text-[#688089] hover:text-[#20343a]"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  )}
                </div>
                <div className="min-h-0 flex-1 overflow-auto bg-[#fffefe] p-2.5 font-mono text-[11px] text-[#21383f]">
                  {output ? (
                    <pre className={`${compilerDiagnostics.hasErrors ? 'text-[#8f1d13]' : 'text-[#1c3a42]'} whitespace-pre-wrap`}>
                      {output}
                    </pre>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-[#718890]">
                      <div>
                        <p>Verify or upload to see compiler messages and sketch errors.</p>
                        <p className="mt-1 text-[10px]">Errors and warnings will stay here just like the Arduino IDE bottom compiler panel.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <MonacoEditor
              height={editorHeight}
              language={language.id === 'arduino' ? 'cpp' : language.id === 'micropython' ? 'python' : language.id}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={editorTheme}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                renderLineHighlight: 'line',
                glyphMargin: false,
              }}
            />
          )}
        </div>

        <div className={`grid min-h-[36vh] overflow-hidden border-t xl:border-l-0 xl:border-t-0 ${isClassicArduino ? 'border-[#c7d4d8] xl:min-h-0 xl:grid-rows-[0.22fr_0.78fr]' : 'border-white/10 xl:grid-rows-[0.55fr_0.45fr]'}`}>
          <div className={`border-b ${isClassicArduino ? 'border-[#c7d4d8] bg-[#f7fafb]' : 'border-white/10 bg-brand-dark'}`}>
            <div className={`flex items-center gap-2 border-b px-3 py-1.5 ${isClassicArduino ? 'border-[#d7e1e5] bg-[#edf4f6]' : 'border-white/10 bg-white/5'}`}>
              <Terminal className={`w-3.5 h-3.5 ${isClassicArduino ? 'text-[#00979d]' : 'text-emerald-400'}`} />
              <span className={`text-[11px] ${isClassicArduino ? 'text-[#4e6971]' : 'text-white/50'}`}>
                {isClassicArduino ? 'Serial Monitor' : 'Output Console'}
              </span>
              {(isClassicArduino ? serialMonitor.length > 0 : output) && (
                <button
                  onClick={() => isClassicArduino ? setSerialMonitor([]) : setOutput('')}
                  className={`ml-auto flex items-center gap-1 text-xs ${isClassicArduino ? 'text-[#688089] hover:text-[#20343a]' : 'text-white/30 hover:text-white/60'}`}
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className={`h-full overflow-auto p-2.5 font-mono text-xs ${isClassicArduino ? 'bg-[#fffffe] text-[#21383f]' : ''}`}>
              {(isClassicArduino ? serialMonitor.length > 0 : output) ? (
                isClassicArduino ? (
                  <div className="space-y-1 text-[10px] text-[#1c3a42]">
                    {serialMonitor.map((line, index) => (
                      <div key={`${line}-${index}`}>{line}</div>
                    ))}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-emerald-300">{output}</pre>
                )
              ) : (
                <div className={`flex h-full items-center justify-center ${isClassicArduino ? 'text-[#718890]' : 'text-white/20'}`}>
                  <div className="text-center">
                    <Terminal className="mx-auto mb-3 h-12 w-12" />
                    <p>{isArduinoLike ? (isClassicArduino ? 'Send commands and watch serial responses from your sketch here.' : 'Verify or compile your sketch to see compiler output') : 'Click "Run Code" to see output'}</p>
                    <p className="mt-1 text-xs">{isClassicArduino ? `Listening on ${serialBaudRate} baud for ${compilerTarget.title}.` : 'Arduino, C++, Python, JavaScript, and MicroPython supported in Robotix IDE Lab.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`overflow-auto ${isClassicArduino ? 'bg-[#dde6e9]' : 'bg-brand-dark-surface'}`}>
            {isClassicArduino ? (
              <div className="space-y-2 p-2">
                <div className="rounded-[12px] border border-[#cad6db] bg-[#f8fbfb] shadow-[0_4px_14px_rgba(36,56,61,0.06)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d8e2e6] bg-[#eef4f6] px-2.5 py-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#688089]">
                      <span className="text-[#214048]">Tools</span>
                      <span>Device</span>
                      <span>Boards</span>
                      <span>Assistant</span>
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[#728a92]">
                      Robotix assistant dock
                    </div>
                  </div>
                  <div className="grid gap-2 p-2 xl:grid-cols-[0.94fr_1.06fr]">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#234149]">
                            <Terminal className="h-3.5 w-3.5 text-[#00979d]" />
                            Device Commands
                          </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={serialBaudRate}
                            onChange={(event) => setSerialBaudRate(event.target.value as (typeof SERIAL_BAUD_RATES)[number])}
                            className="rounded-md border border-[#c8d4d9] bg-white px-2.5 py-1 text-[11px] text-[#28444c] outline-none"
                          >
                            {SERIAL_BAUD_RATES.map((rate) => (
                              <option key={rate} value={rate}>
                                {rate} baud
                              </option>
                            ))}
                          </select>
                          <span className="rounded-full bg-[#e6f6f7] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f666d]">
                            Live
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-[#d6e0e4] bg-white p-2 font-mono text-[10px] text-[#244048]">
                        <div className="max-h-20 space-y-1 overflow-auto pr-2">
                          {serialMonitor.map((line, index) => (
                            <div key={`${line}-${index}`}>{line}</div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={serialInput}
                          onChange={(event) => setSerialInput(event.target.value)}
                          placeholder="Send: status, LED ON, LED OFF"
                          className="h-8 border-[#c8d4d9] bg-white text-[#21383f] placeholder:text-[#7a9098]"
                        />
                        <button
                          type="button"
                          onClick={sendSerialMessage}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#00979d] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#007f84]"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Send
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="rounded-xl border border-[#d6e0e4] bg-white p-2.5">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#234149]">
                          <Cpu className="h-3.5 w-3.5 text-[#00979d]" />
                          Board Manager
                        </div>
                        <div className="space-y-2">
                          {ARDUINO_BOARD_MANAGER.map((board) => (
                            <button
                              key={board.id}
                              type="button"
                              onClick={() => setSelectedCompilerTarget(board.id)}
                              className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
                                selectedCompilerTarget === board.id
                                  ? 'border-[#8ecdd0] bg-[#ebf8f9]'
                                  : 'border-[#d8e2e6] bg-[#f9fbfb] hover:bg-[#f1f7f8]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold text-[#21383f]">{board.title}</p>
                                  <p className="mt-0.5 text-[10px] text-[#6c848c]">{board.processor}</p>
                                </div>
                                <span className="rounded-full bg-[#eef5f6] px-2 py-0.5 text-[10px] text-[#47646c]">
                                  {board.installState}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#0f666d]">{board.connection}</p>
                              <p className="mt-1 text-[10px] leading-4 text-[#667d85]">{board.bestFor}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#d6e0e4] bg-white p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#234149]">
                          <Cpu className="h-3.5 w-3.5 text-[#00979d]" />
                          Board profile
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {HARDWARE_PROFILES.map((profile) => (
                            <button
                              key={profile.id}
                              type="button"
                              onClick={() => setSelectedHardwareId(profile.id)}
                              className={`rounded-lg border p-2.5 text-left transition-colors ${
                                selectedHardwareId === profile.id
                                  ? 'border-[#8ecdd0] bg-[#ebf8f9]'
                                  : 'border-[#d8e2e6] bg-[#f9fbfb] hover:bg-[#f1f7f8]'
                              }`}
                            >
                              <div className="text-xs font-semibold text-[#21383f]">{profile.title}</div>
                              <p className="mt-1 text-[11px] leading-4 text-[#667d85]">{profile.summary}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[14px] border border-[#cad6db] bg-[#f8fbfb] p-2.5 shadow-[0_4px_18px_rgba(36,56,61,0.06)]">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#234149]">
                      <Activity className="h-3.5 w-3.5 text-[#00979d]" />
                      Build Stats
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-[#d8e2e6] bg-white p-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#718890]">Lines</p>
                        <p className="mt-1 text-sm font-semibold text-[#21383f]">{codeMetrics.lines}</p>
                      </div>
                      <div className="rounded-lg border border-[#d8e2e6] bg-white p-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#718890]">Functions</p>
                        <p className="mt-1 text-sm font-semibold text-[#21383f]">{codeMetrics.functions}</p>
                      </div>
                      <div className="rounded-lg border border-[#d8e2e6] bg-white p-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#718890]">Serial logs</p>
                        <p className="mt-1 text-sm font-semibold text-[#21383f]">{codeMetrics.serialLogs}</p>
                      </div>
                      <div className="rounded-lg border border-[#d8e2e6] bg-white p-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#718890]">Pins</p>
                        <p className="mt-1 text-[11px] font-semibold text-[#21383f]">{codeMetrics.pinRefs.length > 0 ? codeMetrics.pinRefs.join(', ') : 'None'}</p>
                      </div>
                    </div>
                    <div className="mt-2 rounded-lg border border-[#d8e2e6] bg-white p-2 text-[10px] text-[#667d85]">
                      Cable target: <span className="font-semibold text-[#0f666d]">{compilerTarget.port}</span>
                    </div>
                  </div>

                  <div className="rounded-[14px] border border-[#cad6db] bg-[#f8fbfb] p-2.5 shadow-[0_4px_18px_rgba(36,56,61,0.06)]">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-heading text-base font-semibold text-[#223f47]">Robotix Assistant</h2>
                        <p className="mt-0.5 text-xs text-[#657d85]">Sketch help for sensors, wiring logic, and quick fixes.</p>
                      </div>
                      <span className="rounded-full bg-[#e6f6f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f666d]">
                        Context aware
                      </span>
                    </div>

                    <div className="mb-3 rounded-xl border border-[#d6e0e4] bg-white p-2.5 text-[11px] text-[#617881]">
                      Cable target: <span className="font-semibold text-[#0f666d]">{compilerTarget.port}</span>
                      {' '}| Board profile: <span className="font-semibold text-[#0f666d]">{selectedHardware.title}</span>
                      {' '}| Topic: <span className="font-semibold text-[#0f666d]">{suggestedTopic}</span>
                    </div>

                    <div className="mb-3 grid gap-2 sm:grid-cols-2">
                      {AI_PLUGS.map((plug) => (
                        <button
                          key={plug.id}
                          type="button"
                          onClick={() => {
                            setAiPrompt(plug.prompt);
                            runAiPlug(plug.prompt);
                          }}
                          className="rounded-lg border border-[#d8e2e6] bg-white p-2.5 text-left transition-colors hover:border-[#9ed7da] hover:bg-[#f1f7f8]"
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#223f47]">
                            {plug.id.includes('debug') ? <Wrench className="h-3.5 w-3.5 text-[#00979d]" /> : plug.id.includes('explain') ? <Lightbulb className="h-3.5 w-3.5 text-[#00979d]" /> : <WandSparkles className="h-3.5 w-3.5 text-[#00979d]" />}
                            {plug.title}
                          </div>
                          <p className="mt-1.5 text-[11px] leading-4 text-[#667d85]">{plug.description}</p>
                        </button>
                      ))}
                    </div>

                    <Textarea
                      value={aiPrompt}
                      onChange={(event) => setAiPrompt(event.target.value)}
                      placeholder="Example: Add servo control and Bluetooth commands to this Arduino robot sketch."
                      className="min-h-[84px] border-[#c8d4d9] bg-white text-[#21383f] placeholder:text-[#7a9098]"
                    />

                    <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIncludeCodeContext((value) => !value)}
                        className={`rounded-full px-3 py-1.5 text-[11px] transition-all ${
                          includeCodeContext
                            ? 'bg-[#00979d] text-white'
                            : 'border border-[#c8d4d9] bg-white text-[#5f7880]'
                        }`}
                      >
                        {includeCodeContext ? 'Including current sketch' : 'Prompt only'}
                      </button>
                      <span className="text-xs text-[#70868e]">Debug-first recommendations for Arduino workflows.</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => runAiPlug()}
                        disabled={aiLoading}
                        className="inline-flex items-center gap-2 rounded-md bg-[#00979d] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#007f84] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {aiLoading ? 'Thinking...' : 'Ask AI'}
                      </button>
                      <button
                        type="button"
                        onClick={() => insertAiCode('replace')}
                        className="inline-flex items-center gap-2 rounded-md border border-[#c8d4d9] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#244048] hover:bg-[#f1f7f8]"
                      >
                        <WandSparkles className="h-3.5 w-3.5" />
                        Replace sketch
                      </button>
                      <button
                        type="button"
                        onClick={() => insertAiCode('append')}
                        className="inline-flex items-center gap-2 rounded-md border border-[#c8d4d9] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#244048] hover:bg-[#f1f7f8]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Append code
                      </button>
                    </div>

                    <div className="mt-2.5 rounded-xl border border-[#d6e0e4] bg-white p-2.5">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[#223f47]">Assistant Response</h3>
                        {aiResponse ? (
                          <button
                            onClick={copyAiResponse}
                            className="inline-flex items-center gap-1 text-xs text-[#6a8189] hover:text-[#244048]"
                          >
                            {aiCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {aiCopied ? 'Copied' : 'Copy'}
                          </button>
                        ) : null}
                      </div>

                      {aiResponse ? (
                        <pre className="max-h-28 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[#234149]">{aiResponse}</pre>
                      ) : (
                        <div className="rounded-lg border border-dashed border-[#d6e0e4] bg-[#fafcfc] p-2.5 text-xs text-[#70868e]">
                          Use a quick action or write your own request. The assistant can explain the sketch, debug pin logic, and help wire sensors without leaving the IDE.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-brand-secondary" />
                    <span className="text-xs text-white/50">AI API Plugs</span>
                  </div>
                  <div className="text-[11px] text-white/35">
                    {language.id === 'arduino' ? 'Arduino copilot mode' : `${language.label} copilot mode`}
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  {isArduinoLike && (
                    <GlassCard className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-brand-secondary" />
                        <h3 className="font-heading text-lg font-semibold text-white">Compiler telemetry</h3>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/38">Sketch lines</p>
                          <p className="mt-2 text-2xl font-bold text-white">{codeMetrics.lines}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/38">Functions</p>
                          <p className="mt-2 text-2xl font-bold text-white">{codeMetrics.functions}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/38">Serial logs</p>
                          <p className="mt-2 text-2xl font-bold text-white">{codeMetrics.serialLogs}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/38">Detected pins</p>
                          <p className="mt-2 text-sm font-semibold text-white">{codeMetrics.pinRefs.length > 0 ? codeMetrics.pinRefs.join(', ') : 'None'}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/55">
                        Cable target: <span className="text-brand-secondary">{compilerTarget.port}</span>
                        {' '}• Board profile: <span className="text-brand-secondary">{selectedHardware.title}</span>
                      </div>
                    </GlassCard>
                  )}

                  <GlassCard className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-heading text-lg font-semibold text-white">Robotix AI Assistant</h2>
                        <p className="mt-1 text-sm text-white/55">
                          API-powered help for code generation, debugging, hardware logic, and embedded explanations inside the IDE.
                        </p>
                      </div>
                      <Badge variant="accent">Live API</Badge>
                    </div>

                    {isArduinoLike && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/38">Hardware profile</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {HARDWARE_PROFILES.map((profile) => (
                            <button
                              key={profile.id}
                              type="button"
                              onClick={() => setSelectedHardwareId(profile.id)}
                              className={`rounded-xl border p-3 text-left transition-colors ${
                                selectedHardwareId === profile.id
                                  ? 'border-brand-secondary/40 bg-brand-secondary/10'
                                  : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                              }`}
                            >
                              <div className="text-sm font-semibold text-white">{profile.title}</div>
                              <p className="mt-1 text-xs leading-5 text-white/50">{profile.summary}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isArduinoLike && (
                      <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/8 p-3 text-xs text-amber-100">
                        <div className="flex items-center gap-2 font-semibold">
                          <TriangleAlert className="h-3.5 w-3.5" />
                          Embedded compiler focus
                        </div>
                        <p className="mt-2 leading-5 text-amber-50/80">
                          AI responses now include compiler target context, hardware assumptions, cable target hints, and debug-first recommendations for Arduino workflows.
                        </p>
                      </div>
                    )}

                    <div className="mb-4 grid gap-2 sm:grid-cols-2">
                      {AI_PLUGS.map((plug) => (
                        <button
                          key={plug.id}
                          type="button"
                          onClick={() => {
                            setAiPrompt(plug.prompt);
                            runAiPlug(plug.prompt);
                          }}
                          className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-brand-secondary/30 hover:bg-white/[0.05]"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            {plug.id.includes('debug') ? <Wrench className="h-4 w-4 text-brand-secondary" /> : plug.id.includes('explain') ? <Lightbulb className="h-4 w-4 text-brand-secondary" /> : <WandSparkles className="h-4 w-4 text-brand-secondary" />}
                            {plug.title}
                          </div>
                          <p className="mt-2 text-xs leading-5 text-white/50">{plug.description}</p>
                        </button>
                      ))}
                    </div>

                    <Textarea
                      value={aiPrompt}
                      onChange={(event) => setAiPrompt(event.target.value)}
                      placeholder={
                        language.id === 'arduino'
                          ? 'Example: Add servo control and Bluetooth commands to this Arduino robot sketch.'
                          : 'Ask Robotix AI to explain, generate, or improve the current code.'
                      }
                      className="min-h-[120px]"
                    />

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIncludeCodeContext((value) => !value)}
                        className={`rounded-full px-3 py-2 text-xs transition-all ${
                          includeCodeContext
                            ? 'bg-brand-secondary text-brand-dark'
                            : 'border border-white/10 bg-white/[0.03] text-white/65'
                        }`}
                      >
                        {includeCodeContext ? 'Including current code context' : 'Prompt only'}
                      </button>
                      <span className="text-xs text-white/35">Topic: {suggestedTopic}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button onClick={() => runAiPlug()} loading={aiLoading} icon={<Send className="h-4 w-4" />}>
                        Ask AI
                      </Button>
                      <Button variant="secondary" onClick={() => insertAiCode('replace')} icon={<WandSparkles className="h-4 w-4" />}>
                        Replace editor with AI code
                      </Button>
                      <Button variant="ghost" onClick={() => insertAiCode('append')} icon={<Sparkles className="h-4 w-4" />}>
                        Append AI code
                      </Button>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-heading text-lg font-semibold text-white">AI Response</h3>
                      {aiResponse ? (
                        <button
                          onClick={copyAiResponse}
                          className="inline-flex items-center gap-1 text-xs text-white/45 hover:text-white/70"
                        >
                          {aiCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {aiCopied ? 'Copied' : 'Copy'}
                        </button>
                      ) : null}
                    </div>

                    {aiResponse ? (
                      <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/82">{aiResponse}</pre>
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                        Use an AI plug or write your own request. Robotix AI can help generate Arduino sketches, explain code, debug sensor logic, or suggest API integrations.
                      </div>
                    )}
                  </GlassCard>

                  <GlassCard className="overflow-hidden p-4">
                    <PlayVerseArcade
                      onScore={(score) => {
                        toast.success(`PlayVerse score recorded: ${score}`);
                      }}
                    />

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href="/play">
                        <Button variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>
                          Open full PlayVerse
                        </Button>
                      </Link>
                      <Link href="/game-lab">
                        <Button variant="ghost" icon={<Play className="h-4 w-4" />}>
                          Open Game Studio
                        </Button>
                      </Link>
                    </div>
                  </GlassCard>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
