/**
 * @summary
 *  远程玩家类：定义远程玩家
 * @return class RemotePlayer
 *
 */

export default class RemotePlayer {

  constructor(index, game, startX, startY, name, camp) {
    const x = startX;
    const y = startY;
    this.game = game;
    this.name = name;
    this.health = 3;
    this.camp = camp;  // 阵营
    this.weapon = game.add.weapon(30, 'knife1');
    this.alive = true;
    this.player = game.add.sprite(x, y, 'enemy');
    this.player.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
    this.player.animations.add('stop', [3], 20, true);
    this.player.anchor.setTo(0.5, 0.5);
    this.player.name = index.toString();
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE); /* eslint no-undef:0 */
    this.player.body.immovable = true;
    this.player.body.collideWorldBounds = true;
    this.player.angle = game.rnd.angle();
    this.player.manager = this;
    this.player.no_update_times = 1;
    this.lastPosition = {
      x,
      y,
      angle: this.player.angle,
    };
    this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.weapon.bulletAngleOffset = 90;
    this.weapon.bulletSpeed = 400;
    this.weapon.fireRate = 500;
    this.weapon.trackSprite(this.player, 0, 0, true);
    this.bullets = this.weapon.bullets;
    this.nameText = game.add.text(x - 25, y - this.player.height, this.name, { font: '6mm' });
    this.player.playerObj = this;
  }

  update() {
    // 更新精灵状态
    if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
      this.nameText.x = Math.floor(this.player.x - 25);
      this.nameText.y = Math.floor(this.player.y - this.player.height);
      this.player.no_update_times = 1;
    } else {
      // 未移动， 1s之后停止动画
      if (this.player.no_update_times % 60 === 0) {
        this.player.animations.play('stop');
        this.player.no_update_times = 1;
      }
      this.player.no_update_times += 1;
    }
    this.lastPosition.x = this.player.x;
    this.lastPosition.y = this.player.y;
    this.lastPosition.angle = this.player.angle;
  }

  isTeammates(playerObj) {
    // 判断是否是队友
    return this.camp === playerObj.camp;
  }
}
