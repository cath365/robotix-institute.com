/**
 * Built-in Phaser 3 starter templates for the Game Lab.
 *
 * Each template is a complete, self-contained Phaser game written as plain
 * JavaScript. The Game Lab editor inserts the user's selected template into
 * Monaco and the PhaserRunner iframe evaluates it with `Phaser` injected as
 * a global. Templates are intentionally beginner-friendly: no imports, no
 * bundling, no external assets — just `new Phaser.Game(...)`.
 */

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  emoji: string;
  code: string;
}

const PONG = `// Pong — classic two-paddle game
// Player: W/S keys. AI controls the right paddle.

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 480,
  parent: 'game-root',
  backgroundColor: '#0B0638',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: { preload, create, update },
};

let leftPaddle, rightPaddle, ball, scoreText, score = { l: 0, r: 0 };
let cursors, wasd;

new Phaser.Game(config);

function preload() {}

function create() {
  // Center line
  const line = this.add.graphics();
  line.lineStyle(2, 0x2B1EA3, 0.6);
  for (let y = 0; y < 480; y += 18) line.lineBetween(400, y, 400, y + 8);

  // Paddles
  leftPaddle = this.add.rectangle(30, 240, 14, 90, 0xF4B400);
  rightPaddle = this.add.rectangle(770, 240, 14, 90, 0xFFFFFF);
  this.physics.add.existing(leftPaddle);
  this.physics.add.existing(rightPaddle);
  leftPaddle.body.setImmovable(true).setCollideWorldBounds(true);
  rightPaddle.body.setImmovable(true).setCollideWorldBounds(true);

  // Ball
  ball = this.add.circle(400, 240, 8, 0xF4B400);
  this.physics.add.existing(ball);
  ball.body.setBounce(1, 1).setCollideWorldBounds(true).setVelocity(220, 180);

  this.physics.add.collider(ball, leftPaddle, hit);
  this.physics.add.collider(ball, rightPaddle, hit);

  // Score
  scoreText = this.add.text(400, 30, '0  :  0', {
    fontFamily: 'monospace', fontSize: '28px', color: '#ffffff',
  }).setOrigin(0.5);

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,S');
}

function hit(b) {
  b.body.setVelocityX(b.body.velocity.x * 1.05);
}

function update() {
  const speed = 320;
  // Player (left)
  if (wasd.W.isDown) leftPaddle.body.setVelocityY(-speed);
  else if (wasd.S.isDown) leftPaddle.body.setVelocityY(speed);
  else leftPaddle.body.setVelocityY(0);

  // AI (right) — eases toward ball Y
  const target = ball.y;
  const diff = target - rightPaddle.y;
  rightPaddle.body.setVelocityY(Phaser.Math.Clamp(diff * 6, -speed * 0.85, speed * 0.85));

  // Score: ball passed paddle
  if (ball.x < 0) { score.r++; reset(this); }
  else if (ball.x > 800) { score.l++; reset(this); }
  scoreText.setText(score.l + '  :  ' + score.r);
}

function reset(scene) {
  ball.setPosition(400, 240);
  ball.body.setVelocity(Phaser.Math.Between(0, 1) ? 220 : -220, Phaser.Math.Between(-180, 180));
}
`;

const SPACE_INVADER = `// Space Defender — shoot incoming aliens
// Move: ←/→  Shoot: SPACE

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-root',
  backgroundColor: '#0B0638',
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: { create, update },
};

let player, bullets, aliens, cursors, fireKey, scoreText, livesText;
let score = 0, lives = 3, lastShot = 0;

new Phaser.Game(config);

function create() {
  // Stars background
  for (let i = 0; i < 60; i++) {
    this.add.circle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600),
      Phaser.Math.Between(1, 2), 0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
  }

  // Player ship — drawn with graphics
  const g = this.add.graphics();
  g.fillStyle(0xF4B400, 1).fillTriangle(-15, 12, 15, 12, 0, -16);
  g.generateTexture('ship', 30, 30); g.destroy();
  player = this.physics.add.sprite(400, 540, 'ship').setCollideWorldBounds(true);

  // Bullet texture
  const b = this.add.graphics();
  b.fillStyle(0xffffff, 1).fillRect(0, 0, 4, 12);
  b.generateTexture('bullet', 4, 12); b.destroy();
  bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, defaultKey: 'bullet', maxSize: 30 });

  // Alien texture
  const a = this.add.graphics();
  a.fillStyle(0x2B1EA3, 1).fillCircle(14, 14, 14);
  a.fillStyle(0xF4B400, 1).fillCircle(8, 12, 3).fillCircle(20, 12, 3);
  a.generateTexture('alien', 28, 28); a.destroy();
  aliens = this.physics.add.group();
  spawnWave(this);

  this.physics.add.overlap(bullets, aliens, hitAlien, null, this);
  this.physics.add.overlap(player, aliens, hitPlayer, null, this);

  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  scoreText = this.add.text(20, 16, 'Score: 0', { fontFamily: 'monospace', fontSize: '20px', color: '#fff' });
  livesText = this.add.text(680, 16, 'Lives: 3', { fontFamily: 'monospace', fontSize: '20px', color: '#fff' });
}

function update(time) {
  if (!player.active) return;
  if (cursors.left.isDown) player.setVelocityX(-300);
  else if (cursors.right.isDown) player.setVelocityX(300);
  else player.setVelocityX(0);

  if (fireKey.isDown && time > lastShot + 250) {
    const b = bullets.get(player.x, player.y - 18);
    if (b) {
      b.setActive(true).setVisible(true).body.enable = true;
      b.body.setVelocityY(-460);
      lastShot = time;
    }
  }
  bullets.children.each((b) => { if (b.active && b.y < -20) b.destroy(); });

  // Slowly walk aliens down
  aliens.children.each((al) => { if (al.active) al.y += 0.15; if (al.y > 600) hitPlayer.call(this, player, al); });

  if (aliens.countActive() === 0) spawnWave(this);
}

function spawnWave(scene) {
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
    const al = scene.physics.add.image(80 + c * 80, 60 + r * 50, 'alien');
    aliens.add(al);
  }
}

function hitAlien(bullet, alien) {
  bullet.destroy(); alien.destroy();
  score += 10; scoreText.setText('Score: ' + score);
}

function hitPlayer(p, a) {
  if (a) a.destroy();
  lives--; livesText.setText('Lives: ' + lives);
  if (lives <= 0) {
    p.setActive(false).setVisible(false);
    this.add.text(400, 300, 'GAME OVER\\nFinal Score: ' + score,
      { fontFamily: 'monospace', fontSize: '32px', color: '#F4B400', align: 'center' }).setOrigin(0.5);
  }
}
`;

