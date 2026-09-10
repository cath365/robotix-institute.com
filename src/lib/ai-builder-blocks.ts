export type AiBuilderWorkspaceMode = 'ai-friend' | 'quiz-host' | 'robot-coach' | 'launch-board';

export type AiBuilderBlockKind =
  | 'start-app'
  | 'show-avatar'
  | 'ask-name'
  | 'ask-topic'
  | 'quick-buttons'
  | 'ai-generate'
  | 'show-score'
  | 'save-memory'
  | 'confetti-burst'
  | 'robot-dance';

export type AiBuilderBlockCategory = 'Start' | 'Interface' | 'AI' | 'Data' | 'Fun';

export interface AiBuilderBlockInstance {
  id: string;
  kind: AiBuilderBlockKind;
}

export interface AiBuilderManifest {
  version: 1;
  workspaceMode: AiBuilderWorkspaceMode;
  notes: string;
  blocks: AiBuilderBlockInstance[];
}

export interface AiBuilderBlockDefinition {
  kind: AiBuilderBlockKind;
  category: AiBuilderBlockCategory;
  label: string;
  description: string;
  accentClass: string;
}

const MANIFEST_PREFIX = '/* RobotixAIBuilderManifest:';
const MANIFEST_SUFFIX = ' */';

export const AI_BUILDER_BLOCK_LIBRARY: AiBuilderBlockDefinition[] = [
  {
    kind: 'start-app',
    category: 'Start',
    label: 'When App Starts',
    description: 'Boot the experience with a clear first screen.',
    accentClass: 'from-amber-400 to-yellow-300',
  },
  {
    kind: 'show-avatar',
    category: 'Interface',
    label: 'Show Robotix Guide',
    description: 'Display a friendly Robotix AI helper on the screen.',
    accentClass: 'from-sky-400 to-cyan-300',
  },
  {
    kind: 'ask-name',
    category: 'Interface',
    label: 'Ask for Name',
    description: 'Let the user introduce themselves before the app responds.',
    accentClass: 'from-cyan-500 to-blue-400',
  },
  {
    kind: 'ask-topic',
    category: 'Interface',
    label: 'Ask for Topic',
    description: 'Capture what the user wants help creating or exploring.',
    accentClass: 'from-violet-500 to-indigo-400',
  },
  {
    kind: 'quick-buttons',
    category: 'Interface',
    label: 'Show Quick Buttons',
    description: 'Offer fast prompt chips the user can tap.',
    accentClass: 'from-emerald-400 to-lime-300',
  },
  {
    kind: 'ai-generate',
    category: 'AI',
    label: 'Generate AI Reply',
    description: 'Create a playful AI-style answer using the chosen topic.',
    accentClass: 'from-fuchsia-500 to-pink-400',
  },
  {
    kind: 'show-score',
    category: 'Data',
    label: 'Show Score Meter',
    description: 'Track how many playful actions the user has triggered.',
    accentClass: 'from-orange-400 to-amber-300',
  },
  {
    kind: 'save-memory',
    category: 'Data',
    label: 'Save Idea Memory',
    description: 'Keep a short history of the generated ideas or prompts.',
    accentClass: 'from-blue-500 to-sky-400',
  },
  {
    kind: 'confetti-burst',
    category: 'Fun',
    label: 'Celebrate Win',
    description: 'Trigger a visible success moment after the AI responds.',
    accentClass: 'from-pink-400 to-rose-300',
  },
  {
    kind: 'robot-dance',
    category: 'Fun',
    label: 'Robot Dance',
    description: 'Make the helper act playful when the run succeeds.',
    accentClass: 'from-lime-400 to-emerald-300',
  },
];

