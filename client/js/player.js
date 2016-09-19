
/**
 * @summary:
 *   玩家类： 每个 player 实例代表玩家自己
 * @description:
 *
 */

export default class Player {
  /**
   * game: Phaser.Game
   * name: 玩家名称如: 张三
   * group: 组: 'kzTeam'
   * key: 载入的spriteSheet 名称
   *
   */

  constructor(game, name, camp, key, land, socket) {
    this.game = game;
    this.name = name;
    this.camp = camp; // 阵营
    this.land = land;
    this.socket = socket;
    this.playerGroup = game.add.group();
    this.key = key;
    this.currentSpeed = 0;
    this.angle = 0;
    this.startX = Math.round((Math.random() * 1000) - 500);
    this.startY = Math.round((Math.random() * 1000) - 500);
    return this.init();
  }

  init() {
    this.sPlayer = this.game.add.sprite(this.startX, this.startY, this.key, 'tank1');
    this.sPlayer.anchor.setTo(0.5, 0.5);

    this.sPlayer.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    const turret = this.game.add.sprite(0, 0, this.key, 'turret');
    turret.anchor.setTo(0.3, 0.5);
    this.sPlayer.addChild(turret);
    this.game.physics.enable(this.sPlayer, Phaser.Physics.ARCADE);
    this.sPlayer.body.maxVelocity.setTo(400, 400);
    this.sPlayer.body.collideWorldBounds = true;
    this.sPlayer.playerObj = this;
    this.sPlayer.name = this.name;
    this.playerGroup.add(this.sPlayer);

    this.setName();

    return this;
  }

  // 设置玩家名称
  setName() {
    const playerName = this.game.add.text(
      -30,
      -23,
      this.name,
      {
        font: '6mm',
      });
    playerName.angle = 90;
    playerName.fill = 'blue';
    this.sPlayer.addChild(playerName);
  }

  isTeammates(playerObj) {
    // 判断是否是队友
    return this.camp === playerObj.camp;
  }

  easeInSpeed(x) {
    return (x * Math.abs(x)) / 2000;
  }

  move(touchControl) {
    const touchSpeed = touchControl.speed;
    const touchCursors = touchControl.cursors;
    //
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

    this.sPlayer.angle = this.angle;
    if (touchSpeed.x === 0 && touchSpeed.y === 0) {
      this.currentSpeed = 0;
    }
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
}
