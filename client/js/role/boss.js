/**
 * 每个阵营有一个 boss
 */

export default class Boss {
  constructor(game, key, camp, x, y, explosion, socket) {
    this.game = game;
    this.camp = String(camp);
    this.key = key;
    this.x = x || this.game.world.centerX;
    this.y = y;
    this.explosion = explosion;
    this.socket = socket;
    this.group = this.game.add.group(this.game.world, 'boss group');
    this.init();
  }

  init() {
    this.sBoss = this.game.add.sprite(this.x, this.y, this.key);
    this.game.physics.enable(this.sBoss, Phaser.Physics.ARCADE);
    this.sBoss.anchor.setTo(0.5, 0.5);
    this.sBoss.body.immovable = true;
    this.sBoss.width = 40;
    this.sBoss.height = 20;
    this.sBoss.boss = this;
    this.group.add(this.sBoss);
  }

  checkCollideOverlap(sPlayer, bossGroupList, weaponsGroupList) {
    const self = this;
    self.game.physics.arcade.collide(sPlayer, bossGroupList);
    self.game.physics.arcade.collide(
      bossGroupList,
      weaponsGroupList,
      (sBoss, sBullet) => {
        sBullet.kill();
        const bulletOwner = sBullet.bullet.owner;
        if (sBoss.boss.camp !== bulletOwner.camp) {
          self.explosion.boom(sBoss, 'kaboom');
          sBoss.destroy();
          self.socket.emit('kill boss', {
            camp: sBoss.boss.camp,
          });
        }
      },
      null,
      self
    );
    return self;
  }
}
