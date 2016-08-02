/**
 * 定义远程玩家
 * @return class RemotePlayer
 *
 */


export default class RemotePlayer {
  constructor(index, game, player, startX, startY) {
    const x = startX;
    const y = startY;
    this.game = game;
    this.health = 3;
    this.player = player;
    this.alive = true;
    this.player = game.add.sprite(x, y, 'enemy');
    this.player.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
    this.player.animations.add('stop', [3], 20, true);
    this.player.anchor.setTo(0.5, 0.5);
    this.player.name = index.toString();
    game.physics.enable(this.player, Phaser.Physics.ARCADE); /* eslint no-undef:0 */
    this.player.body.immovable = true;
    this.player.body.collideWorldBounds = true;
    this.player.angle = game.rnd.angle();
    this.lastPosition = {
      x,
      y,
    };
  }

  update() {
    if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
      this.player.play('move');
      this.player.rotation = Math.PI + this.game.physics.arcade.angleToXY(this.player, this.lastPosition.x, this.lastPosition.y);
    } else {
      this.player.play('stop');
    }
    this.lastPosition.x = this.player.x;
    this.lastPosition.y = this.player.y;
  }
}
