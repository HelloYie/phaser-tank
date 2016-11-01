import { names } from 'constant';

const utils = {
  randomUserName() {
    return names[Math.floor(Math.random() * names.length)];
  },
  // 换子弹后以前存放子弹的数组要更新
  updateWeaponGroupList(weaponsGroupList, player) {
    weaponsGroupList.forEach((weaponGroup, index) => {
      const ownerId = weaponGroup.children[0].bullet.owner.id;
      if (player.id === ownerId) {
        weaponsGroupList[index] = player.weapon.group;
      }
    });
  },
};
export default utils;
