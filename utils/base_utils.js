import { names } from 'constant';

const utils = {
  randomUserName() {
    return names[Math.floor(Math.random() * names.length)];
  },
};
export default utils;
