const utils = {

  serverId(id) {
    // 服务器端ID需加上 /#
    if (id.search('/#') !== 0){
      return `/#${id}`;
    }
    return id;
  },

};

module.exports = utils;
