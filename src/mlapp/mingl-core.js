import '../extension/jsExtension.js';
import MlApp from './mlapp.js';
import MlAppExtension from '../extension/mlappExtension.js';
import vueExt from '../extension/vueExtension.js';
import filter from '../filter/vueFilter.js';

import Go from '../utils/go.js';
import msg from '../utils/msg.js';
import identity from '../utils/identity.js';

//

class MinglLoader {
  constructor() {}
  install = (Vue, dependencies, dependencyComponents) => {
    if (dependencies) {
      for (let i = 0; i < dependencies.length; i++) {
        const depend = dependencies[i];
        Vue.use(depend);
      }
    }

    if (dependencyComponents) {
      for (let i = 0; i < dependencyComponents.length; i++) {
        const component = dependencyComponents[i];
        if (!component.name) {
          console.error('未设置名称', component);
        }
        Vue.component(component.name, component);
      }
    }
  };
}
class MinglCore {
  vue = null;
  #pluginsConfig = {};
  $ml = null;
  $global = null;
  constructor() {}

  installPlugin(name, plugin, defaultInstallers, Vue) {
    let pluginConfig = this.$ml.getPluginConfig(name);
    let installers = pluginConfig.installers || defaultInstallers;
    let obj = new plugin(pluginConfig.configHandler, Vue);

    for (let i = 0; i < installers.length; i++) {
      const installer = installers[i];
      if (typeof installer == 'object' && installer.installer) {
        let sobj = new plugin(
          installer.configHander || pluginConfig.configHandler,
          Vue
        );
        sobj.install(installer);

        // plugin(
        //   installer.installer,
        //   installer.configHander || pluginConfig.configHandler
        // );
      } else {
        obj.install(installer);
        // plugin(installer, pluginConfig.configHandler);
      }
    }
  }
  install(Vue, handler, global) {
    this.vue = Vue;
    if (global) {
      this.$global = global;
    }
    this.$ml = new MlApp(this.$global);
    let mlapp = this.$ml;
    Vue.prototype.$ml = mlapp;
    handler && handler(mlapp, mlapp.config);
    Vue.prototype.$lang = mlapp.getCache('_lang');
    vueExt(Vue, mlapp);
    filter(Vue, mlapp);

    //初始化基础功能
    this.installPlugin('ml-msg', msg, [Vue, mlapp]);
    this.installPlugin('ml-go', Go, [Vue, mlapp]);
    this.installPlugin('ml-identity', identity, [Vue, mlapp], Vue);
  }
  load(dependencies, dependencyComponents) {
    new MinglLoader().install(this.vue, dependencies, dependencyComponents);
  }
}

MlApp.use(new MlAppExtension());
let minglCore = new MinglCore();

export default minglCore;
