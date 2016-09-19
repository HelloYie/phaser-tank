import { names } from 'constant';
const utils = {
  plainId(id) {
    return id.slice(2);
  },

  randomUserName(){
    return names[Math.floor(Math.random() * names.length)];
  },

};
export default utils;
