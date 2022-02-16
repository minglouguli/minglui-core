import axios from 'axios';

class ResPromise extends Promise {
  success(h) {
    let _ = this;
    return _.then(res => {
      let result = res.data || {};
      if (result.isSuccess === true) {
        return Promise.resolve(
          h(result.data, result.message, result.code, res)
        );
      } else {
        return Promise.resolve(h(result, '响应成功', 1, res));
      }
    });
  }
  error(h) {
    let _ = this;
    return _.catch(res => {
      let result = res.data || {};
      if (result.isSuccess === false) {
        return Promise.resolve(
          h(result.message, result.code, result.data, res)
        ); // new ResPromise((r, e) => e('exxxx'));
      } else {
        return Promise.resolve(h(res.message, 500, null, res));
      }
    });
  }
}

class Go {
  __interceptors = null;
  __urls = {};
  _httpConfig = {
    options: {
      timeout: 20000
    },
    setUrl: (key, url, group) => {
      let __urls = this.__urls;
      if (Array.isArray(key)) {
        for (let i = 0; i < key.length; i++) {
          const item = key[i];
          if (Array.isArray(item)) {
            if (item[0][0] != '@') {
              item[0] = '@' + item[0];
            }
            __urls[item[0]] = { url: item[1], group: url };
          } else {
            if (item.key[0] != '@') {
              item.key = '@' + item.key;
            }
            __urls[item.key] = { url: item.value, group: url };
          }
        }
      } else {
        if (key[0] != '@') {
          key = '@' + key;
        }
        __urls[key] = { url: url, group: group };
      }

      return this._httpConfig;
    },
    event: {
      default: {
        before: null,
        success: null,
        error: null
      }
    },
    setInterceptors: handler => {
      this.__interceptors = handler;
    }
  };
  #instance = null;
  constructor(httpConfigHandler) {
    httpConfigHandler && httpConfigHandler(this._httpConfig);
    this.#instance = axios.create(this._httpConfig.options);
    this.__interceptors && this.__interceptors(this.#instance.interceptors);
  }
  install(ObjClass) {
    let $go = this;
    let target = null;
    if (typeof ObjClass == 'object') {
      target = ObjClass;
    } else {
      target = ObjClass.prototype;
    }
    target.$go = function (url, data, config, options) {
      let _ = this;
      let opt = null;
      let conf = null;
      if (typeof url === 'string') {
        opt = {
          url: url,
          data: data,
          ...options
        };
        conf = config;
      } else {
        opt = url; // { ...url, ...options };
        conf = data; // { ...data, ...config };
      }
      return $go._go(_, opt, conf);
    };
    target.$go.get = function (url, data, config) {
      return this.$go(url, data, { ...config, ...{ method: 'get' } });
    };
    target.$go.msg = function (url, data, config) {
      return this.$go(url, data, config, { showMsg: true });
    };
    target.$go_get = function (url, data, config) {
      return this.$go(url, data, { ...config, ...{ method: 'get' } });
    };
    target.$go_msg = function (url, data, config) {
      return this.$go(url, data, config, { showMsg: true });
    };

    target.$axios = this._go2;
  }
  _go(target, options, config) {
    let $go = this;
    let _ = target;
    let __urls = $go.__urls;
    let _httpConfig = $go._httpConfig;

    let opt = {
      ...{
        url: '',
        data: null,
        before: null,
        success: null,
        error: null,
        complete: null,
        showMsg: null,
        showMsgType: 0b01
      },
      ...options
    };

    if (opt.showMsgType == 0b01) {
      if (opt.showMsg === true) {
        opt.showMsgType = 0b11;
      } else if (opt.showMsg === false) {
        opt.showMsgType = 0b00;
      }
    }

    config = config || {};

    let url = opt.url || config.url;
    let data = opt.data || config.data;

    let urlObj = {
      key: '',
      url: url,
      group: ''
    };

    if (url && url[0] == '@' && __urls[url]) {
      urlObj.key = url;
      urlObj.url = __urls[url].url;
      urlObj.group = __urls[url].group;
      url = urlObj.url;
    }

    let _conf = Object.assign(
      {},
      {
        url: url,
        data: data,
        method: 'post',
        urlObj: urlObj
      },
      config
    );

    return new ResPromise((r, e) => {
      let glEvent = _httpConfig.event[urlObj.group || 'default'] || {};
      try {
        let beforeR = opt.before && opt.before.call(_, _conf);
        if (beforeR !== false) {
          beforeR = glEvent.before && glEvent.before.call(_, _conf);
        }
        let request = $go.#instance;
        if (beforeR) {
          request = function (url, rconf) {
            return new Promise((_r, _e) => {
              try {
                _r({
                  data: beforeR,
                  config: rconf,
                  request: {},
                  response: { status: 200 }
                });
              } catch (error) {
                _e(error);
              }
            });
          };
        }

        request(url, _conf)
          .then(res => {
            let result = res.data;
            // result.origin = res;
            if (result.isSuccess === true) {
              if (((opt.showMsgType >> 1) & 1) === 1) {
                _.$successMsg && _.$successMsg(res.data.message);
              }
              opt.success &&
                opt.success.call(_, result.data, result.msg, result.code, res);
              r(res);
            } else if (res.data.isSuccess === false) {
              if (((opt.showMsgType >> 0) & 1) === 1) {
                _.$errorMsg && _.$errorMsg(result.message);
              }

              let gcr =
                glEvent.error &&
                glEvent.error.call(
                  _,
                  result.msg,
                  result.code,
                  result.data,
                  res
                );

              if (gcr !== false) {
                opt.error &&
                  opt.error.call(_, result.msg, result.code, result.data, res);
                e(res);
              }
            } else {
              opt.success && opt.success.call(_, result, '响应成功', 1, res);
              r(res);
            }
          })
          .catch(ex => {
            let status = 500;
            let data = null;
            let msg = ex.message;
            if (ex.response) {
              status = ex.response.status;
              let rdata = ex.response.data;
              if (rdata) {
                if (rdata.isSuccess === false) {
                  data = rdata.data;
                  msg = rdata.message;
                } else {
                  data = rdata;
                }
              }
            }

            if (((opt.showMsgType >> 0) & 1) === 1) {
              _.$errorMsg && _.$errorMsg(msg);
            }

            let gcr =
              glEvent.error && glEvent.error.call(_, msg, status, data, ex);

            if (gcr !== false) {
              opt.error && opt.error.call(_, msg, status, data, ex);
              e(ex);
            }
          });
      } catch (ex) {
        if (((opt.showMsgType >> 0) & 1) === 1) {
          _.$errorMsg && _.$errorMsg(ex.message);
        }
        let gcr =
          glEvent.error && glEvent.error.call(_, ex.message, 500, null, ex);

        if (gcr !== false) {
          opt.error && opt.error.call(_, ex.message, 500, null, ex);
          e(ex);
        }
        console.error(ex);
      }
    });
  }
  _go2(url, data, config) {
    let _conf = Object.assign(
      {},
      {
        data: data,
        method: 'post'
      },
      config
    );

    var pro = this.#instance(url, _conf);
    return pro;
  }
}

export default Go;
