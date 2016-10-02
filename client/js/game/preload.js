/*
 * 载入游戏资源
 */

import { images } from './images';


export default class Load {
  constructor(game) {
    this.game = game;
  }

  preload() {
    const [
      tankPng, enemyPng, bulletPng,
      earthPng, compassRosePng, touchSegmentPng,
      attackPng, touchPng, explosionPng,
      explosionBrickPng, stonePng, brickPng,
      grossPng, bossTopPng, bossBottomPng,
      eqBulletLaserPng, bulletLaserPng,
      eqBulletSprialPng, bulletSprialPng,
    ] = images;
    let gameRatio = window.innerWidth / window.innerHeight;
    this.game.load.image('bullet', bulletPng);
    this.game.load.image('bulletLaser', bulletLaserPng);
    this.game.load.image('bulletSprial', bulletSprialPng);
    this.game.load.image('earth', earthPng);
    this.game.load.image('compass', compassRosePng);
    this.game.load.image('touch_segment', touchSegmentPng);
    this.game.load.image('touch', touchPng);
    this.game.load.image('attack', attackPng);
    this.game.load.image('stone', stonePng);
    this.game.load.image('brick', brickPng);
    this.game.load.image('gross', grossPng);
    this.game.load.image('gross', grossPng);
    this.game.load.image('bossTop', bossTopPng);
    this.game.load.image('bossBottom', bossBottomPng);
    this.game.load.image('eqBulletLaser', eqBulletLaserPng);
    this.game.load.image('eqBulletSprial', eqBulletSprialPng);
    this.game.load.spritesheet('tank', tankPng, 35, 28, 1);
    this.game.load.spritesheet('enemy', enemyPng, 35, 28, 1);
    this.game.load.spritesheet('kaboom', explosionPng, 64, 64, 23);
    this.game.load.spritesheet('brickKaboom', explosionBrickPng, 24, 24, 7);
    this.game.load.onLoadStart.add(this.onLoadStart, this);
    this.game.load.onLoadComplete.add(this.onLoadComplete, this);
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.forceOrientation(false, true);
    this.game.scale.enterIncorrectOrientation.add(() => {
    });
    this.game.scale.leaveIncorrectOrientation.add(() => {
      gameRatio = window.innerWidth / window.innerHeight;
      this.game.width = Math.ceil(640 * gameRatio);
      this.game.height = 640;
      this.game.renderer.resize(this.game.width, this.game.height);
    });
  }

  create() {
    this.game.stage.backgroundColor = '#fff';
  }

  onLoadStart() {
  }

  onLoadComplete() {
    this.game.state.start('play');
  }
}
