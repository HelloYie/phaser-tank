/**
 *
 * @summ
 *  主类： 游戏主入口
 * @desc
 *  负责绘制整个游戏, 并监听socket
 */

import 'pixi.js';
import 'p2';
import 'phaser';
import 'socket.io-client';
import { names } from './constant';
import Player from './Player';
import Bullets from './Bullet';
import SocketEvent from './SocketEvent';
import Gravity from './Gravity';
import lightSandPng from 'assets/light_sand.png';
import knife1 from 'assets/knife1.png';
import dudePng from 'assets/dude.png';
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
    this.game.load.image('earth', lightSandPng);
    this.game.load.image('knife1', knife1);
    this.game.load.spritesheet('dude', dudePng, 64, 64);
    this.game.load.spritesheet('enemy', dudePng, 64, 64);
  }

  create() {
    this.socket = io.connect();
    this.game.world.setBounds(-2000, -2000, 2000, 2000);
    this.land = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'earth');
    this.land.fixedToCamera = true;

    // 初始化玩家
    const name = names[Math.floor(Math.random() * names.length)];
    this.player = new Player(this.game, name, null, 'dude').init();
    this.sPlayer = this.player.sPlayer;
    this.nameText = this.player.playerName;
    this.playerGroup = this.player.playerGroup;

    // 初始化子弹
    const bullet = new Bullets(this.game, 'knife1').init();
    this.weapon = bullet.weapon;
    this.weapon.trackSprite(this.sPlayer, 0, 0, true);
    this.bullets = bullet.bullets;
    this.gamers = {};

    this.sPlayer.bringToTop();

    this.game.camera.follow(this.sPlayer);
    this.game.camera.deadzone = new Phaser.Rectangle(
      this.game.width / 3,
      this.game.height / 3,
      this.game.width / 3,
      this.game.height / 3,
    );
    this.game.camera.focusOnXY(0, 0);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    // Start listening for events
    const sEvent = new SocketEvent(this.game, this.socket, this.gamers, this.sPlayer, this.playerGroup).init();
    this.gamers = sEvent.gamers;
    this.playerGroup = sEvent.playerGroup;

    new Gravity(this.sPlayer).init();
  }

  hitHandler(gamer, bullet) {
    const bullet_owner = bullet.data.bulletManager.trackedSprite;
    if (bullet_owner.camp !== gamer.camp) {
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
    let updated = false;
    this.game.physics.arcade.overlap(this.playerGroup, this.bullets, this.hitHandler, null, this);
    Object.keys(this.gamers).forEach((gamerId) => {
      const gamerObj = this.gamers[gamerId];
      if (gamerObj.alive) {
        gamerObj.update();
        game.physics.arcade.collide(this.sPlayer, gamerObj.player);
        game.physics.arcade.overlap(this.playerGroup, gamerObj.bullets, this.hitHandler, null, this);
      } else {
        gamerObj.nameText.kill();
        gamerObj.player.kill();
      }
    });
    if (this.game.input.activePointer.isDown) {
      // 攻击
      if (this.sPlayer.alive) {
        this.weapon.fire();
        this.socket.emit('shot', {
          x: this.sPlayer.x,
          y: this.sPlayer.y,
          angle: this.sPlayer.angle,
        });
      }
    } else {
      // 移动
      if (this.cursors.left.isDown) {
        this.sPlayer.angle -= 4;
        updated = 1;
      } else if (this.cursors.right.isDown) {
        this.sPlayer.angle += 4;
        updated = 1;
      }

      if (this.cursors.up.isDown) {
        // The speed we'll travel at
        window.currentSpeed = 350;
        updated = 1;
      } else if (window.currentSpeed > 0) {
        window.currentSpeed -= 1;
        updated = 1;
      }
    }

    if (updated || window.gyroUpdated) {
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
      this.sPlayer.animations.play('move');
    } else {
      this.sPlayer.animations.play('stop');
    }

    this.land.tilePosition.x = -this.game.camera.x;
    this.land.tilePosition.y = -this.game.camera.y;
    //
    this.player.playerName.x = Math.floor(this.sPlayer.x - 25);
    this.player.playerName.y = Math.floor(this.sPlayer.y - this.sPlayer.height);
    if ((this.updateRate % 3) === 0) {
      // 每秒20个请求， 降低请求数
      this.updateRate = 1;
      this.socket.emit('move player', { x: this.sPlayer.x, y: this.sPlayer.y, angle: this.sPlayer.angle });
    }
    this.updateRate += 1;
  }

  render() {

  }
}

new Main();