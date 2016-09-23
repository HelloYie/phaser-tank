/**
 * @summary
 *  血条
 */
import _ from 'underscore';

export default class HealthBar {
  constructor(game, providedConfig) {
    this.game = game;

    this.setupConfiguration(providedConfig);
    this.setPosition(this.config.x, this.config.y);
    this.drawBackground();
    this.drawHealthBar();
    this.bgSprite.addChild(this.barSprite);
    this.setFixedToCamera(this.config.isFixedToCamera);
  }

  setupConfiguration(providedConfig) {
    const defaultConfig = {
      width: 250,
      height: 40,
      x: 0,
      y: 0,
      bg: {
        color: '#333',
      },
      bar: {
        color: '#f00',
      },
      animationDuration: 200,
      flipped: false,
      isFixedToCamera: false,
    };
    this.config = _.extend({}, defaultConfig, providedConfig);
    this.flipped = this.config.flipped;
  }

  drawBackground() {
    const bmd = this.game.add.bitmapData(this.config.width, this.config.height);
    bmd.ctx.fillStyle = this.config.bg.color;
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, this.config.width, this.config.height);
    bmd.ctx.fill();
    this.bgSprite = this.game.make.sprite(this.x, this.y, bmd);
    this.bgSprite.anchor.set(0.5);

    if (this.flipped) {
      this.bgSprite.scale.x = -1;
    }
  }

  drawHealthBar() {
    const bmd = this.game.add.bitmapData(this.config.width, this.config.height);
    bmd.ctx.fillStyle = this.config.bar.color;
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, this.config.width, this.config.height);
    bmd.ctx.fill();

    this.barSprite = this.game.make.sprite((this.x - this.bgSprite.width) / 2, this.y, bmd);
    this.barSprite.anchor.set(0, 0.5);
    this.barSprite.x = -this.bgSprite.width / 2;
    this.barSprite.y = 0;

    if (this.flipped) {
      this.barSprite.scale.x = -1;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;

    if (this.bgSprite !== undefined && this.barSprite !== undefined) {
      this.bgSprite.position.x = x;
      this.bgSprite.position.y = y;
      // this.barSprite.position.x = (x - this.config.width) / 2;
    }
  }

  setPercent(newValue) {
    if (newValue < 0) newValue = 0;
    if (newValue > 100) newValue = 100;

    const newWidth = (newValue * this.config.width) / 100;

    this.setWidth(newWidth);
  }

  setWidth(newWidth) {
    if (this.flipped) {
      newWidth = -newWidth;
    }
    this.game.add.tween(this.barSprite).to({
      width: newWidth,
    }, this.config.animationDuration, Phaser.Easing.Linear.None, true);
  }

  setFixedToCamera(fixedToCamera) {
    this.bgSprite.fixedToCamera = fixedToCamera;
    this.barSprite.fixedToCamera = fixedToCamera;
  }

  kill() {
    this.bgSprite.destroy();
    this.barSprite.destroy();
  }
}
