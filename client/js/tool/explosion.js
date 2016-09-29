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
   * @param sprit [Sprite] 爆炸精灵
   * @param key [String] 爆炸 key
   * @return Explosion
   */
  boom(sprite, key) {
    const explosionAni = this.game.add.sprite(0, 0, key);
    explosionAni.anchor.setTo(0.5, 0.5);
    explosionAni.animations.add('kaboom');
    explosionAni.reset(sprite.centerX, sprite.centerY);
    explosionAni.play('kaboom', 20, false, true);
    return this;
  }
}
