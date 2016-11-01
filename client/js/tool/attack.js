
/**
 * @summary:
 *   攻击类
 * @description:
 *
 */

export default class Attack {
  /**
   * game: Phaser.Game
   */
  constructor(game, socket) {
    this.game = game;
    this.socket = socket;
    this.swipeCoordX = 0;
    this.swipeCoordY = 0;
    this.swipeCoordX2 = 0;
    this.swipeCoordY2 = 0;
    this.swipeMinDistance = 10;
    this.shot();
  }

  shot() {
    // 如果用户移动的最小距离不超过 10，则判断为发弹
    this.game.input.onDown.add((pointer) => {
      this.swipeCoordX = pointer.clientX;
      this.swipeCoordY = pointer.clientY;
    });
    this.game.input.onUp.add((pointer) => {
      this.swipeCoordX2 = pointer.clientX;
      this.swipeCoordY2 = pointer.clientY;
      const isLeft = this.swipeCoordX2 < this.swipeCoordX - this.swipeMinDistance;
      const isRight = this.swipeCoordX2 > this.swipeCoordX + this.swipeMinDistance;
      const isUp = this.swipeCoordY2 < this.swipeCoordY - this.swipeMinDistance;
      const isDown = this.swipeCoordY2 > this.swipeCoordY + this.swipeMinDistance;
      if (!isLeft && !isRight && !isUp && !isDown) {
        this.socket.emit('shot');
      }
    }, this);
    return this;
  }
}
