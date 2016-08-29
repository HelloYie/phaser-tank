
/**
 * @summary:
 *   重力引擎
 * @description:
 *
 */
import gyro from 'js/lib/gyro';

export default class Gravity {

  constructor(player) {
    this.player = player;
  }

  init() {
    // 初始化加速度感应器
    gyro.frequency = 200;
    gyro.startTracking((o) => {
      const gamma = -(o.gamma);  // x轴
      const beta = o.beta - 20;  // Y轴
      const rad = Math.atan2(gamma, beta);
      let angle = (rad * (180 / Math.PI)) + 90;

      window.gyroUpdated = false;

      if (this.player.angle !== angle) {
        if (angle < -45 || angle > 225) {
          angle = -90;
        }
        if ((angle >= -45 && angle <= 0) || (angle > 0 && angle < 45)) {
          angle = 0;
        }
        if ((angle >= 45 && angle <= 90) || (angle > 90 && angle < 135)) {
          angle = 90;
        }
        if ((angle >= 135 && angle <= 180) || (angle > 180 && angle < 225)) {
          angle = 180;
        }
        this.player.angle = angle;
        window.gyroUpdated = true;
      }

      let speed = Math.max(Math.abs(gamma), Math.abs(beta)) * 35;
      if (speed < 0) {
        speed = 0;
      } else if (speed > 350) {
        speed = 350;
      }
      if (speed !== window.currentSpeed) {
        window.currentSpeed = speed;
        window.gyroUpdated = true;
      }
    });
    return this;
  }
}
