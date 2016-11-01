/**
 * 处理道具事件
 */

export default {
  onAddEquipment: function x(data) {
    this.equipments.create(data.key, data.x, data.y);
  },
};
