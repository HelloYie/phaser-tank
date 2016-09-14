
/**
 * @summary:
 *   攻击类
 * @description:
 *
 */
export default class Attack {
  /**
   * game: Phaser.Game
   * key: 子弹图片名称
   */
  constructor(game, player, key, explosion, socket) {
    this.game = game;
    this.player = player;
    this.key = key;
    this.explosion = explosion;
    this.socket = socket;
    this.init();
  }

  init() {
    // 初始化子弹数据
    this.weapon = this.game.add.weapon(5, this.key);
    this.bullets = this.weapon.bullets;
    this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.weapon.bulletAngleOffset = 90;
    this.weapon.bulletSpeed = 400;
    this.weapon.fireRate = 500;
    this.weapon.bulletAngleOffset = 0;
    this.weapon.trackSprite(this.player, 50, 0, true);

    // 攻击按钮
    this.attackBtn = this.game.add.sprite(this.game.width - 200, this.game.height - 200, 'attack');
    this.attackBtn.anchor.x = 0;
    this.attackBtn.anchor.y = 0;
    this.attackBtn.inputEnabled = true;
    this.attackBtn.events.onInputDown.add(this.attack, this);
    return this;
  }

  // 攻击
  attack() {
    if (this.player.alive) {
      this.weapon.fire();
      this.socket.emit('shot');
    }
    return this;
  }

 // 捕获攻击
  hitHandler(gamer, bullet) {
    const bulletOwner = bullet.data.bulletManager.trackedSprite;
    if (!bulletOwner.playerObj.isTeammates(gamer.playerObj)) {
      this.explosion.boom(gamer);
      gamer.kill();
    }
    if (bulletOwner !== gamer) {
      bullet.kill();
    }
    return this;
  }
}