function encodeManifest(manifest: AiBuilderManifest) {
  const json = JSON.stringify(manifest);
  if (typeof window === 'undefined') {
    return Buffer.from(json, 'utf8').toString('base64');
  }

  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function decodeManifest(encoded: string) {
  if (typeof window === 'undefined') {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as AiBuilderManifest;
  }

  const binary = window.atob(encoded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as AiBuilderManifest;
}

export function createAiBuilderManifest(
  mode: AiBuilderWorkspaceMode = 'ai-friend',
  notes = ''
): AiBuilderManifest {
  return {
    version: 1,
    workspaceMode: mode,
    notes,
    blocks: [
      { id: crypto.randomUUID(), kind: 'start-app' },
      { id: crypto.randomUUID(), kind: 'show-avatar' },
      { id: crypto.randomUUID(), kind: 'ask-name' },
      { id: crypto.randomUUID(), kind: 'ask-topic' },
      { id: crypto.randomUUID(), kind: 'ai-generate' },
      { id: crypto.randomUUID(), kind: 'confetti-burst' },
    ],
  };
}

export function cloneAiBuilderBlock(kind: AiBuilderBlockKind): AiBuilderBlockInstance {
  return { id: crypto.randomUUID(), kind };
}

export function normalizeAiBuilderManifest(manifest: AiBuilderManifest): AiBuilderManifest {
  return {
    version: 1,
    workspaceMode: manifest.workspaceMode,
    notes: manifest.notes?.trim().slice(0, 1200) ?? '',
    blocks: Array.isArray(manifest.blocks)
      ? manifest.blocks
          .filter((block): block is AiBuilderBlockInstance => Boolean(block?.kind))
          .slice(0, 24)
          .map((block) => ({
            id: block.id || crypto.randomUUID(),
            kind: block.kind,
          }))
      : [],
  };
}

export function stripAiBuilderManifest(code: string) {
  return code.replace(/^\/\* RobotixAIBuilderManifest:[A-Za-z0-9+/=]+\*\/\s*/m, '');
}

export function attachAiBuilderManifest(code: string, manifest: AiBuilderManifest) {
  return `${MANIFEST_PREFIX}${encodeManifest(normalizeAiBuilderManifest(manifest))}${MANIFEST_SUFFIX}\n${stripAiBuilderManifest(code).trimStart()}`;
}

export function parseAiBuilderManifest(code: string) {
  const match = code.match(/^\/\* RobotixAIBuilderManifest:([A-Za-z0-9+/=]+)\*\/\s*/m);
  if (!match) {
    return {
      manifest: createAiBuilderManifest(),
      code: stripAiBuilderManifest(code),
    };
  }

  try {
    return {
      manifest: normalizeAiBuilderManifest(decodeManifest(match[1])),
      code: stripAiBuilderManifest(code),
    };
  } catch {
    return {
      manifest: createAiBuilderManifest(),
      code: stripAiBuilderManifest(code),
    };
  }
}

export function buildAiBuilderCode(manifest: AiBuilderManifest) {
  const normalized = normalizeAiBuilderManifest(manifest);
  const lines = normalized.blocks.map((block, index) => {
    const blockDef = AI_BUILDER_BLOCK_LIBRARY.find((item) => item.kind === block.kind);
    return `  // ${index + 1}. ${blockDef?.label ?? block.kind}`;
  });

  const modeLabel = normalized.workspaceMode.replace(/-/g, ' ');
  const notesLine = normalized.notes
    ? `const builderNotes = ${JSON.stringify(normalized.notes)};\nconsole.log('Notes:', builderNotes);\n`
    : '';

  return `const robotixBuilderMode = ${JSON.stringify(modeLabel)};
const robotixBlockKinds = ${JSON.stringify(normalized.blocks.map((block) => block.kind), null, 2)};

console.log('Robotix AI Builder mode:', robotixBuilderMode);
console.log('Workspace blocks:', robotixBlockKinds.length);
${notesLine}// Robotix AI Builder workflow
${lines.join('\n')}

function launchRobotixPrototype() {
  return {
    mode: robotixBuilderMode,
    blocks: robotixBlockKinds,
    status: 'ready-to-build',
  };
}

console.log('Prototype blueprint:', launchRobotixPrototype());`;
}

export function getAiBuilderTemplateManifest(title: string): AiBuilderManifest {
  const lower = title.toLowerCase();

  if (lower.includes('dashboard')) {
    return {
      version: 1,
      workspaceMode: 'launch-board',
      notes: 'Use colorful status cards, a score meter, and a fun helper to make the dashboard feel alive.',
      blocks: [
        cloneAiBuilderBlock('start-app'),
        cloneAiBuilderBlock('show-avatar'),
        cloneAiBuilderBlock('quick-buttons'),
        cloneAiBuilderBlock('show-score'),
        cloneAiBuilderBlock('save-memory'),
        cloneAiBuilderBlock('confetti-burst'),
      ],
    };
  }

  if (lower.includes('bot')) {
    return {
      version: 1,
      workspaceMode: 'ai-friend',
      notes: 'Keep the AI guide friendly and make the first reply playful.',
      blocks: [
        cloneAiBuilderBlock('start-app'),
        cloneAiBuilderBlock('show-avatar'),
        cloneAiBuilderBlock('ask-name'),
        cloneAiBuilderBlock('ask-topic'),
        cloneAiBuilderBlock('quick-buttons'),
        cloneAiBuilderBlock('ai-generate'),
        cloneAiBuilderBlock('robot-dance'),
      ],
    };
  }

  if (lower.includes('arduino') || lower.includes('robot')) {
    return {
      version: 1,
      workspaceMode: 'robot-coach',
      notes: 'Use the AI guide as a robotics coach that explains build steps and celebrates progress.',
      blocks: [
        cloneAiBuilderBlock('start-app'),
        cloneAiBuilderBlock('show-avatar'),
        cloneAiBuilderBlock('ask-topic'),
        cloneAiBuilderBlock('ai-generate'),
        cloneAiBuilderBlock('show-score'),
        cloneAiBuilderBlock('confetti-burst'),
      ],
    };
  }

  return {
    version: 1,
    workspaceMode: 'quiz-host',
    notes: 'Ask a question, respond with energy, and keep the interaction playful.',
    blocks: [
      cloneAiBuilderBlock('start-app'),
      cloneAiBuilderBlock('ask-name'),
      cloneAiBuilderBlock('ask-topic'),
      cloneAiBuilderBlock('quick-buttons'),
      cloneAiBuilderBlock('ai-generate'),
      cloneAiBuilderBlock('save-memory'),
      cloneAiBuilderBlock('confetti-burst'),
    ],
  };
}
