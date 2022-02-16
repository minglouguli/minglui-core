export default function (Vue, mlapp) {
  //filter
  Vue.filter('img', function (value) {
    if (value) {
      if (value.indexOf('://' < 0)) {
        value = mlapp.config.domainUrl + '/' + value;
      }
    }
    //console.log(value);
    return value; // || defaultImg;
  });

  Vue.filter('dateFormat', function (value, format) {
    // alert("1")
    if (!value) {
      return '';
    }
    if (typeof value == 'string') {
      return value.dateFormat(format);
    } else {
      return value.format(format);
    }
  });

  Vue.filter('toFixed', function (value, l) {
    if (typeof value != Number) {
      value = parseFloat(value);
    }
    value = value || 0;
    return value.toFixed(l);
  });

  Vue.filter('mgSubstring', function (value, begin, length, format) {
    begin = begin || 0;
    length = length || 10;
    format = format || '...';
    return value ? value.mgSubstring(0, length, format) : '';
  });

  Vue.filter('percent', function (value) {
    try {
      return (Math.round(value * 10000) / 100).toFixed(2) + '%';
    } catch {
      console.log('percent error:', value);
    }
  });

  Vue.filter('toTime', function (value) {
    try {
      if (value > 3600) {
        return new Date(value * 1000 + 3600000 * 12).mlformat('hh:mm:ss');
      } else {
        return new Date(value * 1000).mlformat('mm:ss');
      }
    } catch {
      console.log('toTime error:', value);
    }
  });

  Vue.filter('toSize', function (value) {
    try {
      if (value < 1024) {
        return value + 'B';
      } else if (value < 1024 * 1024) {
        return (value / 1024).toFixed(2) + 'KB';
      } else if (value < 1024 * 1024 * 1024) {
        return (value / 1024 / 1024).toFixed(2) + 'MB';
      } else if (value < 1024 * 1024 * 1024 * 1024) {
        return (value / 1024 / 1024 / 1024).toFixed(2) + 'GB';
      }
    } catch {
      console.log('toSize error:', value);
    }
  });

  Vue.filter('round', function (value, i) {
    try {
      if (value == null || value == undefined) {
        return '';
      }
      if (!i) {
        i = 2;
      }
      return value.toFixed(2);
    } catch {
      console.log('round error:', value, i);
    }
  });

  Vue.filter('nameCase', function (value, to) {
    if (value) {
      return value.nameCase(to);
    }
    return value;
  });

  Vue.filter('lower', function (value) {
    if (value) {
      return value.toLowerCase();
    }
    return value;
  });

  //======================directive==================================

  // Vue.directive('auth',{
  //    bind
  // });

  Vue.directive('myif', {
    bind(el, binding, vnode) {
      console.log('bind', [el], binding, vnode);
      return false;
      // if (binding.value) el.parentNode.removeChild(el);
    },
    inserted(el, binding, vnode) {
      console.log('inserted', [el], binding, vnode, this);
      el.__ml__ = {
        v_myif: binding.value,
        __comment__: document.createComment('')
      };
      if (!binding.value) el.parentNode.replaceChild(el.__ml__.__comment__, el);
    },
    update(el, binding, vnode, oldVnode) {
      if (binding.value != el.__ml__.v_myif) {
        el.__ml__.v_myif = binding.value;
        if (binding.value) {
          el.__ml__.__comment__.parentNode.replaceChild(
            el,
            el.__ml__.__comment__
          );
        } else {
          el.parentNode.replaceChild(el.__ml__.__comment__, el);
        }
      }
      // console.log('update', [el], binding, vnode, oldVnode);
    },
    componentUpdated(el, binding, vnode, oldVnode) {
      // console.log('componentUpdated', el, binding, vnode, oldVnode);
    },
    unbind(el, binding, vnode) {
      console.log('unbind', el, binding, vnode);
    }
  });

  Vue.mixin({
    methods: {
      $path(name, nameDes, pathDes) {
        var rpath = (this.$route && this.$route.name) || '';
        var npath = this.$options.name || '';
        var path = name;
        if (rpath && npath) {
          path = `${rpath}:${npath}|${name}`;
        }
        if (nameDes) {
          path += '#' + nameDes;
        }
        if (pathDes) {
          path += '|' + pathDes;
        }
        return path;
      }
    }
  });

  Vue.directive('auth', {
    async inserted(el, binding, vnode) {
      // console.log('inserted', [el], binding, vnode, this);

      if (binding.value) {
        let url = mlapp.getPluginConfig('ml-auth').url;
        if (url) {
          let cacheFlag = mlapp.getPluginConfig('ml-auth').cache == true;
          //Home:ml-user-list|userEditBtn
          let path = '';
          let name = '';
          let mPath = '';
          let des = '';
          let pathDes = '';
          let nameDes = '';
          //value:  路由:page主键|addBtn#地址页面说明|按键说明     or  addBtn#按键说明
          if (binding.value.indexOf('#') > -1) {
            let arr = binding.value.split('#');
            if (arr.length == 2) {
              mPath = arr[0];
              des = arr[1];
            }
          } else {
            mPath = binding.value;
          }

          if (mPath.indexOf('|') > -1) {
            let arr = binding.value.split('|');
            if (arr.length == 2) {
              path = arr[0];
              name = arr[1];
            }
          } else {
            name = mPath;
            //未配置页面，则自动获取路由页面
            var rpath =
              (vnode.context.$route && vnode.context.$route.name) || '';
            var npath = vnode.context.$options.name || '';

            if (rpath && npath) {
              path = `${rpath}:${npath}`;
            }
          }

          if (des.indexOf('|') > -1) {
            let arr = binding.value.split('|');
            if (arr.length == 2) {
              pathDes = arr[0];
              nameDes = arr[1];
            }
          } else {
            nameDes = des;
          }
          if (!nameDes) {
            //尝试取元素上的文字
            nameDes = el.innerText;
            nameDes = nameDes && nameDes.substring(0, 10);
          }

          //console.log('bbb', path, name, pathDes, nameDes);
          if (name) {
            let showFlag = false;
            el.__ml__ = {
              __auth_value__: binding.value,
              __comment__: document.createComment('')
            };

            el.parentNode &&
              el.parentNode.replaceChild(el.__ml__.__comment__, el);

            await mlapp.queue('_mlComponentsAuthQueue_' + path, async () => {
              let cacheOptions = mlapp.getHash('_mlComponentsAuth', path);
              if (!cacheOptions) {
                //如果不存在缓存数据，则进行远程请求数据；
                let handler =
                  mlapp.getPluginConfig('ml-auth').getOptionsHandler ||
                  async function (v, opt) {
                    return await v
                      .$go(opt.url, { path: opt.path })
                      .success(data => {
                        return data;
                      })
                      .error(msg => {
                        v.$errorMsg(msg);
                      });
                  };
                cacheOptions = await handler(mlapp, { path: path, url: url });
                if (cacheOptions && !cacheOptions.all) {
                  (mlapp.$errorMsg &&
                    mlapp.$errorMsg(
                      "响应数据格式有误，要求{isAllAuth:false,all:{'test':{isAuth:true}}}"
                    )) ||
                    console.error(
                      "响应数据格式有误，要求{isAllAuth:false,all:{'test':{isAuth:true}}}"
                    );
                }
                if (cacheFlag) {
                  mlapp.setHash('_mlComponentsAuth', path, cacheOptions);
                } else {
                  mlapp.setHash(
                    '_mlComponentsAuth',
                    path,
                    cacheOptions,
                    3,
                    true
                  );
                }
              }

              let authObj = cacheOptions;
              if (authObj) {
                if (authObj.isAllAuth) {
                  showFlag = true;
                  let item = authObj.all[name];
                  if (!item) {
                    //表示未记录设置，记录到缓存中，然后到操作授权处添加缓存记录，或直接添加
                    let pathTitle = (path && `${path}|${name}`) || name;
                    mlapp.setHash('_mlComponentsUnSettingAuthTemp', pathTitle, {
                      path: path,
                      name: name,
                      pathDes: pathDes,
                      title: nameDes
                    });
                  }
                } else {
                  //console.log(authObj);
                  let item = authObj.all[name];
                  if (item && item.isAuth) {
                    showFlag = true;
                  }
                }
              }

              if (showFlag) {
                el.__ml__.__comment__.parentNode &&
                  el.__ml__.__comment__.parentNode.replaceChild(
                    el,
                    el.__ml__.__comment__
                  );
              }
            });
          }
        }
      }
    }
  });
}
