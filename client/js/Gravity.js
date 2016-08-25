
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
    // start gyroscope detection
    gyro.startTracking((o) => {
      // 近乎完美的重力加速度传感器体验
      // updating player velocity
      const gamma = -(o.gamma);  // x轴
      const beta = o.beta - 20;  // Y轴
      const rad = Math.atan2(gamma, beta);
      const angle = (rad * (180 / Math.PI)) + 90;

      window.gyroUpdated = false;
      if (this.player.angle !== angle) {
        this.player.angle = angle;
        window.gyroUpdated = true;
      }

      let speed = Math.max(Math.abs(gamma), Math.abs(beta)) * 14;
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