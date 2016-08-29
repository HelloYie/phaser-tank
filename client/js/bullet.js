
/**
 * @summary:
 *   子弹类
 * @description:
 *
 */
export default class Bullets {
  /**
   * game: Phaser.Game
   * imgName: 子弹图片名称
   *
   */
  constructor(game, imgName) {
    this.game = game;
    this.imgName = imgName;
  }

  init() {
    // 初始化子弹数据
    this.weapon = this.game.add.weapon(5, this.imgName);
    this.bullets = this.weapon.bullets;
    //  The bullet will be automatically killed when it leaves the world bounds
    this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    //  Because our bullet is drawn facing up, we need to offset its rotation:
    this.weapon.bulletAngleOffset = 90;
    //  The speed at which the bullet is fired
    this.weapon.bulletSpeed = 400;
    //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    this.weapon.fireRate = 500;
    return this;
  }
}