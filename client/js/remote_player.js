/**
 * @summary
 *  远程玩家类：定义远程玩家
 * @return class RemotePlayer
 *
 */

import BasePlayer from './base_player';

export default class RemotePlayer extends BasePlayer {

  /**
   * @param id [String] 玩家id
   */
  constructor(id, game, key, name, camp, avatar, startX, startY, bulletKey) {
    super(id, game, key, name, camp, avatar, startX, startY, bulletKey);
    this.lastPosition = {
      startX,
      startY,
      angle: this.sPlayer.angle,
    };
    this.sPlayer.body.immovable = true;
  }

  update() {
    // 更新精灵状态
    if (this.sPlayer.x !== this.lastPosition.x || this.sPlayer.y !== this.lastPosition.y || this.sPlayer.angle !== this.lastPosition.angle) {
      this.sPlayer.animations.play('move');
    } else {
      this.sPlayer.animations.play('stop');
    }
    this.lastPosition.x = this.sPlayer.x;
    this.lastPosition.y = this.sPlayer.y;
    this.lastPosition.angle = this.sPlayer.angle;
  }
}
