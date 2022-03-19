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
  operators = [
    '(',
    ')',
    '!',
    '*',
    '/',
    '+',
    '-',
    '==',
    '!=',
    '===',
    '!==',
    '<',
    '<=',
    '>',
    '>=',
    '&',
    '|',
    '&&',
    '||',
    ':',
    '?',
    '??',
    '='
  ];
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
    // debugger;
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
              stack.push(o);
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
  renderX(template, data) {
    return this.mlREngine.renderX(template, data);
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
  renderX(template, data) {
    ////let str = 'age1+1*(12+31)-4';
    //let str = '11+2*34';
    //let str = '11*2+34';
    // let str = '11*(2+34)';
    // let str = '1 + 2 * 3 + 4';
    // let str = '1 + 2 * 3 + (4 * 5 + 6) * 7';
    //let str = '1-1?1+1*5:2*(3+1)';
    //  let str = 'a';

    //console.log('xxx', str, this.operationProvider.getExpressionStack(str));
    // console.log('xxx', str, this.operationProvider.convertToReversePolish(str));
    // console.log(str);
    // console.log(
    //   'xxx',
    //   this.reversPolishAnalysis(str, {
    //     a: 2,
    //     b: 1,
    //     c: 3,
    //     obj: {
    //       d: 2
    //     }
    //   }).exp
    // );
    let begin = '';
    let end = '';
    for (let i = 0; i < this.#options.openTag.length; i++) {
      const element = this.#options.openTag[i];
      begin += `\\\\${element}`;
    }
    for (let i = 0; i < this.#options.closeTag.length; i++) {
      const element = this.#options.closeTag[i];
      end += `\\\\${element}`;
    }
    let r = this.templateExpressionAnalysis(template, data);
    let brx = new RegExp(begin, 'g');
    let erx = new RegExp(end, 'g');
    return r
      .replace(brx, this.#options.openTag)
      .replace(erx, this.#options.closeTag);
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
        continue;
      }
      const closeTag = template.substring(i, i + this.#options.closeTag.length);
      if (closeTag == this.#options.closeTag) {
        deep--;
      }
      if (findFlag && deep == 0) {
        //找到了结束标志
        closeTagIndex = i;
        findFlag = false;
        var br = this.blockExpressionAnalysis(
          template.substring(
            openTagIndex + this.#options.openTag.length,
            closeTagIndex
          ),
          scopeData,
          templateScopeEnv
        );
        if (br.flag) {
          //表示是块级，需要删去上下占位行
          // debugger;
          //整块删除
          result = this.removeEndNewLine(result);
        }
        result += br.result;
      }
    }
    result += template.substring(closeTagIndex + this.#options.closeTag.length);
    return result;
  }
  reversPolishAnalysis(template, data) {
    //debugger;
    let stack = this.operationProvider.convertToReversePolish(template);
    //  debugger;
    let result = [];
    for (let index = 0; index < stack.length; index++) {
      const item = stack[index];
      if (item.type === 0) {
        let p1, p2, p3;

        if (item.exp === '!') {
          //一元运算
          p1 = result.pop();
        } else if (item.exp === '?') {
          p3 = result.pop();
          p2 = result.pop();
          p1 = result.pop();
        } else if (item.exp === ':') {
          continue;
        } else {
          p2 = result.pop();
          p1 = result.pop();
        }

        // debugger;
        let r = this.operateExecute(
          data,
          item.exp,
          p1.exp,
          p2 && p2.exp,
          p3 && p3.exp
        );
        // console.log('exe', p1.exp, p2.exp, item.exp, r);
        result.push({
          type: 1,
          exp: r
        });
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
    let result = '';
    let flag = false;
    if (blockExpression.startsWith(this.#options.for)) {
      flag = true;
      let newLineIndex = blockExpression.indexOf(this.#options.newLine);
      if (newLineIndex) {
        let forExpression = blockExpression
          .substring(this.#options.for.length + 1, newLineIndex)
          .trim();
        let forTemplate = blockExpression.substring(newLineIndex);
        let si = forTemplate
          .substring(this.#options.newLine.length)
          .indexOf(this.#options.newLine);
        if (si > -1) {
          let st = forTemplate.substring(0, si);
          if (st.indexOf('{{@') > -1) {
            forTemplate = forTemplate.substring(this.#options.newLine.length);
          }
        }
        forTemplate = this.removeEndNewLine(forTemplate);

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
        if (list.length > 0) {
          for (let index = 0; index < list.length; index++) {
            const item = list[index];
            let itemData = {};
            itemName && (itemData[itemName] = item);
            itemIndexName && (itemData[itemIndexName] = index);
            result += this.templateExpressionAnalysis(forTemplate, {
              ...scopeData,
              ...itemData
            });
          }
        }
      }
    } else if (blockExpression.startsWith(this.#options.if)) {
      flag = true;
      let newLineIndex = blockExpression.indexOf(this.#options.newLine);
      if (newLineIndex) {
        let ifExpression = blockExpression
          .substring(this.#options.if.length + 1, newLineIndex)
          .trim();
        let operateResult = this.operatorExpressionAnalysis(
          ifExpression,
          scopeData
        );

        if (operateResult) {
          templateScopeEnv.ifPass = true;
          let ifTemplate = blockExpression.substring(newLineIndex);
          console.log('ttt', 'aaa' + ifTemplate + 'ccc');
          //debugger;
          ifTemplate = this.removeEndNewLine(ifTemplate);
          console.log('fff', 'aaa' + ifTemplate + 'ccc');

          result += this.templateExpressionAnalysis(ifTemplate, scopeData);
        } else {
          templateScopeEnv.ifPass = false;
        }
      }
    } else if (blockExpression.startsWith(this.#options.elseIf)) {
      flag = true;
      if (!templateScopeEnv.ifPass) {
        let newLineIndex = blockExpression.indexOf(this.#options.newLine);
        if (newLineIndex) {
          let ifExpression = blockExpression
            .substring(this.#options.elseIf.length + 1, newLineIndex)
            .trim();
          let operateResult = this.operatorExpressionAnalysis(
            ifExpression,
            scopeData
          );

          if (operateResult) {
            templateScopeEnv.ifPass = true;
            let ifTemplate = blockExpression.substring(newLineIndex);

            ifTemplate = this.removeEndNewLine(ifTemplate);

            result += this.templateExpressionAnalysis(ifTemplate, scopeData);
          } else {
            templateScopeEnv.ifPass = false;
          }
        }
      } else {
      }
    } else if (blockExpression.startsWith('@else')) {
      flag = true;
      if (!templateScopeEnv.ifPass) {
        let newLineIndex = blockExpression.indexOf(this.#options.newLine);
        if (newLineIndex) {
          let ifExpression = blockExpression
            .substring(this.#options.elseIf.length + 1, newLineIndex)
            .trim();

          templateScopeEnv.ifPass = true;
          let ifTemplate = blockExpression.substring(newLineIndex);
          ifTemplate = this.removeEndNewLine(ifTemplate);
          result += this.templateExpressionAnalysis(ifTemplate, scopeData);
        }
      }
    } else {
      result = this.expressionAnalysis(blockExpression, scopeData);
    }

    return {
      result: result,
      flag: flag
    };
  }
  removeEndNewLine(str) {
    //TODO
    let chat = str[str.length - 1];
    while (chat == ' ') {
      str = str.substring(0, str.length - 1);
      chat = str[str.length - 1];
    }
    let newLine = this.#options.newLine;
    if (str.length >= newLine.length) {
      if (str[str.length - newLine.length] === newLine) {
        str = str.substring(0, str.length - newLine.length);
      }
    }

    return str;
  }
  operatorExpressionAnalysis(operatorExpression, data) {
    return this.reversPolishAnalysis(operatorExpression, data).exp;
  }
  operateExecute(data, operator, arg1, arg2, arg3) {
    arg1 = this.bindKeyExpressionAnalysis(arg1, data);
    arg2 = this.bindKeyExpressionAnalysis(arg2, data);
    try {
      switch (operator) {
        case '?':
          return arg1 ? arg2 : arg3;
        case '!':
          return !arg1;
        case '+':
          return arg1 + arg2;
        case '-':
          return arg1 - arg2;
        case '*':
          return arg1 * arg2;
        case '/':
          return arg1 / arg2;
        case '===':
          return arg1 === arg2;
        case '==':
          return arg1 == arg2;
        case '!=':
          return arg1 != arg2;
        case '!==':
          return arg1 !== arg2;
        case '>':
          return arg1 > arg2;
        case '<':
          return arg1 < arg2;
        case '>=':
          return arg1 >= arg2;
        case '<=':
          return arg1 <= arg2;
        case '&&':
          return arg1 && arg2;
        case '||':
          return arg1 || arg2;
      }
    } catch (error) {
      console.error(error, ...arguments);
    }

    return '';
  }
  bindKeyExpressionAnalysis(bindKeyExpression, data) {
    // console.log(bindKeyExpression);
    if (bindKeyExpression === undefined || bindKeyExpression === '') {
      return '';
    }
    if (typeof bindKeyExpression === 'string') {
      bindKeyExpression = bindKeyExpression.trim();
      if (bindKeyExpression === 'true') {
        return true;
      } else if (bindKeyExpression === 'false') {
        return false;
      }
    } else {
      return bindKeyExpression;
    }

    let tNumber = Number(bindKeyExpression);
    if (!isNaN(tNumber)) {
      //数字
      return tNumber;
    } else {
      if (
        (bindKeyExpression[0] == '"' &&
          bindKeyExpression[bindKeyExpression.length - 1] == '"') ||
        (bindKeyExpression[0] == "'" &&
          bindKeyExpression[bindKeyExpression.length - 1] == "'")
      ) {
        //纯字符串
        return bindKeyExpression.substring(1, bindKeyExpression.length - 1);
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
            } else {
              bindValue = undefined;
              break;
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
    let varr = [];
    let sustr = '';
    let deep = 0;
    // debugger;
    for (let index = 0; index < expression.length; index++) {
      const element = expression[index];
      if (element == '|') {
        if (deep === 0) {
          deep++;
          sustr += element;
        } else {
          sustr += element;
          deep = 0;
        }
      } else {
        if (deep === 1) {
          varr.push(sustr.substring(0, sustr.length - 1));
          sustr = element;
          deep = 0;
        } else {
          sustr += element;
          deep = 0;
        }
      }
    }
    if (sustr) {
      varr.push(sustr);
    }

    // varr = expression.split('|');
    let bindValue = '';
    let bindKeyExpression = varr[0];

    if (bindKeyExpression) {
      if (bindKeyExpression) {
        if (/([\+|\-|\*|\/|\(|\)|&|\||?|\=])/.test(bindKeyExpression)) {
          bindValue = this.operatorExpressionAnalysis(bindKeyExpression, data);
        } else {
          bindValue = this.bindKeyExpressionAnalysis(bindKeyExpression, data);
        }
      }
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
