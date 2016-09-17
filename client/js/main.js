/**
 *
 * @summ
 *  主类： 游戏主入口
 * @desc
 *  负责绘制整个游戏, 并监听socket
 */

import 'css/reset.css';
import 'css/game.css';
import { names } from './constant';
import Player from './player';
import Attack from './attack';
import SocketEvent from './socket_event';
import Explosion from './explosion';
import tankPng from '../assets/tank/tanks.png';
import enemyPng from '../assets/tank/enemy-tanks.png';
import bulletPng from '../assets/tank/bullet.png';
import earthPng from '../assets/tank/scorched_earth.png';
import compassRosePng from '../assets/tank/compass_rose.png';
import touchSegmentPng from '../assets/tank/touch_segment.png';
import touchPng from '../assets/tank/touch.png';
import attackPng from '../assets/tank/attack.png';
import explosionPng from '../assets/tank/explosion.png';
import tanksJson from '../assets/tank/tanks.json';
import Room from './room';


class Main {
  constructor() {
    this.game = new Phaser.Game(
      '100',
      '100',
      Phaser.AUTO,
      '',
      {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this),
        render: this.render.bind(this),
      }
    );
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
    this.game.world.setBounds(0, 0, 2000, 2000);
    this.game.camera.unfollow();
    this.game.camera.deadzone = new Phaser.Rectangle(
      this.game.width / 3,
      this.game.height / 3,
      this.game.width / 3,
      this.game.height / 3
    );
    this.game.camera.focusOnXY(0, 0);
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.input.justPressedRate = 30;

    // 初始化陆地
    this.land = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'earth');
    this.land.fixedToCamera = true;

    // 初始化玩家
    const name = names[Math.floor(Math.random() * names.length)];
    this.player = new Player(this.game, name, 'red', 'tank', this.socket);
    this.sPlayer = this.player.sPlayer;
    this.sPlayer.bringToTop();

    // 初始化爆炸类
    this.explosion = new Explosion(this.game, 'kaboom');

    // 初始化子弹
    this.attack = new Attack(this.game, this.sPlayer, 'bullet', this.explosion, this.socket);
    this.bullets = this.attack.bullets;

    // 初始化 socket 事件
    this.sEvent = new SocketEvent(this.game, this.player, this.socket);
  }

  update() {
    this.game.physics.arcade.overlap(
      this.player.playerGroup,
      this.bullets,
      this.attack.hitHandler,
      null,
      this
    );
    Object.keys(this.sEvent.gamers).forEach((gamerId) => {
      const gamerObj = this.sEvent.gamers[gamerId];
      if (gamerObj.player.alive) {
        gamerObj.update();
        this.game.physics.arcade.overlap(
          this.player.playerGroup,
          gamerObj.bullets,
          this.attack.hitHandler,
          null,
          this
        );
      } else {
        this.explosion.boom(gamerObj.player);
        gamerObj.player.kill();
      }
    });
    this.game.physics.arcade.collide(this.sPlayer, this.player.playerGroup);
    this.player.move();
  }

  render() {
  }
}

// 主入口调用
require.ensure([], () => {
  // 初始化房间
  window.IO = require('./lib/socket.io-client');

  window.room = new Room();

  require.ensure([], () => {
    // 游戏资源加载
    window.PIXI = require('./lib/pixi.min');

    window.p2 = require('./lib/p2.min');

    require.ensure([], () => {
      window.Phaser = require('./lib/phaser-split.min');

      require('./lib/phaser-touch-control');

      if (false) {
        // 开始游戏
        new Main();
      }
    });
  });
});
