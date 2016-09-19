/**
 * @summary
 *  地图类
 */

export default class Map {
  constructor(game, key, stoneKey, brickKey) {
    const self = this;
    self.game = game;
    self.key = key;
    self.stoneKey = stoneKey;
    self.brickKey = brickKey;
    return self.init();
  }

  init() {
    const self = this;
    self.land = self.game.add.tileSprite(0, 0, self.game.width, self.game.height, self.key);
    self.land.fixedToCamera = true;
    self.createStone();
    return self;
  }

  createStone() {
    const self = this;
    self.stone = self.game.add.sprite(100, 100, self.stoneKey);
    this.game.physics.enable(this.stone, Phaser.Physics.ARCADE);
    self.stone.body.immovable = true;
    return self;
  }

  checkOverlap(player) {
    const self = this;
    self.game.physics.arcade.collide(player, self.stone);
    return self;
  }
}
