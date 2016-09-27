/*
 * 游戏图片在房间预加载
 */

import tankPng from '../assets/tank/tank-1.png';
import enemyPng from '../assets/tank/tank-2.png';
import bulletPng from '../assets/tank/bullet.png';
import earthPng from '../assets/tank/scorched_earth.png';
import compassRosePng from '../assets/tank/compass_rose.png';
import touchSegmentPng from '../assets/tank/touch_segment.png';
import touchPng from '../assets/tank/touch.png';
import attackPng from '../assets/tank/attack.png';
import explosionPng from '../assets/tank/explosion.png';
import explosionBrickPng from '../assets/tank/brick-explosion.png';
import stonePng from '../assets/tank/stone.png';
import brickPng from '../assets/tank/brick.png';
import grossPng from '../assets/tank/gross.png';
import bossTopPng from '../assets/tank/boss-top.png';
import bossBottomPng from '../assets/tank/boss-bottom.png';


const images = [
  tankPng, enemyPng, bulletPng,
  earthPng, compassRosePng, touchSegmentPng,
  attackPng, touchPng, explosionPng,
  explosionBrickPng, stonePng, brickPng,
  grossPng, bossTopPng, bossBottomPng,
];

class ImagePreLoader {
  constructor(onload) {
    this.onload = onload || function () {};
    images.forEach((img) => {
      const image = new Image();
      image.src = img;
    });
    window.onload = this.onload;
  }
}

export {
  ImagePreLoader,
  images,
};
