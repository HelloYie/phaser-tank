class Bullet {
  constructor(game, key, player, power) {
    this.game = game;
    this.key = key;
    this.power = power;
    this.sBullet = game.add.sprite(0, 0, key);
    this.game.physics.enable(this.sBullet, Phaser.Physics.ARCADE);
    this.sBullet.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.sBullet.anchor.set(0.5);

    this.sBullet.checkWorldBounds = true;
    this.sBullet.outOfBoundsKill = true;
    this.sBullet.exists = false;

    this.sBullet.tracking = false;
    this.sBullet.scaleSpeed = 0;
    this.sBullet.bullet = this;
    this.owner = player;
  }

  fire(speed, gx = 0, gy = 0) {
    const owner = this.owner.sPlayer;
    this.speed = speed;
    let x = 0;
    let y = 0;
    switch (owner.angle) {
      case 90:
        y = 10;
        break;
      case -90:
        y = -10;
        break;
      case 0:
        x = 10;
        break;
      case -180:
        x = -10;
        break;
      default:
        break;
    }
    this.sBullet.reset(owner.x + x, owner.y + y);
    this.sBullet.scale.set(1);
    this.game.physics.arcade.velocityFromAngle(
      owner.angle,
      speed,
      this.sBullet.body.velocity
    );
    this.sBullet.body.gravity.set(gx, gy);
  }
}


export class Weapon {
  constructor(game, key, player, power) {
    this.game = game;
    this.key = key;
    this.power = power;
    this.nextFire = 0;
    this.group = this.game.add.group(
      this.game.world,
      'weapon group'
    );
    for (let i = 0; i < 20; i++) {
      this.group.add(new Bullet(game, this.key, player, power).sBullet, true);
    }
  }

  fire() {
    if (this.game.time.time < this.nextFire) {
      return;
    }
    this.sBullet = this.group.getFirstDead(false) || this.group.getFirstExists(false);
    this.sBullet.bullet.power = this.power;
    this.sBullet.revive();
    this.sBullet.bullet.fire(
      this.bulletSpeed,
      0,
      0,
    );
    this.nextFire = this.game.time.time + this.fireRate;
  }
}

// 普通弹
export class SingleBulletWeapon extends Weapon {
  constructor(game, player) {
    super(game, 'bullet', player, 1);
    this.bulletSpeed = 600;
    this.fireRate = 300;
  }
}

// 激光弹(vertical)
export class BeamBulletWeaponVtc extends Weapon {
  constructor(game, player) {
    super(game, 'bulletBeam', player, 2);
    this.bulletSpeed = 600;
    this.fireRate = 600;
  }
}

// 激光弹(horizen）
export class BeamBulletWeaponHrz extends Weapon {
  constructor(game, player) {
    super(game, 'bulletBeamHrz', player, 2);
    this.bulletSpeed = 600;
    this.fireRate = 600;
  }
}
// 转弯弹
export class SprialBulletWeapon extends Weapon {
  constructor(game, player) {
    super(game, 'bulletSprial', player, 1);
    this.bulletSpeed = 300;
    this.fireRate = 600;
  }
}
