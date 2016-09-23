
/**
 * @summary:
 *   玩家基类
 */

import HealthBar from './health_bar';


export default class Player {
  constructor(id, game, key, name, sex, camp, avatar, startX, startY, bulletKey, socket) {
    this.id = id;
    this.game = game;
    this.name = name;
    this.sex = sex;
    this.avatar = avatar;
    this.camp = camp;
    this.key = key;
    this.startX = startX;
    this.startY = startY;
    this.bulletKey = bulletKey;
    this.socket = socket;
    this.alive = true;
    this.currentSpeed = 0;
    this.angle = 0;
    this.health = 5;
    this.stopped = false;
    this.init();
  }

  init() {
    this.group = this.game.add.group();
    this.sPlayer = this.game.add.sprite(this.startX, this.startY, this.key);
    this.game.physics.enable(this.sPlayer, Phaser.Physics.ARCADE);
    this.sPlayer.anchor.setTo(0.5, 0.5);
    this.sPlayer.animations.add('move');
    this.sPlayer.animations.add('stop');

    this.sPlayer.body.maxVelocity.setTo(400, 400);
    this.sPlayer.body.collideWorldBounds = true;

    this.sPlayer.width = 35;
    this.sPlayer.height = 28;

    this.sPlayer.name = this.name;
    this.sPlayer.player = this;
    this.sPlayer.group = this.group;

    this.group.add(this.sPlayer);
    this.setName();
    this.setHealthBar();
    this.setBullet();
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

  // 初始化子弹
  setBullet() {
    const self = this;
    self.weapon = self.game.add.weapon(5, self.bulletKey);
    self.bullets = self.weapon.bullets;
    self.bullets.owner = self;
    self.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    self.weapon.bulletSpeed = 400;
    self.weapon.fireRate = 500;
    self.weapon.bulletAngleOffset = 90;
    self.weapon.trackSprite(self.sPlayer, 0, 0, true);
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
    if (this.game.input.activePointer.isDown) {
      this.stopped = false;
      this.socket.emit(
        'move player',
        {
          angle: this.angle,
          speed: Math.abs(this.currentSpeed),
          x: this.sPlayer.x,
          y: this.sPlayer.y,
        }
      );
    } else if (!this.stopped) {
      this.socket.emit(
        'move player',
        {
          angle: this.angle,
          speed: 0,
          x: this.sPlayer.x,
          y: this.sPlayer.y,
        }
      );
      this.stopped = true;
    }
    return this;
  }

  isTeammates(player) {
    return this.camp === player.camp;
  }
}
