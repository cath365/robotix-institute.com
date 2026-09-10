export interface StudioSignal {
  id: string;
  label: string;
  found: boolean;
  detail: string;
}

export interface StudioSuggestion {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StudioAnalysis {
  score: number;
  verdict: string;
  genre: string;
  signals: StudioSignal[];
  suggestions: StudioSuggestion[];
}

function hasAny(code: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(code));
}

function pickGenre(code: string) {
  if (hasAny(code, [/bullet/i, /fireKey/i, /shoot/i, /enemy/i])) return 'Arcade shooter';
  if (hasAny(code, [/hazard/i, /survive/i, /lives/i, /timeLeft/i])) return 'Survival challenge';
  if (hasAny(code, [/score/i, /collect/i, /pickup/i, /overlap/i])) return 'Collectathon';
  if (hasAny(code, [/platform/i, /jump/i, /gravity/i])) return 'Platformer';
  return 'Creator prototype';
}

export function analyzeStudioProject({
  title,
  description,
  tags,
  thumbnail,
  code,
}: {
  title: string;
  description: string;
  tags: string;
  thumbnail?: string | null;
  code: string;
}): StudioAnalysis {
  const signals: StudioSignal[] = [
    {
      id: 'movement',
      label: 'Player controls',
      found: hasAny(code, [/createCursorKeys/i, /setVelocityX/i, /setVelocityY/i, /player\.body/i]),
      detail: 'A real game needs responsive movement or interaction controls.',
    },
    {
      id: 'objective',
      label: 'Goal or win state',
      found: hasAny(code, [/score/i, /goal/i, /finishRound/i, /win/i, /mission/i]),
      detail: 'Players should know what they are trying to achieve.',
    },
    {
      id: 'pressure',
      label: 'Challenge pressure',
      found: hasAny(code, [/timeLeft/i, /timer/i, /lives/i, /hazard/i, /enemy/i]),
      detail: 'Good games create tension through risk, time, or opposition.',
    },
    {
      id: 'feedback',
      label: 'Player feedback',
      found: hasAny(code, [/scoreText/i, /setText/i, /camera/i, /flash/i, /shake/i, /alpha/i]),
      detail: 'Games feel better when actions visibly respond on screen.',
    },
    {
      id: 'polish',
      label: 'Visual atmosphere',
      found: hasAny(code, [/star/i, /graphics/i, /tween/i, /rectangle/i, /backgroundColor/i]),
      detail: 'Atmosphere turns a prototype into something memorable.',
    },
    {
      id: 'metadata',
      label: 'Storefront readiness',
      found: title.trim().length >= 4 && description.trim().length >= 30 && !!thumbnail?.trim(),
      detail: 'A title, story, and cover image make the project feel publishable.',
    },
  ];

  const baseScore = signals.filter((signal) => signal.found).length * 16;
  const tagsBonus = tags.trim().length > 0 ? 4 : 0;
  const score = Math.min(100, baseScore + tagsBonus);

  const suggestions: StudioSuggestion[] = [];

  if (!signals.find((signal) => signal.id === 'metadata')?.found) {
    suggestions.push({
      id: 'metadata',
      title: 'Add a stronger pitch',
      detail: 'Give the game a clear description and cover image so it feels like a release, not only a draft.',
      priority: 'high',
    });
  }

  if (!signals.find((signal) => signal.id === 'pressure')?.found) {
    suggestions.push({
      id: 'pressure',
      title: 'Add tension',
      detail: 'Use a timer, enemies, hazards, or lives so the player feels pressure and purpose.',
      priority: 'high',
    });
  }

  if (!signals.find((signal) => signal.id === 'feedback')?.found) {
    suggestions.push({
      id: 'feedback',
      title: 'Add stronger feedback',
      detail: 'Screen shake, score text, flashes, and state messages make gameplay feel much more alive.',
      priority: 'medium',
    });
  }

  if (!signals.find((signal) => signal.id === 'polish')?.found) {
    suggestions.push({
      id: 'polish',
      title: 'Add atmosphere',
      detail: 'A background layer, glow, stars, or animated scene details will make the game more memorable.',
      priority: 'medium',
    });
  }

  if (!signals.find((signal) => signal.id === 'objective')?.found) {
    suggestions.push({
      id: 'objective',
      title: 'Clarify the win condition',
      detail: 'Make it obvious how the player wins or loses so the loop feels complete.',
      priority: 'high',
    });
  }

  if (tags.trim().length === 0) {
    suggestions.push({
      id: 'tags',
      title: 'Improve discoverability',
      detail: 'Add tags like arcade, robotics, puzzle, ai, or survival so the game reads like a real listing.',
      priority: 'low',
    });
  }

  let verdict = 'Playable prototype';
  if (score >= 85) verdict = 'Showcase-ready release';
  else if (score >= 65) verdict = 'Strong creator build';
  else if (score >= 45) verdict = 'Playable prototype';
  else verdict = 'Early concept';

  return {
    score,
    verdict,
    genre: pickGenre(code),
    signals,
    suggestions,
  };
}
