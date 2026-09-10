export interface GameWorldTheme {
  id: string;
  name: string;
  vibe: string;
  palette: {
    background: string;
    accent: string;
    player: string;
    hazard: string;
  };
  descriptionSeed: string;
  tags: string[];
}

export const GAME_WORLD_THEMES: GameWorldTheme[] = [
  {
    id: 'neon-grid',
    name: 'Neon Grid',
    vibe: 'Arcade energy with electric color and clean sci-fi motion.',
    palette: {
      background: '#09041f',
      accent: '#33d6ff',
      player: '#f4b400',
      hazard: '#fb7185',
    },
    descriptionSeed: 'A neon-charged arena where every move feels fast, electric, and high-stakes.',
    tags: ['arcade', 'neon', 'fast-paced'],
  },
  {
    id: 'robot-frontier',
    name: 'Robot Frontier',
    vibe: 'Adventure across a futuristic robotics outpost with industrial charm.',
    palette: {
      background: '#101d28',
      accent: '#60a5fa',
      player: '#22c55e',
      hazard: '#f97316',
    },
    descriptionSeed: 'A frontier robotics zone packed with machines, field hazards, and engineering missions.',
    tags: ['robotics', 'adventure', 'engineering'],
  },
  {
    id: 'space-vault',
    name: 'Space Vault',
    vibe: 'High-tech orbital vaults, clean HUD overlays, and space-ops tension.',
    palette: {
      background: '#040b1f',
      accent: '#38bdf8',
      player: '#f8fafc',
      hazard: '#ef4444',
    },
    descriptionSeed: 'A dangerous orbital sector where precision piloting and quick thinking keep the mission alive.',
    tags: ['space', 'sci-fi', 'shooter'],
  },
  {
    id: 'bio-circuit',
    name: 'Bio Circuit',
    vibe: 'Organic colors mixed with circuitry for a fresh, unusual Robotix identity.',
    palette: {
      background: '#071c16',
      accent: '#4ade80',
      player: '#fde047',
      hazard: '#a855f7',
    },
    descriptionSeed: 'A living circuit world where engineered ecosystems and machine logic collide.',
    tags: ['creative', 'survival', 'future-world'],
  },
];

function mergeTags(existing: string, extra: string[]) {
  const current = existing
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const merged = Array.from(new Set([...current, ...extra]));
  return merged.join(', ');
}

function replaceFirstColor(code: string, pattern: RegExp, replacement: string) {
  return code.replace(pattern, replacement);
}

export function applyWorldThemeToProject({
  title,
  description,
  tags,
  code,
  theme,
}: {
  title: string;
  description: string;
  tags: string;
  code: string;
  theme: GameWorldTheme;
}) {
  let nextCode = code;

  nextCode = replaceFirstColor(
    nextCode,
    /backgroundColor:\s*['"`][^'"`]+['"`]/,
    `backgroundColor: '${theme.palette.background}'`
  );

  nextCode = replaceFirstColor(nextCode, /#33d6ff/g, theme.palette.accent);
  nextCode = replaceFirstColor(nextCode, /#f4b400/g, theme.palette.player);
  nextCode = replaceFirstColor(nextCode, /#fb7185/g, theme.palette.hazard);
  nextCode = replaceFirstColor(nextCode, /#ef4444/g, theme.palette.hazard);
  nextCode = replaceFirstColor(nextCode, /#22c55e/g, theme.palette.player);

  if (!nextCode.includes(`World theme:${theme.id}`)) {
    nextCode = `// World theme:${theme.id}\n${nextCode}`;
  }

  return {
    title: title.trim() || theme.name,
    description: description.trim() || theme.descriptionSeed,
    tags: mergeTags(tags, theme.tags),
    code: nextCode,
  };
}
