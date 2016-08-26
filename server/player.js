/**
 *  玩家
 */

'use strict';

class Player {
  /**
   * startX: x坐标开始点
   * startY: y坐标开始点
   * angle: 角度
   * name: 名称
   */
  constructor(startX, startY, angle, name) {
    this.x = startX;
    this.y = startY;
    this.angle = angle;
    this.name = name;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  getAngle() {
    return this.angle;
  }

  setAngle(angle) {
    this.angle = angle;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }
}

module.exports = Player;
