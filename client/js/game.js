/*
 * 游戏主入口
 */

import GameMap from './map';
import Player from './player';
import TouchControl from './touch_control';
import Attack from './attack';
import Explosion from './explosion';
import Boss from './boss';

import tankPng from '../assets/tank/tank-1.png';
import enemyPng from '../assets/tank/tank-2.png';
import bulletPng from '../assets/tank/bullet.png';
import earthPng from '../assets/tank/scorched_earth.png';
import compassRosePng from '../assets/tank/compass_rose.png';
import touchSegmentPng from '../assets/tank/touch_segment.png';
import touchPng from '../assets/tank/touch.png';
import attackPng from '../assets/tank/attack.png';
import explosionPng from '../assets/tank/explosion.png';
import explosionBrickPng from '../assets/tank/brick-explosion.png';
import stonePng from '../assets/tank/stone.png';
import brickPng from '../assets/tank/brick.png';
import grossPng from '../assets/tank/gross.png';
import bossTopPng from '../assets/tank/boss-top.png';
import bossBottomPng from '../assets/tank/boss-bottom.png';


class TankGame {
  constructor(room, callback) {
    const self = this;
    $('.room_container').remove();
    self.room = room;
    self.callback = callback;
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
    self.game.load.image('bossTop', bossTopPng);
    self.game.load.image('bossBottom', bossBottomPng);
    self.game.load.spritesheet('tank', tankPng, 35, 28, 1);
    self.game.load.spritesheet('enemy', enemyPng, 35, 28, 1);
    self.game.load.spritesheet('kaboom', explosionPng, 64, 64, 23);
    self.game.load.spritesheet('brickKaboom', explosionBrickPng, 24, 24, 7);
  }

  create() {
    // 初始化游戏设置
    const self = this;
    self.game.world.setBounds(0, 0, 600, 600);
    self.game.camera.focusOnXY(0, 0);
    self.game.physics.startSystem(Phaser.Physics.ARCADE);
    self.game.input.justPressedRate = 30;

    // 初始化触摸移动类
    self.touchControl = new TouchControl(this.game, this);
    // 初始化陆地
    self.land = self.game.add.tileSprite(0, 0, 2000, 2000, 'earth');
    // 初始化爆炸类
    self.explosion = new Explosion(self.game);
    // 初始化攻击类
    new Attack(self.game, self.room.socket);
    // 初始化地图类
    self.gameMap = new GameMap(self.game, self.explosion, self.room.socket);
    // 初始化玩家, 哪个队先进来，那个队就在下面.
    const isTopCamp = self.room.camp === '1';
    self.player = new Player(
      self.room.socket.id,
      self.game,
      'tank',
      self.room.name,
      self.room.sex,
      self.room.camp,
      self.room.avatar,
      self.game.world.centerX + 100,
      isTopCamp ? 50 : self.game.world.height - 14,
      'bullet',
      self.room.socket
    );
    self.room.socket.emit(
      'new player',
      {
        x: self.player.startX,
        y: self.player.startY,
        name: self.player.name,
        avatar: self.player.avatar,
        camp: self.player.camp,
        sex: self.player.sex,
      }
    );
    self.sPlayer = self.player.sPlayer;
    // 初始化自己的 boss
    self.boss = new Boss(
      self.game,
      isTopCamp ? 'bossTop' : 'bossBottom',
      self.room.camp,
      self.game.world.centerX,
      isTopCamp ? 20 : self.game.world.height - 20,
      self.explosion,
      self.room.socket
    );
    // 初始化敌人的 boss
    self.enemiesBoss = new Boss(
      self.game,
      isTopCamp ? 'bossBottom' : 'bossTop',
      isTopCamp ? '2' : '1',
      self.game.world.centerX,
      isTopCamp ? self.game.world.height - 20 : 20,
      self.explosion,
      self.room.socket
    );
    self.game.camera.follow(self.sPlayer);
    self.room.player = self.player;
    self.game.world.bringToTop(self.gameMap.crossGroup);
  }

  update() {
    const self = this;
    const enemiesGroup = self.room.sEvent.enemiesGroup;
    self.gameMap.checkCollideOverlap(self.sPlayer);
    self.enemiesBoss.checkCollideOverlap(self.sPlayer);
    self.player.checkCollideOverlap(enemiesGroup);
    self.player.move(self.touchControl);
  }

  render() {
  }
}
export default TankGame;
