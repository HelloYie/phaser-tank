/*
 * 游戏主入口
 */

import $ from 'jquery';

import Map from './map';
import Player from './player';
import Attack from './attack';
import TouchControl from './touch_control';
import Explosion from './explosion';
import tanksJson from '../assets/tank/tanks.json';
import tileMapJson from '../assets/tank/map.json';

import tankPng from '../assets/tank/tanks.png';
import enemyPng from '../assets/tank/enemy-tanks.png';
import bulletPng from '../assets/tank/bullet.png';
import earthPng from '../assets/tank/scorched_earth.png';
import compassRosePng from '../assets/tank/compass_rose.png';
import touchSegmentPng from '../assets/tank/touch_segment.png';
import touchPng from '../assets/tank/touch.png';
import attackPng from '../assets/tank/attack.png';
import explosionPng from '../assets/tank/explosion.png';
import stonePng from '../assets/tank/stone.png';
import brickPng from '../assets/tank/brick.png';
import grossPng from '../assets/tank/gross.png';

class TankGame {
  constructor(camp) {
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
    self.camp = camp;
  }

  preload() {
    this.game.load.image('bullet', bulletPng);
    this.game.load.image('earth', earthPng);
    this.game.load.image('compass', compassRosePng);
    this.game.load.image('touch_segment', touchSegmentPng);
    this.game.load.image('touch', touchPng);
    this.game.load.image('attack', attackPng);
    this.game.load.image('stone', stonePng);
    this.game.load.image('brick', brickPng);
    this.game.load.image('gross', grossPng);
    this.game.load.image('gross', grossPng);
    this.game.load.atlas('tank', tankPng, null, tanksJson);
    this.game.load.atlas('enemy', enemyPng, null, tanksJson);
    this.game.load.spritesheet('kaboom', explosionPng, 64, 64, 23);
    this.game.load.tilemap('map', null, tileMapJson, Phaser.Tilemap.TILED_JSON);
  }

  create() {
    // 初始化游戏设置
    const self = this;
    self.game.world.setBounds(0, 0, 1200, 900);
    // self.game.camera.deadzone = new Phaser.Rectangle(
    //   self.game.width / 3,
    //   self.game.height / 3,
    //   self.game.width / 3,
    //   self.game.height / 3
    // );
    self.game.camera.focusOnXY(0, 0);
    self.game.physics.startSystem(Phaser.Physics.ARCADE);
    self.game.input.justPressedRate = 30;

    // 初始化地图
    self.land = new Map(self.game, 'earth');

    // 初始化玩家
    self.player = new Player(self.game, self.room.name, self.camp, 'tank', self.land, self.room.socket);
    self.room.socket.emit(
      'new player',
      {
        x: self.player.startX,
        y: self.player.startY,
        name: self.player.name,
        avatar: self.room.avatar,
        camp: self.player.camp,
      }
    );
    self.sPlayer = self.player.sPlayer;
    self.sPlayer.bringToTop();
    self.game.camera.follow(self.sPlayer);

    // 初始化触摸移动类
    self.touchControl = new TouchControl(this.game, this).touchControl;

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
    self.land.checkCollide(self.sPlayer);
    self.player.move(self.touchControl);
  }

  render() {
  }
}
export default TankGame;
