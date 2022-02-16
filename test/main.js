import Vue from './vue.js';
import App from './app.js';
import { MlCore } from '../src/index.js';

Vue.use(
  MlCore,
  mlapp => {
    mlapp.setPluginConfig('ml-go', {
      installers: [Vue, mlapp],
      configHandler: conf => {
        conf.options.timeout = 10000;

        //添加拦截器
        conf.setInterceptors(interceptors => {
          interceptors.response.use(
            response => {
              return response;
            },
            error => {
              return Promise.reject(error);
            }
          );
        });

        // 添加预请求
        conf
          .setUrl(
            [
              { key: '@test', value: '/api/test/getDate' },
              { key: 'test2', value: '/api/test/getDate' },
              ['@test3', '/api/test/getdata']
            ],
            'test'
          )
          .setUrl('test4', '/api/test/getDate', 'test')
          .setUrl('test5', '/api/test/getDate');

        conf.event.default = {
          // 发送前
          before(config) {
            let accessToken = this.$identity.accessToken || '';
            if (accessToken) {
              config.headers['Authorization'] = accessToken;
            }
          },
          //请求成功
          success(data) {},
          //请求失败
          error(msg, code) {
            if (code == 401) {
              // 未登录
              console.info('需要登陆访问');
              // router.push({ name: 'Login' });
            } else if (code == 403) {
              ///权限不足
            }
            // this.$router.push({ name: 'Login' });
          }
        };

        conf.event.test = {
          before(config) {
            if (config.urlObj.key == '@test') {
              return {
                isSuccess: true,
                data: {
                  list: [1]
                },
                code: 1,
                message: 'success'
              };

              // return {
              //   list: []
              // };
            }
          },
          //请求成功
          success(data) {},
          //请求失败
          error(msg, code) {
            if (code == 401) {
              // 未登录
              // this.$router.push({ name: 'Login' });
              return false;
            } else if (code == 403) {
              ///权限不足
            }
          }
        };
      }
    });

    mlapp.setPluginConfig('ml-identity', {
      installers: [Vue, mlapp],
      configHandler: conf => {
        let timer = null;
        conf.onStart(identity => {
          timer = setInterval(() => {
            identity.refresh();
          }, 600000);
        });
        conf.onSignIn((identity, accessToken) => {
          identity.setAccessToken(accessToken);
          mlapp.setStore('mlaccessToken', accessToken);
        });
        conf.onSignOut(identity => {
          if (timer) {
            clearInterval(timer);
          }
          mlapp.delStore('mlaccessToken');
        });
        conf.onRefresh(identity => {
          if (identity.isAuthenticated) {
            mlapp.$go('/api/auth/refreshAccessToken').success(data => {
              if (data.accessToken) {
                identity.setAccessToken(data.accessToken);
                mlapp.setStore('mlaccessToken', accessToken);
              }
            });
          }
        });
        conf.onAuthenticate(async (identity, pageObj) => {
          if (!identity.isAuthenticated) {
            //如果检查到用户没有登录，则进行服务端检查用户是否有登录以及权限；
            var res = await MlCore.$ml.$go('/api/auth/Authenticate', pageObj);
            if (res.data.data.isAuthenticated) {
              identity.signIn(res.data);
            }
          }
          return identity.isAuthenticated;
        });
      }
    });

    mlapp.setPluginConfig('ml-msg', {
      configHandler: conf => {
        conf.setMsg((_, options) => {
          if (config.type === 1) {
            _.$notify({
              title: '成功',
              message: config.msg,
              type: 'success'
            });
          } else if (config.type === 2) {
            _.$notify.error({
              title: '错误',
              message: config.msg
            });
          } else {
            _.$notify.info({
              message: config.msg
            });
          }
        });
      }
    });
  },
  window
);

window.document.body.insertAdjacentHTML('beforeend', '<div id="app"></div>');

new Vue({
  render: h => {
    return h(App);
  }
}).$mount('#app');
