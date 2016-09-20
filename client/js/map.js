/**
 * @summary
 *  地图类
 */

export default class Map {
  constructor(game, key) {
    const self = this;
    self.game = game;
    self.key = key;
    self.mapCollideSprites = [];
    return self.init();
  }

  init() {
    const self = this;
    self.land = self.game.add.tileSprite(0, 0, 1200, 900, self.key);
    self.map = self.game.add.tilemap('map');
    self.map.addTilesetImage('brick', 'brick');
    self.map.addTilesetImage('stone', 'stone');
    self.map.addTilesetImage('gross', 'gross');
    self.map.setCollisionBetween(1, 2);
    self.layer = self.map.createLayer('map');
    self.layer.resizeWorld();

    return self;
  }

  checkCollide(player) {
    const self = this;
    self.game.physics.arcade.collide(player, self.layer);
    return self;
  }
}
