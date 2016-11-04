
/**
 * @summary:
 *   玩家基类
 */

import HealthBar from '../tool/health_bar';
import {
  SingleBulletWeapon,
  BeamBulletWeaponVtc,
  BeamBulletWeaponHrz,
  SprialBulletWeapon,
} from '../tool/bullet';


export default class Player {
  constructor(id, game, key, name, sex, camp, avatar, startX, startY, explosion, socket) {
    this.id = id;
    this.game = game;
    this.name = name;
    this.sex = sex;
    this.avatar = avatar;
    this.camp = String(camp);
    this.key = key;
    this.startX = startX;
    this.startY = startY;
    this.explosion = explosion;
    this.socket = socket;
    this.alive = true;
    this.angle = this.camp === '1' ? 90 : -90;
    this.health = 5;
    this.move_action = 'stop';

    this.singleBullet = new SingleBulletWeapon(this.game, this);
    this.beamVtcBullet = new BeamBulletWeaponVtc(this.game, this);
    this.beamHrzBullet = new BeamBulletWeaponHrz(this.game, this);
    this.sprialBullet = new SprialBulletWeapon(this.game, this);
    // 10次没同步， 就同步一次
    this.no_move = 1;
    this.no_move_limit = 20;
    this.weapon = this.singleBullet;
    this.setSplayer();
    this.setName();
    this.setHealthBar();
  }

  setSplayer() {
    this.sPlayer = this.game.add.sprite(this.startX, this.startY, this.key);
    this.game.physics.enable(this.sPlayer, Phaser.Physics.ARCADE);
    this.sPlayer.anchor.setTo(0.5, 0.5);
    this.sPlayer.animations.add('move');
    this.sPlayer.animations.add('stop');

    this.sPlayer.body.maxVelocity.setTo(400, 400);
    this.sPlayer.body.collideWorldBounds = true;
    // this.sPlayer.body.immovable = true;

    this.sPlayer.width = 30;
    this.sPlayer.height = 24;
    this.sPlayer.angle = this.angle;

    this.sPlayer.name = this.name;
    this.sPlayer.player = this;
  }

  setHealthBar() {
    this.healthBar = new HealthBar(this.game, {
      x: -23,
      y: 0,
      width: 28,
      height: 5,
    });
    this.sPlayer.addChild(this.healthBar.bgSprite);
    this.healthBar.bgSprite.angle = this.sPlayer.angle;
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
    const touchCursors = touchControl.cursors;
    this.currentSpeed = 100;
    if (this.game.input.activePointer.isDown) {
      // 在操作
      if (touchCursors.left && this.move_action !== 'left') {
        this.angle = 180;
        this.move_action = 'left';
      } else if (touchCursors.right && this.move_action !== 'right') {
        this.angle = 0;
        this.move_action = 'right';
      } else if (touchCursors.up && this.move_action !== 'up') {
        this.angle = -90;
        this.move_action = 'up';
      } else if (touchCursors.down && this.move_action !== 'down') {
        this.angle = 90;
        this.move_action = 'down';
      } else if (this.no_move % this.no_move_limit) {
        // 没有动作，直接返回
        this.no_move += 1;
        return false;
      }
    } else if (this.move_action !== 'stop') {
      // 未操作边缘
      this.move_action = 'stop';
      this.currentSpeed = 0;
    } else {
      // 未操作
      if (this.no_move % this.no_move_limit) {
        // 没有动作，直接返回
        this.no_move += 1;
        return false;
      }
      this.currentSpeed = 0;
    }
    const moveInfo = {
      angle: this.angle,
      speed: this.currentSpeed,
      x: this.sPlayer.x,
      y: this.sPlayer.y,
    };

    this.socket.emit('move player', moveInfo);
    this.no_move = 1;
    return this;
  }

  isTeammates(player) {
    return this.camp === player.camp;
  }

  hitPlayerHandler(gamer, sBullet) {
    const self = this;
    const killer = sBullet.bullet.owner;
    // 自己击中自己
    if (killer.id === gamer.player.id) {
      return;
    }
    sBullet.kill();

    if (killer.isTeammates(gamer)) {
      // 击中队友
      return;
    }

    let health = gamer.player.health;
    health -= sBullet.bullet.power;

    if (health < 1) {
      self.explosion.boom(gamer, 'kaboom');
      gamer.destroy();
      self.socket.emit('kill player', {
        id: gamer.player.id,
        health,
        killerId: killer.id,
      });
    } else {
      gamer.player.setHealth(health);
    }
  }

  checkCollideOverlap(gamersGroup, weaponsGroupList) {
    const self = this;
    self.game.physics.arcade.collide(
      self.sPlayer,
      gamersGroup,
    );
    self.game.physics.arcade.overlap(
      gamersGroup,
      weaponsGroupList,
      self.hitPlayerHandler,
      null,
      self
    );
  }
}
