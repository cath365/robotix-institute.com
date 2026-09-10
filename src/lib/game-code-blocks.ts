export type GameCodeBlockTarget = 'global' | 'preload' | 'create' | 'update';

export interface GameCodeBlockSection {
  target: GameCodeBlockTarget;
  snippet: string;
}

export interface GameCodeBlock {
  id: string;
  title: string;
  description: string;
  level: 'Starter' | 'Builder' | 'Challenge';
  sections: GameCodeBlockSection[];
}

export const GAME_CODE_BLOCKS: GameCodeBlock[] = [
  {
    id: 'ambient-stars',
    title: 'Ambient Stars',
    description: 'Decorate the scene with a starfield so the game feels more alive immediately.',
    level: 'Starter',
    sections: [
      {
        target: 'create',
        snippet: `for (let i = 0; i < 24; i += 1) {
  this.add.circle(
    Phaser.Math.Between(0, 720),
    Phaser.Math.Between(0, 540),
    Phaser.Math.Between(1, 3),
    0xffffff,
    Phaser.Math.FloatBetween(0.12, 0.75)
  );
}`,
      },
    ],
  },
  {
    id: 'shift-boost',
    title: 'Shift Boost',
    description: 'Hold Shift to give the player a little burst of speed during movement.',
    level: 'Starter',
    sections: [
      {
        target: 'create',
        snippet: `this.boostKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);`,
      },
      {
        target: 'update',
        snippet: `if (this.boostKey?.isDown && this.player?.body) {
  this.player.body.velocity.scale(1.03);
}`,
      },
    ],
  },
  {
    id: 'screen-wrap',
    title: 'Screen Wrap',
    description: 'Let the player exit one side of the arena and appear on the opposite side.',
    level: 'Builder',
    sections: [
      {
        target: 'update',
        snippet: `if (this.player && this.player.x < -20) this.player.x = 740;
if (this.player && this.player.x > 740) this.player.x = -20;
if (this.player && this.player.y < 80) this.player.y = 500;
if (this.player && this.player.y > 560) this.player.y = 100;`,
      },
    ],
  },
  {
    id: 'teleport-portal',
    title: 'Teleport Portal',
    description: 'Drop a glowing portal into the map that warps the player to a random location.',
    level: 'Builder',
    sections: [
      {
        target: 'create',
        snippet: `this.portal = this.add.circle(660, 470, 16, 0x33d6ff, 0.45).setStrokeStyle(2, 0xffffff, 0.85);
this.physics.add.existing(this.portal);
this.portal.body.setImmovable(true);
this.portal.body.setAllowGravity(false);
this.physics.add.overlap(this.player, this.portal, () => {
  if (this.time.now < (this.portalCooldown ?? 0)) return;
  this.portalCooldown = this.time.now + 1200;
  this.player.setPosition(
    Phaser.Math.Between(80, 640),
    Phaser.Math.Between(120, 420)
  );
});`,
      },
    ],
  },
  {
    id: 'rival-bot',
    title: 'Rival Bot',
    description: 'Add a bouncing bot that collides with the player and shakes the camera.',
    level: 'Challenge',
    sections: [
      {
        target: 'create',
        snippet: `this.rival = this.add.circle(120, 150, 15, 0xfb7185);
this.physics.add.existing(this.rival);
this.rival.body.setCollideWorldBounds(true);
this.rival.body.setBounce(1, 1);
this.rival.body.setVelocity(160, 130);
this.physics.add.overlap(this.player, this.rival, () => {
  this.cameras.main.shake(120, 0.01);
  if (this.player?.body) {
    this.player.body.setVelocity(
      -this.player.body.velocity.x,
      -this.player.body.velocity.y
    );
  }
});`,
      },
    ],
  },
];

function indent(text: string, spaces: number) {
  const padding = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line.length > 0 ? `${padding}${line}` : line))
    .join('\n');
}

function wrapSnippet(blockId: string, target: GameCodeBlockTarget, snippet: string) {
  return `// Robotix block:${blockId}:${target}\n${snippet}\n// End Robotix block:${blockId}:${target}`;
}

const SCENE_START_PATTERN = /scene:\s*{\n/;

function insertIntoTarget(code: string, blockId: string, target: GameCodeBlockTarget, snippet: string) {
  const marker = `Robotix block:${blockId}:${target}`;
  if (code.includes(marker)) {
    return { code, inserted: false };
  }

  const wrapped = wrapSnippet(blockId, target, snippet);

  if (target === 'global') {
    const anchor = '  return {';
    const index = code.indexOf(anchor);
    if (index >= 0) {
      const insert = `${indent(wrapped, 2)}\n\n`;
      return {
        code: `${code.slice(0, index)}${insert}${code.slice(index)}`,
        inserted: true,
      };
    }
  }

  if (target === 'create') {
    const pattern = /create:\s*function\s*\(\)\s*{\n/;
    if (pattern.test(code)) {
      return {
        code: code.replace(pattern, (match) => `${match}${indent(wrapped, 8)}\n\n`),
        inserted: true,
      };
    }
  }

  if (target === 'preload') {
    const pattern = /preload:\s*function\s*\(\)\s*{\n/;
    if (pattern.test(code)) {
      return {
        code: code.replace(pattern, (match) => `${match}${indent(wrapped, 8)}\n\n`),
        inserted: true,
      };
    }
    if (SCENE_START_PATTERN.test(code)) {
      return {
        code: code.replace(
          SCENE_START_PATTERN,
          (match) => `${match}      preload: function () {\n${indent(wrapped, 8)}\n      },\n`
        ),
        inserted: true,
      };
    }
  }

  if (target === 'update') {
    const pattern = /update:\s*function\s*\([^)]*\)\s*{\n/;
    if (pattern.test(code)) {
      return {
        code: code.replace(pattern, (match) => `${match}${indent(wrapped, 8)}\n\n`),
        inserted: true,
      };
    }
  }

  return {
    code: `${code}\n\n${wrapped}`,
    inserted: true,
  };
}

export function applyCodeSections(
  code: string,
  id: string,
  sections: GameCodeBlockSection[]
) {
  let nextCode = code;
  let inserted = false;

  for (const section of sections) {
    const result = insertIntoTarget(nextCode, id, section.target, section.snippet);
    nextCode = result.code;
    inserted = inserted || result.inserted;
  }

  return { code: nextCode, inserted };
}

export function applyGameCodeBlock(code: string, block: GameCodeBlock) {
  return applyCodeSections(code, block.id, block.sections);
}

export function upsertManagedCodeSection(
  code: string,
  id: string,
  target: GameCodeBlockTarget,
  snippet: string
) {
  const start = `// Robotix block:${id}:${target}`;
  const end = `// End Robotix block:${id}:${target}`;
  const blockPattern = new RegExp(
    `\\n?\\s*${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`,
    'm'
  );

  if (snippet.trim().length === 0) {
    if (!blockPattern.test(code)) {
      return { code, inserted: false };
    }
    return {
      code: code.replace(blockPattern, '\n'),
      inserted: true,
    };
  }

  const wrapped = wrapSnippet(id, target, snippet);
  if (blockPattern.test(code)) {
    return {
      code: code.replace(blockPattern, `\n${wrapped}\n`),
      inserted: true,
    };
  }

  return insertIntoTarget(code, id, target, snippet);
}
