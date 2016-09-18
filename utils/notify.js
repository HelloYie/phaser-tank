import 'notification-js/build/notification.min.css';
import notification from  'notification-js';

const notify = {
  success(msg){
    notification.notify('success', msg, {
      autoHide: true,
    });
  },

  error(msg){
    notification.notify('error', msg, {
      autoHide: true,
    });
  },

  warning(msg){
    notification.notify('warning', msg, {
      autoHide: true,
    });
  },

  default(msg){
    notification.notify('default', msg, {
      autoHide: true,
    });
  },

  info(msg){
    notification.notify('info', msg, {
      autoHide: true,
    });
  },
};
export default notify;
