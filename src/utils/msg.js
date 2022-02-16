class MLMsg {
  #msgHandler = null;
  #config = {
    options: {
      msg: '',
      type: 0 //0:default; 1:success;  2:error
    },
    setMsg: f => {
      this.#msgHandler = f;
    }
  };
  constructor(configHandler) {
    configHandler && configHandler(this.#config);
  }
  #msg(target, msg, options) {
    let opt = {
      ...this.#config.options,
      ...options,
      msg: msg
    };
    this.#msgHandler && this.#msgHandler(target, opt);
  }
  install(ObjClass) {
    let _ = this;
    let target = null;
    if (typeof ObjClass == 'object') {
      target = ObjClass;
    } else {
      target = ObjClass.prototype;
    }

    target.$msg = this.#msg;
    target.$successMsg = function (msg) {
      let _target = this;
      _.#msg(_target, msg, { type: 1 });
    };
    target.$errorMsg = function (msg) {
      let _target = this;
      _.#msg(_target, msg, { type: 2 });
    };
  }
}

export default MLMsg;
