class MinglIdentity {
  #claims = {};
  #user = {};
  #isAuthenticated = false;
  #authenticateHandler = null;
  #signInHandler = null;
  #signOutHandler = null;
  #refreshHandler = null;
  #startHandler = null;
  #config = {
    onStart: f => {
      this.#startHandler = f;
    },
    onAuthenticate: f => {
      this.#authenticateHandler = f;
    },
    onSignIn: f => {
      this.#signInHandler = f;
    },
    onSignOut: f => {
      this.#signOutHandler = f;
    },
    onRefresh: f => {
      this.#refreshHandler = f;
    }
  };
  #identity = null;
  accessToken = '';

  constructor(handler, Vue) {
    handler && handler(this.#config);
    let user = { name: '' };
    this.#user = (Vue.observable && Vue.observable(user)) || user;
    this.#identity = (Vue.observable && Vue.observable(this)) || this;
    this.start(this);
  }
  get user() {
    return this.#user;
  }
  get isAuthenticated() {
    return this.#isAuthenticated;
  }
  clear() {
    this.#isAuthenticated = false;
    this.#claims = {};
    for (const key in this.#user) {
      if (Object.hasOwnProperty.call(this.#user, key)) {
        this.#user[key] = '';
      }
    }
  }
  setUserInfo(user) {
    this.#isAuthenticated = true;
    if (user) {
      if (typeof user == 'function') {
        user(this.#user);
      } else if (typeof user == 'object') {
        // console.log('uuu', user);
        for (const key in user) {
          if (Object.hasOwnProperty.call(user, key)) {
            const element = user[key];
            this.#user[key] = element;
          }
        }
      }
    }
  }
  setAccessToken(accessToken) {
    this.#isAuthenticated = true;
    this.accessToken = accessToken;
  }

  async start(...args) {
    if (this.#startHandler) {
      return await this.#startHandler(this, ...args);
    }
  }
  async signIn(...args) {
    this.#isAuthenticated = true;
    if (this.#signInHandler) {
      return await this.#signInHandler(this, ...args);
    }
  }
  async signOut(...args) {
    this.clear();
    if (this.#signOutHandler) {
      return await this.#signOutHandler(this, ...args);
    }
  }

  async authenticate(...args) {
    //  console.info('authenticateHandler', this.#authenticateHandler);
    if (this.#authenticateHandler) {
      return await this.#authenticateHandler(this, ...args);
    }
    return true;
  }
  async refresh(...args) {
    if (this.#refreshHandler) {
      return await this.#refreshHandler(this, ...args);
    }
  }
  install(ObjClass) {
    let _ = this;
    if (typeof ObjClass == 'object') {
      ObjClass.$identity = this.#identity;
    } else {
      Object.defineProperty(ObjClass.prototype, '$identity', {
        get: function () {
          return _.#identity;
        },
        set(v) {
          return v;
        }
      });
    }

    // Vue.prototype.$identity = new Proxy(identity, {
    //   get(obj, prop) {
    //     let v = prop in obj ? obj[prop] : null;
    //     console.log('getpro', prop, v);
    //     return v;
    //   },
    //   set(obj, prop, value) {
    //     if (prop in obj) {
    //       console.log('setpro', prop, value);
    //       obj[prop] = value;
    //       return true;
    //     }
    //     return false;
    //   },
    // });
  }
  addClaim(key, value) {
    this.#claims[key] = value;
  }
  getClaim(key) {
    return this.#claims[key];
  }
}

export default MinglIdentity;
