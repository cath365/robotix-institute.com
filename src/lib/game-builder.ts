export type GameBuilderPresetId = 'collector' | 'dodger' | 'shooter';

export interface GameBuilderConfig {
  preset: GameBuilderPresetId;
  title: string;
  objective: string;
  backgroundColor: string;
  playerColor: string;
  accentColor: string;
  hazardColor: string;
  playerSpeed: number;
  goalCount: number;
  objectCount: number;
  roundTime: number;
  lives: number;
}

export interface GameBuilderPreset {
  id: GameBuilderPresetId;
  name: string;
  description: string;
  helper: string;
  tags: string[];
  goalLabel: string;
  objectLabel: string;
  timeLabel: string;
  defaultConfig: GameBuilderConfig;
}

const PRESET_LIBRARY: Record<GameBuilderPresetId, Omit<GameBuilderPreset, 'id'>> = {
  collector: {
    name: 'Collector Quest',
    description: 'Move around the arena, grab energy orbs, and hit the score goal before time runs out.',
    helper: 'Great for first-time creators who want instant movement, scoring, and win conditions.',
    tags: ['game-builder', 'collect', 'arcade', 'beginner'],
    goalLabel: 'Score to win',
    objectLabel: 'Pickups on screen',
    timeLabel: 'Round timer (sec)',
    defaultConfig: {
      preset: 'collector',
      title: 'Orb Collector',
      objective: 'Collect enough energy orbs before the timer reaches zero.',
      backgroundColor: '#0b0638',
      playerColor: '#f4b400',
      accentColor: '#33d6ff',
      hazardColor: '#8b5cf6',
      playerSpeed: 230,
      goalCount: 12,
      objectCount: 5,
      roundTime: 45,
      lives: 3,
    },
  },
  dodger: {
    name: 'Dodge Arena',
    description: 'Stay alive while moving hazards bounce across the arena and the timer counts down.',
    helper: 'Feels like Code.org arcade warmups: survive, react fast, and tune the difficulty quickly.',
    tags: ['game-builder', 'dodge', 'reflex', 'arcade'],
    goalLabel: 'Lives',
    objectLabel: 'Hazards',
    timeLabel: 'Survive for (sec)',
    defaultConfig: {
      preset: 'dodger',
      title: 'Meteor Dodge',
      objective: 'Avoid every meteor until the survival timer ends.',
      backgroundColor: '#091223',
      playerColor: '#22c55e',
      accentColor: '#f4b400',
      hazardColor: '#ef4444',
      playerSpeed: 260,
      goalCount: 3,
      objectCount: 6,
      roundTime: 30,
      lives: 3,
    },
  },
  shooter: {
    name: 'Space Shooter',
    description: 'Pilot a ship, fire upward, and clear a target number of enemy drones.',
    helper: 'Adds a simple shooter loop with bullets, enemies, score, and health in one starter.',
    tags: ['game-builder', 'shooter', 'space', 'phaser'],
    goalLabel: 'Enemies to clear',
    objectLabel: 'Max enemies at once',
    timeLabel: 'Mission timer (sec)',
    defaultConfig: {
      preset: 'shooter',
      title: 'Drone Defender',
      objective: 'Blast the drones before they overwhelm your ship.',
      backgroundColor: '#040b1f',
      playerColor: '#33d6ff',
      accentColor: '#f4b400',
      hazardColor: '#fb7185',
      playerSpeed: 320,
      goalCount: 14,
      objectCount: 4,
      roundTime: 50,
      lives: 4,
    },
  },
};

