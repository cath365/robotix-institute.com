import { applyCodeSections, type GameCodeBlockSection, upsertManagedCodeSection } from '@/lib/game-code-blocks';

export type EventConditionId = 'timer_below' | 'score_reaches' | 'space_pressed' | 'player_hits_object';
export type EventActionId = 'show_message' | 'camera_shake' | 'spawn_bonus' | 'increase_score' | 'teleport_player';

export interface GameEventRule {
  id: string;
  label: string;
  sceneId?: string | null;
  condition: EventConditionId;
  action: EventActionId;
  value: number;
  message: string;
  targetObjectId?: string;
}

function sanitizeId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || `event-rule-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeText(value: string) {
  return JSON.stringify(value.trim() || 'Robotix event triggered');
}

export function createDefaultEventRule(): GameEventRule {
  return {
    id: `event-${Math.random().toString(36).slice(2, 8)}`,
    label: 'New event rule',
    sceneId: null,
    condition: 'score_reaches',
    action: 'show_message',
    value: 5,
    message: 'Great work! Keep pushing forward.',
  };
}

function buildActionSnippet(rule: GameEventRule) {
  const message = escapeText(rule.message);

  if (rule.action === 'camera_shake') {
    return `this.cameras.main.shake(180, 0.012);`;
  }

  if (rule.action === 'spawn_bonus') {
    return `const reward = this.add.circle(
  Phaser.Math.Between(90, 630),
  Phaser.Math.Between(130, 430),
  11,
  0xffffff
);
this.physics.add.existing(reward);
reward.body.setImmovable(true);
reward.body.setAllowGravity(false);
if (!this.pickups?.add) {
  this.pickups = this.physics.add.group();
}
this.pickups.add(reward);`;
  }

  if (rule.action === 'increase_score') {
    return `this.score = (this.score ?? 0) + ${Math.max(1, rule.value)};
if (this.scoreText) this.scoreText.setText('Score: ' + this.score);`;
  }

  if (rule.action === 'teleport_player') {
    return `this.player?.setPosition(
  Phaser.Math.Between(80, 640),
  Phaser.Math.Between(120, 430)
);`;
  }

  return `const eventPanel = this.add.rectangle(360, 110, 390, 74, 0x020617, 0.76)
  .setStrokeStyle(2, 0x33d6ff, 0.9);
const eventText = this.add.text(360, 110, ${message}, {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '18px',
  color: '#ffffff',
  align: 'center',
  wordWrap: { width: 320 },
}).setOrigin(0.5);
this.time.delayedCall(2200, () => {
  eventPanel.destroy();
  eventText.destroy();
});`;
}

function buildConditionSections(rule: GameEventRule): GameCodeBlockSection[] {
  const actionBody = buildActionSnippet(rule)
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');

  const ruleKey = sanitizeId(rule.id || rule.label);
  const sections: GameCodeBlockSection[] = [
    {
      target: 'create',
      snippet: `this.robotixRuleState = this.robotixRuleState || {};
this.robotixRuleState[${JSON.stringify(ruleKey)}] = false;`,
    },
  ];

  if (rule.condition === 'space_pressed') {
    sections.push({
      target: 'create',
      snippet: `this.robotixEventKeys = this.robotixEventKeys || {};
this.robotixEventKeys[${JSON.stringify(ruleKey)}] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);`,
    });
  }

  if (rule.condition === 'player_hits_object' && rule.targetObjectId) {
    sections.push({
      target: 'create',
      snippet: `if (this.robotixSceneObjects?.[${JSON.stringify(rule.targetObjectId)}]) {
  this.physics.add.overlap(this.player, this.robotixSceneObjects[${JSON.stringify(rule.targetObjectId)}], () => {
    if (${JSON.stringify(rule.sceneId ?? null)} && this.robotixActiveScene?.id !== ${JSON.stringify(rule.sceneId ?? null)}) return;
    if (this.robotixRuleState[${JSON.stringify(ruleKey)}]) return;
    this.robotixRuleState[${JSON.stringify(ruleKey)}] = true;
${actionBody}
  });
}`,
    });
    return sections;
  }

  const conditionCheck =
    rule.condition === 'timer_below'
      ? `(this.timeLeft ?? 999) <= ${Math.max(1, rule.value)}`
      : rule.condition === 'score_reaches'
        ? `(this.score ?? 0) >= ${Math.max(1, rule.value)}`
        : `Phaser.Input.Keyboard.JustDown(this.robotixEventKeys?.[${JSON.stringify(ruleKey)}])`;

  sections.push({
    target: 'update',
    snippet: `if ((!${JSON.stringify(rule.sceneId ?? null)} || this.robotixActiveScene?.id === ${JSON.stringify(rule.sceneId ?? null)}) && !this.robotixRuleState?.[${JSON.stringify(ruleKey)}] && ${conditionCheck}) {
  this.robotixRuleState[${JSON.stringify(ruleKey)}] = true;
${actionBody}
}`,
  });

  return sections;
}

export function applyEventRule(code: string, rule: GameEventRule) {
  const normalized: GameEventRule = {
    ...rule,
    id: sanitizeId(rule.id || rule.label),
    label: rule.label.trim() || 'Event rule',
    sceneId: rule.sceneId?.trim() || null,
    value: Math.max(1, Math.round(Number(rule.value) || 1)),
    message: rule.message.trim() || 'Robotix event triggered',
  };

  const result = applyCodeSections(code, `event-${normalized.id}`, buildConditionSections(normalized));
  return {
    ...result,
    rule: normalized,
  };
}

export function syncEventRulesToCode(code: string, rules: GameEventRule[]) {
  const normalized = rules.map((rule) => ({
    ...rule,
    id: sanitizeId(rule.id || rule.label),
    label: rule.label.trim() || 'Event rule',
    sceneId: rule.sceneId?.trim() || null,
    value: Math.max(1, Math.round(Number(rule.value) || 1)),
    message: rule.message.trim() || 'Robotix event triggered',
  }));

  const createSnippets: string[] = [];
  const updateSnippets: string[] = [];
  const globalSnippets: string[] = [];
  const preloadSnippets: string[] = [];

  normalized.forEach((rule) => {
    buildConditionSections(rule).forEach((section) => {
      if (section.target === 'create') createSnippets.push(section.snippet);
      else if (section.target === 'update') updateSnippets.push(section.snippet);
      else if (section.target === 'global') globalSnippets.push(section.snippet);
      else if (section.target === 'preload') preloadSnippets.push(section.snippet);
    });
  });

  let nextCode = code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-event-rules', 'global', globalSnippets.join('\n\n')).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-event-rules', 'preload', preloadSnippets.join('\n\n')).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-event-rules', 'create', createSnippets.join('\n\n')).code;
  nextCode = upsertManagedCodeSection(nextCode, 'managed-event-rules', 'update', updateSnippets.join('\n\n')).code;

  return {
    code: nextCode,
    rules: normalized,
  };
}
