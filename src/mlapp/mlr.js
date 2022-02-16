class MlR {
  mlREngine = null;
  $filters = {};
  $options = {};
  constructor(opt) {
    this.$options = Object.assign(
      {},
      MlR.__global__.options,
      this.$options,
      opt || {}
    );
    this.$filters = Object.assign({}, MlR.__global__.filters, this.$filters);
    this.mlREngine = new MlREngine(this, {
      options: this.$options,
      filters: this.$filters
    });
  }
  filter(filterName, handler) {
    this.$filters[filterName] = handler;
    return this;
  }
  render(template, data) {
    return this.mlREngine.render(template, data);
  }
}

MlR.__global__ = {
  filters: {},
  options: {
    openTag: '{{',
    closeTag: '}}'
  }
};

MlR.filter = function(filterName, handler) {
  MlR.__global__.filters[filterName] = handler;
};

MlR.new = function(options) {
  return new MlR(options);
};

class MlREngine {
  #options = {
    openTag: '{{',
    closeTag: '}}'
  };
  #filters = {};
  #mlr = null;
  constructor(mlr, config) {
    this.#mlr = mlr;
    this.#options = config.options;
    this.#filters = config.filters;
  }

  render(template, data) {
    //   asdfbc{{name}}uuuuu{{abccc{{todod}}
    let result = '';
    if (!template) {
      return result;
    }
    let scopeData = data || {};
    template.split(this.#options.openTag).forEach((value, index) => {
      if (index > 0) {
        let vtemp = value.split(this.#options.closeTag);
        let v0 = vtemp[0]; //name
        let v1 = vtemp[1]; //uuuuu
        if (vtemp.length == 1) {
          result += this.textAnalysis(v0);
        } else {
          result += this.expressionAnalysis(v0, scopeData);
          if (v1) {
            result += this.textAnalysis(v1);
          }
        }
      } else {
        result += value;
      }
    });
    return result;
  }
  textAnalysis(text) {
    return text;
  }
  bindKeyExpressionAnalysis(bindKeyExpression, data) {
    // console.log(bindKeyExpression);
    bindKeyExpression = bindKeyExpression.trim();
    let tNumber = Number(bindKeyExpression);
    if (!isNaN(tNumber)) {
      //数字
      return tNumber;
    } else if (
      (bindKeyExpression[0] == '"' &&
        bindKeyExpression[bindKeyExpression.length - 1] == "'") ||
      (bindKeyExpression[0] == "'" &&
        bindKeyExpression[bindKeyExpression.length - 1] == "'")
    ) {
      //纯字符串
      return bindKeyExpression;
    } else {
      let bindKey = bindKeyExpression;
      let bindValue = '';
      if (Object.hasOwnProperty.call(data, bindKey)) {
        bindValue = data[bindKey];
      }
      return bindValue;
    }
  }
  filterExpressionAnalysis(filterExpression) {
    let result = [];
    if (filterExpression.indexOf('(') > 0) {
      //存在参数
      result[0] = filterExpression.match(/([\w]+)\(/)[1];
      result[1] = [];
      var paramExpression = filterExpression.match(/[\w]+\(([^)]+)\)/)[1];
      if (paramExpression) {
        result[1] = paramExpression.split(',');
      }
    } else {
      result[0] = filterExpression;
      result[1] = []; //无参数
    }
    return result;
  }
  getFilter(filterName) {
    if (Object.hasOwnProperty.call(this.#filters, filterName)) {
      return this.#filters[filterName];
    } else {
      return null;
    }
  }
  expressionAnalysis(expression, data) {
    let varr = expression.split('|');
    let bindValue = '';
    let bindKeyExpression = varr[0];
    // debugger;
    if (bindKeyExpression) {
      bindValue = this.bindKeyExpressionAnalysis(bindKeyExpression, data);
      if (varr.length > 1) {
        //存在过滤器
        for (let i = 1; i < varr.length; i++) {
          const filterExpression = varr[i];
          if (filterExpression) {
            var filterResult = this.filterExpressionAnalysis(filterExpression);
            let filterName = filterResult[0];
            let filter = this.getFilter(filterName);
            if (filter) {
              let params = [bindValue];
              let filterParamsReslut = filterResult[1];
              if (filterParamsReslut.length > 0) {
                for (let j = 0; j < filterParamsReslut.length; j++) {
                  params.push(
                    this.bindKeyExpressionAnalysis(filterParamsReslut[j], data)
                  );
                }
              }
              bindValue = filter.apply(this.#mlr, params);
            } else {
              console.warn('未定义过滤器：' + filterName);
            }
          }
        }
        return bindValue;
      } else {
        return bindValue;
      }
    } else {
      return bindValue;
    }
  }
}

export default MlR;
