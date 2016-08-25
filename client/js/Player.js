
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
   * spriteSheetName: 载入的spriteSheet 名称
   *
   */

  constructor(game, name, group, spriteSheetName) {
    this.game = game;
    this.name = name;
    this.group = group;
    this.spriteSheetName = spriteSheetName;
    this.startX = Math.round((Math.random() * 1000) - 500);
    this.startY = Math.round((Math.random() * 1000) - 500);
  }

  init() {
    this.sPlayer = this.game.add.sprite(this.startX, this.startY, this.spriteSheetName);
    this.sPlayer.anchor.setTo(0.5, 0.5);
    this.sPlayer.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
    this.sPlayer.animations.add('stop', [3], 20, true);

    this.game.physics.enable(this.sPlayer, Phaser.Physics.ARCADE);
    this.sPlayer.body.maxVelocity.setTo(400, 400);
    this.sPlayer.body.collideWorldBounds = true;

    this.setName();
    this.setGroup();

    return this;
  }

  // 设置玩家名称
  setName() {
    const playerName = this.game.add.text(
      this.startX - 25,
      this.startY - this.sPlayer.height,
      this.name,
      {
        font: '6mm',
      });
    playerName.x = Math.floor(this.sPlayer.x - 25);
    playerName.y = Math.floor(this.sPlayer.y - this.sPlayer.height);
    this.playerName = playerName;
    return this;
  }

  // 设置玩家组
  setGroup() {
    const playerGroup = this.game.add.group();
    playerGroup.add(this.sPlayer);
    this.playerGroup = playerGroup;
    return this;
  }
}