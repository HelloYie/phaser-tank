import { names } from 'constant';

const utils = {
  clientId(id) {
    // 客户端ID开头没有 /#
    if (id.search('/#') === 0){
      return id.slice(2);
    }
    return id;
  },

  createSocketId(id) {
    return `/#${id}`;
  },

  randomUserName() {
    return names[Math.floor(Math.random() * names.length)];
  },

};
export default utils;
