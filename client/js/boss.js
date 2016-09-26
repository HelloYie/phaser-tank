/**
 * 每个阵营有一个 boss
 */

export default class Boss {
  constructor(game, key, camp, x, y, explosion, socket) {
    this.game = game;
    this.camp = camp;
    this.key = key;
    this.x = x || this.game.world.centerX;
    this.y = y;
    this.explosion = explosion;
    this.socket = socket;
    this.group = this.game.add.group();
    this.init();
  }

  init() {
    this.sBoss = this.game.add.sprite(this.x, this.y, this.key);
    this.game.physics.enable(this.sBoss, Phaser.Physics.ARCADE);
    this.sBoss.anchor.setTo(0.5, 0.5);
    this.sBoss.body.immovable = true;
    this.sBoss.width = 80;
    this.sBoss.height = 40;
    this.group.add(this.sBoss);
  }

  checkCollide(sPlayer) {
    const self = this;
    self.game.physics.arcade.collide(sPlayer, self.sBoss);
    self.game.physics.arcade.overlap(
      self.group,
      sPlayer.player.bullets,
      (sprite, bullet) => {
        bullet.kill();
        // self.sBoss.destroy();
        // self.explosion.boom(sprite, 'kaboom');
        self.socket.emit('kill boss', {
          camp: self.camp,
        });
      },
      null,
      self
    );
    return self;
  }
}
