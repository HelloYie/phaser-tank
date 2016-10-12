class Bullet {
  constructor(game, key, player, power) {
    this.game = game;
    this.key = key;
    this.power = power;
    this.sBullet = game.add.sprite(0, 0, key);
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
    this.sBullet.reset(owner.x, owner.y);
    this.sBullet.scale.set(1);
    this.game.physics.arcade.velocityFromAngle(
      owner.angle,
      speed,
      this.sBullet.body.velocity
    );
    this.sBullet.angle = owner.angle + 90;
    this.sBullet.body.gravity.set(gx, gy);
  }
}


export class Weapon {
  constructor(game, key, power) {
    this.game = game;
    this.key = key;
    this.power = power;
    this.nextFire = 0;
    this.group = this.game.add.group(
      this.game.world,
      'weapon group',
      false,
      true,
      Phaser.Physics.ARCADE
    );
    this.setBullet = (player) => {
      for (let i = 0; i < 50; i++) {
        this.group.add(new Bullet(game, this.key, player, power).sBullet, true);
      }
    };
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
  constructor(game) {
    super(game, 'bullet', 1);
    this.bulletSpeed = 600;
    this.fireRate = 300;
  }
}

// 激光弹
export class BeamBulletWeapon extends Weapon {
  constructor(game) {
    super(game, 'bulletLaser', 2);
    this.bulletSpeed = 600;
    this.fireRate = 600;
  }
}

// 转弯弹
export class SprialBulletWeapon extends Weapon {
  constructor(game) {
    super(game, 'bulletSprial', 1);
    this.bulletSpeed = 300;
    this.fireRate = 600;
  }
}
