class Stack {
  constructor() {
    this.stack = [];
  }

  push(value) {
    this.stack.push(value);
  }

  pop() {
    return this.stack.pop();
  }
  size() {
    return this.stack.length;
  }
  empty() {
    return this.size() === 0;
  }
}

class OperationProvider {
  operators = ['(', ')', '*', '/', '+', '-'];
  subOperators = ['('];
  subOperatorsObjg = {
    '(': { end: ')' }
  };
  isOperator(value) {
    return this.operators.includes(value);
  }
  /**
   * 比较运算符优先
   * @param {*} a
   * @param {*} b
   * @returns
   */
  operateCompare(a, b) {
    let aIndex = this.operators.indexOf(a) || 0;
    let bIndex = this.operators.indexOf(b) || 0;
    return aIndex < bIndex;
  }
  getExpressionStack(stringExpression) {
    let stack = [];
    let operate = '';
    let subStack = [];
    let subExpression = '';

    let isOperator = false;
    let findOperate = false;
    let findParam = false;
    for (let index = 0; index < stringExpression.length; index++) {
      const chat = stringExpression[index];
      if (chat === ' ') {
        continue;
      }
      let isOperator = this.isOperator(chat);

      //处理括号子表达式；
      if (chat === '(') {
        subStack.push(chat);
        continue;
      }
      if (subStack.length > 0) {
        if (chat === ')') {
          subStack.pop();
          if (subStack.length === 0) {
            stack.push({
              type: 2, //子表达式
              exp: subExpression
            });
            subExpression = '';
          }
        } else {
          subExpression += chat;
        }
        continue;
      }

      if (stack.length === 0) {
        stack.push({
          type: isOperator ? 0 : 1,
          exp: chat
        });
        continue;
      }
      let item = stack.pop();

      if (isOperator) {
        if (item.type === 0) {
          let pre = item.exp + chat;
          //检查是否是一个组合符号，比如!=,+(;
          //否则推入栈中 [!=,+,(]
          if (this.isOperator(pre)) {
            item.exp = pre;
            stack.push(item);
            continue;
          } else {
            stack.push(item);
            stack.push({
              type: 0,
              exp: chat
            });
            continue;
          }
        } else {
          stack.push(item);
          stack.push({
            type: 0,
            exp: chat
          });
        }
      } else {
        if (item.type === 0) {
          stack.push(item);
          stack.push({
            type: 1,
            exp: chat
          });
        } else {
          item.exp += chat;
          stack.push(item);
        }
      }
    }
    return stack;
  }
  convertToReversePolish(stringExpression) {
    const operators = this.operators;
    const expressionStack = this.getExpressionStack(stringExpression);
    // let stack = new Stack();
    let stack = [];
    let result = [];

    for (let index = 0; index < expressionStack.length; index++) {
      const expressionObj = expressionStack[index];
      const expression = expressionObj.exp;
      if (expressionObj.type === 0) {
        // while (true) {
        if (stack.length === 0) {
          //第一次加入运算符，
          stack.push(expressionObj);

          continue;
          //   break;
        }
        //}
        let op = stack.pop();

        if (this.operateCompare(expression, op.exp)) {
          //当前运算符优先，则都加入栈中，等待和后续的运算比较
          stack.push(op);
          stack.push(expressionObj);
        } else {
          //之前的运算符比较高，则之前的运算可以加入运算栈中；
          result.push(op);

          while (stack.length > 0) {
            // 继续寻找栈中较高或相同等级的运算
            let o = stack.pop();
            if (this.operateCompare(expression, o.exp)) {
              break;
            } else {
              result.push(o);
            }
          }
          //推入当前运算，和后续比较
          stack.push(expressionObj);
        }
      } else {
        result.push(expressionObj);
      }
    }
    while (stack.length > 0) {
      let op = stack.pop();

      if (op !== '(') {
        result.push(op);
      }
    }
    return result;

    // infixExpression.replace(operatorsRex, (_, expression) => {
    //   if (operators.includes(expression)) {
    //     while (true) {
    //       if (stack.empty()) {
    //         stack.push(expression);
    //         break;
    //       }

    //       if (expression === '(') {
    //         stack.push(expression);
    //         break;
    //       }

    //       const op = stack.pop();

    //       if (expression === ')') {
    //         if (op !== '(') {
    //           ret.push(op);
    //           continue;
    //         }
    //         break;
    //       }

    //       if (expression === '(') {
    //         stack.push(op);
    //         stack.push(expression);
    //         break;
    //       }

    //       if (expression === '+' || expression === '-') {
    //         if (op !== '+' || op !== '-') {
    //         }
    //       }
    //     }
    //   } else {
    //     ret.push(expression);
    //   }
    // });
  }
}

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
    this.operationProvider = new OperationProvider();
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
    ////let str = 'age1+1*(12+31)-4';
    //let str = '11+2*34';
    //let str = '11*2+34';
    // let str = '11*(2+34)';
    // let str = '1 + 2 * 3 + 4';
    let str = '1 + 2 * 3 + (4 * 5 + 6) * 7';

    //console.log('xxx', str, this.operationProvider.getExpressionStack(str));
    // console.log('xxx', str, this.operationProvider.convertToReversePolish(str));
    console.log(str);
    console.log('xxx', this.reversPolishAnalysis(str, {}));
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
  reversPolishAnalysis(template, data) {
    let stack = this.operationProvider.convertToReversePolish(template);
    let result = [];
    for (let index = 0; index < stack.length; index++) {
      const item = stack[index];
      if (item.type === 0) {
        let p1 = result.pop();
        let p2 = result.pop();

        result.push(this.operateExecute(data, item.exp, p1.exp + p2.exp));
      } else if (item.type == 2) {
        result.push(this.reversPolishAnalysis(item.exp, data));
      } else {
        result.push(item);
      }
    }
    return result.pop();
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
  operateExecute(data, operator, arg1, arg2, arg3) {
    arg1 = this.bindKeyExpressionAnalysis(arg1, data);
    arg2 = this.bindKeyExpressionAnalysis(arg2, data);
    switch (operator) {
      case '+':
        return arg1 + arg2;
    }
    return '';
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
