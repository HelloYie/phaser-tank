
/**
 * @summary:
 *   玩家类： 每个 player 实例代表玩家自己
 * @description:
 *
 */
import BasePlayer from './base_player';


export default class Player extends BasePlayer {
  constructor(id, game, key, name, camp, avatar, startX, startY, bulletKey, socket) {
    super(id, game, key, name, camp, avatar, startX, startY, bulletKey);
    this.socket = socket;
    this.currentSpeed = 0;
    this.angle = 0;
  }

  move(touchControl) {
    const touchSpeed = touchControl.speed;
    const touchCursors = touchControl.cursors;
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
      this.sPlayer.animations.play('move');
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
