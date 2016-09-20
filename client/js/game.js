/*
 * 游戏主入口
 */


import Map from './map';
import Player from './player';
import Attack from './attack';
import TouchControl from './touch_control';
import Explosion from './explosion';
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
  constructor(camp) {
    const self = this;
    $('.room_container').remove();
    self.game = new Phaser.Game(
      '100',
      '100',
      Phaser.AUTO,
      '',
      {
        preload() {
          self.preload(self);
        },
        create() {
          self.create(self);
        },
        update() {
          self.update(self);
        },
        render: self.render,
      }
    );
    self.room = window.room;
    self.camp = camp;
  }

  preload(self) {
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

  create(self) {
    // 初始化游戏设置
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
    self.player = new Player(
      self.room.socket.id,
      self.game,
      self.room.name_with_sex,
      self.camp,
      'tank',
      self.land,
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

  update(self) {
    const hitMeHandler = (gamer, bullet) => {
      gamer.kill();
      bullet.kill();
      self.explosion.boom(gamer);
      self.room.socket.emit('kill player');
    };
    const hitEnemyHandler = (gamer, bullet) => {
      const bulletOwner = bullet.data.bulletManager.trackedSprite;
      // 如果不是队友，击毙
      if (!bulletOwner.playerObj.isTeammates(gamer.playerObj)) {
        self.explosion.boom(gamer);
        gamer.kill();
      }
      if (bulletOwner !== gamer) {
        bullet.kill();
      }
      self.room.socket.emit('kill player', {
        id: gamer.id,
      });
    };

    Object.keys(self.room.sEvent.gamers).forEach((gamerId) => {
      const gamer = self.room.sEvent.gamers[gamerId];
      gamer.update();
      // 其他人打到自己
      self.game.physics.arcade.overlap(
        self.sPlayer,
        gamer.bullets,
        hitMeHandler,
        null,
        null,
        self
      );
      // 自己打到敌人
      self.game.physics.arcade.overlap(
        self.bullets,
        gamer.player,
        hitEnemyHandler,
        null,
        null,
        self
      );
      self.game.physics.arcade.collide(self.sPlayer, gamer.player);
    });
    self.land.checkCollide(self.sPlayer);
    self.player.move(self.touchControl);
  }

  render() {
  }
}
export default TankGame;
