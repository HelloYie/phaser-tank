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

  setGroup(name) {
    this.group = this.game.add.group(this.game.world, name);
  }

  /**
   * @param sprit [Sprite] 爆炸精灵
   * @param key [String] 爆炸 key
   * @return Explosion
   */
  boom(sprite, key) {
    let explosion = _.filter(this.group.children, (exp) => exp.key === key)[0];
    if (!explosion) {
      explosion = this.game.add.sprite(0, 0, key);
      explosion.anchor.setTo(0.5, 0.5);
      const animation = explosion.animations.add('kaboom');
      animation.killOnComplete = true;
      this.group.add(explosion);
    }
    explosion.revive();
    explosion.reset(sprite.centerX, sprite.centerY);
    explosion.animations.play('kaboom', 20, false, true);
    return this;
  }
}
