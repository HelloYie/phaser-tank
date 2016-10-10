/**
 * 处理道具事件
 */

export default {
  onAddEquipment: function x(data) {
    const self = this;
    // 新增道具时，地图上最多保留3个道具
    self.equipments.add(data.key, data.x, data.y);
    const equipmentSprites = self.equipments.group.children;
    equipmentSprites.forEach((equipment, index) => {
      if (index < equipmentSprites.length - 3) {
        self.equipments.group.remove(equipment);
      }
    });
  },
};
