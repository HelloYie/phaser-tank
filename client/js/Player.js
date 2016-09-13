
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

  constructor(game, name, camp, spriteSheetName) {
    this.game = game;
    this.name = name;
    this.camp = camp; // 阵营
    this.playerGroup = game.add.group();
    this.spriteSheetName = spriteSheetName;
    this.startX = Math.round((Math.random() * 1000) - 500);
    this.startY = Math.round((Math.random() * 1000) - 500);
    return this.init();
  }

  init() {
    this.sPlayer = this.game.add.sprite(this.startX, this.startY, this.spriteSheetName, 'tank1');
    this.sPlayer.anchor.setTo(0.5, 0.5);

    this.sPlayer.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    // this.sPlayer.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
    // this.sPlayer.animations.add('stop', [3], 20, true);
    const turret = this.game.add.sprite(0, 0, this.spriteSheetName, 'turret');
    turret.anchor.setTo(0.3, 0.5);
    this.sPlayer.addChild(turret);


    this.game.physics.enable(this.sPlayer, Phaser.Physics.ARCADE);
    this.sPlayer.body.maxVelocity.setTo(400, 400);
    this.sPlayer.body.collideWorldBounds = true;
    this.sPlayer.playerObj = this;
    this.sPlayer.name = this.name;
    this.playerGroup.add(this.sPlayer);

    this.setName();

    return this;
  }

  // 设置玩家名称
  setName() {
    const playerName = this.game.add.text(
      -30,
      -23,
      this.name,
      {
        font: '6mm',
      });
    playerName.angle = 90;
    playerName.fill = 'blue';
    this.sPlayer.addChild(playerName);
  }

  isTeammates(playerObj) {
    // 判断是否是队友
    return this.camp === playerObj.camp;
  }
}
