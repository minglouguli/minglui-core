import ClipboardJS from 'clipboard';

class MlExtension {
  install(MlApp) {
    MlApp.prototype.join = function (objArr, pro, separator) {
      var r = '';
      for (var i = 0; i < objArr.length; i++) {
        r += (objArr[i][pro] || '') + separator;
      }
      return r;
    };

    MlApp.prototype.ArrAcross = function (arr1, fun) {
      var arr = [];
      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];
        arr.push(fun(element1));
      }
      return arr;
    };

    MlApp.prototype.ArrAcross2 = function (arr1, arr2, fun) {
      var arr = [];
      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];
        for (let ii = 0; ii < arr2.length; ii++) {
          const element2 = arr2[ii];
          arr.push(fun(element1, element2));
        }
      }
      return arr;
    };
    MlApp.prototype.ArrAcross3 = function (arr1, arr2, arr3, fun) {
      var arr = [];
      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];
        for (let ii = 0; ii < arr2.length; ii++) {
          const element2 = arr2[ii];
          for (let iii = 0; iii < arr3.length; iii++) {
            const element3 = arr3[iii];
            arr.push(fun(element1, element2, element3));
          }
        }
      }
      return arr;
    };

    MlApp.prototype.objAcross = function (obj1, fun) {
      var arr = [];
      let arr1 = obj1.list;
      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];
        arr.push(fun({ key: obj1.key, item: element1 }));
      }
      return arr;
    };

    /**
     *
     *
     * @param {*} obj1
     * @param {*} obj2
     * @param {*} fun
     * @returns
     */
    MlApp.prototype.objAcross2 = function (obj1, obj2, fun) {
      var arr = [];
      let arr1 = obj1.list;
      let arr2 = obj2.list;
      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];
        for (let ii = 0; ii < arr2.length; ii++) {
          const element2 = arr2[ii];
          arr.push(
            fun(
              { key: obj1.key, item: element1 },
              { key: obj2.key, item: element2 }
            )
          );
        }
      }
      return arr;
    };
    MlApp.prototype.objAcross3 = function (obj1, obj2, obj3, fun) {
      var arr = [];
      let arr1 = obj1.list;
      let arr2 = obj2.list;
      let arr3 = obj3.list;
      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];
        for (let ii = 0; ii < arr2.length; ii++) {
          const element2 = arr2[ii];
          for (let iii = 0; iii < arr3.length; iii++) {
            const element3 = arr3[iii];
            arr.push(
              fun(
                { key: obj1.key, item: element1 },
                { key: obj2.key, item: element2 },
                { key: obj3.key, item: element3 }
              )
            );
          }
        }
      }
      return arr;
    };

    MlApp.prototype.SearchOfRoute = function (searchconfig, rowdata, isobject) {
      // pointcode,Name|GroupName&Id|GroupId&Flag=true,ex_ListPath
      if (searchconfig == 'null' || searchconfig === '' || !rowdata) {
        //???null ???????????? ????????????????????????????????????????????????????????????????????????underfinded ????????????Id
        return isobject ? {} : '';
      }
      var param = ['Id'];
      var submitdata;
      // ?????????underfined ?????????Id   ,????????????????????????????????????????????????
      if (searchconfig && searchconfig != 'null') {
        param = searchconfig.split('&'); //  Name|GroupName&Id|GroupId&Flag=true
      }
      if (isobject === true) {
        submitdata = {};
        for (let i = 0; i < param.length; i++) {
          const value = param[i];
          var se = value.split('=');
          if (se.length > 1) {
            submitdata[se[0]] = se[1];
          } else {
            var parr = value.split('|');
            var pname = parr[0]; //??????????????????
            var sname = parr[1] || pname; //?????????????????????
            submitdata[sname] = rowdata[pname];
          }
        }

        //param.forEach(function (value) {
        //});
        return submitdata;
      } else {
        submitdata = '?';
        for (let i = 0; i < param.length; i++) {
          const value = param[i];
          if (value.split('=').length > 1) {
            submitdata += value + '&';
          } else {
            var parr2 = value.split('|');
            var pname2 = parr2[0];
            var sname2 = parr2[1] || pname;
            submitdata += sname2 + '=' + rowdata[pname2] + '&';
          }
        }

        if (submitdata.length <= 1) {
          submitdata = ''; //???????????? ??????????????????Id??????
        } else {
          submitdata = submitdata.substring(0, submitdata.length - 1);
        }
        return submitdata;
      }
    };

    /**
     *??????????????????????????????????????????????????????
     *
     * @param {Function} fun
     * @param {Number} delay
     * @param {Boolean} immediate ?????????????????????true:????????????????????????false:????????????????????????delay????????????
     * @returns
     */
    MlApp.prototype.debounce = function (fun, delay, immediate) {
      delay = delay || 1000;
      immediate = immediate == false ? false : true;
      let timeout = null;
      return function () {
        let context = this,
          args = arguments;
        timeout && clearTimeout(timeout);
        if (immediate) {
          var runFlag = !timeout; //??????????????????????????????????????????????????????
          //???????????????????????????????????????????????????????????????
          timeout = setTimeout(() => {
            timeout = null; //??????null,???????????????????????????????????????????????????????????????
          }, delay);
          if (runFlag) {
            //????????? ????????????
            fun.apply(context, args);
          }
        } else {
          timeout = setTimeout(() => {
            fun.apply(context, args);
          }, delay);
        }
      };
    };

    /**
     *???????????????????????????????????????????????????delay ??????????????????????????????
     *
     * @param {*} fun
     * @param {*} delay
     * @returns
     */
    MlApp.prototype.throttle = function (fun, delay) {
      var timer = null;
      var startTime = Date.now();

      return function () {
        var curTime = Date.now();
        var remaining = delay - (curTime - startTime);
        var context = this;
        var args = arguments;

        clearTimeout(timer);
        if (remaining <= 0) {
          fun.apply(context, args);
          startTime = Date.now();
        } else {
          timer = setTimeout(fun, remaining);
        }
      };
    };

    MlApp.prototype.copy = function (text, successHandler, failHandler) {
      let btn = window.document.createElement('button');
      btn.setAttribute('data-clipboard-action', 'copy'); // cut
      btn.setAttribute('data-clipboard-text', text);
      var clipboard = new ClipboardJS(btn);
      if (successHandler) {
        clipboard.on('success', e => {
          successHandler(e);
        });
      }
      if (failHandler) {
        clipboard.on('error', e => {
          failHandler(e);
        });
      }
      btn.click();
    };
  }
}
export default MlExtension;
