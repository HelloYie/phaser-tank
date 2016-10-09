
/**
 * @summary:
 *   玩家基类
 */

import HealthBar from '../tool/health_bar';
import { SingleBulletWeapon } from '../tool/bullet';

export default class Player {
  constructor(id, game, key, name, sex, camp, avatar, startX, startY, socket) {
    this.id = id;
    this.game = game;
    this.name = name;
    this.sex = sex;
    this.avatar = avatar;
    this.camp = String(camp);
    this.key = key;
    this.startX = startX;
    this.startY = startY;
    this.socket = socket;
    this.alive = true;
    this.currentSpeed = 0;
    this.angle = this.camp === '1' ? 90 : -90;
    this.health = 5;
    this.stopped = false;
    this.weapon = new SingleBulletWeapon(game, this);
    this.setSplayer();
    this.setName();
    this.setHealthBar();
  }

  setSplayer() {
    this.group = this.game.add.physicsGroup();
    this.sPlayer = this.game.add.sprite(this.startX, this.startY, this.key);
    this.game.physics.enable(this.sPlayer, Phaser.Physics.ARCADE);
    this.sPlayer.anchor.setTo(0.5, 0.5);
    this.sPlayer.animations.add('move');
    this.sPlayer.animations.add('stop');

    this.sPlayer.body.maxVelocity.setTo(400, 400);
    this.sPlayer.body.collideWorldBounds = true;

    this.sPlayer.width = 35;
    this.sPlayer.height = 28;
    this.sPlayer.angle = this.angle;

    this.sPlayer.name = this.name;
    this.sPlayer.player = this;
    this.sPlayer.group = this.group;

    this.group.add(this.sPlayer);
  }

  setHealthBar() {
    this.healthBar = new HealthBar(this.game, {
      x: -23,
      y: 0,
      width: 28,
      height: 5,
    });
    this.sPlayer.addChild(this.healthBar.bgSprite);
    this.healthBar.bgSprite.angle = 90;
  }

  // 设置玩家名称
  setName() {
    const playerName = this.game.add.text(
      -40,
      0,
      this.name.length > 3 ? `${this.name.substr(0, 3)}...` : this.name,
      {
        font: '12px',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 30,
        fill: '#fff',
      });
    playerName.angle = 90;
    playerName.anchor.set(0.5);
    this.sPlayer.addChild(playerName);
  }

  setHealth(health) {
    const percent = (health / 5) * 100;
    this.health = health;
    this.healthBar.setPercent(percent);
  }

  move(touchControl) {
    const touchSpeed = touchControl.speed;
    const touchCursors = touchControl.cursors;
    if (touchCursors.left) {
      this.angle = 180;
      this.currentSpeed = touchSpeed.x;
    } else if (touchCursors.right) {
      this.angle = 0;
      this.currentSpeed = touchSpeed.x;
    } else if (touchCursors.up) {
      this.angle = -90;
      this.currentSpeed = touchSpeed.y;
    } else if (touchCursors.down) {
      this.angle = 90;
      this.currentSpeed = touchSpeed.y;
    }

    if (touchSpeed.x === 0 && touchSpeed.y === 0) {
      this.currentSpeed = 0;
    }
    const moveInfo = {
      angle: this.angle,
      speed: Math.abs(this.currentSpeed),
      x: this.sPlayer.x,
      y: this.sPlayer.y,
    };
    if (this.game.input.activePointer.isDown) {
      this.socket.emit('move player', moveInfo);
      this.stopped = false;
    } else if (!this.stopped) {
      moveInfo.speed = 0;
      this.socket.emit('move player', moveInfo);
      this.stopped = true;
    }
    return this;
  }

  isTeammates(player) {
    return this.camp === player.camp;
  }

  hitPlayerHandler(gamer, bullet) {
    const killer = bullet.bullet.owner;
    // 击中自己
    if (killer.id === gamer.player.id) {
      return;
    }
    bullet.kill();
    // 不是自己攻击
    if (this.id !== killer.id) {
      return;
    }
    if (killer.isTeammates(gamer)) {
      // 击中队友
    } else {
      this.socket.emit('kill player', {
        id: gamer.player.id,
        health: gamer.player.health,
        killerId: killer.id,
      });
    }
  }

  checkCollideOverlap(gamersGroup) {
    const self = this;
    const weaponsGroup = gamersGroup.children.map((gamer) => {
      return gamer.player.weapon.group;
    });
    self.game.physics.arcade.collide(
      self.group,
      gamersGroup,
    );
    self.game.physics.arcade.overlap(
      gamersGroup,
      weaponsGroup,
      self.hitPlayerHandler,
      null,
      self
    );
  }
}
