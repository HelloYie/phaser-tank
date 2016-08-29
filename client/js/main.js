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
import Player from './player';
import Bullets from './bullet';
import SocketEvent from './socket_event';
import Gravity from './gravity';
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
    this.player = new Player(this.game, name, 'red', 'dude').init();
    this.sPlayer = this.player.sPlayer;
    this.nameText = this.player.playerName;

    // 初始化子弹
    const bullet = new Bullets(this.game, 'knife1').init();
    this.weapon = bullet.weapon;
    this.weapon.trackSprite(this.sPlayer, 0, 0, true);
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

    new Gravity(this.sPlayer).init();
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
    let updated = false;
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

new Main();
