/**
 *
 * @summ
 *  主类： 游戏主入口
 * @desc
 *  负责绘制整个游戏, 并监听socket
 */

import { names } from './constant';
import Player from './player';
import Bullets from './bullet';
import SocketEvent from './socket_event';
import Gravity from './gravity';
// import lightSandPng from 'assets/light_sand.png';
// import knife1 from 'assets/knife1.png';
// import dudePng from 'assets/dude.png';

import tankPng from '../assets/tank/tanks.png';
import enemyPng from '../assets/tank/enemy-tanks.png';
import bulletPng from '../assets/tank/bullet.png';
import earthPng from '../assets/tank/scorched_earth.png';
// import kaboomPng from '../assets/tank/explosion.png';

import tanksJson from '../assets/tank/tanks.json';

import 'css/reset.css';
import 'css/game.css';


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
    window.currentSpeed = 0;
    this.updateRate = 1;
  }

  preload() {
    // this.game.load.image('earth', lightSandPng);
    // this.game.load.image('knife1', knife1);
    // this.game.load.spritesheet('dude', dudePng, 64, 64);
    // this.game.load.spritesheet('enemy', dudePng, 64, 64);

    // tank
    this.game.load.atlas('dude', tankPng, null, tanksJson);
    this.game.load.atlas('enemy', enemyPng, null, tanksJson);
    // this.game.load.image('logo', 'assets/games/tanks/logo.png');
    this.game.load.image('knife1', bulletPng);
    this.game.load.image('earth', earthPng);
    // this.game.load.spritesheet('kaboom', kaboomPng, 64, 64, 23);
  }

  create() {
    this.socket = io.connect();
    this.game.world.setBounds(-2000, -2000, 2000, 2000);
    this.land = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'earth');
    this.land.fixedToCamera = true;

    // 初始化玩家
    const name = names[Math.floor(Math.random() * names.length)];
    this.player = new Player(this.game, name, 'red', 'dude').init();
    this.sPlayer = this.player.sPlayer;
    this.nameText = this.player.playerName;

    // 初始化子弹
    const bullet = new Bullets(this.game, this.sPlayer, 'knife1').init();
    this.weapon = bullet.weapon;
    this.bullets = bullet.bullets;

    this.sPlayer.bringToTop();

    this.game.camera.follow(this.sPlayer);
    this.game.camera.deadzone = new Phaser.Rectangle(
      this.game.width / 3,
      this.game.height / 3,
      this.game.width / 3,
      this.game.height / 3
    );
    this.game.camera.focusOnXY(0, 0);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    // 按键500ms触发一次
    this.game.input.justPressedRate = 30;

    // Start listening for events
    this.sEvent = new SocketEvent(this.game, this.socket, this.player).init();

    new Gravity(this.sPlayer, this.game).init();
  }

  hitHandler(gamer, bullet) {
    const bullet_owner = bullet.data.bulletManager.trackedSprite;
    if (!bullet_owner.playerObj.isTeammates(gamer.playerObj)) {
      gamer.kill();
      this.socket.emit('kill', {
        id: gamer.name,
      });
      if (gamer === this.sPlayer) {
        // 阵亡
        this.nameText.kill();
      } else {
        gamer.manager.nameText.kill();
      }
    }
    if (bullet_owner !== gamer) {
      // 碰撞后子弹消失
      bullet.kill();
    }
  }

  update() {
    this.game.physics.arcade.overlap(this.player.playerGroup, this.bullets, this.hitHandler, null, this);
    Object.keys(this.sEvent.gamers).forEach((gamerId) => {
      const gamerObj = this.sEvent.gamers[gamerId];
      if (gamerObj.player.alive) {
        gamerObj.update();
        this.game.physics.arcade.overlap(this.player.playerGroup, gamerObj.bullets, this.hitHandler, null, this);
      } else {
        gamerObj.nameText.kill();
        gamerObj.player.kill();
      }
    });

    this.game.physics.arcade.collide(this.sPlayer, this.player.playerGroup);

    if (this.game.input.activePointer.justPressed()) {
      // 攻击
      if (this.sPlayer.alive) {
        this.weapon.bulletAngleOffset = 0;
        this.weapon.fire();
        this.socket.emit('shot', {
          x: this.sPlayer.x,
          y: this.sPlayer.y,
          angle: this.sPlayer.angle,
        });
      }
    }

    if (window.gyroUpdated) {
      this.playerMove();
    }
  }

  playerMove() {
    this.game.physics.arcade.velocityFromRotation(
      this.sPlayer.rotation,
      window.currentSpeed,
      this.sPlayer.body.velocity
    );

    if (window.currentSpeed > 0) {
      // this.sPlayer.animations.play('move');
      this.sPlayer.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);
    } else {
      this.sPlayer.animations.play('stop');
    }

    this.land.tilePosition.x = -this.game.camera.x;
    this.land.tilePosition.y = -this.game.camera.y;
    if ((this.updateRate % 10) === 0) {
      // 每秒6个请求， 降低请求数
      this.updateRate = 1;
      this.socket.emit(
        'move player',
        {
          x: this.sPlayer.x,
          y: this.sPlayer.y,
          angle: this.sPlayer.angle,
          speed: window.currentSpeed,
        }
      );
    }
    this.updateRate += 1;
  }

  render() {

  }
}

require.ensure([], () => {
  window.PIXI = require('./lib/pixi.min');

  window.p2 = require('./lib/p2.min');

  window.io = require('./lib/socket.io-client');

  require.ensure([], () => {
    window.Phaser = require('./lib/phaser-split.min');

    new Main();
  });
});
