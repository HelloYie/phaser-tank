/*
 * 游戏主入口
 */

import $ from 'jquery';

import Player from './player';
import Attack from './attack';
import { names } from './constant';
import Explosion from './explosion';
import tanksJson from '../assets/tank/tanks.json';

import tankPng from '../assets/tank/tanks.png';
import enemyPng from '../assets/tank/enemy-tanks.png';
import bulletPng from '../assets/tank/bullet.png';
import earthPng from '../assets/tank/scorched_earth.png';
import compassRosePng from '../assets/tank/compass_rose.png';
import touchSegmentPng from '../assets/tank/touch_segment.png';
import touchPng from '../assets/tank/touch.png';
import attackPng from '../assets/tank/attack.png';
import explosionPng from '../assets/tank/explosion.png';

class TankGame {
  constructor() {
    const self = this;
    $('.room_container').remove();
    self.game = new Phaser.Game(
      '100',
      '100',
      Phaser.AUTO,
      '',
      {
        preload: self.preload.bind(self),
        create: self.create.bind(self),
        update: self.update.bind(self),
        render: self.render.bind(self),
      }
    );
    self.room = window.room;
  }

  preload() {
    this.game.load.image('bullet', bulletPng);
    this.game.load.image('earth', earthPng);
    this.game.load.image('compass', compassRosePng);
    this.game.load.image('touch_segment', touchSegmentPng);
    this.game.load.image('touch', touchPng);
    this.game.load.image('attack', attackPng);
    this.game.load.atlas('tank', tankPng, null, tanksJson);
    this.game.load.atlas('enemy', enemyPng, null, tanksJson);
    this.game.load.spritesheet('kaboom', explosionPng, 64, 64, 23);
  }

  create() {
    // 初始化游戏设置
    const self = this;
    self.game.world.setBounds(0, 0, 2000, 2000);
    self.game.camera.unfollow();
    self.game.camera.deadzone = new Phaser.Rectangle(
      self.game.width / 3,
      self.game.height / 3,
      self.game.width / 3,
      self.game.height / 3
    );
    self.game.camera.focusOnXY(0, 0);
    self.game.physics.startSystem(Phaser.Physics.ARCADE);
    self.game.input.justPressedRate = 30;

    // 初始化陆地
    self.land = self.game.add.tileSprite(0, 0, self.game.width, self.game.height, 'earth');
    self.land.fixedToCamera = true;

    // 初始化玩家
    const name = names[Math.floor(Math.random() * names.length)];
    self.player = new Player(self.game, name, 'red', 'tank', self.room.socket);
    self.room.socket.emit(
      'new player',
      {
        id: self.room.socket.id,
        x: self.player.startX,
        y: self.player.startY,
        name: self.player.name,
        camp: self.player.camp,
      }
    );
    self.sPlayer = self.player.sPlayer;
    self.sPlayer.bringToTop();

    // 初始化爆炸类
    self.explosion = new Explosion(self.game, 'kaboom');

    // 初始化子弹
    self.attack = new Attack(self.game, self.sPlayer, 'bullet', self.explosion, self.room.socket);
    self.bullets = self.attack.bullets;
    self.room.sEvent.initGame(self.game, self.player);
  }

  update() {
    const self = this;
    self.game.physics.arcade.overlap(
      self.player.playerGroup,
      self.bullets,
      self.attack.hitHandler,
      null,
      self
    );
    Object.keys(self.room.sEvent.gamers).forEach((gamerId) => {
      const gamerObj = self.room.sEvent.gamers[gamerId];
      if (gamerObj.player.alive) {
        gamerObj.update();
        self.game.physics.arcade.overlap(
          self.player.playerGroup,
          gamerObj.bullets,
          self.attack.hitHandler,
          null,
          self
        );
      } else {
        self.explosion.boom(gamerObj.player);
        gamerObj.player.kill();
      }
    });
    self.game.physics.arcade.collide(self.sPlayer, self.player.playerGroup);
    self.player.move();
  }

  render() {
  }
}
export default TankGame;
