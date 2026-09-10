import { applyCodeSections, type GameCodeBlockSection } from '@/lib/game-code-blocks';

export interface GameDirectorSystem {
  id: string;
  title: string;
  description: string;
  lane: 'Flow' | 'Combat' | 'Reward' | 'Polish';
  sections: GameCodeBlockSection[];
}

export const GAME_DIRECTOR_SYSTEMS: GameDirectorSystem[] = [
  {
    id: 'mission-briefing',
    title: 'Mission Briefing',
    description: 'Opens the level with a cinematic objective banner, then fades it away like a premium release.',
    lane: 'Flow',
    sections: [
      {
        target: 'create',
        snippet: `const introText = this.add.text(360, 120, 'MISSION: ' + (TITLE || 'SURVIVE'), {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '28px',
  color: '#ffffff',
  align: 'center',
}).setOrigin(0.5);
const introPanel = this.add.rectangle(360, 120, 420, 74, 0x020617, 0.75)
  .setStrokeStyle(2, 0x33d6ff, 0.9);
this.children.bringToTop(introText);
this.tweens.add({
  targets: [introText, introPanel],
  alpha: { from: 0, to: 1 },
  duration: 280,
  yoyo: false,
});
this.time.delayedCall(2200, () => {
  this.tweens.add({
    targets: [introText, introPanel],
    alpha: 0,
    y: '-=16',
    duration: 420,
    onComplete: () => {
      introText.destroy();
      introPanel.destroy();
    },
  });
});`,
      },
    ],
  },
  {
    id: 'combo-chain',
    title: 'Combo Chain',
    description: 'Rewards quick consecutive actions with a combo counter to make scoring more exciting.',
    lane: 'Reward',
    sections: [
      {
        target: 'global',
        snippet: `function robotixRegisterCombo(scene) {
  scene.combo = (scene.combo ?? 0) + 1;
  scene.comboExpiresAt = scene.time.now + 1800;
  if (scene.comboText) {
    scene.comboText.setText('Combo x' + scene.combo);
    scene.comboText.setAlpha(1);
  }
}`,
      },
      {
        target: 'create',
        snippet: `this.combo = 0;
this.comboExpiresAt = 0;
this.comboText = this.add.text(24, 118, 'Combo x0', {
  fontFamily: 'monospace',
  fontSize: '18px',
  color: '#f4b400',
}).setAlpha(0.7);`,
      },
      {
        target: 'update',
        snippet: `if (this.comboText && this.time.now > (this.comboExpiresAt ?? 0) && (this.combo ?? 0) > 0) {
  this.combo = 0;
  this.comboText.setText('Combo x0');
  this.comboText.setAlpha(0.45);
}`,
      },
    ],
  },
  {
    id: 'danger-wave',
    title: 'Danger Wave',
    description: 'Adds an escalating wave alert and camera pulse so the match feels more dramatic over time.',
    lane: 'Combat',
    sections: [
      {
        target: 'create',
        snippet: `this.waveLevel = 1;
this.waveLabel = this.add.text(560, 90, 'Wave 1', {
  fontFamily: 'monospace',
  fontSize: '18px',
  color: '#fb7185',
});
this.time.addEvent({
  delay: 9000,
  loop: true,
  callback: () => {
    this.waveLevel += 1;
    this.waveLabel?.setText('Wave ' + this.waveLevel);
    this.cameras.main.flash(180, 255, 110, 110);
  },
});`,
      },
    ],
  },
  {
    id: 'reward-drop',
    title: 'Reward Drop',
    description: 'Spawns surprise bonus pickups over time so the world feels more dynamic and rewarding.',
    lane: 'Reward',
    sections: [
      {
        target: 'create',
        snippet: `this.time.addEvent({
  delay: 6500,
  loop: true,
  callback: () => {
    if (!this.pickups?.add || !this.physics?.add) return;
    const reward = this.add.circle(
      Phaser.Math.Between(80, 640),
      Phaser.Math.Between(120, 460),
      10,
      0xffffff
    );
    this.physics.add.existing(reward);
    reward.body.setImmovable(true);
    reward.body.setAllowGravity(false);
    this.pickups.add(reward);
  },
});`,
      },
    ],
  },
  {
    id: 'cinematic-finish',
    title: 'Cinematic Finish',
    description: 'Adds a stronger end-of-round camera and victory presentation so the finale feels memorable.',
    lane: 'Polish',
    sections: [
      {
        target: 'create',
        snippet: `this.robotixCelebrate = (headline, subline, color = '#33d6ff') => {
  this.cameras.main.flash(260, 255, 255, 255);
  this.cameras.main.zoomTo(1.04, 260);
  const panel = this.add.rectangle(360, 270, 380, 152, 0x020617, 0.84)
    .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.9);
  const titleText = this.add.text(360, 246, headline, {
    fontFamily: 'system-ui, sans-serif',
    fontSize: '32px',
    color,
    align: 'center',
  }).setOrigin(0.5);
  const detailText = this.add.text(360, 294, subline, {
    fontFamily: 'system-ui, sans-serif',
    fontSize: '16px',
    color: '#ffffff',
    align: 'center',
    wordWrap: { width: 300 },
  }).setOrigin(0.5);
  this.time.delayedCall(3000, () => {
    panel.destroy();
    titleText.destroy();
    detailText.destroy();
  });
};`,
      },
    ],
  },
];

export function applyDirectorSystem(code: string, system: GameDirectorSystem) {
  return applyCodeSections(code, `director-${system.id}`, system.sections);
}
