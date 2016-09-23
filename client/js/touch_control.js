/**
 * 游戏手柄
 */

 export default class TouchControl {
   constructor(game) {
     this.game = game;
     this.touchControl = this.game.plugins.add(Phaser.Plugin.TouchControl);
     this.touchControl.inputEnable();
     this.touchControl.settings.singleDirection = true;
     return this.touchControl;
   }
 }
