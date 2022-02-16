//Array

Array.prototype.any = function (fun) {
  let _ = this;
  for (let i = 0; i < _.length; i++) {
    const element = _[i];
    if (fun(element)) {
      return true;
    }
  }
  return false;
};

Array.prototype.remove = function (fun) {
  let index = 0;
  while (index < this.length) {
    const item = this[index];
    if (fun(item)) {
      this.splice(index, 1);
    } else {
      index++;
    }
  }
  return this;
  //return this.filter(f => !fun(f));
};
Array.prototype.removeAt = function (i) {
  return this.splice(i, 1);
};

Array.prototype.firstOrDefault = function (fun) {
  return this.filter(fun)[0];
};

Array.prototype.where = function (fun) {
  return this.filter(fun);
};

Array.prototype.select = function (fun) {
  var arr = [];
  var _ = this;
  for (let i = 0; i < _.length; i++) {
    const element1 = _[i];
    arr.push(fun(element1, i));
  }
  return arr;
};

Array.prototype.sum = function (fun) {
  var _ = this;
  let sum = 0;
  if (fun == null) {
    for (let i = 0; i < _.length; i++) {
      const element = _[i];
      sum += element;
    }
  } else {
    for (let i = 0; i < _.length; i++) {
      const element = _[i];
      sum += fun(element);
    }
  }
  return sum;
};

Array.prototype.clone = function () {
  let _ = this;
  let arr = [];
  for (let i = 0; i < _.length; i++) {
    const element = _[i];
    arr.push(element);
  }
  return arr;
};

Array.prototype.sortAsc = function (fun) {
  return this.sort((a, b) => fun(a) - fun(b));
};

Array.prototype.sortDesc = function (fun) {
  return this.sort((a, b) => fun(b) - fun(a));
};

Array.prototype.orderBy = function (fun) {
  let _ = this;
  let length = _.length;
  for (let j = 0; j < length; j++) {
    let end = length - j;
    for (let i = 0; i < end; i++) {
      const element = _[i];
      if (i < end - 1) {
        const next = _[i + 1];
        if (fun(element) - fun(next) > 0) {
          _[i + 1] = element;
          _[i] = next;
        }
      }
    }
  }
};

Array.prototype.orderByDescending = function (fun) {
  let _ = this;
  let length = _.length;
  for (let j = 0; j < length; j++) {
    let end = length - j;
    for (let i = 0; i < end; i++) {
      const element = _[i];
      if (i < end - 1) {
        const next = _[i + 1];
        if (fun(element) - fun(next) < 0) {
          _[i + 1] = element;
          _[i] = next;
        }
      }
    }
  }
  return this;
};

Array.prototype.orderBy2 = function (fun) {
  let _ = this;
  let length = _.length;
  for (let j = 0; j < length; j++) {
    let end = length - j;
    for (let i = 0; i < end; i++) {
      const element = _[i];
      if (i < end - 1) {
        const next = _[i + 1];
        if (fun(element) - fun(next) > 0) {
          _[i + 1] = element;
          _[i] = next;
        }
      }
    }
  }
  return this;
};

Array.prototype.orderByDescending2 = function (fun) {
  let _ = this;
  let length = _.length;
  for (let j = 0; j < length; j++) {
    let end = length - j;
    for (let i = 0; i < end; i++) {
      const element = _[i];
      if (i < end - 1) {
        const next = _[i + 1];
        if (fun(element) - fun(next) < 0) {
          _[i + 1] = element;
          _[i] = next;
        }
      }
    }
  }
  return this;
};

Array.prototype.addRange = function (list) {
  let _ = this;
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    _.push(element);
  }
  return _;
};

//Data

