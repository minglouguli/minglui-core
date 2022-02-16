import MlR from './mlr.js';

class MlApp {
  //属性
  config = {
    enableLog: true
  };
  env = {
    device: '', //pc  mobile
    platForm: '', //web  h5  app  wechat min  desktop
    os: '', //win10 android  ios
    isDev: true
  };
  #privateCache = {};
  #hash = {};
  #privateEvents = {};
  #pluginsConfig = {};
  #lockQueue = {};
  #stackQueue = {};
  #global = {};
  constructor(global) {
    if (!global) {
      global = typeof window != 'undefined' ? window : global;
    }
    this.setGlobal(global);
  }

  //======基本方法
  log(...arg) {
    console.log(...arg);
  }
  token(pre, str, len) {
    var token = ''; //订单号
    for (var i = 0; i < 6; i++) {
      ////6位随机数，用以加在时间戳后面。
      token += Math.floor(Math.random() * 10);
    }
    var tstr = new Date().getTime() + '';
    if (len) {
      tstr = tstr.substr(4, 6);
    }
    return (pre || '') + tstr + (str || '') + token;
  }
  setGlobal(global) {
    this.#global = global;
  }
  setConfig(config) {
    this.config = Object.assign({}, this.config, config);
    return this;
  }

  //配置插件全局配置
  setPluginConfig(pluginName, config) {
    this.#pluginsConfig[pluginName] = config;
  }

  //获取插件全局配置
  getPluginConfig(pluginName) {
    return this.#pluginsConfig[pluginName] || {};
  }

  setData(key, obj) {
    this.setCache(key, obj);
  }
  getData(key) {
    return this.getCache(key) || {};
  }
  updateData(key, obj) {
    this.setCache(key, Object.assign({}, this.getData(key), obj));
  }

  //存储
  setCache(key, value, seconds, sleep) {
    this.#privateCache[key] = {
      active: true,
      value: value
    };
    if (seconds) {
      let ti = setTimeout(() => {
        if (Object.hasOwnProperty.call(this.#privateCache, key)) {
          if (sleep) {
            this.#privateCache[key].active = false;
          } else {
            delete this.#privateCache[key];
          }
        }
        clearTimeout(ti);
      }, seconds * 1000);
    }
  }
  getCache(key, useSleep) {
    let obj = this.#privateCache[key];
    if (obj) {
      if (!useSleep && !obj.active) {
        return null;
      } else {
        return obj.value;
      }
    } else {
      return null;
    }
  }

  delCache(key) {
    if (Object.hasOwnProperty.call(this.#privateCache, key)) {
      delete this.#privateCache[key];
    }
  }

  /**
   *保存hash
   *
   * @param {*} key
   * @param {*} field
   * @param {*} value
   * @param {*} seconds 缓存时长，不设置或0表示持久
   * @param {*} sleep 是否启动睡眠模式，是 则缓存过期后变成睡眠状态，而不是清除缓存
   * @memberof MlApp
   */
  setHash(key, field, value, seconds, sleep) {
    if (!this.#hash[key]) {
      this.#hash[key] = {};
    }
    this.#hash[key][field] = {
      active: true,
      value: value
    };
    if (seconds) {
      let ti = setTimeout(() => {
        if (
          this.#hash[key] &&
          Object.hasOwnProperty.call(this.#hash[key], field)
        ) {
          if (sleep) {
            this.#hash[key][field].active = false;
          } else {
            delete this.#hash[key][field];
          }
        }
        clearTimeout(ti);
      }, seconds * 1000);
    }
  }

  /**
   * 获取hash
   *
   * @param {*} key
   * @param {*} field
   * @param {*} useSleep 如果数据处于睡眠状态，则获取睡眠状态的数据，否则如果没有活跃的数据将返回null
   * @memberof MlApp
   */
  getHash(key, field, useSleep) {
    if (field) {
      if (this.#hash[key]) {
        let hash = this.#hash[key][field];

        if (hash) {
          if (!useSleep && !hash.active) {
            return null;
          } else {
            return hash.value;
          }
        }
      }
      return null;
    } else {
      return this.#hash[key] || null;
    }
  }

  delHash(key, field) {
    if (Object.hasOwnProperty.call(this.#hash, key)) {
      if (field) {
        if (
          this.#hash[key] &&
          Object.hasOwnProperty.call(this.#hash[key], field)
        ) {
          delete this.#hash[key][field];
        }
      } else {
        delete this.#hash[key];
      }
    }
  }

  setStore(key, value) {
    this.#global.localStorage.setItem(key, value);
  }
  getStore(key) {
    return this.#global.localStorage.getItem(key);
  }
  delStore(key) {
    this.#global.localStorage.removeItem(key);
  }

  async lock(name) {
    if (!this.#lockQueue[name]) {
      this.#lockQueue[name] = {
        queue: [],
        isLock: false
      };
    }
  }

  async queue(name, fun) {
    if (!this.#stackQueue[name]) {
      this.#stackQueue[name] = {
        queue: [],
        using: false
      };
    }

    let obj = this.#stackQueue[name];
    obj.queue.push(fun);
    await this.runQueue(name, obj);
  }

  async runQueue(name, queueObj) {
    if (!queueObj.using) {
      queueObj.using = true;
      let activeFun = queueObj.queue.shift();
      if (activeFun) {
        await activeFun();
        queueObj.using = false;
        this.runQueue(name, queueObj);
      } else {
        //队列走完了
        queueObj.using = false;
        //释放队列
        delete this.#stackQueue[name];
      }
    }
  }

  setLang(langName, lang) {
    //todo 通过设置加载语言；
    this.setStore('_lang', langName);
    this.setCache('_lang', lang);
  }

  getLang() {
    //todo 通过设置加载语言；
    return this.getCache('_lang');
  }

  //====事件
  on(eventName, fun) {
    eventName = 'ml-' + eventName;
    if (!this.#privateEvents[eventName]) {
      this.#privateEvents[eventName] = [];
    }
    this.#privateEvents[eventName].push(fun);
  }

  off(eventName) {
    eventName = 'ml-' + eventName;
    this.#privateEvents[eventName] = [];
  }
  trigger(eventName, eventoptions) {
    eventName = 'ml-' + eventName;
    let events = this.#privateEvents[eventName] || [];
    if (events.length > 0) {
      for (let i = 0; i < events.length; i++) {
        const e = events[i];
        e(eventoptions);
      }
    }
  }

  //其他方法
  objToList(obj, fun) {
    let list = [];
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        list.push(fun(key, element));
      }
    }
  }

  listToDic(list, key, value) {
    key = key || 'key';
    value = value || 'value';
    let length = list.length;
    let dic = {};
    for (let i = 0; i < length; i++) {
      let item = list[i];
      dic[item[key]] = item[value];
    }
    return dic || {};
  }
  getQueryString = function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = this.#global.location.search.substr(1).match(reg);
    if (r !== null) {
      return unescape(r[2]);
    }
    return null;
  };
  MlR() {
    return MlR;
  }
}

MlApp.use = function (plugin, ...args) {
  plugin.install && plugin.install(MlApp, ...args);
};

export default MlApp;
