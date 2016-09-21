/**
 * @summary
*   爆炸类
 * @description
 *  坦克被打死后引发
 */

export default class Explosion {
  constructor(game, key) {
    this.game = game;
    this.key = key;
    this.explosions = this.game.add.group();
    this.init();
  }

  init() {
    for (let i = 0; i < 10; i++) {
      const explosionAnimation = this.explosions.create(0, 0, this.key, [0], false);
      explosionAnimation.anchor.setTo(0.5, 0.5);
      explosionAnimation.animations.add('kaboom');
    }
    return this;
  }

  /**
   * @param x [Number] 爆炸的 x 坐标
   * @param y [Number] 爆炸的 y 坐标
   * @return Explosion
   */
  boom(player) {
    const explosionAnimation = this.explosions.getFirstExists(false);
    if (!player.boomed && explosionAnimation) {
      explosionAnimation.reset(player.x, player.y);
      explosionAnimation.play('kaboom', 30, false, true);
      player.boomed = true;
    }
    return this;
  }
}
