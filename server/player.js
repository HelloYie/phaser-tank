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
  constructor(attrs) {
    this.speed = 0;
    this.setAttrs(attrs);
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

  getSpeed() {
    return this.speed;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  setAttrs(attrs) {
    this.x = attrs.x;
    this.y = attrs.y;
    this.angle = attrs.angle;
    this.name = attrs.name;
    this.speed = attrs.speed;
    this.splayerId = attrs.splayerId;
    this.id = attrs.id;
    this.roomId = attrs.roomId;
    this.avatar = attrs.avatar;
    this.camp = attrs.camp;
  }

}

module.exports = Player;
