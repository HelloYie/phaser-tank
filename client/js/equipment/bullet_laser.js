/**
 * @summary
 *   装备类
 * @description
 *   激光弹，可以穿透岩石，终极杀人武器
 */

export default class BulletLaser {
  constructor(game) {
    this.game = game;
    this.shapeSprite = this.game.add.sprite(0, 0);
    this.graphics = game.add.graphics(this.game.world.centerX, 0);
    this.graphics.beginFill(0xCC66FF);
    this.graphics.drawRect(0, 0, 10, 600);
    this.graphics.alpha = 0;
    this.x = this.graphics.x;
    this.graphics.endFill();
    this.graphics.moveTo(0, 0);
    this.graphics.lineTo(0, 600);
    this.shapeSprite.addChild(this.graphics);
    this.game.world.bringToTop(this.shapeSprite);
  }
  shot() {
    this.graphics.alpha = 1;
    this.graphics.width = 10;
    this.graphics.x = this.x - 5;
    this.game.add.tween(this.graphics)
    .to({
      width: 0,
      x: this.x,
    }, 600)
    .start();
  }
}
