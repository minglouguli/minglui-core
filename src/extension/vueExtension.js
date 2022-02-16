export default function (Vue, mlapp) {
  Vue.prototype.$setTimeout = function (handler, timeout) {
    let timer = setTimeout(handler, timeout);
    this.$once('hook:beforeDestroy', () => {
      clearTimeout(timer);
      timer = null;
    });
  };
  Vue.prototype.$setInterval = function (handler, timeout) {
    let timer = setInterval(handler, timeout);
    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer);
      timer = null;
    });
  };
  Vue.prototype.$beforeDestroy = function (handler) {
    this.$once('hook:beforeDestroy', () => {
      handler();
    });
  };
  // Vue.filter('debounce', function(fun, delay, immediate) {
  //   return mlapp.debounce(fun, delay, immediate);
  // });
}
