/**
 * @summary
 *  远程玩家类：定义远程玩家
 * @return class RemotePlayer
 *
 */

export default class RemotePlayer {

  /**
   * @param id [String] 玩家id
   */
  constructor(id, game, startX, startY, name, camp) {
    const x = startX;
    const y = startY;
    this.game = game;
    this.name = name;
    this.health = 3;
    this.camp = camp;  // 阵营
    this.id = id;
    this.weapon = game.add.weapon(30, 'bullet');
    this.alive = true;

    this.player = game.add.sprite(x, y, 'enemy', 'tank1');
    this.player.addChild(game.add.sprite(-15, -15, 'enemy', 'turret'));
    this.player.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.immovable = true;
    this.player.body.collideWorldBounds = true;
    // this.player.angle = game.rnd.angle();
    this.lastPosition = {
      x,
      y,
      angle: this.player.angle,
    };
    this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.weapon.bulletAngleOffset = 90;
    this.weapon.bulletSpeed = 400;
    this.weapon.fireRate = 500;
    this.weapon.bulletAngleOffset = 0;
    this.weapon.trackSprite(this.player, 50, 0, true);
    this.bullets = this.weapon.bullets;

    const playerName = this.game.add.text(
      -30,
      -23,
      this.name,
      {
        font: '6mm',
      });
    playerName.angle = 90;
    playerName.fill = 'blue';
    this.player.addChild(playerName);
    this.player.playerObj = this;
  }

  update() {
    // 更新精灵状态
    if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y || this.player.angle !== this.lastPosition.angle) {
      this.player.animations.play('move');
    } else {
      this.player.animations.play('stop');
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
