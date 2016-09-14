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
import TouchControl from './touch_control';

import tankPng from '../assets/tank/tanks.png';
import enemyPng from '../assets/tank/enemy-tanks.png';
import bulletPng from '../assets/tank/bullet.png';
import earthPng from '../assets/tank/scorched_earth.png';
import compassRosePng from '../assets/tank/compass_rose.png';
import touchSegmentPng from '../assets/tank/touch_segment.png';
import touchPng from '../assets/tank/touch.png';
import attackPng from '../assets/tank/attack.png';

import tanksJson from '../assets/tank/tanks.json';


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
    this.currentSpeed = 0;
    this.angle = 0;
  }

  preload() {
    this.game.load.image('bullet', bulletPng);
    this.game.load.image('earth', earthPng);
    this.game.load.image('compass', compassRosePng);
    this.game.load.image('touch_segment', touchSegmentPng);
    this.game.load.image('touch', touchPng);
    this.game.load.image('attack', attackPng);
    this.game.load.atlas('dude', tankPng, null, tanksJson);
    this.game.load.atlas('enemy', enemyPng, null, tanksJson);
  }

  create() {
    this.socket = io.connect();
    this.game.world.setBounds(0, 0, 2000, 2000);
    this.land = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'earth');
    this.land.fixedToCamera = true;

    // 初始化玩家
    const name = names[Math.floor(Math.random() * names.length)];
    this.player = new Player(this.game, name, 'red', 'dude');
    this.sPlayer = this.player.sPlayer;

    // 初始化子弹
    this.attack = new Attack(this.game, this.sPlayer, 'bullet', this.socket);
    this.bullets = this.attack.bullets;

    this.sPlayer.bringToTop();
    this.game.camera.unfollow();

    this.game.camera.deadzone = new Phaser.Rectangle(
      this.game.width / 3,
      this.game.height / 3,
      this.game.width / 3,
      this.game.height / 3
    );
    this.game.camera.focusOnXY(0, 0);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.game.input.justPressedRate = 30;

    this.sEvent = new SocketEvent(this.game, this.socket, this.player);
    this.touchControl = new TouchControl(this.game, this).touchControl;
  }

  hitHandler(gamer, bullet) {
    const bulletOwner = bullet.data.bulletManager.trackedSprite;
    if (!bulletOwner.playerObj.isTeammates(gamer.playerObj)) {
      gamer.kill();
      this.socket.emit('kill', {
        id: gamer.name,
      });
    }
    if (bulletOwner !== gamer) {
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
        gamerObj.player.kill();
      }
    });

    this.game.physics.arcade.collide(this.sPlayer, this.player.playerGroup);
    this.playerMove();
  }

  playerMove() {
    const touchCursors = this.touchControl.cursors;
    const touchSpeed = this.touchControl.speed;

    if (touchCursors.left) {
      this.angle = 180;
      this.currentSpeed = Math.abs(touchSpeed.x);
    } else if (touchCursors.right) {
      this.angle = 0;
      this.currentSpeed = Math.abs(touchSpeed.x);
    } else if (touchCursors.up) {
      this.angle = -90;
      this.currentSpeed = Math.abs(touchSpeed.y);
    } else if (touchCursors.down) {
      this.angle = 90;
      this.currentSpeed = Math.abs(touchSpeed.y);
    }

    if (touchSpeed.x === 0 && touchSpeed.y === 0) {
      this.currentSpeed = 0;
    }

    this.sPlayer.angle = this.angle;
    this.game.physics.arcade.velocityFromAngle(
      this.angle,
      this.currentSpeed * 3,
      this.sPlayer.body.velocity
    );
    if (this.currentSpeed === 0) {
      return;
    }

    if (this.currentSpeed > 0) {
      this.sPlayer.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);
    } else {
      this.sPlayer.animations.play('stop');
    }
    this.socket.emit(
      'move player',
      {
        x: this.sPlayer.x,
        y: this.sPlayer.y,
        angle: this.sPlayer.angle,
        speed: this.currentSpeed,
      }
    );
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

    require('./lib/phaser-touch-control');

    new Main();
  });
});
