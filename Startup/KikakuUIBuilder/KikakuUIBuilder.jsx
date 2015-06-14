/*
 *  KikakuUIBuilder v2.0.0
 * 
 *  Author: Kareobana (http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.JSON
 *    KIKAKU.FileManager v0.0.0
 *    KIKAKU.SettingManager v0.0.0
 *    KIKAKU.EventDispatcher v0.0.0
 */

var KIKAKU = KIKAKU || function(fn) {
  app.beginUndoGroup('KIKAKU');
  try {
    fn();
  } catch (e) {
    alert(e);
  }
  app.endUndoGroup();
};

(function(root) {
  /*
   * Declaration
   */
  function UIBuilder(global, name, options) {
    this._initialize.apply(this, arguments);
  }

  UIBuilder.LIBRARY_NAME = 'KikakuUIBuilder';
  
  UIBuilder.VERSION = '2.0.0';
  
  UIBuilder.AUTHOR = 'Kareobana';

  UIBuilder.API = API;

  UIBuilder.prototype.getName = getName;
  UIBuilder.prototype.getVersion = getVersion;
  UIBuilder.prototype.getAuthor = getAuthor;
  UIBuilder.prototype.getUrl = getUrl;

  UIBuilder.prototype.add = add;

  UIBuilder.prototype.api = api;

  UIBuilder.prototype.on = on;
  UIBuilder.prototype.off = off;
  UIBuilder.prototype.trigger = trigger;

  UIBuilder.prototype.get = get_;
  UIBuilder.prototype.set = set_;
  UIBuilder.prototype.execute = execute;
  UIBuilder.prototype.enable = enable;
  UIBuilder.prototype.disable = disable;
  UIBuilder.prototype.getItems = getItems;
  UIBuilder.prototype.replaceItems = replaceItems;
  UIBuilder.prototype.addItems = addItems;
  UIBuilder.prototype.removeItem = removeItem;

  UIBuilder.prototype.getSetting = getSetting;
  UIBuilder.prototype.saveSetting = saveSetting;
  UIBuilder.prototype.deleteSetting = deleteSetting;

  UIBuilder.prototype.getFileNames = getFileNames;
  UIBuilder.prototype.existsFile = existsFile;
  UIBuilder.prototype.getFile = getFile;
  UIBuilder.prototype.saveFile = saveFile;
  UIBuilder.prototype.deleteFile = deleteFile;

  UIBuilder.prototype.update = update;
  UIBuilder.prototype.close = close;

  UIBuilder.prototype.build = build;

  /*
   * Implementation
   */
  //utility
  function noop() {}

  function isObject(arg) {
    return Object.prototype.toString.call(arg) === '[object Object]';
  }

  function isArray(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }

  function isFunction(arg) {
    return Object.prototype.toString.call(arg) === '[object Function]';
  }

  function isString(arg) {
    return Object.prototype.toString.call(arg) === '[object String]';
  }

  function isNumber(arg) {
    return Object.prototype.toString.call(arg) === '[object Number]';
  }

  function isBoolean(arg) {
    return Object.prototype.toString.call(arg) === '[object Boolean]';
  }

  function isUndefined(arg) {
    return typeof arg === 'undefined';
  }

  function clamp(v, mn, mx) {
    if (v < mn) {
      return mn;
    } else if (mx < v) {
      return mx;
    }
    return v;
  }

  function forEach(obj, fn) {
    if (isArray(obj)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        fn(obj[i], i);
      }
    } else if (isObject(obj)) {
      for (var key in obj) {
        fn(obj[key], key);
      }
    }
  }

  function map(arr, fn) {
    var result = [];
    forEach(arr, function(v) {
      result.push(fn(v));
    });
    return result;
  }

  function filter(arr, fn) {
    var result = [];
    forEach(arr, function(v, i) {
      if (fn(v, i)) {
        result.push(v);
      }
    });
    return result;
  }

  function some(arr, fn) {
    fn = isFunction(fn) ? fn : (function(value) {
      return function(v) {
        return v === value;
      };
    })(fn);

    for (var i = 0, l = arr.length; i < l; i++) {
      if (fn(arr[i])) {
        return true;
      }
    }
    return false;
  }

  function extend() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 0) {
      return {};
    }
    var obj1 = isObject(args[0]) ? args[0] : {};
    for (var i = 1, l = args.length; i < l; i++) {
      var obj2 = args[i];
      if (isObject(obj2)) {
        for (var key in obj2) {
          if (obj2.hasOwnProperty(key)) {
            obj1[key] = obj2[key];
          }
        }
      }
    }
    return obj1;
  }

  function getKeys(obj) {
    var keys = [];
    for (var key in obj) {
      keys.push(key);
    }
    return keys;
  }

  var inherits = (function() {
    var F = function() {};
    return function(C, P) {
      F.prototype = P.prototype;
      C.prototype = new F();
      C.uber = P.prototype;
      C.prototype.constructor = C;
    };
  })();

  var MATH_REGEX = /Math\s*\.\s*(?:E|LN2|LN10|LOG2E|LOG10E|PI|SQRT1_2|SQRT2|abs|acos|asin|atan2|atan|ceil|exp|floor|log|max|min|pow|random|round|sin|cos|sqrt|tan)/g,
    FORMULA_REGEX = /^(?:[0-9.eE]|NaN|Infinifty|\!|\=|\?|\:|\+|\-|\*|\/|\%|\~|\&|\||\^|\<|\>|\(|\)|\s)*$/;

  function parseNumber(value) {
    if (isNumber(value)) {
      return value;
    }
    if (FORMULA_REGEX.test(value.replace(MATH_REGEX, ''))) {
      try {
        value = eval(value);
      } catch (e) {
        //pass
      }
    }
    value = parseFloat(value);
    if (isNaN(value) || !isFinite(value)) {
      value = 0;
    }
    return value;
  }

  /*
   * Parameter Interface
   */
  function IParameter() {}
  IParameter.prototype.getHeight = noop;
  IParameter.prototype.build = noop;
  IParameter.prototype.init = noop;
  IParameter.prototype.get = noop;
  IParameter.prototype.set = noop;
  IParameter.prototype.execute = noop;
  IParameter.prototype.enable = noop;
  IParameter.prototype.disable = noop;
  IParameter.prototype.getItems = noop;
  IParameter.prototype.addItems = noop;
  IParameter.prototype.removeItem = noop;
  IParameter.prototype.replaceItems = noop;
  IParameter.prototype.toJSON = function() {
    return {};
  };

  /*
   * Parameter
   */
  function Parameter() {}
  inherits(Parameter, IParameter);

  Parameter.DEFAULT_HEIGHT = 24;

  Parameter.prototype.getHeight = function() {
    return Parameter.DEFAULT_HEIGHT;
  };

  Parameter.prototype._initialize = function(name, value, options) {
    this._name = name;
    this._value = value;
    this._options = {
      title: true,
      helpTip: null
    };
    if (isObject(options)) {
      extend(this._options, options);
    } else if (isBoolean(options)) {
      extend(this._options, {
        title: options
      });
    } else if (isFunction(options) || isArray(options)) {
      extend(this._options, {
        callback: options
      });
    }
    this._initialized = function () {
      return false;
    };
  };

  Parameter.prototype.build = function(group, builder) {
    this._group = group;
    this._builder = builder;

    this._buildUI();
  };

  Parameter.prototype._buildUI = function() {
    var group = this._group,
      builder = this._builder;

    var is_title = isBoolean(this._options.title) ? this._options.title : true,
      title_width = is_title ? builder._options.titleWidth : 0;
    if (is_title) {
      this._buildTitle(title_width);
    }

    var parameter_width = group.size[0] - title_width;
    this._buildParameter(parameter_width);
  };

  Parameter.prototype._buildTitle = function(width) {
    var group = this._group,
      height = Parameter.DEFAULT_HEIGHT,
      title_group = group.add('group', [0, 0, width, height]);

    title_group.minimumSize = title_group.maximumSize = [width, height];
    title_group.spacing = title_group.margins = 0;
    title_group.alignment = ['left', 'top'];

    var title = isString(this._options.title) ? this._options.title : this._name;
    title_group.add('statictext', undefined, title);
  };

  Parameter.prototype._buildParameter = noop;

  Parameter.prototype.init = function(obj) {
    if (isObject(obj)) {
      if (!isUndefined(obj.items)) {
        this.replaceItems(obj.items);
      }

      if (!isUndefined(obj.value)) {
        this.set(obj.value);
      }
    }
    this._initialized = function () {
      return true;
    };
  };

  Parameter.prototype.enable = function() {
    this._group.enabled = true;
  };

  Parameter.prototype.disable = function() {
    this._group.enabled = false;
  };

  Parameter.prototype.toJSON = function() {
    return {
      value: this.get()
    };
  };

  /*
   * Single Parameter
   */
  function SingleParameter() {}
  inherits(SingleParameter, Parameter);

  SingleParameter.prototype._onChange = function() {
    this._on('callback', true);
  };

  SingleParameter.prototype._on = function(event, update) {
    if (!this._initialized()) {
      return;
    }

    var builder = this._builder,
      callback = this._options[event];

    if (isFunction(callback)) {
      callback.call(builder);
    }

    if (update) {
      builder.update();
    }
  };

  /*
   * Multiple Parameter
   */
  function MultipleParameter() {}
  inherits(MultipleParameter, Parameter);

  MultipleParameter.prototype._onChange = function(index) {
    this._on(index, 'callback', true);
  };

  MultipleParameter.prototype._on = function(index, event, update) {
    if (!this._initialized()) {
      return;
    }

    var builder = this._builder,
      callback = this._options[event];

    if (isFunction(callback)) {
      callback.call(builder, index);
    } else if (isArray(callback) && isNumber(index) && isFunction(callback[index])) {
      callback[index].call(builder, index);
    }

    if (update) {
      builder.update();
    }
  };

  /*
   * Heading
   */
  function HeadingParameter() {
    this.type = 'heading';
    this._initialize.apply(this, arguments);
  }
  inherits(HeadingParameter, Parameter);

  HeadingParameter.prototype._buildUI = function() {
    var group = this._group,
      width = group.size[0],
      height = group.size[1];

    var heading_group = group.add('group', [0, 0, width, height]);
    heading_group.minimumSize = [width, height];
    heading_group.spacing = heading_group.margins = 0;
    heading_group.orientation = 'row';
    heading_group.alignment = ['fill', 'top'];
    heading_group.alignChildren = ['fill', 'fill'];

    var heading = this._name;
    if (isString(this._value)) {
      heading = this._value;
    } else if (isString(this._options.title)) {
      heading = this._options.title;
    }

    var heading_ui = this._ui = heading_group.add('statictext', [0, 0, width, height], heading);
    heading_ui.justify = 'center';
    if (isString(this._options.helpTip)) {
      heading_ui.helpTip = this.options.helpTip;
    }
  };

  HeadingParameter.prototype.get = function() {
    return this._ui.text;
  };

  HeadingParameter.prototype.set = function(value) {
    value = String(value);
    if (value !== this._ui.text) {
      this._ui.text = value;
      this._onChange();
    }
  };

  /*
   * Separator
   */
  function SeparatorParameter() {
    this.type = 'separator';
    this._initialize.apply(this, arguments);
  }
  inherits(SeparatorParameter, Parameter);

  SeparatorParameter.DEFAULT_HEIGHT = 12;

  SeparatorParameter.prototype.getHeight = function() {
    return SeparatorParameter.DEFAULT_HEIGHT;
  };

  SeparatorParameter.prototype._buildUI = function() {
    var group = this._group,
      width = group.size[0];

    group.alignChildren = ['fill', 'center'];
    group.add('panel', [0, 0, width, 2]);
  };

  /*
   * Space
   */
  function SpaceParameter() {
    this.type = 'space';
    this._initialize.apply(this, arguments);
  }
  inherits(SpaceParameter, Parameter);

  SpaceParameter.prototype.getHeight = function() {
    if (isNumber(this._value)) {
      this._value = Math.max(this._value, 0);
    } else {
      this._value = 5;
    }
    return this._value;
  };

  SpaceParameter.prototype._buildUI = noop;

  SpaceParameter.prototype.enable = noop;

  SpaceParameter.prototype.disable = noop;

  /*
   * Panel
   */
  function PanelParameter() {
    this.type = 'panel';
    this._initialize.apply(this, arguments);
  }
  inherits(PanelParameter, Parameter);

  PanelParameter.prototype._buildUI = function() {
    var group = this._group;

    var text = this._name;
    if (isString(this._value)) {
      text = this._value;
    } else if (isString(this._options.title)) {
      text = this._options.title;
    }
    group.text = text;
  };

  PanelParameter.prototype.get = function() {
    return this._group.text;
  };

  PanelParameter.prototype.set = function(value) {
    value = String(value);
    if (value !== this.get()) {
      this._group.text = value;
      this._builder.update();
    }
  };

  /*
   * PanelEnd
   */
  function PanelEndParameter() {
    this.type = 'panelend';
  }
  inherits(PanelEndParameter, IParameter);

  /*
   * Text
   */
  function TextParameter() {
    this.type = 'text';
    this._initialize.apply(this, arguments);
    this._creation_properties = {};
  }
  inherits(TextParameter, SingleParameter);

  TextParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      value = this._value || '';

    var text_ui = this._ui = group.add('edittext', undefined, value, this._creation_properties);
    if (isString(this._options.helpTip)) {
      text_ui.helpTip = this._options.helpTip;
    }

    text_ui.onChange = function() {
      self._onChange();
    };

    text_ui.onChanging = function() {
      self._on('onChanging', false);
    };
  };

  TextParameter.prototype.get = function() {
    return this._ui.text;
  };

  TextParameter.prototype.set = function(value) {
    value = String(value);
    if (value !== this.get()) {
      this._ui.text = value;
      this._onChange();
    }
  };

  /*
   * Texts
   */
  function TextsParameter() {
    this.type = 'texts';
    this._initialize.apply(this, arguments);
    this._creation_properties = {};
  }
  inherits(TextsParameter, MultipleParameter);

  TextsParameter.prototype._buildParameter = function() {
    var self = this,
      group = this._group,
      helpTip = this._options.helpTip;

    this._ui = [];
    forEach(this._value, function(value, i) {
      var ui = group.add('edittext', undefined, '', self._creation_properties);
      if (isString(helpTip)) {
        ui.helpTip = helpTip;
      } else if (isArray(helpTip) && isString(helpTip[i])) {
        ui.helpTip = helpTip[i];
      }
      ui.onChange = (function(index) {
        return function() {
          self._onChange(index);
        };
      })(i);
      ui.onChanging = (function(index) {
        return function() {
          self._on(index, 'onChanging', false);
        };
      })(i);
      self._ui.push(ui);
    });
  };

  TextsParameter.prototype.init = function(obj) {
    this.set(this._value);
    TextsParameter.uber.init.call(this, obj);
  };

  TextsParameter.prototype.get = function(index) {
    if (isNumber(index)) {
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      return this._ui[index].text;
    }

    var values = [];
    forEach(this._ui, function(ui) {
      values.push(ui.text);
    });

    return values;
  };

  TextsParameter.prototype.set = function(value, value2) {
    var self = this;
    if (!isUndefined(value2)) {
      var index = value;
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      value2 = String(value2);
      if (value2 !== this.get(index)) {
        this._ui[index].text = value2;
        this._onChange(index);
      }
    } else {
      if (isArray(value)) {
        value = value.slice(0, this._ui.length);
        forEach(value, function(value, i) {
          self.set(i, value);
        });
      }
    }
  };

  /*
   * TextArea
   */
  function TextAreaParameter() {
    this.type = 'textarea';
    this._initialize.apply(this, arguments);
    this._creation_properties = {
      multiline: true,
      scrolling: true
    };
  }
  inherits(TextAreaParameter, TextParameter);

  TextAreaParameter.prototype.getHeight = function() {
    var height = 80;
    if (isObject(this._options) && isNumber(this._options.height)) {
      height = this._options.height;
    }
    return height;
  };

  /*
   * TextAreas
   */
  function TextAreasParameter() {
    this.type = 'textareas';
    this._initialize.apply(this, arguments);
    this._creation_properties = {
      multiline: true,
      scrolling: true
    };
  }
  inherits(TextAreasParameter, TextsParameter);

  TextAreasParameter.prototype.getHeight = function() {
    var height = 80;
    if (isObject(this._options) && isNumber(this._options.height)) {
      height = this._options.height;
    }
    return height;
  };

  /*
   * Statictext
   */
  function StaticTextParameter() {
    this.type = 'statictext';
    this._initialize.apply(this, arguments);
  }
  inherits(StaticTextParameter, TextParameter);

  StaticTextParameter.prototype._buildParameter = function(width) {
    var group = this._group,
      value = this._value || '';

    var text_ui = this._ui = group.add('statictext', undefined, value);
    if (isString(this._options.helpTip)) {
      text_ui.helpTip = this._options.helpTip;
    }
  };

  /*
   * Statictexts
   */
  function StaticTextsParameter() {
    this.type = 'statictexts';
    this._initialize.apply(this, arguments);
  }
  inherits(StaticTextsParameter, TextsParameter);

  StaticTextsParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      helpTip = this._options.helpTip;

    this._ui = [];
    forEach(this._value, function(value, i) {
      var ui = group.add('statictext', undefined, '');
      if (isString(helpTip)) {
        ui.helpTip = helpTip;
      } else if (isArray(helpTip) && isString(helpTip[i])) {
        ui.helpTip = helpTip[i];
      }
      self._ui.push(ui);
    });
  };

  /*
   * Number
   */
  function numberOnChange(parameter, options) {
    options = extend({
      minvalue: -Infinity,
      maxvalue: Infinity,
      index: null
    }, options);

    return function() {
      var value = clamp(parseNumber(this.text), options.minvalue, options.maxvalue);
      this.text = value + '';
      parameter._onChange.call(parameter, options.index);
    };
  }

  function extractNumberValue(obj) {
    var default_value = 0,
      minvalue = -Infinity,
      maxvalue = Infinity;

    if (isObject(obj)) {
      if (isNumber(obj.minvalue)) {
        minvalue = obj.minvalue;
      }
      if (isNumber(obj.maxvalue)) {
        maxvalue = obj.maxvalue;
      }
      if (isNumber(obj.value)) {
        default_value = obj.value;
      }
    } else if (isNumber(obj)) {
      default_value = obj;
    }

    return {
      value: default_value,
      minvalue: minvalue,
      maxvalue: maxvalue
    };
  }

  function NumberParameter() {
    this.type = 'number';
    this._initialize.apply(this, arguments);
  }
  inherits(NumberParameter, SingleParameter);

  NumberParameter.prototype._buildParameter = function(width) {
    var group = this._group,
      value = this._value || '',
      minmax = extractNumberValue(value);

    this._minvalue = minmax.minvalue;
    this._maxvalue = minmax.maxvalue;

    var number_ui = this._ui = group.add('edittext', undefined, minmax.value);
    if (isString(this._options.helpTip)) {
      number_ui.helpTip = this._options.helpTip;
    }

    number_ui.onChange = numberOnChange(this, {
      minvalue: minmax.minvalue,
      maxvalue: minmax.maxvalue
    });
  };

  NumberParameter.prototype.get = function() {
    return parseFloat(this._ui.text);
  };

  NumberParameter.prototype.set = function(value) {
    value = clamp(parseNumber(value), this._minvalue, this._maxvalue);

    if (value !== this.get()) {
      this._ui.text = value + '';
      this._onChange();
    }
  };

  /*
   * Numbers
   */
  function NumbersParameter() {
    this.type = 'numbers';
    this._initialize.apply(this, arguments);
  }
  inherits(NumbersParameter, MultipleParameter);

  NumbersParameter.prototype._buildParameter = function() {
    var self = this,
      group = this._group,
      helpTip = this._options.helpTip;

    this._default_value = [];
    this._minvalue = [];
    this._maxvalue = [];
    this._ui = [];
    forEach(this._value, function(value, i) {
      var minmax = extractNumberValue(value);

      self._default_value.push(minmax.value);
      self._minvalue.push(minmax.minvalue);
      self._maxvalue.push(minmax.maxvalue);

      var ui = group.add('edittext', undefined, '');
      if (isString(helpTip)) {
        ui.helpTip = helpTip;
      } else if (isArray(helpTip) && isString(helpTip[i])) {
        ui.helpTip = helpTip[i];
      }
      ui.onChange = numberOnChange(self, {
        minvalue: minmax.minvalue,
        maxvalue: minmax.maxvalue,
        index: i
      });
      self._ui.push(ui);
    });
  };

  NumbersParameter.prototype.init = function(obj) {
    this.set(this._default_value);
    NumbersParameter.uber.init.call(this, obj);
  };

  NumbersParameter.prototype.get = function(index) {
    if (isNumber(index)) {
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      return parseFloat(this._ui[index].text);
    }

    var values = [];
    forEach(this._ui, function(ui) {
      values.push(parseFloat(ui.text));
    });

    return values;
  };

  NumbersParameter.prototype.set = function(value, value2) {
    var self = this;
    if (!isUndefined(value2)) {
      var index = value;
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      value2 = clamp(parseNumber(value2), this._minvalue[index], this._maxvalue[index]);
      if (value2 !== this.get(index)) {
        this._ui[index].text = value2 + '';
        this._onChange(index);
      }
    } else {
      if (isArray(value)) {
        value = value.slice(0, this._ui.length);
        forEach(value, function(value, i) {
          self.set(i, value);
        });
      }
    }
  };

  /*
   * Slider
   */
  function extractSliderValue(obj) {
    var value = {};

    if (isObject(obj)) {
      if (isNumber(obj.minvalue)) {
        value.minvalue = obj.minvalue;
      }
      if (isNumber(obj.maxvalue)) {
        value.maxvalue = obj.maxvalue;
      }
      if (isNumber(obj.value)) {
        value.value = obj.value;
      }
    } else if (isNumber(obj)) {
      value.value = obj;
    }

    return value;
  }

  function SliderParameter() {
    this.type = 'slider';
    this._initialize.apply(this, arguments);
  }
  inherits(SliderParameter, SingleParameter);

  SliderParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      value = extend({
        value: 0,
        minvalue: 0,
        maxvalue: 100
      }, extractSliderValue(this._value));

    this._minvalue = value.minvalue;
    this._maxvalue = value.maxvalue;

    var height = group.size[1],
      number_width = Math.min(0.25 * width, 50),
      slider_width = width - number_width;

    var slider_ui = this._ui = group.add('slider', undefined, value.value, value.minvalue, value.maxvalue);
    slider_ui.preferredSize = [slider_width, height];

    var number_ui = this._number_ui = group.add('edittext', undefined, value.value);
    number_ui.preferredSize = [number_width, height];
    number_ui.maximumSize = [Math.max(number_width, 100), height];

    if (isString(this._options.helpTip)) {
      slider_ui.helpTip = this._options.helpTip;
      number_ui.helpTip = this._options.helpTip;
    }

    slider_ui.onChange = function() {
      self._onChange();
    };

    slider_ui.onChanging = function() {
      number_ui.text = this.value;
    };

    number_ui.onChange = function() {
      var value = clamp(parseNumber(this.text), self._minvalue, self._maxvalue);
      this.text = value;
      slider_ui.value = value;
      self._onChange();
    };
  };

  SliderParameter.prototype.get = function() {
    return this._ui.value;
  };

  SliderParameter.prototype.set = function(value) {
    value = clamp(parseNumber(value), this._minvalue, this._maxvalue);

    if (value !== this.get()) {
      this._ui.value = value;
      this._number_ui.text = value;
      this._onChange();
    }
  };

  /*
   * Point
   */
  function PointParameter() {
    this.type = 'point';
    this._initialize.apply(this, arguments);
  }
  inherits(PointParameter, SingleParameter);

  PointParameter.prototype._buildParameter = function() {
    this._value = this._value || [0, 0];

    var self = this,
      group = this._group;

    this._ui = [];
    for (var i = 0; i < 2; i++) {
      var ui = group.add('edittext', undefined, '');
      if (isString(this._options.helpTip)) {
        ui.helpTip = this._options.helpTip;
      }
      ui.onChange = numberOnChange(this);
      this._ui.push(ui);
    }
  };

  PointParameter.prototype.init = function(obj) {
    this.set(this._value);
    PointParameter.uber.init.call(this, obj);
  };

  PointParameter.prototype.get = function() {
    return [parseFloat(this._ui[0].text), parseFloat(this._ui[1].text)];
  };

  PointParameter.prototype.set = function(value) {
    if (!isArray(value) || value.length !== 2) {
      throw new Error('Invalid value: ' + value);
    }

    value = [parseNumber(value[0]), parseNumber(value[1])];
    var current_value = this.get();
    if (value[0] !== current_value[0] || value[1] !== current_value[1]) {
      this._ui[0].text = value[0] + '';
      this._ui[1].text = value[1] + '';
      this._onChange();
    }
  };

  /*
   * Point3d
   */
  function Point3dParameter() {
    this.type = 'point3d';
    this._initialize.apply(this, arguments);
  }
  inherits(Point3dParameter, SingleParameter);

  Point3dParameter.prototype._buildParameter = function() {
    this._value = this._value || [0, 0, 0];

    var self = this,
      group = this._group;

    this._ui = [];
    for (var i = 0; i < 3; i++) {
      var ui = group.add('edittext', undefined, '');
      if (isString(this._options.helpTip)) {
        ui.helpTip = this._options.helpTip;
      }
      ui.onChange = numberOnChange(this);
      this._ui.push(ui);
    }
  };

  Point3dParameter.prototype.init = function(obj) {
    this.set(this._value);
    PointParameter.uber.init.call(this, obj);
  };

  Point3dParameter.prototype.get = function() {
    return [parseFloat(this._ui[0].text), parseFloat(this._ui[1].text), parseFloat(this._ui[2].text)];
  };

  Point3dParameter.prototype.set = function(value) {
    if (!isArray(value) || value.length !== 3) {
      throw new Error('Invalid value: ' + value);
    }

    value = [parseNumber(value[0]), parseNumber(value[1]), parseNumber(value[2])];
    var current_value = this.get();
    if (value[0] !== current_value[0] || value[1] !== current_value[1] || value[2] !== current_value[2]) {
      this._ui[0].text = value[0] + '';
      this._ui[1].text = value[1] + '';
      this._ui[2].text = value[2] + '';
      this._onChange();
    }
  };

  /*
   * File
   */
  function FileParameter() {
    this.type = 'file';
    this._initialize.apply(this, arguments);
  }
  inherits(FileParameter, TextParameter);

  FileParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      value = this._value || '';

    var path_ui = this._ui = group.add('edittext', undefined, value);
    if (isString(this._options.helpTip)) {
      path_ui.helpTip = this._options.helpTip;
    }
    path_ui.onChange = function() {
      self._onChange();
    };

    var filter = this._options.filter,
      browse_ui = group.add('button', undefined, '...');
    browse_ui.maximumSize = [20, group.size[1]];
    browse_ui.alignment = ['right', 'fill'];
    browse_ui.onClick = function() {
      var file = File.openDialog(undefined, filter, false);
      if (file !== null) {
        if (path_ui.text !== file.absoluteURI) {
          path_ui.text = file.absoluteURI;
          self._onChange();
        }
      }
    };
  };

  /*
   * Folder
   */
  function FolderParameter() {
    this.type = 'folder';
    this._initialize.apply(this, arguments);
  }
  inherits(FolderParameter, TextParameter);

  FolderParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      value = this._value || '';

    var path_ui = this._ui = group.add('edittext', undefined, value);
    if (isString(this._options.helpTip)) {
      path_ui.helpTip = this._options.helpTip;
    }
    path_ui.onChange = function() {
      self._onChange();
    };

    var browse_ui = group.add('button', undefined, '...');
    browse_ui.maximumSize = [20, group.size[1]];
    browse_ui.alignment = ['right', 'fill'];
    browse_ui.onClick = function() {
      var file = Folder.selectDialog();
      if (file !== null) {
        if (path_ui.text !== file.absoluteURI) {
          path_ui.text = file.absoluteURI;
          self._onChange();
        }
      }
    };
  };

  /*
   * Checkbox
   */
  function extractCheckboxValue(obj) {
    var value,
      text = '';

    if (isObject(obj)) {
      if (isBoolean(obj.value)) {
        value = obj.value;
      }
      if (isString(obj.text)) {
        text = obj.text;
      }
    } else {
      value = !!obj;
    }

    return {
      value: value,
      text: text
    };
  }

  function CheckboxParameter() {
    this.type = 'checkbox';
    this._initialize.apply(this, arguments);
  }
  inherits(CheckboxParameter, SingleParameter);

  CheckboxParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      value = extractCheckboxValue(this._value);

    var checkbox_ui = this._ui = group.add('checkbox', undefined, value.text);
    if (isString(this._options.helpTip)) {
      checkbox_ui.helpTip = this._options.helpTip;
    }
    checkbox_ui.alignment = ['left', 'top'];
    checkbox_ui.value = value.value;

    checkbox_ui.onClick = function() {
      self._onChange();
    };
  };

  CheckboxParameter.prototype.get = function() {
    return this._ui.value;
  };

  CheckboxParameter.prototype.set = function(value) {
    value = !!value;
    if (value !== this.get()) {
      this._ui.value = value;
      this._onChange();
    }
  };

  /*
   * Checkboxes
   */
  function CheckboxesParameter() {
    this.type = 'checkboxes';
    this._initialize.apply(this, arguments);
  }
  inherits(CheckboxesParameter, MultipleParameter);

  CheckboxesParameter.prototype._buildParameter = function() {
    var self = this,
      group = this._group,
      helpTip = this._options.helpTip;

    this._text = [];
    this._ui = [];
    forEach(this._value, function(value, i) {
      value = extractCheckboxValue(value);
      var ui = group.add('checkbox', undefined, '');
      if (isString(helpTip)) {
        ui.helpTip = helpTip;
      } else if (isArray(helpTip) && isString(helpTip[i])) {
        ui.helpTip = helpTip[i];
      }
      ui.value = value.value;
      ui.onClick = (function(index) {
        return function() {
          self._onChange(index);
        };
      })(i);
      self._text.push(value.text);
      self._ui.push(ui);
    });
  };

  CheckboxesParameter.prototype.init = function(obj) {
    var ui = this._ui;
    forEach(this._text, function(text, i) {
      ui[i].text = text;
    });
    CheckboxesParameter.uber.init.call(this, obj);
  };

  CheckboxesParameter.prototype.get = function(index) {
    if (isNumber(index)) {
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      return this._ui[index].value;
    }

    var values = [];
    forEach(this._ui, function(ui) {
      values.push(ui.value);
    });

    return values;
  };

  CheckboxesParameter.prototype.set = function(value, value2) {
    var self = this;
    if (!isUndefined(value2)) {
      var index = value;
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      value2 = !!value2;
      if (value2 !== this.get(index)) {
        this._ui[index].value = value2;
        this._onChange(index);
      }
    } else {
      if (isArray(value)) {
        value = value.slice(0, this._ui.length);
        forEach(value, function(value, i) {
          self.set(i, value);
        });
      }
    }
  };

  /*
   * Radiobutton
   */
  function RadiobuttonParameter() {
    this.type = 'radiobutton';
    this._initialize.apply(this, arguments);
  }
  inherits(RadiobuttonParameter, SingleParameter);

  RadiobuttonParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      help_tip = this._options.helpTip;

    this._ui = [];

    forEach(this._value, function(value, i) {
      var ui = group.add('radiobutton', undefined);
      if (isString(help_tip)) {
        ui.helpTip = help_tip;
      } else if (isArray(help_tip) && isString(help_tip[i])) {
        ui.helpTip = help_tip[i];
      }
      if (i === 0) {
        ui.value = true;
      }
      ui.onClick = function() {
        self._onChange();
      };
      self._ui.push(ui);
    });
  };

  RadiobuttonParameter.prototype.init = function(obj) {
    var ui = this._ui;
    forEach(this._value, function(value, i) {
      ui[i].text = value;
    });
    RadiobuttonParameter.uber.init.call(this, obj);
  };

  RadiobuttonParameter.prototype.get = function() {
    var ui = this._ui,
      text = '';
    for (var i = 0, l = ui.length; i < l; i++) {
      if (ui[i].value) {
        text = ui[i].text;
        break;
      }
    }
    return text;
  };

  RadiobuttonParameter.prototype.set = function(value) {
    var ui = this._ui;
    for (var i = 0, l = ui.length; i < l; i++) {
      if (ui[i].text === value) {
        if (!ui[i].value) {
          ui[i].value = true;
          this._onChange();
        }
        break;
      }
    }
  };

  /*
   * Color
   */
  function parseColor(value) {
    var color = [1, 0, 0, 1];
    if (isArray(value)) {
      for (var i = 0, l = Math.min(value.length, 3); i < l; i++) {
        color[i] = clamp(parseNumber(value[i]), 0, 1);
      }
    }
    return color;
  }

  function isSameColor(c1, c2) {
    for (var i = 0; i < 3; i++) {
      if (c1[i] !== c2[i]) {
        return false;
      }
    }
    return true;
  }

  function hexToRgb(hex) {
    var r = (hex >> 16) & 255,
      g = (hex >> 8) & 255,
      b = hex & 255;
    return [r / 255, g / 255, b / 255, 1];
  }

  function rgbToHex(rgb) {
    var r = ~~(255 * rgb[0]) << 16,
      g = ~~(255 * rgb[1]) << 8,
      b = ~~(255 * rgb[2]);
    return r | g | b;
  }

  function colorOnDraw() {
    var graphics = this.graphics;
    graphics.rectPath(0, 0, this.size[0], this.size[1]);
    graphics.fillPath(graphics.newBrush(graphics.BrushType.SOLID_COLOR, this.value));
    if (!this.enabled) {
      graphics.fillPath(graphics.newBrush(graphics.BrushType.SOLID_COLOR, [0, 0, 0, 0.3]));
    }
  }

  function ColorParameter() {
    this.type = 'color';
    this._initialize.apply(this, arguments);
  }
  inherits(ColorParameter, SingleParameter);

  ColorParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      value = parseColor(this._value);

    var color_ui = this._ui = group.add('button', undefined, '');
    if (isString(this._options.helpTip)) {
      color_ui.helpTip = this._options.helpTip;
    }

    color_ui.value = value;

    color_ui.onDraw = colorOnDraw;

    color_ui.onClick = function() {
      var hex = $.colorPicker(rgbToHex(this.value));
      if (hex != -1) {
        this.value = hexToRgb(hex);
        self._onChange();
      }
    };
  };

  ColorParameter.prototype._onChange = function() {
    var args = Array.prototype.slice.call(arguments);
    ColorParameter.uber._onChange.apply(this, args);
    this._ui.notify('onDraw');
  };

  ColorParameter.prototype.get = function() {
    return this._ui.value;
  };

  ColorParameter.prototype.set = function(value) {
    var color = parseColor(value),
      current_color = this.get();

    if (!isSameColor(color, current_color)) {
      this._ui.value = color;
      this._onChange();
    }
  };

  /*
   * Colors
   */
  function ColorsParameter() {
    this.type = 'colors';
    this._initialize.apply(this, arguments);
  }
  inherits(ColorsParameter, MultipleParameter);

  ColorsParameter.prototype._buildParameter = function() {
    var self = this,
      group = this._group,
      helpTip = this._options.helpTip;

    this._ui = [];
    forEach(this._value, function(value, i) {
      value = parseColor(value);

      var ui = group.add('button', undefined, '');
      if (isString(helpTip)) {
        ui.helpTip = helpTip;
      } else if (isArray(helpTip) && isString(helpTip[i])) {
        ui.helpTip = helpTip[i];
      }

      ui.value = value;

      ui.onDraw = colorOnDraw;

      ui.onClick = (function(index) {
        return function() {
          var hex = $.colorPicker(rgbToHex(this.value));
          if (hex != -1) {
            this.value = hexToRgb(hex);
            self._onChange(index);
          }
        };
      })(i);

      self._ui.push(ui);
    });
  };

  ColorsParameter.prototype._onChange = function(index) {
    var args = Array.prototype.slice.call(arguments);
    ColorsParameter.uber._onChange.apply(this, args);
    this._ui[index].notify('onDraw');
  };

  ColorsParameter.prototype.get = function(index) {
    if (isNumber(index)) {
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      return this._ui[index].value;
    }

    var values = [];
    forEach(this._ui, function(ui) {
      values.push(ui.value);
    });

    return values;
  };

  ColorsParameter.prototype.set = function(value, value2) {
    var self = this;
    if (!isUndefined(value2)) {
      var index = value;
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      value2 = parseColor(value2);
      if (!isSameColor(value2, this.get(index))) {
        this._ui[index].value = value2;
        this._onChange(index);
      }
    } else {
      if (isArray(value)) {
        value = value.slice(0, this._ui.length);
        forEach(value, function(value, i) {
          self.set(i, value);
        });
      }
    }
  };

  /*
   * Item Interface
   */
  function extractItemValue(obj) {
    var value = null,
      items = [];

    if (isObject(obj)) {
      if (!isUndefined(obj.value)) {
        value = obj.value;
      }
      if (isArray(obj.items)) {
        items = obj.items;
      }
    } else if (isArray(obj)) {
      items = obj;
    }

    return {
      value: value,
      items: items
    };
  }

  function processItemUI(ui, builder, fn) {
    try {
      ui.lock = true;
      fn(ui);
      if (ui.selection === null) {
        ui.selection = 0;
      }
    } catch (e) {
      //pass
    } finally {
      ui.lock = false;
      builder.update();
    }
  }

  function ItemParameter() {
    this._default_value = null;
    this._ui = {};
  }
  inherits(ItemParameter, SingleParameter);

  ItemParameter.prototype.init = function(obj) {
    if (this._default_value !== null) {
      this.set(this._default_value);
    }
    ItemParameter.uber.init.call(this, obj);
  };

  ItemParameter.prototype.get = function() {
    if (this._ui.selection === null) {
      return null;
    }
    return this._ui.selection.text;
  };

  ItemParameter.prototype.set = function(value) {
    if (!isString(value)) {
      return;
    }

    var ui = this._ui;
    for (var i = 0, l = ui.items.length; i < l; i++) {
      var item = ui.items[i];
      if (item.text === value) {
        if (ui.selection.index !== i) {
          ui.selection = item;
          this._onChange();
        }
        break;
      }
    }
  };

  ItemParameter.prototype.getItems = function() {
    var ui = this._ui,
      items = [];
    for (var i = 0, l = ui.items.length; i < l; i++) {
      items.push(ui.items[i].text);
    }
    return items;
  };

  ItemParameter.prototype.replaceItems = function(items) {
    if (isString(items)) {
      items = [items];
    } else if (!isArray(items)) {
      return;
    }

    var ui = this._ui,
      builder = this._builder;

    processItemUI(ui, builder, function(ui) {
      ui.removeAll();
      for (var i = 0, l = items.length; i < l; i++) {
        ui.add('item', items[i]);
      }
    });
  };

  ItemParameter.prototype.addItems = function(items) {
    if (isString(items)) {
      items = [items];
    } else if (!isArray(items)) {
      return;
    }

    var ui = this._ui,
      builder = this._builder;

    processItemUI(ui, builder, function(ui) {
      for (var i = 0, l = items.length; i < l; i++) {
        ui.add('item', items[i]);
      }
    });
  };

  ItemParameter.prototype.removeItem = function(item) {
    if (!isString(item)) {
      return;
    }
    var ui = this._ui,
      builder = this._builder;

    processItemUI(ui, builder, function(ui) {
      ui.remove(item);
    });
  };

  ItemParameter.prototype.toJSON = function() {
    return {
      items: this.getItems(),
      value: this.get()
    };
  };

  /*
   * items interface
   */
  function ItemsParameter() {
    this._infos = [];
    this._ui = [];
  }
  inherits(ItemsParameter, MultipleParameter);

  ItemsParameter.prototype.init = function(obj) {
    var self = this,
      infos = this._infos;

    forEach(infos, function(info, i) {
      self.replaceItems(i, info.items);
      self.set(i, info.value);
    });

    ItemsParameter.uber.init.call(this, obj);
  };

  ItemsParameter.prototype.get = function(index) {
    var self = this;
    if (isNumber(index)) {
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      var ui = this._ui[index];
      if (ui.selection === null) {
        return null;
      } else {
        return ui.selection.text;
      }
    }

    var values = [];
    forEach(this._ui, function(ui) {
      if (ui.selection === null) {
        values.push(null);
      } else {
        values.push(ui.selection.text);
      }
    });

    return values;
  };

  ItemsParameter.prototype.set = function(value, value2) {
    var self = this;
    if (!isUndefined(value2)) {
      var index = value;
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      value2 = String(value2);

      var ui = this._ui[index];
      for (var i = 0, l = ui.items.length; i < l; i++) {
        var item = ui.items[i];
        if (item.text === value2) {
          if (ui.selection.index !== i) {
            ui.selection = item;
            this._onChange(index);
            this._builder.update();
          }
          break;
        }
      }
    } else {
      if (isArray(value)) {
        value = value.slice(0, this._ui.length);
        forEach(value, function(value, i) {
          self.set(i, value);
        });
      }
    }
  };

  ItemsParameter.prototype.getItems = function(index) {
    var self = this;
    if (isNumber(index)) {
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }
      var ui = this._ui[index],
        items = [];

      for (var i = 0, l = ui.items.length; i < l; i++) {
        items.push(ui.items[i].text);
      }

      return items;
    }

    var values = [];
    forEach(this._ui, function(ui, i) {
      values.push(self.getItems(i));
    });

    return values;
  };

  ItemsParameter.prototype.replaceItems = function(value, value2) {
    var self = this;
    if (!isUndefined(value2)) {
      var index = value;
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }

      var ui = this._ui[index],
        builder = this._builder,
        items = value2;

      if (isString(items)) {
        items = [items];
      } else if (!isArray(items)) {
        return;
      }

      processItemUI(ui, builder, function(ui) {
        ui.removeAll();
        for (var i = 0, l = items.length; i < l; i++) {
          ui.add('item', items[i]);
        }
      });
      return;
    }

    forEach(value, function(value, i) {
      self.replaceItems(i, value);
    });
  };

  ItemsParameter.prototype.addItems = function(value, value2) {
    var self = this;
    if (!isUndefined(value2)) {
      var index = value;
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }

      var ui = this._ui[index],
        builder = this._builder,
        items = value2;

      if (isString(items)) {
        items = [items];
      } else if (!isArray(items)) {
        return;
      }

      processItemUI(ui, builder, function(ui) {
        for (var i = 0, l = items.length; i < l; i++) {
          ui.add('item', items[i]);
        }
      });

      return;
    }

    forEach(value, function(value, i) {
      self.addItems(i, value);
    });
  };

  ItemsParameter.prototype.removeItem = function(value, value2) {
    var self = this;
    if (!isUndefined(value2)) {
      var index = value;
      if (index < 0 || index >= this._ui.length) {
        throw new Error('"index" is out of range');
      }

      var ui = this._ui[index],
        builder = this._builder,
        item = value2;

      if (!isString(item)) {
        return;
      }

      processItemUI(ui, builder, function(ui) {
        ui.remove(item);
      });

      return;
    }

    forEach(value, function(value, i) {
      self.removeItem(i, value);
    });
  };

  ItemsParameter.prototype.toJSON = function() {
    return {
      items: this.getItems(),
      value: this.get()
    };
  };

  /*
   * Popup
   */
  function PopupParameter() {
    this.type = 'popup';
    this._initialize.apply(this, arguments);
  }
  inherits(PopupParameter, ItemParameter);

  PopupParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      value = extractItemValue(this._value);

    this._default_value = value.value;
    var popup_ui = this._ui = group.add('dropdownlist', undefined, value.items);
    if (isString(this._options.helpTip)) {
      popup_ui.helpTip = this._options.helpTip;
    }
    popup_ui.selection = 0;
    popup_ui.lock = false;

    popup_ui.onChange = function() {
      if (!this.lock) {
        self._onChange();
      }
    };
  };

  /*
   * Popups
   */
  function PopupsParameter() {
    this.type = 'popups';
    this._initialize.apply(this, arguments);
  }
  inherits(PopupsParameter, ItemsParameter);

  PopupsParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      helpTip = this._options.helpTip;

    this._ui = [];
    this._infos = [];
    forEach(this._value, function(value, i) {
      value = extractItemValue(value);
      self._infos.push({
        value: value.value,
        items: value.items
      });

      var ui = group.add('dropdownlist', undefined, []);
      if (isString(helpTip)) {
        ui.helpTip = helpTip;
      } else if (isArray(helpTip) && isString(helpTip[i])) {
        ui.helpTip = helpTip[i];
      }

      ui.onChange = (function(index) {
        return function() {
          if (!this.lock) {
            if (this.selection === null) {
              this.selection = 0;
            }
            self._onChange(index);
          }
        };
      })(i);

      self._ui.push(ui);
    });
  };

  /*
   * ListBox
   */
  function ListboxParameter() {
    this.type = 'listbox';
    this._initialize.apply(this, arguments);
  }
  inherits(ListboxParameter, ItemParameter);

  ListboxParameter.prototype.getHeight = function() {
    var height = 80;
    if (isNumber(this._options.height)) {
      height = this._options.height;
    }
    return height;
  };

  ListboxParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      value = extractItemValue(this._value);

    this._default_value = value.value;
    var listbox_ui = this._ui = group.add('listbox', undefined, value.items);
    if (isString(this._options.helpTip)) {
      listbox_ui.helpTip = this._options.helpTip;
    }
    listbox_ui.selection = 0;
    listbox_ui.lock = false;

    listbox_ui.onChange = function() {
      if (!this.lock) {
        self._onChange();
      }
    };

    listbox_ui.onDoubleClick = function() {
      if (!this.lock) {
        self._on('onDoubleClick', false);
      }
    };
  };

  /*
   * Listboxes
   */
  function ListboxesParameter() {
    this.type = 'listboxes';
    this._initialize.apply(this, arguments);
  }
  inherits(ListboxesParameter, ItemsParameter);

  ListboxesParameter.prototype.getHeight = function() {
    var height = 80;
    if (isNumber(this._options.height)) {
      height = this._options.height;
    }
    return height;
  };

  ListboxesParameter.prototype._buildParameter = function(width) {
    var self = this,
      group = this._group,
      helpTip = this._options.helpTip;

    this._ui = [];
    this._infos = [];
    forEach(this._value, function(value, i) {
      value = extractItemValue(value);
      self._infos.push({
        value: value.value,
        items: value.items
      });

      var ui = group.add('listbox', undefined, []);
      if (isString(helpTip)) {
        ui.helpTip = helpTip;
      } else if (isArray(helpTip) && isString(helpTip[i])) {
        ui.helpTip = helpTip[i];
      }

      ui.onChange = (function(index) {
        return function() {
          if (!this.lock) {
            self._onChange(index);
          }
        };
      })(i);

      ui.onDoubleClick = (function(index) {
        return function() {
          if (!this.lock) {
            self._on(index, 'onDoubleClick', false);
          }
        };
      })(i);

      self._ui.push(ui);
    });
  };

  /*
   * Script
   */
  function Script() {
    this.type = 'script';
    this._initialize.apply(this, arguments);
  }
  inherits(Script, Parameter);

  Script.prototype._initialize = function(name, value) {
    this._name = name;
    this._value = value;
  };

  Script.prototype._buildUI = function() {
    var self = this,
      group = this._group,
      builder = this._builder;

    var name = this._name,
      value = this._value;

    var title = name,
      callback = noop,
      help_tip = null;

    if (isFunction(value)) {
      callback = value;
    } else if (isObject(value)) {
      if (isString(value.title)) {
        title = value.title;
      }
      if (isFunction(value.callback)) {
        callback = value.callback;
      }
      if (isString(value.helpTip)) {
        help_tip = value.helpTip;
      }
    }

    this._title = title;
    this._callback = callback;

    switch (title.toLowerCase()) {
      case 'ok':
        this._ui = group.add('button', undefined, 'Dummy', {
          name: 'ok'
        });
        break;
      case 'cancel':
        this._ui = group.add('button', undefined, 'Dummy', {
          name: 'cancel'
        });
        break;
      default:
        this._ui = group.add('button', undefined, 'Dummy');
        break;
    }
    this._ui.alignment = ['fill', 'fill'];

    if (help_tip) {
      this._ui.helpTip = help_tip;
    }

    this._ui.onClick = function() {
      self.execute(true);
    };
  };

  Script.prototype.init = function() {
    this._ui.text = this._title;
  };

  Script.prototype.execute = function(undo) {
    undo = isUndefined(undo) ? true : !!undo;

    var builder = this._builder,
      callback = this._callback,
      value = null;
    try {
      if (undo) {
        app.beginUndoGroup(builder.getName() + ": " + this._name);
      }
      value = callback.apply(builder, arguments);
    } catch (e) {
      alert(e);
    } finally {
      if (undo) {
        app.endUndoGroup();
      }
    }
    return value;
  };

  Script.prototype.enable = function() {
    this._ui.enabled = true;
  };

  Script.prototype.disable = function() {
    this._ui.enabled = false;
  };

  Script.prototype.toJSON = function() {
    return {};
  };

  /*
   * Help
   */
  function Help() {
    this.type = 'help';
    this._initialize.apply(this, arguments);
  }
  inherits(Help, Parameter);

  Help.prototype.build = function(group, builder) {
    var name = this._name,
      value = this._value,
      callback = isFunction(value) ? value : function() {
        alert(value, name);
      };

    var help_ui = this._ui = group.add('button', [0, 0, 20, 20], '?');

    help_ui.onClick = function() {
      callback.call(builder);
    };
  };

  /*
   * SettingManager
   */
  function SettingManager(section, name) {
    this._setting_manager = new KIKAKU.SettingManager(section);
    this._name = name;
    this._obj = {};
    this._is_initialized = function() {
      return false;
    };
  }

  SettingManager.prototype._have = function() {
    return this._setting_manager.have(this._name);
  };

  SettingManager.prototype._initialize = function() {
    if (!this._is_initialized()) {
      if (this._have()) {
        try {
          this._obj = this._setting_manager.get(this._name, {});
        } catch (e) {
          //pass
        }
      }

      this._is_initialized = function() {
        return true;
      };
    }
  };

  SettingManager.prototype.get = function(key, default_value) {
    if (!isString(key)) {
      throw new Error('"key" is required');
    } else if (isUndefined(default_value)) {
      throw new Error('"default_value" is required');
    }
    this._initialize();

    if (isUndefined(this._obj[key])) {
      return default_value;
    }

    return this._obj[key];
  };

  SettingManager.prototype._save = function() {
    this._setting_manager.save(this._name, this._obj);
  };

  SettingManager.prototype.save = function(key, value) {
    if (!isString(key)) {
      throw new Error('"key" is required');
    } else if (isUndefined(value)) {
      throw new Error('"value" is required');
    }
    this._initialize();

    this._obj[key] = value;
    this._save();
  };

  SettingManager.prototype._delete = function() {
    this._setting_manager.delete(this._name);
  };

  SettingManager.prototype.delete = function(key) {
    if (!isString(key)) {
      throw new Error('"key" is required');
    }
    this._initialize();

    if (this._obj[key]) {
      delete this._obj[key];
    }

    if (this._have()) {
      var keys = getKeys(this._obj);
      if (keys.length > 0) {
        this._save();
      } else {
        this._delete();
      }
    }
  };

  /*
   * FileManager
   */
  function FileManager(root, file_type) {
    if (!some(FileManager.FILE_TYPES, file_type)) {
      throw new Error('Invalid file type: ' + file_type);
    }
    this._file_manager = new KIKAKU.FileManager(root);
    this._file_type = file_type;
  }

  FileManager.FILE_TYPES = ['txt', 'json'];

  FileManager.prototype.getFileNames = function() {
    var file_type = this._file_type,
      file_names = this._file_manager.getFileNames({
        mask: '*.' + file_type
      }),
      re = new RegExp('\.' + file_type + '$');

    file_names = map(file_names, function(file_name) {
      return file_name.replace(re, '');
    });

    return file_names;
  };

  FileManager.prototype.get = function(file_name) {
    file_name += '.' + this._file_type;
    var data = this._file_manager.get(file_name);
    if (data !== null && this._file_type === 'json') {
      try {
        data = KIKAKU.JSON.parse(data);
      } catch (e) {
        //pass
      }
    }
    return data;
  };

  FileManager.prototype.save = function(file_name, data) {
    file_name += '.' + this._file_type;
    if (this._file_type === 'json') {
      data = KIKAKU.JSON.stringify(data);
    }
    this._file_manager.save(file_name, data);
  };

  FileManager.prototype.delete = function(file_name) {
    file_name += '.' + this._file_type;
    this._file_manager.delete(file_name);
  };

  /*
   * UIBuilder
   */
  UIBuilder.PARAMETERS_KEY = '__parameters__';

  UIBuilder.SPACING_SIZE = 2;

  UIBuilder.MARGINS_SIZE = 5;

  function API() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length < 2) {
      throw new Error('few arguments');
    }
    var script = args.shift(),
    name = args.shift();

    if (API.Scripts[script] && API.Scripts[script][name]) {
      var api = API.Scripts[script][name];
      return api.fn.apply(api.ctx, args);
    }
  }

  API.Scripts = {};
  
  API.exist = function (script) {
    return !!API.Scripts[script];
  };

  API.add = function (script, name, fn, ctx) {
    if (!API.Scripts[script]) {
      API.Scripts[script] = {};
    }
    API.Scripts[script][name] = {
      fn: fn,
      ctx: ctx
    };
  };

  API.remove = function (script) {
    if (API.Scripts[script]) {
      delete API.Scripts[script];
    }
  };

  UIBuilder.prototype._initialize = function(global, name, options) {
    if (!isString(name) || name === '') {
      throw new Error('"name" is required');
    }
    if (!KIKAKU.FileManager.validateFileName(name)) {
      throw new Error('invalid name: ' + name);
    }

    this._is_build = function() {
      return false;
    };
    this._global = global;
    this._name = name;
    this._options = extend({
      version: '0.0.0',
      author: '',
      url: '',
      title: this._name,
      resizeable: true,
      numberOfScriptColumns: 2,
      titleWidth: 70,
      width: 200,
      help: true,
      autoSave: false,
      fileType: 'txt',
    }, options);

    this._apis = {};
    this._parameters = {};
    this._layer = 0;
    this._event_dispatcher = new KIKAKU.EventDispatcher();
    this._setting_manager = new SettingManager(UIBuilder.LIBRARY_NAME, this._name);
    this._file_manager = new FileManager(UIBuilder.AUTHOR + '/' + UIBuilder.LIBRARY_NAME + '/' + this._name, this._options.fileType);
    this._help = null;
  };

  function getName() {
    return this._name;
  }

  function getVersion() {
    return this._options.version;
  }

  function getAuthor() {
    return this._options.author;
  }

  function getUrl() {
    return this._options.url;
  }

  //api
  function api(name, fn) {
    if (!isString(name)) {
      throw new Error('"name" must be string');
    } else if (this._apis[name]) {
      throw new Error('Give a unique name');
    } else if (!isFunction(fn)) {
      throw new Error('"fn" is not a function');
    }

    API.add(this._name, name, fn, this);

    return this;
  }

  //parameter
  function add(type, name, value, options) {
    if (this._is_build()) {
      throw new Error('Has been built');
    } else if (!isString(type)) {
      throw new Error('"type" must be string');
    } else if (!isString(name)) {
      throw new Error('"name" must be string');
    } else if (this._parameters[name]) {
      throw new Error('Give a unique name');
    }

    switch (type) {
      case 'heading':
        this._parameters[name] = new HeadingParameter(name, value, options);
        break;
      case 'separator':
        this._parameters[name] = new SeparatorParameter(name, value, options);
        break;
      case 'space':
        this._parameters[name] = new SpaceParameter(name, value, options);
        break;
      case 'panel':
        this._parameters[name] = new PanelParameter(name, value, options);
        this._layer++;
        if (this._options.width < this._layer * 2 * (UIBuilder.SPACING_SIZE + UIBuilder.MARGINS_SIZE)) {
          throw new Error('Too many panels');
        }
        break;
      case 'panelend':
        this._parameters[name] = new PanelEndParameter(name, value, options);
        this._layer--;
        if (this._layer < 0) {
          throw new Error('Too many panelends');
        }
        break;
      case 'text':
        this._parameters[name] = new TextParameter(name, value, options);
        break;
      case 'texts':
        this._parameters[name] = new TextsParameter(name, value, options);
        break;
      case 'textarea':
        this._parameters[name] = new TextAreaParameter(name, value, options);
        break;
      case 'textareas':
        this._parameters[name] = new TextAreasParameter(name, value, options);
        break;
      case 'statictext':
        this._parameters[name] = new StaticTextParameter(name, value, options);
        break;
      case 'statictexts':
        this._parameters[name] = new StaticTextsParameter(name, value, options);
        break;
      case 'number':
        this._parameters[name] = new NumberParameter(name, value, options);
        break;
      case 'numbers':
        this._parameters[name] = new NumbersParameter(name, value, options);
        break;
      case 'slider':
        this._parameters[name] = new SliderParameter(name, value, options);
        break;
      case 'point':
        this._parameters[name] = new PointParameter(name, value, options);
        break;
      case 'point3d':
        this._parameters[name] = new Point3dParameter(name, value, options);
        break;
      case 'file':
        this._parameters[name] = new FileParameter(name, value, options);
        break;
      case 'folder':
        this._parameters[name] = new FolderParameter(name, value, options);
        break;
      case 'checkbox':
        this._parameters[name] = new CheckboxParameter(name, value, options);
        break;
      case 'checkboxes':
        this._parameters[name] = new CheckboxesParameter(name, value, options);
        break;
      case 'radiobutton':
        this._parameters[name] = new RadiobuttonParameter(name, value, options);
        break;
      case 'color':
        this._parameters[name] = new ColorParameter(name, value, options);
        break;
      case 'colors':
        this._parameters[name] = new ColorsParameter(name, value, options);
        break;
      case 'popup':
        this._parameters[name] = new PopupParameter(name, value, options);
        break;
      case 'popups':
        this._parameters[name] = new PopupsParameter(name, value, options);
        break;
      case 'listbox':
        this._parameters[name] = new ListboxParameter(name, value, options);
        break;
      case 'listboxes':
        this._parameters[name] = new ListboxesParameter(name, value, options);
        break;
      case 'script':
        this._parameters[name] = new Script(name, value, options);
        break;
      case 'help':
        if (this._help) {
          throw new Error('Help has been defined');
        }
        if (!(isString(value) || isFunction(value))) {
          throw new Error('Invalid help value');
        }
        this._help = new Help(name, value);
        break;
      default:
        throw new Error('Invalid type: ' + type);
    }
    return this;
  }

  //event
  function on(type, fn) {
    this._event_dispatcher.addEventListener(type, fn, this);
    return this;
  }

  function off(type, fn) {
    this._event_dispatcher.removeEventListener(type, fn, this);
    return this;
  }

  function trigger() {
    this._event_dispatcher.dispatchEvent.apply(this._event_dispatcher, arguments);
    return this;
  }

  UIBuilder.prototype._validateParameter = function(name) {
    if (!this._is_build()) {
      throw new Error('Not built yet');
    } else if (!this._parameters[name]) {
      throw new Error('Invalid name: ' + name);
    }
  };

  function get_(name, index) {
    this._validateParameter(name);

    return this._parameters[name].get(index);
  }

  function set_(name, value, value2) {
    this._validateParameter(name);

    this._parameters[name].set(value, value2);
    return this;
  }

  function execute(name, undo) {
    this._validateParameter(name);

    return this._parameters[name].execute(undo);
  }

  function enable(name) {
    this._validateParameter(name);

    this._parameters[name].enable();
    return this;
  }

  function disable(name) {
    this._validateParameter(name);

    this._parameters[name].disable();
    return this;
  }

  function getItems(name, index) {
    this._validateParameter(name);

    return this._parameters[name].getItems(index);
  }

  function replaceItems(name, value, value2) {
    this._validateParameter(name);

    this._parameters[name].replaceItems(value, value2);
    return this;
  }

  function addItems(name, value, value2) {
    this._validateParameter(name);

    this._parameters[name].addItems(value, value2);
    return this;
  }

  function removeItem(name, value, value2) {
    this._validateParameter(name);

    this._parameters[name].removeItem(value, value2);
    return this;
  }

  //setting
  function getSetting(key, default_value) {
    return this._setting_manager.get(key, default_value);
  }

  function saveSetting(key, value) {
    this._setting_manager.save(key, value);
  }

  function deleteSetting(key) {
    this._setting_manager.delete(key);
  }

  //file
  function getFileNames() {
    return this._file_manager.getFileNames();
  }

  function existsFile(filename) {
    return this._file_manager.exists(filename);
  }

  function getFile(filename) {
    return this._file_manager.get(filename);
  }

  function saveFile(filename, data) {
    this._file_manager.save(filename, data);
  }

  function deleteFile(filename) {
    this._file_manager.delete(filename);
  }

  //event
  function update() {
    if (!this._is_build()) {
      throw new Error('Not built yet');
    }
    var auto_save = this._options.autoSave;
    if (auto_save) {
      this._setting_manager.save(UIBuilder.PARAMETERS_KEY, this._parameters);
    }
  }

  function close() {
    if (!this._is_build()) {
      throw new Error('Not built yet');
    }
    if (this._global instanceof Window) {
      this._global.close();
    }
  }

  function build() {
    if (this._is_build()) {
      throw new Error('Has been built');
    }
    this._is_build = function() {
      return true;
    };

    var self = this,
      resizeable = this._options.resizeable,
      title = this._options.title,
      w = this._global = (function(global) {
        if (global instanceof Panel) {
          return global;
        } else if (global === 'dialog') {
          return new Window('dialog', title, undefined, {
            resizeable: resizeable
          });
        }
        return new Window('palette', title, undefined, {
          resizeable: resizeable
        });
      })(this._global),
      SPACING_SIZE = UIBuilder.SPACING_SIZE,
      MARGINS_SIZE = UIBuilder.MARGINS_SIZE,
      group,
      width = this._options.width;

    w.minimumSize = [width, undefined];
    w.spacing = SPACING_SIZE;
    w.margins = MARGINS_SIZE;
    if (resizeable) {
      w.onResizing = w.onResize = function() {
        this.layout.resize();
      };
    }

    //build parameters
    var current_panel = w,
      current_width = width - 2 * MARGINS_SIZE,
      script_index = 0,
      script_columns = this._options.numberOfScriptColumns;

    for (var name in this._parameters) {
      var parameter = this._parameters[name];

      if (parameter instanceof PanelParameter) {
        current_panel = current_panel.add('panel');
        current_panel.minimumSize = [current_width, undefined];
        current_panel.spacing = SPACING_SIZE;
        current_panel.margins = MARGINS_SIZE;
        current_panel.alignment = ['fill', 'top'];
        current_panel.alignChildren = ['fill', 'fill'];
        current_width -= 2 * (SPACING_SIZE + MARGINS_SIZE);
        script_index = 0;
        parameter.build(current_panel, this);
      } else if (parameter instanceof PanelEndParameter) {
        current_panel = current_panel.parent;
        current_width += 2 * (SPACING_SIZE + MARGINS_SIZE);
        script_index = 0;
      } else {
        var do_create = true;
        if (parameter instanceof Script) {
          if (script_index % script_columns !== 0) {
            do_create = false;
          }
          ++script_index;
        } else {
          if (parameter instanceof SpaceParameter && parameter.getHeight() === 0) {
            do_create = false;
          }
          script_index = 0;
        }

        if (do_create) {
          group = current_panel.add('group', [0, 0, current_width, parameter.getHeight()]);
          group.minimumSize = [current_width, parameter.getHeight()];
          group.spacing = 1;
          group.margins = 0;
          group.orientation = 'row';
          group.alignment = ['fill', 'top'];
          group.alignChildren = ['fill', 'fill'];
        }

        parameter.build(group, this);
      }
    }

    //help
    if (this._options.help && this._help === null) {
      var text = this.getName() + ' v' + this.getVersion();
      if (this.getAuthor() !== '') {
        text += '\n\n' + this.getAuthor();
      }
      if (this.getUrl() !== '') {
        text += '\n' + this.getUrl();
      }
      this._help = new Help(this.getName(), text);
    }

    if (this._help !== null) {
      group = w.add('group', undefined);
      group.spacing = group.margins = 0;
      group.alignment = ['right', 'top'];
      group.alignChildren = ['right', 'top'];
      this._help.build(group, this);
    }

    //callback
    var init = function() {
      var auto_save = self._options.autoSave,
        values = {};
      if (auto_save) {
        values = self.getSetting(UIBuilder.PARAMETERS_KEY, {});
      } else {
        self.deleteSetting(UIBuilder.PARAMETERS_KEY);
      }
      for (var name in self._parameters) {
        self._parameters[name].init(values[name]);
      }
      self.trigger('init');
    };

    if (w instanceof Window) {
      w.onShow = function() {
        init();
      };

      w.onClose = function() {
        API.remove(self._name);
        self.trigger('close');
      };

      w.center();
      w.show();
    } else if (w instanceof Panel) {
      w.layout.layout(true);
      init();
    }
  }

  root.UIBuilder = UIBuilder;

})(KIKAKU);
