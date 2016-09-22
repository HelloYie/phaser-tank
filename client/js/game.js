/*
 * 游戏主入口
 */

import $ from 'jquery';
import _ from 'underscore';

import Map from './map';
import Player from './player';
import TouchControl from './touch_control';
import tileMapJson from '../assets/tank/map.json';

import tankPng from '../assets/tank/tank-1.png';
import enemyPng from '../assets/tank/tank-2.png';
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
  constructor(camp, room, callback) {
    const self = this;
    $('.room_container').remove();
    self.room = room;
    self.camp = camp;
    self.game = new Phaser.Game(
      '100',
      '100',
      Phaser.AUTO,
      '',
      {
        preload: self.preload.bind(self),
        create() {
          self.create(self);
          callback(self);
        },
        update: self.update.bind(self),
        render: self.render.bind(self),
      }
    );
  }

  preload() {
    const self = this;
    self.game.load.image('bullet', bulletPng);
    self.game.load.image('earth', earthPng);
    self.game.load.image('compass', compassRosePng);
    self.game.load.image('touch_segment', touchSegmentPng);
    self.game.load.image('touch', touchPng);
    self.game.load.image('attack', attackPng);
    self.game.load.image('stone', stonePng);
    self.game.load.image('brick', brickPng);
    self.game.load.image('gross', grossPng);
    self.game.load.image('gross', grossPng);
    self.game.load.spritesheet('tank', tankPng, 35, 28, 1);
    self.game.load.spritesheet('enemy', enemyPng, 35, 28, 1);
    self.game.load.spritesheet('kaboom', explosionPng, 64, 64, 23);
    self.game.load.tilemap('map', null, tileMapJson, Phaser.Tilemap.TILED_JSON);
  }

  create() {
    // 初始化游戏设置
    const self = this;
    self.game.world.setBounds(0, 0, 1200, 900);
    self.game.camera.focusOnXY(0, 0);
    self.game.physics.startSystem(Phaser.Physics.ARCADE);
    self.game.input.justPressedRate = 30;

    // 初始化地图
    self.map = new Map(self.game, 'earth');

    // 初始化玩家
    self.player = new Player(
      self.room.socket.id,
      self.game,
      'tank',
      self.room.name,
      self.room.sex,
      self.camp,
      '',
      Math.round((Math.random() * 1000) - 500),
      Math.round((Math.random() * 1000) - 500),
      'bullet',
      self.room.socket
    );
    self.room.socket.emit(
      'new player',
      {
        x: self.player.startX,
        y: self.player.startY,
        name: self.player.name,
        avatar: self.room.avatar,
        camp: self.player.camp,
        sex: self.player.sex,
      }
    );
    self.sPlayer = self.player.sPlayer;
    self.sPlayer.bringToTop();
    self.game.camera.follow(self.sPlayer);

    // 初始化触摸移动类
    self.touchControl = new TouchControl(this.game, this).touchControl;

    self.room.sEvent.initGame(self.game, self.player);
  }

  update() {
    const self = this;
    // 告诉服务器谁死了，并且子弹立即消失.
    const hitHandler = (gamer, bullet) => {
      console.info(gamer, bullet);
      bullet.kill();
      self.room.socket.emit('kill player', {
        id: gamer.player.id,
        health: gamer.player.health,
      });
    };
    _.each(self.room.sEvent.gamers, (gamer, k) => {
      // 检测子弹是否打到玩家.
      _.each(self.room.sEvent.gamers, (oGamer, oKey) => {
        if (k !== oKey) {
          self.game.physics.arcade.overlap(
            gamer.group,
            oGamer.bullets,
            hitHandler,
            null,
            self
          );
          self.game.physics.arcade.collide(gamer.sPlayer, oGamer.sPlayer);
        }
      });
    });
    self.map.checkCollide(self.sPlayer);
    self.player.move(self.touchControl);
  }

  render() {
  }
}
export default TankGame;
