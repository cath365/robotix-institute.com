/**
 * Default Phaser 3 starter for the Game Lab.
 * Students edit this in Monaco; the preview iframe loads Phaser from CDN and
 * expects a final `RobotixPhaser.start((Phaser) => config)` call.
 */
export const GAME_LAB_STARTER_CODE = `
RobotixPhaser.start((Phaser) => ({
  type: Phaser.AUTO,
  width: 640,
  height: 520,
  parent: 'game-root',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  backgroundColor: '#0B0638',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: {
    preload: function () {},
    create: function () {
      this.add.text(320, 40, 'Robotix Collect', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '26px',
        color: '#f4b400',
      }).setOrigin(0.5);

      this.player = this.add.circle(320, 260, 18, 0xf4b400);
      this.physics.add.existing(this.player);
      this.player.body.setCollideWorldBounds(true);

      this.star = this.add.circle(
        Phaser.Math.Between(80, 560),
        Phaser.Math.Between(120, 400),
        14,
        0xffffff
      );
      this.physics.add.existing(this.star);
      this.star.body.setImmovable(true);

      this.score = 0;
      this.scoreText = this.add.text(24, 24, 'Score: 0', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
      });

      this.cursors = this.input.keyboard.createCursorKeys();

      this.physics.add.overlap(this.player, this.star, () => {
        this.score += 1;
        this.scoreText.setText('Score: ' + this.score);
        this.star.setPosition(
          Phaser.Math.Between(80, 560),
          Phaser.Math.Between(120, 400)
        );
      });
    },
    update: function () {
      const speed = 220;
      this.player.body.setVelocity(0);
      if (this.cursors.left.isDown) this.player.body.setVelocityX(-speed);
      else if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);
      if (this.cursors.up.isDown) this.player.body.setVelocityY(-speed);
      else if (this.cursors.down.isDown) this.player.body.setVelocityY(speed);
    },
  },
}));
`.trim();
