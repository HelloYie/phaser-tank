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
    self.land = self.game.add.tileSprite(0, 0, 1000, 1000, self.key);
    self.createStone();
    return self;
  }

  createStone() {
    const self = this;
    self.stones = self.game.add.sprite(100, 100, self.stoneKey);
    self.stone = self.game.add.sprite(20, 20, self.stoneKey);
    self.stones.addChild(self.stone);
    this.game.physics.enable(this.stones, Phaser.Physics.ARCADE);
    self.stone.body.immovable = true;
    return self;
  }

  checkOverlap(player) {
    const self = this;
    self.game.physics.arcade.collide(player, self.stone);
    return self;
  }
}