Date.prototype.format = function (format) {
  format = format || 'yyyy-MM-dd HH:mm:ss';
  var o = {
    'M+': this.getMonth() + 1, //month
    'd+': this.getDate(), //day
    'H+': this.getHours(), //hour
    'm+': this.getMinutes(), //minute
    's+': this.getSeconds(), //second
    'q+': Math.floor((this.getMonth() + 3) / 3), //quarter
    S: this.getMilliseconds() //millisecond
  };

  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  return format;
};

//String

String.prototype.dateFormat = function (format) {
  let value = this;
  if (!value) {
    return '';
  } else {
    if (value.indexOf('Date') > -1) {
      var inx = value.match(/(-\d+|\d+)/)[1];
      return new Date(parseInt(inx)).format(format);
    } else {
      if (value.indexOf('T') == -1) {
        value = value.replace(/-/g, '/');
      }
      // return $dayjs(value).format('YYYY-MM-DD');

      //console.log(value);

      return new Date(value).format(format);
    }
  }
};

String.prototype.format = function () {
  // af{0}cd{1}er{2}sdf
  let format = this;
  var param = arguments;
  var obj = param[0];
  if (obj) {
    if (obj && typeof obj == 'object') {
      if (/\{[a-zA-Z]+\}/gi.test(format)) {
        // var m = objectTool.SearchOfRoute(mo, full, true);
        format = format.replace(/\{[a-zA-Z]+\}/gi, function (val) {
          var i = val.match(/{([a-zA-Z]+)}/)[1];
          return obj[i];
        });
      }
      return format;
    } else {
      return format.replace(/\{\d+\}/gi, function (val) {
        var i = parseInt(val.match(/{(\d+)}/)[1]);
        return param[i];
      });
    }
  }
  return format;
};

String.prototype.toDate = function () {
  let value = this;
  if (!value) {
    return new Date();
  } else {
    if (value.indexOf('Date') > -1) {
      var inx = value.match(/(-\d+|\d+)/)[1];
      return new Date(parseInt(inx));
    } else {
      return new Date(value);
    }
  }
};

String.prototype.mgSubstring = function (start, length, format) {
  let _ = this;
  if (_ == undefined) {
    return '';
  }
  let len = this.length;
  return (
    _.substring(start, start + length) +
    (len - start > length ? format || '' : '')
  );
};

String.prototype.nameCase = function (to, from) {
  // 1:cameCase;  2:PascalCase;   3:kebabCase;  4:mid-line
  let name = this;
  if (to != 4 && name.indexOf('-') > -1) {
    name = name.replace(/-/gi, '_');
  }
  if (to == 1) {
    if (name.indexOf('_') > -1) {
      console.log(name, to);
      // my_name>myName
      let vr = name.replace(/_(\w)/g, function (all, letter) {
        return letter.toUpperCase();
      });
      console.log(vr);
      return vr;
    } else {
      //MyName > myName
      return name.charAt(0).toLowerCase() + name.substring(1);
    }
  } else if (to == 2) {
    if (name.indexOf('_') > -1) {
      let tn = name.replace(/_(\w)/g, function (all, letter) {
        return letter.toUpperCase();
      });

      return tn.charAt(0).toUpperCase() + tn.substring(1);
    } else {
      //myName > MyName
      return name.charAt(0).toUpperCase() + name.substring(1);
    }
  } else if (to == 3) {
    if (/[A-Z]/.test(name.charAt(0))) {
      //  MyName > my_name;
      return (name.charAt(0).toLowerCase() + name.substring(1))
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase();
    } else {
      //  myName > my_name;
      return name.replace(/([A-Z])/g, '_$1').toLowerCase();
    }
  } else if (to == 4) {
    if (/[A-Z]/.test(name.charAt(0))) {
      //  MyName > my_name;
      return (name.charAt(0).toLowerCase() + name.substring(1))
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase();
    } else {
      //  myName > my_name;
      return name.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
  }
  return name;
};

//Math
Math.mlRound = function (v, l) {
  if (l) {
    return Math.round(v * l * 10) / (l * 10);
  } else {
    return Math.round(v);
  }
};

export default function () {}