const PLATFORMER = `// Mini Platformer — collect coins, avoid the floor
// Move: ←/→   Jump: SPACE / ↑

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 480,
  parent: 'game-root',
  backgroundColor: '#1A0E6B',
  physics: { default: 'arcade', arcade: { gravity: { y: 600 } } },
  scene: { create, update },
};

let player, platforms, coins, cursors, jumpKey, scoreText, score = 0;

new Phaser.Game(config);

function create() {
  // Player texture
  const g = this.add.graphics();
  g.fillStyle(0xF4B400, 1).fillRoundedRect(0, 0, 28, 36, 6);
  g.fillStyle(0x0B0638, 1).fillCircle(8, 12, 3).fillCircle(20, 12, 3);
  g.generateTexture('hero', 28, 36); g.destroy();

  // Platform texture
  const p = this.add.graphics();
  p.fillStyle(0x2B1EA3, 1).fillRoundedRect(0, 0, 120, 18, 4);
  p.generateTexture('plat', 120, 18); p.destroy();

  // Coin
  const c = this.add.graphics();
  c.fillStyle(0xF4B400, 1).fillCircle(10, 10, 9);
  c.lineStyle(2, 0xD49A00, 1).strokeCircle(10, 10, 9);
  c.generateTexture('coin', 20, 20); c.destroy();

  platforms = this.physics.add.staticGroup();
  // Ground
  for (let x = 60; x < 800; x += 120) platforms.create(x, 460, 'plat');
  // Floating
  platforms.create(180, 360, 'plat');
  platforms.create(420, 290, 'plat');
  platforms.create(640, 220, 'plat');
  platforms.create(280, 160, 'plat');

  player = this.physics.add.sprite(60, 400, 'hero').setBounce(0.05).setCollideWorldBounds(true);
  this.physics.add.collider(player, platforms);

  coins = this.physics.add.group();
  [{x:180, y:330}, {x:420, y:260}, {x:640, y:190}, {x:280, y:130}, {x:760, y:430}].forEach(p => {
    const co = coins.create(p.x, p.y, 'coin'); co.body.setAllowGravity(false);
  });
  this.physics.add.overlap(player, coins, (pl, co) => {
    co.destroy(); score++; scoreText.setText('Coins: ' + score + ' / 5');
    if (score === 5) {
      this.add.text(400, 240, 'YOU WIN! 🎉', { fontFamily: 'monospace', fontSize: '40px', color: '#F4B400' }).setOrigin(0.5);
    }
  });

  cursors = this.input.keyboard.createCursorKeys();
  jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  scoreText = this.add.text(20, 16, 'Coins: 0 / 5', { fontFamily: 'monospace', fontSize: '20px', color: '#fff' });
}

function update() {
  const onGround = player.body.touching.down;
  if (cursors.left.isDown) player.setVelocityX(-220);
  else if (cursors.right.isDown) player.setVelocityX(220);
  else player.setVelocityX(0);
  if ((cursors.up.isDown || jumpKey.isDown) && onGround) player.setVelocityY(-380);
}
`;

const BLANK = `// Blank canvas — start your own Phaser game!
// Tip: hit Run to see your changes live.

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 480,
  parent: 'game-root',
  backgroundColor: '#0B0638',
  scene: { create, update },
};

new Phaser.Game(config);

function create() {
  this.add.text(400, 220, 'Hello, Robotix!', {
    fontFamily: 'monospace', fontSize: '40px', color: '#F4B400',
  }).setOrigin(0.5);
  this.add.text(400, 270, 'Edit the code on the left,', {
    fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
  }).setOrigin(0.5);
  this.add.text(400, 295, 'then press Run.', {
    fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
  }).setOrigin(0.5);
}

function update() {}
`;

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Empty game ready for you to fill in.',
    difficulty: 'beginner',
    emoji: '✨',
    code: BLANK,
  },
  {
    id: 'pong',
    name: 'Pong',
    description: 'Classic 2-paddle ball game with simple AI.',
    difficulty: 'beginner',
    emoji: '🏓',
    code: PONG,
  },
  {
    id: 'platformer',
    name: 'Coin Platformer',
    description: 'Run, jump, collect 5 coins to win.',
    difficulty: 'intermediate',
    emoji: '🪙',
    code: PLATFORMER,
  },
  {
    id: 'space',
    name: 'Space Defender',
    description: 'Shoot waves of aliens. Don\'t let them land!',
    difficulty: 'intermediate',
    emoji: '🚀',
    code: SPACE_INVADER,
  },
];

export function getTemplate(id: string): GameTemplate | undefined {
  return GAME_TEMPLATES.find((t) => t.id === id);
}
