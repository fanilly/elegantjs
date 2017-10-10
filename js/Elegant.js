/**
 * Project name:Elegant
 * Author:JiJunfeng
 * Version:2.1
 * Create Date:2017-7-21
 * description:
 * 遵循amd规范的2.0
 */

!(function(elegant, window) {
  /**
   * 模仿jQuery实现的demo 遵循AMD规范
   */
  if (typeof define === 'function' && define.amd)
    define(elegant);
  else
    window.elegant = elegant();
})((function(win) {

  //对添加原型的方法进行优化
  Function.prototype.addMethods = !Function.addMethods ? function(methods) {
    for (var method in methods) this.prototype[method] = methods[method];
  } : Function.prototype.addMethods;

  //构造函数constructor
  function _Elegant(selector) {
    this.elems = []; //保存选中的所有元素
    this.selectorIsChild = false; //是否是直接子代选择器
    this._selectorAll(selector);
    /**
     * 将所有选中的元素绑定到自身身上 
     * 然后销毁elems数组和selectorIsChild标志
     */
    for (var i = 0; i < this.elems.length; i++) {
      this[i] = this.elems[i];
    }
    delete this.elems;
    delete this.selectorIsChild;
    this.length = this.len();
  }

  _Elegant.extends = function() {
    for (var item = 0; item < arguments.length; item++) {
      if (toString.call(arguments[item]).indexOf('Object') != -1)
        _Elegant.addMethods(arguments[item]);
    }
  };

  /*=====================================================================================
  =                                       核心辅助模块                                  =
  =====================================================================================*/
  _Elegant.extends({
    constructor: _Elegant,
    /**
     * [index 获取下标]
     * @param  {[Object]} obj [期望获取索引值的元素]
     * @return {[Number]}     [返回传入对象在集合中的索引值]
     */
    index: function(obj) {
      var tempIndex;
      this.each(function(item, index) {
        if (obj == item) {
          tempIndex = index;
          return;
        }
      });
      return tempIndex;
    },

    /**
     * [each 遍历自身的elems属性]
     * @param  {Function} fn [每个属性值执行的回调函数]
     * @return {[Void]}      [无返回值]
     */
    each: function(fn) {
      for (var key in this) {
        if (this.hasOwnProperty(key) && key != 'length') {
          fn.call(this, this[key], key);
        }
      }
      return this;
    },

    /**
     * [_map 遍历数组是数组的每一项都执行回调函数]
     * @param  {[Arrag]}   arr [数组]
     * @param  {Function} fn  [回调函数]
     * @return {[this]}       [自身]
     */
    _map: function(arr, fn) {
      for (var i = 0, len = arr.length; i < len; i++) {
        fn.call(this, arr[i], i);
      }
      return this;
    },

    /**
     * [len 获取长度]
     * @return {[Number]} [获取到的对象的长度]
     */
    len: function() {
      var len = 0;
      this.each(function() {
        len++;
      });
      return len;
    },

    /**
     * [Tween 物体抛物线运动轨迹]
     * 参考: Tween.js
     * t:当前已经过去的时间
     * b:初始变化量  c:终止变化量 比如:一个物体从宽100到200  b=100 c = 200-100
     * d:持续时长
     * @type {Object}
     */
    Tween: {
      linear: function(t, b, c, d) {
        return c * t / d + b;
      },
      easeIn: function(t, b, c, d) {
        return c * (t /= d) * t + b;
      },
      easeOut: function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
      },
      easeInOut: function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
      }
    }
  });

  /*=====================================================================================
  =                                      DOM+CSS操作模块                                =
  =====================================================================================*/
  _Elegant.extends({

    /**
     * [css 设置css样式]
     * 如果传入一个参数 这个参数必须为一个对象 {属性:属性值}
     * 如果传入两个参数 第一个为属性名称 第二个为属性值
     * @return {[this]} [返回自身以支持链式调用]
     */
    css: function() {
      var obj;
      if (arguments.length == 1) {
        //一个参数 参数类型必须为对象{属性:属性值}
        obj = arguments[0];
        if (this.isObject(obj)) {
          this.each(function(item) {
            for (var key in obj) {
              item.style[key] = obj[key];
            }
          });
        }
      } else if (arguments.length == 2) {
        //两个参数 第一个为属性名称 第二个为属性值
        var attributeName = arguments[0],
          attributeValue = arguments[1];
        if (typeof attributeName == 'string' &&
          (typeof attributeValue == 'string' || typeof attributeValue == 'number')) {
          this.each(function(item) {
            item.style[attributeName] = attributeValue;
          });
        }
      } else {
        throw new Error('The mothed "css" require "1" or "2" parameters');
      }
      return this;
    },

    /**
     * [getCss 外部调用 获取css样式]
     * @param  {[String]} attr [要获取的属性名称]
     * @return {[String]}      [返回获取到的值]
     */
    getCss: function(attr) {
      return this[0].currentStyle ?
        this[0].currentStyle[attr] : getComputedStyle(this[0], null)[attr];
    },

    /**
     * [_getCss 工具 获取css样式]
     * @param  {[Object]} attr [要获取的属性名称的对象]
     * @param  {[String]} attr [要获取的属性名称]
     * @return {[String]}      [返回获取到的值]
     */
    _getCss: function(obj, attr) {
      return obj.currentStyle ?
        obj.currentStyle[attr] : getComputedStyle(obj, null)[attr];
    },

    /**
     * [attr 设置获取属性值]
     * 允许接受一个参数或两个参数
     * 如果只有一个参数 认为是属性名称 最终返回该属性的值
     * 如果有两个参数 认为是属性名称加属性值 将值设置给该属性
     * @return 设置值支持继续链式调用 获取值不支持
     */
    attr: function() {
      var args = arguments;
      if (args.length == 1) {
        return this[0].getAttribute(args[0]);
      } else if (args.length == 2) {
        this.each(function(item) {
          item.setAttribute(args[0], args[1]);
        });
      } else {
        throw new Error('function attr require 1 or 2 parameters');
      }
      return this;
    },

    /**
     * [addClass 添加class名称]
     * 传入一个或多个className
     * @return {[type]}           [description]
     */
    addClass: function() {
      var args = arguments,
        i, len = args.length;
      this.each(function(item) {
        this._map(args, function(val) {
          if (item.classList && item.classList.add) {
            item.classList.add(val);
          } else {
            item.className += ' ' + val;
          }
        });
      });
      return this;
    },

    /**
     * [removeClass 移除class名称]
     * 传入一个className
     * @return {[type]}           [description]
     */
    removeClass: function(className) {
      this.each(function(item) {
        if ((new this.constructor(item)).hasClass(className)) {
          if (item.classList && item.classList.remove) {
            item.classList.remove(className);
          } else {
            var classStr = '',
              arr = item.className.split(' ');
            arr = this.removeItem(arr, className);
            this._map(arr, function(val) {
              classStr += ' ' + val;
            });
            item.className = classStr;
          }
        }
      });
      return this;
    },

    /**
     * [hasClass 判断类名是否存在]
     * @param  {[String]}  className [class名称]
     * @return {Boolean}           [存在为真 不存在为假]
     */
    hasClass: function(className) {
      if (this[0].classList && this[0].classList.contains) {
        return this[0].classList.contains(className);
      } else {
        var arr = this[0].className.split(' ');
        return this.hasItem(arr, className);
      }
    },

    /**
     * [offset 过去位置及大小]
     * @return {[Object]} [包含宽高上左]
     */
    offset: function() {
      return {
        width: this[0].offsetWidth,
        height: this[0].offsetHeight,
        top: this[0].offsetTop,
        left: this[0].offsetLeft
      };
    },

    /**
     * [width 获取宽度和设置宽度]
     * 如果没有参数传入 返回当前内容宽度
     * 如果传入一个参数 设置当前内容的宽度为传入的值
     */
    width: function() {
      if (arguments.length == 0) {
        return this.offset().width;
      } else {
        this.css('width', arguments[0]);
      }
    },

    /**
     * [height 获取和设置高度]
     * 如果没有参数传入 返回当前内容高度
     * 如果传入一个参数 设置当前内容的高度为传入的值
     */
    height: function() {
      if (arguments.length == 0) {
        return this.offset().height;
      } else {
        this.css('height', arguments[0]);
      }
    }
  });

  /*=====================================================================================
  =                                        事件模块                                     =
  =====================================================================================*/
  _Elegant.extends({

    /**
     * [on 绑定事件]
     * @param  {[String]}   type [事件类型]
     * @param  {Function} fn   [事件执行的函数]
     * @return {[Object]}        [返回自身以实现链式调用]
     */
    on: function(type, fn) {
      this.each(function(item) {
        if (item.addEventListener) {
          item.addEventListener(type, function(e) {
            //直接传入经过兼容处理的事件对象
            fn.call(this, e || win.event);
          }, false);
        } else if (item.attachEvent) {
          item.attachEvent("on" + type, function(e) {
            fn.call(this, e || win.event);
          });
        } else {
          item["on" + type] = function(e) {
            fn.call(this, e || win.event);
          };
        }
      });
      return this;
    },

    /**
     * [delegate 事件委托]
     * @param  {[String]}   elem [要委托到的标签或类名]
     * @param  {[String]}   type [事件类型]
     * @param  {Function} fn   [事件触发之后执行的回调函数]
     * @return {[this]}        [返回this以支持链式调用]
     */
    delegate: function(elem, type, fn) {
      this.each(function(item) {
        var self = this;
        new this.constructor(item).on(type, function(e) {
          var sourceTag = e.target || e.srcElement;
          if (self.isString(elem)) {
            if (elem.charAt(0) == '.') {
              if (sourceTag.className &&
                sourceTag.className.indexOf(elem.substring(1)) != -1) {
                fn.call(sourceTag, e);
              }
            } else {
              if (sourceTag.tagName &&
                sourceTag.tagName.toUpperCase() == elem.toUpperCase()) {
                fn.call(sourceTag, e);
              }
            }
          }
        });
      });
      return this;
    },

    click: function(fn) {
      this.on('click', fn);
      return this;
    },

    dblclick: function(fn) {
      this.on('dblclick', fn);
      return this;
    },

    hover: function(fnOver, fnOut) {
      if (fnOver) this.on('mouseover', fnOver);
      if (fnOut) this.on('mouseout', fnOut);
      return this;
    },

    mouseover: function(fn) {
      this.on('mouseover', fn);
      return this;
    },

    mouseout: function(fn) {
      this.on('mouseout', fn);
      return this;
    },

    mouseenter: function(fn) {
      this.on('mouseenter', fn);
      return this;
    },

    mouseleave: function(fn) {
      this.on('mouseleave', fn);
      return this;
    },

    mousedown: function(fn) {
      this.on('mousedown', fn);
      return this;
    },

    mousemove: function(fn) {
      this.on('mousemove', fn);
      return this;
    },

    mouseup: function(fn) {
      this.on('mouseup', fn);
      return this;
    },

    keydown: function(fn) {
      this.on('keydown', fn);
      return this;
    },

    keyup: function(fn) {
      this.on('keyup', fn);
      return this;
    }
  });

  /*=====================================================================================
  =                                       数据类型判断                                  =
  =====================================================================================*/
  _Elegant.extends({
    isString: function(str) {
      return toString.call(str).indexOf('String') !== -1;
    },
    isHTMLElement: function(option) {
      return toString.call(option).indexOf('HTML') !== -1;
    },
    isObject: function(obj) {
      return toString.call(obj).indexOf('Object') !== -1;
    }
  });

  /*=====================================================================================
  =                                        选择器模块                                   =
  ======================================================================================*/
  /**
   *
   * 选择器模块 selector
   * 支持id选择器 类选择器 标签选择器 属性选择器 筛选选择器 后代选择器 直接子代选择器
   * Example:
   * #box .nav .item:eq(3) | #box .nav li:eq(3) 
   * #box .nav .item[data-flag] | #box .nav .item[data-falg=success]
   *
   */
  _Elegant.extends({


    /*=========================================  getByClaa  =======================================*/
    eq: function(index) {
      return new this.constructor(this[index]);
    },

    /*=========================================  getByClaa  =======================================*/
    find: function(str) {
      /********************************************************************************************
       *****************************************************************************************
       **************************************待补充*****************************************
       *****************************************************************************************
       ********************************************************************************************/
    },

    /*=========================================  getByClaa  =======================================*/
    getByClass: function(elem, str) {
      /**
       * 1.判断浏览器是否支持class选择器 如果支持 直接返回
       * 2.如果不支持class选择器 那么先使用标签选择器 选中所有标签
       * 再判断每一个标签的class属性是否匹配
       */
      var resault = elem.getElementsByClassName ?
        elem.getElementsByClassName(str) :
        (function() {
          var tempResault = [],
            allElem = elem.getElementsByTagName('*');
          for (var i = 0; i < allElem.length; i++) {
            //选中标签的全部类名是个str='btn on red'=allElem[i].className
            if (allElem[i].className.indexOf(str) !== -1) tempResault.push(allElem[i]);
          }
          return tempResault;
        })();
      return resault;
    },

    /*=======================================  _selectorAll  ========================================*/
    _selectorAll: function(selector) {

      /**
       *
       * 1.如果selector是HTML元素 则判断是单个元素还是元素集合
       * 如果是单个元素 需要包装成数组 如果是一个集合 则直接让elems等于这个集合
       * 2.如果是字符串 首先去除字符串两端的空格并根据逗号分割成数组
       * 得到的数组中包含所有的选择器组 循环得到的数组
       * 拿数组中的每一项(选择器组)进行以空格分割成数组
       * 然后依次进行元素选取 第一轮选取是以document为祖元素 
       * 之后的选取以上一次选取到的元素为祖元素 如果出现‘>’表示为直接子代选择 
       * 3.如果不是HTML元素也不是个字符串则抛出错误
       *
       */
      if (this.isHTMLElement(selector)) { //如果传入的参数是dom元素
        //如果不是个元素集合 则包装成数组
        this.elems = toString.call(selector).indexOf('HTMLCollection') !== -1 ? selector : [selector];
      } else if (this.isString(selector)) { //如果传入的参数是一个字符串
        var i, n,
          allSelector = this.trim(selector).split(','), //得到所有的选择器组
          tempElems = []; //临时的保存所有选中的元素
        for (n = 0; n < allSelector.length; n++) {
          /**
           * 处理每一个选择器组 依次选取所有的选择器组表示的元素
           * 然后保存到tempElems中
           */
          var tempEndElem, parentElem = [document],
            arr = this.trim(allSelector[n]).split(/\s+/g),
            endElem;
          for (i = 0; i < arr.length; i++) {
            //用本次得到的去覆盖上次的到的
            tempEndElem = this._getElems(parentElem, arr[i]);
            parentElem = endElem = tempEndElem === 'USEPREV' ? endElem : tempEndElem;
          }
          this.merge(tempElems, endElem); //将end数组合并至tempElems中
        }
        this.elems = tempElems; //保存所有选中的元素
      } else {
        throw new Error('@pram selector error');
      }
      return this;
    },

    /*=========================================  _getElems  =======================================*/
    _getElems: function(parentElem, currentSelector) {

      /**
       * 检查是否是直接子代选择器
       * 如果是进行标记并返回一个标记表示使用上次祖元素
       */
      if (currentSelector === '>') {
        this.selectorIsChild = true;
        return 'USEPREV';
      }

      /**
       *
       * 遍历祖元素 然后拿每个祖元素去选取当前选择器
       * 将得到的所有元素保存到数组selectElem中并返回
       *
       */
      var j, temp, tempElem, index,
        selectElem = [], //保存已选中的元素
        selectStr = currentSelector.substring(1); //保存当前选择器去掉选择器符号符号的部分
      for (var i = 0; i < parentElem.length; i++) {
        var elem; //临时保存选中的元素
        switch (currentSelector.charAt(0)) {
          case '#':
            elem = parentElem[i].getElementById(selectStr);
            selectElem.push(elem);
            break;
          case '.':
            /**
             *
             * 类选择器
             * 1. 如果选择器是点字符:字符 或点字符:字符()
             * 需要取出点与冒号之间的字符(类名) 冒号之后括号之前的内容(筛选选择器)
             * 括号之间的值(筛选选择器的值)
             * 2.如果选择器是点字符[字符=字符]
             * 需要取出点之后中括号之前的值(类名) 中括号中等号之前的值(属性名称)
             * 中括号中等号之后的值(属性值)
             * 3.如果之上条件都不成立 直接判定为类选择器
             * 
             */
            if (/\w+\:\w+(\(\d+\))?/g.test(selectStr)) { //

              /**
               * 如果选择器是点字符:字符 或点字符:字符()
               * 如(.item:first || .item:eq(1))
               * temp 是将selectStr进行整理[li,eq,2] 或者 [li,first]
               * index 是eq、lt、gt...传入的参数
               */
              temp = selectStr.split(/\:|\(|\)/);
              index = temp[2];
              tempElem = this._checkClassNameIsMatching(parentElem[i], temp[0]);
              selectElem = this._selectionAndScreening(temp, index, tempElem);
            } else if (/\w+\[\w+\-?\w+\=?\w+?\]/g.test(selectStr)) { //

              /**
               * 类加属性选择器(.item[data-src=xxx] || .item[data-flag])
               * 将属性选择器切成数组   [input,type,button]
               */
              temp = selectStr.split(/\[|\=|\]/g);
              tempElem = this._checkClassNameIsMatching(parentElem[i], temp[0]);
              selectElem = this._propertySelection(temp, tempElem);
            } else { //类选择器(.item)

              elem = this._checkClassNameIsMatching(parentElem[i], selectStr);
              for (j = 0; j < elem.length; j++) selectElem.push(elem[j]);
            }
            break;
          default:

            /**
             *
             * 标签选择器
             * 1.选择器内容如果是字符点字符
             * 按照点分割 前面的是标签名 后面的是类名
             * 2.选择器内容如果是字符:字符 或 字符:字符()
             * 需要取出冒号前的值(标签名) 冒号后与括号前的值(筛选选择器)
             * 括号中的值(筛选选择器的值)
             * 3.选择器内容如果是字符[字符] 或 字符[字符=字符]
             * 需要取出中括号之前的值(标签名) 中括号之中等号之前的值[属性名]
             * 中括号等号后的值(属性值)
             * 4.如果之上的都不符合 那么直接判定为标签名
             * 每次都要先判断当前是否是直接子代状态
             *
             */

            if (/\w+\.\w+/g.test(currentSelector)) { //如果选择器是字符点字符(li.item)

              temp = currentSelector.split(".");
              tempElem = this._checkTagNameIsMatching(parentElem[i], temp[0]);
              for (j = 0; j < tempElem.length; j++) {
                if (tempElem[j].className.indexOf(temp[1]) !== -1) selectElem.push(tempElem[j]);
              }
            } else if (/\w+\:\w+(\(\d+\))?/g.test(currentSelector)) {

              /**
               * 如果选择器是字符:字符 或字符:字符() (li:first || li:eq(1))
               * 将currentElem进行整理[li,eq,2] 或者 [li,first]
               */
              temp = currentSelector.split(/\:|\(|\)/);
              index = temp[2]; //eq、lt、gt...传入的参数
              tempElem = this._checkTagNameIsMatching(parentElem[i], temp[0]);
              selectElem = this._selectionAndScreening(temp, index, tempElem);
            } else if (/\w+\[\w+\-?\w+\=?\w+?\]/g.test(currentSelector)) { //

              /**
               * 如果是属性选择器 input[type=button] a[data-flag]
               * 将属性选择器切成数组   [input,type,button]
               */
              temp = currentSelector.split(/\[|\=|\]/g);
              tempElem = this._checkTagNameIsMatching(parentElem[i], temp[0]);
              selectElem = this._propertySelection(temp, tempElem);
            } else { //否则就是标签选择器(li)

              elem = this._checkTagNameIsMatching(parentElem[i], currentSelector);
              for (j = 0; j < elem.length; j++) selectElem.push(elem[j]);
            }
            break;
        }
      }
      this.selectorIsChild = false;
      return selectElem;
    },

    /*===================================  _checkTagNameIsMatching  ================================*/
    _checkTagNameIsMatching: function(currentParentElem, tagName) {
      //返回currentParentElem的直接子元素中所有标签名是tagName的选项的集合
      var allChilds, j, tempElem = [];
      if (this.selectorIsChild) {
        allChilds = currentParentElem.childNodes;
        for (j = 0; j < allChilds.length; j++) {
          if (allChilds[j].nodeName.toUpperCase() === tagName.toUpperCase()) {
            tempElem.push(allChilds[j]);
          }
        }
      } else {
        tempElem = currentParentElem.getElementsByTagName(tagName);
      }
      return tempElem;
    },

    /*====================================  _checkClassNameIsMatching  ==============================*/
    _checkClassNameIsMatching: function(currentParentElem, className) {
      //返回currentParentElem的直接子元素中所有className包含className的选项的集合
      var j, allChilds, tempElem = [];
      if (this.selectorIsChild) { //直接子代选择器
        allChilds = currentParentElem.childNodes;
        for (j = 0; j < allChilds.length; j++) {
          if (allChilds[j].className && allChilds[j].className.indexOf(className) !== -1) {
            tempElem.push(allChilds[j]);
          }
        }
      } else { //不是直接子代选择器
        tempElem = this.getByClass(currentParentElem, className);
      }
      return tempElem;
    },

    /*======================================  _propertySelection  ==================================*/
    _propertySelection: function(temp, tempElem) {
      //属性选择器
      var tempSelectElem = [];
      for (var j = 0; j < tempElem.length; j++) {
        if (temp.length == 4) { //在选中标签中选出有temp[1]的属性切值符合条件
          if (tempElem[j].getAttribute(temp[1]) == temp[2]) {
            tempSelectElem.push(tempElem[j]);
          }
        } else { //在选中标签中选出有temp[1]的属性
          if (tempElem[j].getAttribute(temp[1])) {
            tempSelectElem.push(tempElem[j]);
          }
        }
      }
      return tempSelectElem;
    },

    /*===================================  _selectionAndScreening  =================================*/
    _selectionAndScreening: function(temp, index, tempElem) {
      //返回最终筛选出的所有元素的集合
      var j, tempSelectElem = [];
      switch (temp[1]) {
        case "eq":
          tempSelectElem.push(tempElem[index]);
          break;
        case "first":
          tempSelectElem.push(tempElem[0]);
          break;
        case "last":
          tempSelectElem.push(tempElem[tempElem.length - 1]);
          break;
        case "lt": //如果是lt需要将tempElem数组中获取到的小于n的标签循环推入tempSelectElem中
          for (j = 0; j < index; j++)
            tempSelectElem.push(tempElem[j]);
          break;
        case "gt": //和lt相反
          for (j = index; j < tempElem.length; j++)
            tempSelectElem.push(tempElem[j]);
          break;
        case "even": //选择偶数个
          for (j = 0; j < tempElem.length; j += 2)
            tempSelectElem.push(tempElem[j]);
          break;
        case "odd": //获取奇数个
          for (j = 1; j < tempElem.length; j += 2)
            tempSelectElem.push(tempElem[j]);
          break;
        default:
          break;
      }
      return tempSelectElem;
    }
  });

  /*=====================================================================================
  =                                       字符串操作模块                                =
  ======================================================================================*/
  _Elegant.extends({
    trim: function(str) {
      return str.replace(/(^\s*)|(\s*$)/g, "");
    }
  });

  /*=====================================================================================
  =                                        数组操作模块                                 =
  ======================================================================================*/
  _Elegant.extends({
    minValue: function(arr) {
      return Math.min.apply(null, arr);
    },
    maxValue: function(arr) {
      return Math.max.apply(null, arr);
    },
    merge: function(arr1, arr2) {
      Array.prototype.push.apply(arr1, arr2);
    },
    hasItem: function(arr, item) {
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] == item) return true;
      }
      return false;
    },
    removeItem: function(arr, val) {
      var tempArr = [];
      this._map(arr, function(item) {
        if (item == val) tempArr.push(item);
      });
      return tempArr;
    }
  });

  /*=====================================================================================
  =                                       运动与动画模块                                =
  ======================================================================================*/
  _Elegant.extends({
    /**
     * [animate 动画]
     * @param  {[Object]}   options  [将要发生动画的属性:值]
     * @param  {[Number]}   duration [动画持续的时间]
     * @param  {Function} fn       [动画执行完成的回调函数]
     * @param  {[String]}   timeLine [过渡效果的时间曲线 
     *         允许的值:linear ease easeIn easeInOut]
     * @return {[this]}            [返回自身以支持链式调用]
     */
    animate: function(options, duration, fn, timeLine) {
      var self = this,
        timingFunction = timeLine || 'easeIn';
      this.each(function(item) {
        var startTime = new Date().getTime(),
          key, initialVlaues = {};

        for (key in options) { //保存当前元素的将要做动画的属性的初始值
          initialVlaues[key] = key == 'opacity' ?
            this._getCss(item, key) * 100 : parseInt(this._getCss(item, key));
        }

        /**
         * 临时保存当前元素动画的最终效果 
         * 使当用户暂停了当前动画的时候 可以继续前一次的位置执行到结束
         */
        item.animateSettings = options;
        item.timer = setInterval(function() {
          var currentTime = new Date().getTime() - startTime; //当前动画已经运行的时间
          item.duration = duration - currentTime; //保存当前动画还有多少时间结束
          if (currentTime >= duration) {

            /**
             * 当动画播放结束 删除保存的当前动画最终效果及剩余时间
             * 并设置当前元素的样式为最终效果 以消除动画中小的误差
             */
            delete item.duration;
            delete item.animateSettings;
            for (key in options) {
              item.style[key] = key == 'opacity' ? options[key] : options[key] + 'px';
              if (key == 'opacity') item.style.filter = 'alpha(opacity=' + options[key] * 100 + ')';
            }
            if (fn) fn();
            self.stop();
          } else {
            //正常执行动画
            for (key in options) {
              var keyVal = options[key],
                initKeyVal = initialVlaues[key],
                tween = self.Tween[timingFunction];
              if (key == 'opacity') {
                var alphaVal = tween(currentTime, initKeyVal, keyVal * 100 - initKeyVal, duration);
                item.style[key] = alphaVal / 100;
                item.style.filter = 'alpha(opacity=' + alphaVal + ')';
              } else {
                item.style[key] = tween(currentTime, initKeyVal, keyVal - initKeyVal, duration) + 'px';
              }
            }
          }
        }, 1);
      });
      return this;
    },

    /**
     * [stop 停止当前动画]
     * @return {[this]} [返回自身以支持链式调用]
     */
    stop: function() {
      this.each(function(item) {
        clearInterval(item.timer);
      });
      return this;
    },

    /**
     * [start 开始当前动画]
     * @return {[this]} [返回自身以支持链式调用]
     */
    start: function() {
      this.each(function(item) {
        if (!item.animateSettings || !item.duration) {
          throw new Error('当前元素不在动画序列中');
        }
        this.animate(item.animateSettings, item.duration);
      });
      return this;
    }
  });

  return function() {
    function Elegant() {
      return new _Elegant(arguments[0]);
    }
    //全局工具函数
    Elegant.ajax = function(){
      /********************************************************************************************
       *****************************************************************************************
       **************************************待补充*****************************************
       *****************************************************************************************
       ********************************************************************************************/
    };
    return Elegant;
  }
})(window), window);

/*===========================================================================================
=                                           test                                            =
============================================================================================*/

// console.log(Elegant('#box').attr('data-flag'));
// console.log(Elegant('#box').attr('class'));
// 
// Elegant('#box').addClass('hello', 'world', 'name', 'space');
// Elegant('#box').removeClass('hello');
// console.log(Elegant('.container'));
// Elegant('.container').eq(0).click(function() {
//   Elegant(this).animate({
//     width: 300,
//     height: 300,
//     opacity: 0.6
//   }, 1000);
// });
/*var box = document.getElementById('box');
box.className+=' hello';
box.className+=' world';
console.log(box.className);*/