export const GAME_BUILDER_PRESETS: GameBuilderPreset[] = (Object.entries(PRESET_LIBRARY) as Array<
  [GameBuilderPresetId, Omit<GameBuilderPreset, 'id'>]
>).map(([id, value]) => ({ id, ...value }));

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stringOrFallback(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function quote(value: string) {
  return JSON.stringify(value);
}

export function getGameBuilderPreset(presetId: GameBuilderPresetId) {
  return GAME_BUILDER_PRESETS.find((preset) => preset.id === presetId) ?? GAME_BUILDER_PRESETS[0];
}

export function createDefaultGameBuilderConfig(presetId: GameBuilderPresetId = 'collector'): GameBuilderConfig {
  const preset = getGameBuilderPreset(presetId);
  return { ...preset.defaultConfig };
}

export function normalizeGameBuilderConfig(input: GameBuilderConfig): GameBuilderConfig {
  const preset = getGameBuilderPreset(input.preset);
  return {
    ...preset.defaultConfig,
    ...input,
    title: stringOrFallback(input.title, preset.defaultConfig.title),
    objective: stringOrFallback(input.objective, preset.defaultConfig.objective),
    playerSpeed: clamp(Number(input.playerSpeed) || preset.defaultConfig.playerSpeed, 140, 420),
    goalCount: clamp(Number(input.goalCount) || preset.defaultConfig.goalCount, 1, 50),
    objectCount: clamp(Number(input.objectCount) || preset.defaultConfig.objectCount, 1, 12),
    roundTime: clamp(Number(input.roundTime) || preset.defaultConfig.roundTime, 10, 180),
    lives: clamp(Number(input.lives) || preset.defaultConfig.lives, 1, 10),
  };
}

function buildCollectorCode(config: GameBuilderConfig) {
  return `
RobotixPhaser.start((Phaser) => {
  const ARENA_WIDTH = 720;
  const ARENA_HEIGHT = 540;
  const MOVE_SPEED = ${config.playerSpeed};
  const SCORE_TO_WIN = ${config.goalCount};
  const ROUND_TIME = ${config.roundTime};
  const PICKUPS_ON_SCREEN = ${config.objectCount};
  const TITLE = ${quote(config.title)};
  const OBJECTIVE = ${quote(config.objective)};

  function randomPickupPosition() {
    return {
      x: Phaser.Math.Between(70, ARENA_WIDTH - 70),
      y: Phaser.Math.Between(120, ARENA_HEIGHT - 55),
    };
  }

  return {
    type: Phaser.AUTO,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    parent: 'game-root',
    backgroundColor: ${quote(config.backgroundColor)},
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false },
    },
    scene: {
      create: function () {
        this.score = 0;
        this.timeLeft = ROUND_TIME;
        this.ended = false;

        this.add.rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, ARENA_WIDTH - 24, ARENA_HEIGHT - 24, 0x000000, 0.06)
          .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(${quote(config.hazardColor)}).color, 0.28);

        this.add.text(24, 18, TITLE, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '28px',
          color: ${quote(config.accentColor)},
        });
        this.add.text(24, 54, OBJECTIVE, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '15px',
          color: '#d8defd',
          wordWrap: { width: 520 },
        });

        this.scoreText = this.add.text(24, 92, 'Score: 0 / ' + SCORE_TO_WIN, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
        });
        this.timerText = this.add.text(ARENA_WIDTH - 150, 24, 'Time: ' + ROUND_TIME, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
        });

        this.player = this.add.circle(ARENA_WIDTH / 2, ARENA_HEIGHT - 88, 18, Phaser.Display.Color.HexStringToColor(${quote(config.playerColor)}).color);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setDamping(true);
        this.player.body.setDrag(0.96);
        this.player.body.setMaxVelocity(MOVE_SPEED, MOVE_SPEED);

        this.pickups = this.physics.add.group();
        for (let i = 0; i < PICKUPS_ON_SCREEN; i += 1) {
          const spot = randomPickupPosition();
          const pickup = this.add.circle(spot.x, spot.y, 12, Phaser.Display.Color.HexStringToColor(${quote(config.accentColor)}).color);
          this.physics.add.existing(pickup);
          pickup.body.setImmovable(true);
          pickup.body.setAllowGravity(false);
          this.pickups.add(pickup);
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.overlap(this.player, this.pickups, (_, pickup) => {
          if (this.ended) return;
          this.score += 1;
          const next = randomPickupPosition();
          pickup.setPosition(next.x, next.y);
          this.scoreText.setText('Score: ' + this.score + ' / ' + SCORE_TO_WIN);
          if (this.score >= SCORE_TO_WIN) {
            this.finishRound(true, 'You collected every energy orb.');
          }
        });

        this.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
            if (this.ended) return;
            this.timeLeft -= 1;
            this.timerText.setText('Time: ' + this.timeLeft);
            if (this.timeLeft <= 0) {
              this.finishRound(false, 'Time ran out before the final orb.');
            }
          },
        });

        this.finishRound = (won, message) => {
          this.ended = true;
          this.player.body.setVelocity(0, 0);
          this.add.rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, 360, 136, 0x020617, 0.78)
            .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(won ? ${quote(config.accentColor)} : ${quote(config.hazardColor)}).color, 0.9);
          this.add.text(ARENA_WIDTH / 2, ARENA_HEIGHT / 2 - 20, won ? 'Mission complete' : 'Try again', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '30px',
            color: won ? ${quote(config.accentColor)} : ${quote(config.hazardColor)},
          }).setOrigin(0.5);
          this.add.text(ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 22, message, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 300 },
          }).setOrigin(0.5);
        };
      },
      update: function () {
        if (this.ended) return;

        const velocity = new Phaser.Math.Vector2(0, 0);
        if (this.cursors.left.isDown) velocity.x = -MOVE_SPEED;
        if (this.cursors.right.isDown) velocity.x = MOVE_SPEED;
        if (this.cursors.up.isDown) velocity.y = -MOVE_SPEED;
        if (this.cursors.down.isDown) velocity.y = MOVE_SPEED;

        this.player.body.setVelocity(velocity.x, velocity.y);
      },
    },
  };
});
`.trim();
}

function buildDodgerCode(config: GameBuilderConfig) {
  return `
RobotixPhaser.start((Phaser) => {
  const ARENA_WIDTH = 720;
  const ARENA_HEIGHT = 540;
  const MOVE_SPEED = ${config.playerSpeed};
  const STARTING_LIVES = ${config.lives};
  const ROUND_TIME = ${config.roundTime};
  const HAZARD_COUNT = ${config.objectCount};
  const TITLE = ${quote(config.title)};
  const OBJECTIVE = ${quote(config.objective)};

  function randomVelocity() {
    const x = Phaser.Math.Between(140, 240) * (Math.random() > 0.5 ? 1 : -1);
    const y = Phaser.Math.Between(140, 240) * (Math.random() > 0.5 ? 1 : -1);
    return { x, y };
  }

  return {
    type: Phaser.AUTO,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    parent: 'game-root',
    backgroundColor: ${quote(config.backgroundColor)},
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false },
    },
    scene: {
      create: function () {
        this.timeLeft = ROUND_TIME;
        this.lives = STARTING_LIVES;
        this.ended = false;
        this.invulnerableUntil = 0;

        this.add.text(24, 18, TITLE, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '28px',
          color: ${quote(config.accentColor)},
        });
        this.add.text(24, 54, OBJECTIVE, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '15px',
          color: '#d8defd',
          wordWrap: { width: 540 },
        });

        this.livesText = this.add.text(24, 92, 'Lives: ' + this.lives, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
        });
        this.timerText = this.add.text(ARENA_WIDTH - 170, 24, 'Survive: ' + ROUND_TIME, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
        });

        this.player = this.add.circle(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, 18, Phaser.Display.Color.HexStringToColor(${quote(config.playerColor)}).color);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this.hazards = this.physics.add.group();
        for (let i = 0; i < HAZARD_COUNT; i += 1) {
          const hazard = this.add.circle(
            Phaser.Math.Between(50, ARENA_WIDTH - 50),
            Phaser.Math.Between(120, ARENA_HEIGHT - 50),
            Phaser.Math.Between(12, 22),
            Phaser.Display.Color.HexStringToColor(${quote(config.hazardColor)}).color
          );
          this.physics.add.existing(hazard);
          hazard.body.setCollideWorldBounds(true);
          hazard.body.setBounce(1, 1);
          const speed = randomVelocity();
          hazard.body.setVelocity(speed.x, speed.y);
          this.hazards.add(hazard);
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.overlap(this.player, this.hazards, (_, hazard) => {
          if (this.ended || this.time.now < this.invulnerableUntil) return;
          this.invulnerableUntil = this.time.now + 900;
          this.lives -= 1;
          this.livesText.setText('Lives: ' + this.lives);
          this.player.setAlpha(0.45);
          this.time.delayedCall(300, () => this.player.setAlpha(1));
          hazard.body.setVelocity(randomVelocity().x, randomVelocity().y);
          if (this.lives <= 0) {
            this.finishRound(false, 'The arena overwhelmed your pilot.');
          }
        });

        this.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
            if (this.ended) return;
            this.timeLeft -= 1;
            this.timerText.setText('Survive: ' + this.timeLeft);
            if (this.timeLeft <= 0) {
              this.finishRound(true, 'You survived the hazard wave.');
            }
          },
        });

        this.finishRound = (won, message) => {
          this.ended = true;
          this.player.body.setVelocity(0, 0);
          this.hazards.children.each((hazard) => hazard.body.setVelocity(0, 0));
          this.add.rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, 360, 136, 0x020617, 0.82)
            .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(won ? ${quote(config.accentColor)} : ${quote(config.hazardColor)}).color, 0.9);
          this.add.text(ARENA_WIDTH / 2, ARENA_HEIGHT / 2 - 20, won ? 'Survival clear' : 'Round failed', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '30px',
            color: won ? ${quote(config.accentColor)} : ${quote(config.hazardColor)},
          }).setOrigin(0.5);
          this.add.text(ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 22, message, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 300 },
          }).setOrigin(0.5);
        };
      },
      update: function () {
        if (this.ended) return;

        let velocityX = 0;
        let velocityY = 0;
        if (this.cursors.left.isDown) velocityX = -MOVE_SPEED;
        if (this.cursors.right.isDown) velocityX = MOVE_SPEED;
        if (this.cursors.up.isDown) velocityY = -MOVE_SPEED;
        if (this.cursors.down.isDown) velocityY = MOVE_SPEED;
        this.player.body.setVelocity(velocityX, velocityY);
      },
    },
  };
});
`.trim();
}

function buildShooterCode(config: GameBuilderConfig) {
  return `
RobotixPhaser.start((Phaser) => {
  const ARENA_WIDTH = 720;
  const ARENA_HEIGHT = 540;
  const PLAYER_SPEED = ${config.playerSpeed};
  const GOAL_SCORE = ${config.goalCount};
  const MAX_ENEMIES = ${config.objectCount};
  const ROUND_TIME = ${config.roundTime};
  const STARTING_LIVES = ${config.lives};
  const TITLE = ${quote(config.title)};
  const OBJECTIVE = ${quote(config.objective)};

  return {
    type: Phaser.AUTO,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    parent: 'game-root',
    backgroundColor: ${quote(config.backgroundColor)},
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false },
    },
    scene: {
      create: function () {
        this.score = 0;
        this.lives = STARTING_LIVES;
        this.timeLeft = ROUND_TIME;
        this.ended = false;
        this.lastShotAt = 0;

        for (let i = 0; i < 48; i += 1) {
          this.add.circle(
            Phaser.Math.Between(0, ARENA_WIDTH),
            Phaser.Math.Between(0, ARENA_HEIGHT),
            Phaser.Math.Between(1, 2),
            0xffffff,
            Phaser.Math.FloatBetween(0.16, 0.7)
          );
        }

        this.add.text(24, 18, TITLE, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '28px',
          color: ${quote(config.accentColor)},
        });
        this.add.text(24, 54, OBJECTIVE, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '15px',
          color: '#d8defd',
          wordWrap: { width: 520 },
        });

        this.scoreText = this.add.text(24, 92, 'Score: 0 / ' + GOAL_SCORE, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
        });
        this.livesText = this.add.text(ARENA_WIDTH - 170, 24, 'Lives: ' + this.lives, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
        });
        this.timerText = this.add.text(ARENA_WIDTH - 170, 54, 'Timer: ' + ROUND_TIME, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
        });

        const ship = this.add.graphics();
        ship.fillStyle(Phaser.Display.Color.HexStringToColor(${quote(config.playerColor)}).color, 1);
        ship.fillTriangle(0, 28, 32, 28, 16, 0);
        ship.generateTexture('builder-ship', 32, 30);
        ship.destroy();

        const bullet = this.add.graphics();
        bullet.fillStyle(Phaser.Display.Color.HexStringToColor(${quote(config.accentColor)}).color, 1);
        bullet.fillRect(0, 0, 4, 12);
        bullet.generateTexture('builder-bullet', 4, 12);
        bullet.destroy();

        const enemy = this.add.graphics();
        enemy.fillStyle(Phaser.Display.Color.HexStringToColor(${quote(config.hazardColor)}).color, 1);
        enemy.fillRoundedRect(0, 0, 28, 24, 6);
        enemy.fillStyle(0xffffff, 1);
        enemy.fillCircle(8, 10, 2);
        enemy.fillCircle(20, 10, 2);
        enemy.generateTexture('builder-enemy', 28, 24);
        enemy.destroy();

        this.player = this.physics.add.sprite(ARENA_WIDTH / 2, ARENA_HEIGHT - 44, 'builder-ship').setCollideWorldBounds(true);
        this.bullets = this.physics.add.group({ maxSize: 20 });
        this.enemies = this.physics.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.physics.add.overlap(this.bullets, this.enemies, (roundBullet, roundEnemy) => {
          if (this.ended) return;
          roundBullet.destroy();
          roundEnemy.destroy();
          this.score += 1;
          this.scoreText.setText('Score: ' + this.score + ' / ' + GOAL_SCORE);
          if (this.score >= GOAL_SCORE) {
            this.finishRound(true, 'You cleared the drone wave.');
          }
        });

        this.physics.add.overlap(this.player, this.enemies, (_, roundEnemy) => {
          if (this.ended) return;
          roundEnemy.destroy();
          this.damagePlayer();
        });

        this.spawnEnemy = () => {
          if (this.ended || this.enemies.countActive(true) >= MAX_ENEMIES) return;
          const roundEnemy = this.enemies.create(
            Phaser.Math.Between(32, ARENA_WIDTH - 32),
            Phaser.Math.Between(-120, -24),
            'builder-enemy'
          );
          roundEnemy.body.setVelocityY(Phaser.Math.Between(110, 180));
          roundEnemy.body.setVelocityX(Phaser.Math.Between(-20, 20));
        };

        this.damagePlayer = () => {
          this.lives -= 1;
          this.livesText.setText('Lives: ' + this.lives);
          this.cameras.main.flash(180, 255, 120, 120);
          if (this.lives <= 0) {
            this.finishRound(false, 'Your ship ran out of hull strength.');
          }
        };

        this.finishRound = (won, message) => {
          this.ended = true;
          this.player.body.setVelocity(0, 0);
          this.enemies.children.each((roundEnemy) => roundEnemy.body.setVelocity(0, 0));
          this.add.rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, 360, 136, 0x020617, 0.82)
            .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(won ? ${quote(config.accentColor)} : ${quote(config.hazardColor)}).color, 0.9);
          this.add.text(ARENA_WIDTH / 2, ARENA_HEIGHT / 2 - 20, won ? 'Sector secure' : 'Mission failed', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '30px',
            color: won ? ${quote(config.accentColor)} : ${quote(config.hazardColor)},
          }).setOrigin(0.5);
          this.add.text(ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 22, message, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 300 },
          }).setOrigin(0.5);
        };

        this.time.addEvent({ delay: 850, loop: true, callback: () => this.spawnEnemy() });
        this.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
            if (this.ended) return;
            this.timeLeft -= 1;
            this.timerText.setText('Timer: ' + this.timeLeft);
            if (this.timeLeft <= 0) {
              this.finishRound(this.score >= GOAL_SCORE, this.score >= GOAL_SCORE ? 'Mission complete.' : 'Time ran out before the drone wave cleared.');
            }
          },
        });
      },
      update: function (time) {
        if (this.ended) return;

        if (this.cursors.left.isDown) this.player.setVelocityX(-PLAYER_SPEED);
        else if (this.cursors.right.isDown) this.player.setVelocityX(PLAYER_SPEED);
        else this.player.setVelocityX(0);

        if (Phaser.Input.Keyboard.JustDown(this.fireKey) || (this.fireKey.isDown && time > this.lastShotAt + 180)) {
          const roundBullet = this.bullets.create(this.player.x, this.player.y - 20, 'builder-bullet');
          if (roundBullet) {
            roundBullet.body.setVelocityY(-420);
            this.lastShotAt = time;
          }
        }

        this.bullets.children.each((roundBullet) => {
          if (roundBullet.active && roundBullet.y < -20) {
            roundBullet.destroy();
          }
        });

        this.enemies.children.each((roundEnemy) => {
          if (roundEnemy.active && roundEnemy.y > ARENA_HEIGHT + 30) {
            roundEnemy.destroy();
            this.damagePlayer();
          }
        });
      },
    },
  };
});
`.trim();
}

export function buildGameBuilderCode(input: GameBuilderConfig) {
  const config = normalizeGameBuilderConfig(input);
  if (config.preset === 'dodger') return buildDodgerCode(config);
  if (config.preset === 'shooter') return buildShooterCode(config);
  return buildCollectorCode(config);
}

export function createGameBuilderProject(input: GameBuilderConfig) {
  const config = normalizeGameBuilderConfig(input);
  const preset = getGameBuilderPreset(config.preset);

  return {
    title: config.title,
    description: config.objective,
    tags: preset.tags.join(', '),
    templateId: `builder-${config.preset}`,
    code: buildGameBuilderCode(config),
    config,
    preset,
  };
}
