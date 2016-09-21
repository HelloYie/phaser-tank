
/**
 * @summary:
 *   攻击类
 * @description:
 *
 */
export default class Attack {
  /**
   * game: Phaser.Game
   * key: 子弹图片名称
   */
  constructor(game, socket) {
    this.game = game;
    this.socket = socket;
    this.shot();
  }

  shot() {
    // 攻击按钮
    this.attackBtn = this.game.add.sprite(this.game.width - 50, this.game.height - 50, 'attack');
    this.attackBtn.fixedToCamera = true;
    this.attackBtn.anchor.x = 0;
    this.attackBtn.anchor.y = 0;
    this.attackBtn.inputEnabled = true;
    this.attackBtn.fixedToCamera = true;
    this.attackBtn.events.onInputDown.add(() => {
      // this.weapon.fire();
      this.socket.emit('shot');
    }, this);
    return this;
  }
}
