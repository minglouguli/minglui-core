class Vue {
  options = null;
  constructor(options) {
    let opt = {
      template: '',
      data: null,
      render: null,
      run: () => {},
      content: null,
      ...options
    };
    opt.render =
      (opt.render && opt.render) ||
      function (h) {
        return opt.template;
      };
    this.options = opt;
    if (this.options.template) {
      window.document.body.insertAdjacentHTML(
        'beforeend',
        this.options.template
      );
    }
    if (this.options.render) {
      let $vue = this.options.render(vueObj => {
        this.createElement(vueObj);
      });
    }
  }
  data = {};
  $el = null;
  $parent = null;
  __vue = null;
  createElement(vue, opt) {
    console.log('=========', this);
    let $element = null;
    vue.render = null;
    if (vue.render) {
      let childVue = new Vue({
        render: opt.render
      });
    } else {
      let _element = document.createElement('div');
      _element.innerHTML = vue.template;
      $element = _element.childNodes[0];
    }

    let $vue = this;
    $vue.__vue = vue;
    $vue.$el = $element;
    $vue.data = vue.data && vue.data.call($vue);

    return $vue;
  }
  $create() {}
  $mount(target) {
    let $target = document.querySelector(target);
    if ($target && this.$el) {
      // $target.insertAdjacentHTML('beforeend', this.options.content);
      let $vue = this;
      $vue.$parent = $target;
      $vue.$parent.$el = $target.$el || $target;
      $vue.$parent.$el.append($vue.$el);
      $vue.__vue.script && $vue.__vue.script.call($vue);
    }
    this.options.run && this.options.run.call(this);
  }
}

Vue.use = function (plugin, ...args) {
  plugin.install && plugin.install(Vue, ...args);
};
Vue.filter = function () {};
Vue.directive = function () {};
Vue.mixin = function () {};

export default Vue;
