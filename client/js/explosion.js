/**
 * @summary
*   爆炸类
 * @description
 *  坦克被打死后引发
 */

export default class Explosion {
  constructor(game) {
    this.game = game;
  }

  /**
   * @param x [Number] 爆炸的 x 坐标
   * @param y [Number] 爆炸的 y 坐标
   * @return Explosion
   */
  boom(player, key) {
    const explosionAni = this.game.add.sprite(0, 0, key);
    explosionAni.anchor.setTo(0.5, 0.5);
    self.ani = explosionAni.animations.add('kaboom');
    explosionAni.reset(player.x, player.y);
    explosionAni.play('kaboom', 20, false, true);
    return this;
  }
}
