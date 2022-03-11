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
  newRender(template, data) {
    return this.mlREngine.newRender(template, data);
  }
}

MlR.__global__ = {
  filters: {},
  options: {
    openTag: '{{',
    closeTag: '}}'
  }
};

MlR.filter = function (filterName, handler) {
  MlR.__global__.filters[filterName] = handler;
};

MlR.new = function (options) {
  return new MlR(options);
};

class MlREngine {
  #options = {
    openTag: '{{',
    closeTag: '}}',
    newLine: '\n',
    for: '@for',
    if: '@if',
    elseIf: '@else if',
    else: '@else'
  };
  #filters = {};
  #mlr = null;
  constructor(mlr, config) {
    this.#mlr = mlr;
    this.#options = { ...{}, ...this.#options, ...config.options };
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
  newRender(template, data) {
    return this.templateExpressionAnalysis(template, data);
  }
  templateExpressionAnalysis(template, data) {
    //模板环境，用于处理嵌套模板
    let templateScopeEnv = {
      runIf: false,
      ifPass: false
    };
    let result = '';
    if (!template) {
      return result;
    }
    let scopeData = data || {};

    let blockExpressionArr = [];

    let deep = 0;
    let findFlag = false;
    let openTagIndex = 0;
    let closeTagIndex = 0 - this.#options.closeTag.length;
    for (let i = 0; i < template.length; i++) {
      const openTag = template.substring(i, i + this.#options.openTag.length);
      if (openTag == this.#options.openTag) {
        if (deep == 0) {
          openTagIndex = i;
          result += template.substring(
            closeTagIndex + this.#options.closeTag.length,
            i
          );
        }
        findFlag = true;
        deep++;
      }
      const closeTag = template.substring(i, i + this.#options.closeTag.length);
      if (closeTag == this.#options.closeTag) {
        deep--;
      }
      if (findFlag && deep == 0) {
        //找到了结束标志
        closeTagIndex = i;
        findFlag = false;
        result += this.blockExpressionAnalysis(
          template.substring(
            openTagIndex + this.#options.openTag.length,
            closeTagIndex
          ),
          scopeData,
          templateScopeEnv
        );
      }
    }
    result += template.substring(closeTagIndex + this.#options.closeTag.length);
    return result;
  }
  textAnalysis(text) {
    return text;
  }
  blockExpressionAnalysis(blockExpression, scopeData, templateScopeEnv) {
    if (blockExpression.startsWith(this.#options.for)) {
      let result = '';
      let newLineIndex = blockExpression.indexOf(this.#options.newLine);
      if (newLineIndex) {
        let forExpression = blockExpression
          .substring(this.#options.for.length + 1, newLineIndex)
          .trim();
        let forTemplate = blockExpression.substring(newLineIndex + 1);

        let listName = 'list';
        let itemName = '';
        let itemIndexName = '';
        let arr = forExpression.split(' in ');

        listName = arr[1].trim();
        let iarr = arr[0].trim().split(',');
        itemName = iarr[0].trim().replace('(', '').replace(')', '');
        if (iarr.length > 1) {
          itemIndexName = iarr[1].trim().replace(')', '');
        }
        let list = scopeData[listName];

        for (let index = 0; index < list.length; index++) {
          const item = list[index];
          let itemData = {};
          itemName && (itemData[itemName] = item);
          itemIndexName && (itemData[itemIndexName] = index);
          result += this.templateExpressionAnalysis(forTemplate, {
            ...scopeData,
            ...itemData
          });
          if (index < list.length - 1) {
            result += this.#options.newLine;
          }
        }

        return result;
      }
      return result;
    } else if (blockExpression.startsWith(this.#options.if)) {
      let result = '';
      let newLineIndex = blockExpression.indexOf(this.#options.newLine);
      if (newLineIndex) {
        let ifExpression = blockExpression
          .substring(this.#options.if.length + 1, newLineIndex)
          .trim();
        let operateResult = this.operationExpressionAnalysis(
          ifExpression,
          scopeData
        );
        if (operateResult) {
          templateScopeEnv.ifPass = true;
          let ifTemplate = blockExpression.substring(newLineIndex + 1);
          result += this.templateExpressionAnalysis(ifTemplate, scopeData);
        } else {
          templateScopeEnv.ifPass = false;
        }
      }
      return result;
    } else if (blockExpression.startsWith('@else if')) {
      let result = '';
      if (!templateScopeEnv.ifPass) {
        result = 'elseif模块';
        templateScopeEnv.ifPass = true;
      }
      return result;
    } else if (blockExpression.startsWith('@else')) {
      let result = '';
      if (!templateScopeEnv.ifPass) {
        result = 'else模块';
      }
      return result;
    } else {
      return this.expressionAnalysis(blockExpression, scopeData);
    }
    return blockExpression;
  }
  operationExpressionAnalysis(operationExpression, data) {}
  operate = {
    add(a, b) {
      return a + b;
    },
    sub(a, b) {
      return a - b;
    },
    mul(a, b) {
      return a * b;
    },
    div(a, b) {
      return a / b;
    }
  };
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
      if (bindKeyExpression.indexOf('.') > -1) {
        let proArr = bindKeyExpression.split('.');
        let bindValue = '';
        let scopeData = data;
        for (let i = 0; i < proArr.length; i++) {
          const bindKey = proArr[i];
          if (Object.hasOwnProperty.call(scopeData, bindKey)) {
            bindValue = scopeData[bindKey];
            scopeData = bindValue;
          }
        }
        return bindValue;
      } else {
        let bindKey = bindKeyExpression;
        let bindValue = '';
        if (Object.hasOwnProperty.call(data, bindKey)) {
          bindValue = data[bindKey];
        }
        return bindValue;
      }
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
