/*
 *  KikakuUtils v1.1.0
 *
 *  Author: Kareobana (http://atarabi.com/)
 *  License: MIT
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
  var Utils = {};

  Utils.VERSION = '1.1.0';
  Utils.AUTHOR = 'Kareobana';

  //utility
  Utils.isObject = isObject;
  Utils.isArray = isArray;
  Utils.isFunction = isFunction;
  Utils.isString = isString;
  Utils.isNumber = isNumber;
  Utils.isBoolean = isBoolean;
  Utils.isUndefined = isUndefined;

  Utils.forEach = forEach;
  Utils.forEachItem = forEachItem;
  Utils.forEachLayer = forEachLayer;
  Utils.forEachPropertyGroup = forEachPropertyGroup;
  Utils.forEachEffect = forEachEffect;
  
  Utils.inherits = inherits;

  Utils.assign = assign;
  Utils.map = map;
  Utils.reduce = reduce;
  Utils.filter = filter;
  Utils.some = some;
  Utils.every = every;

  Utils.inArray = inArray;
  Utils.find = find;

  Utils.clamp = clamp;
  Utils.trim = trim;

  //item
  Utils.isFootageItem = isFootageItem;
  Utils.isCompItem = isCompItem;
  Utils.isAVItem = isAVItem;
  Utils.isFolderItem = isFolderItem;

  Utils.createItemFilter = createItemFilter;

  Utils.getItems = getItems;
  Utils.getItem = getItem;
  Utils.getActiveItem = getActiveItem;
  Utils.getActiveComp = getActiveComp;
  Utils.getCompByName = getCompByName;
  Utils.getAVItemByName = getAVItemByName;

  //layer
  Utils.isTextLayer = isTextLayer;
  Utils.isShapeLayer = isShapeLayer;
  Utils.isAVLayer = isAVLayer;
  Utils.isNullLayer = isNullLayer;
  Utils.isSolidLayer = isSolidLayer;
  Utils.isCompLayer = isCompLayer;
  Utils.isCameraLayer = isCameraLayer;
  Utils.isLightLayer = isLightLayer;

  Utils.createLayerFilter = createLayerFilter;

  Utils.getLayers = getLayers;
  Utils.getLayer = getLayer;
  Utils.getLayerByName = getLayerByName;

  Utils.selectLayers = selectLayers;
  Utils.selectLayer = selectLayer;
  Utils.deselectLayers = deselectLayers;

  Utils.getSelectedLayers = getSelectedLayers;
  Utils.getSelectedLayer = getSelectedLayer;

  //property
  Utils.isProperty = isProperty;
  Utils.isPropertyGroup = isPropertyGroup;
  Utils.isHiddenProperty = isHiddenProperty;

  Utils.createPropertyFilter = createPropertyFilter;

  Utils.getSelectedProperties = getSelectedProperties;
  Utils.getSelectedPropertiesWithLayer = getSelectedPropertiesWithLayer;
  Utils.getSelectedProperty = getSelectedProperty;
  Utils.getSelectedPropertyWithLayer = getSelectedPropertyWithLayer;
  Utils.getPathOfProperty = getPathOfProperty;
  Utils.getPathOfSelectedProperty = getPathOfSelectedProperty;
  Utils.getPropertyFromPath = getPropertyFromPath;
  Utils.getLayerOfProperty = getLayerOfProperty;

  //color
  Utils.rgbToHsl = rgbToHsl;
  Utils.hslToRgb = hslToRgb;
  Utils.rgbToYuv = rgbToYuv;
  Utils.yuvToRgb = yuvToRgb;

  /*
   * Implementation
   */
  //utility
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

  function not(fn, ctx) {
    return function() {
      return !fn.apply(ctx, arguments);
    };
  }

  function and(fns) {
    if (!isArray(fns)) {
      fns = Array.prototype.slice.call(arguments);
    }
    var len = fns.length;
    return function() {
      for (var i = 0; i < len; i++) {
        if (!fns[i].apply(null, arguments)) {
          return false;
        }
      }
      return true;
    };
  }

  function or(fns) {
    if (!isArray(fns)) {
      fns = Array.prototype.slice.call(arguments);
    }
    var len = fns.length;
    return function() {
      for (var i = 0; i < len; i++) {
        if (fns[i].apply(null, arguments)) {
          return true;
        }
      }
      return false;
    };
  }

  function inArray(arr, fn) {
    fn = isFunction(fn) ? fn : (function(elem) {
      return function(v) {
        return elem === v;
      };
    })(fn);

    for (var i = 0, l = arr.length; i < l; i++) {
      if (fn(arr[i])) {
        return i;
      }
    }
    return -1;
  }

  function find(arr, fn) {
    var index = inArray(arr, fn);
    if (index >= 0) {
      return arr[index];
    }
    return null;
  }

  function getKeyFromValue(obj, value) {
    for (var key in obj) {
      if (obj[key] === value) {
        return key;
      }
    }
    return null;
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

  function operator(lhs, op, rhs) {
    switch (op) {
      case '==':
        return lhs == rhs;
      case '!=':
        return lhs != rhs;
      case '<':
        return lhs < rhs;
      case '<=':
        return lhs <= rhs;
      case '>':
        return lhs > rhs;
      case '>=':
        return lhs >= rhs;
      default:
        throw new Error('Invalid operator: ' + op);
    }
  }

  function createOperatorFilter(fn, op, rhs) {
    return function(obj) {
      return operator(fn(obj), op, rhs);
    };
  }

  function toLowerCase(str) {
    return str.replace(/\s/g, '').toLowerCase();
  }

  //utility
  function forEach(obj, fn) {
    if (isArray(obj) || isString(obj)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        fn(obj[i], i);
      }
    } else if (isObject(obj)) {
      for (var key in obj) {
        fn(obj[key], key);
      }
    }
  }

  function forEachItem(folder, fn) {
    if (isFolderItem(folder)) {
      for (var i = 1, l = folder.numItems; i <= l; i++) {
        var item = folder.item(i);
        fn(item, i);
      }
    } else if (isFunction(folder)) {
      fn = folder;
      forEach(app.project.items, function(item, i) {
        fn(item, i);
      });
    }
  }

  function forEachLayer(comp, fn) {
    for (var i = 1, l = comp.numLayers; i <= l; i++) {
      var layer = comp.layer(i);
      fn(layer, i);
    }
  }

  function forEachPropertyGroup(property_group, fn) {
    for (var i = 1, l = property_group.numProperties; i <= l; i++) {
      var property = property_group.property(i);
      fn(property, i);
    }
  }

  function forEachEffect(layer, fn) {
    if (isAVLayer(layer)) {
      forEachPropertyGroup(layer.Effects, function(effect, i) {
        fn(effect, i);
      });
    }
  }
  
  function inherits(C, P) {
    var F = function () {};
    F.prototype = P.prototype;
    C.prototype = new F();
    C.super_ = P;
    C.uber = P.prototype;
    C.prototype.constructor = C;
  }
  
  function assign(obj) {
    obj = Object(obj);
    
    for (var i = 1, l = arguments.length; i <l; i++) {
      var target = arguments[i];
      if (!isObject(target)) {
        continue;
      }
      
      for (var key in target) {
        if (target.hasOwnProperty(key)) {
          obj[key] = target[key];
        }
      }
    }
    
    return obj;
  }

  function map(arr, fn) {
    var result = [];
    forEach(arr, function(v, i) {
      result.push(fn(v, i));
    });
    return result;
  }

  function reduce(arr, fn, initial_value) {
    var l = arr.length;
    if (l === 0) {
      if (isUndefined(initial_value)) {
        throw new Error('Reduce of empty array with no initial value');
      }
      return initial_value;
    }
    var i = 0,
      value;
    if (isUndefined(initial_value)) {
      value = arr[0];
      ++i;
    } else {
      value = initial_value;
    }

    while (i < l) {
      value = fn(value, arr[i], i, arr);
      ++i;
    }

    return value;
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
    for (var i = 0, l = arr.length; i < l; i++) {
      if (fn(arr[i])) {
        return true;
      }
    }
    return false;
  }

  function every(arr, fn) {
    for (var i = 0, l = arr.length; i < l; i++) {
      if (!fn(arr[i])) {
        return false;
      }
    }
    return true;
  }

  function clamp(v, mn, mx) {
    if (v < mn) {
      return mn;
    } else if (mx < v) {
      return mx;
    }
    return v;
  }

  function trim(str) {
    return str.replace(/(^\s+)|(\s+$)/g, '');
  }

  //item
  function isFootageItem(item) {
    return item instanceof FootageItem;
  }

  function isCompItem(item) {
    return item instanceof CompItem;
  }

  function isAVItem(item) {
    return isCompItem(item) || isFootageItem(item);
  }

  function isFolderItem(item) {
    return item instanceof FolderItem;
  }

  function getItemFilter() {
    function error(str) {
      throw new Error(str + ': ' + type);
    }

    function requireArgs(num) {
      if (args.length < num) {
        error('few arguments');
      }
    }

    var args = Array.prototype.slice.call(arguments),
      type = args.shift(),
      invert = false,
      fn = null;

    if (type[0] === '!') {
      invert = true;
      type = type.slice(1);
    }

    switch (toLowerCase(type)) {
      case 'none':
        fn = function() {
          return false;
        };
        break;
      case 'all':
        fn = function() {
          return true;
        };
        break;
      case 'footage':
        fn = isFootageItem;
        break;
      case 'comp':
        fn = isCompItem;
        break;
      case 'av':
        fn = isAVItem;
        break;
      case 'folder':
        fn = isFolderItem;
        break;
      case 'name':
        requireArgs(1);
        fn = (function(name) {
          return function(item) {
            return item.name === name;
          };
        })(args[0]);
        break;
      case 'comment':
        requireArgs(1);
        fn = (function(comment) {
          return function(item) {
            return item.comment.indexOf(comment) >= 0;
          };
        })(args[0]);
        break;
      case 'selected':
        fn = function(item) {
          return item.selected;
        };
        break;
        //av item
      case 'width':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.width;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVItem, fn);
        break;
      case 'height':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.height;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVItem, fn);
        break;
      case 'pixelaspect':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.pixelAspect;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVItem, fn);
        break;
      case 'framerate':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.framerate;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVItem, fn);
        break;
      case 'frameduration':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.frameDuration;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVItem, fn);
        break;
      case 'duration':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.duration;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVItem, fn);
        break;
      case 'useproxy':
        fn = function(item) {
          return item.useProxy;
        };
        fn = and(isAVItem, fn);
        break;
      case 'time':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.time;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVItem, fn);
        break;
      case 'hasvideo':
        fn = function(item) {
          return item.hasVideo;
        };
        fn = and(isAVItem, fn);
        break;
      case 'hasaudio':
        fn = function(item) {
          return item.hasAudio;
        };
        fn = and(isAVItem, fn);
        break;
      case 'footagemissing':
        fn = function(item) {
          return item.footageMissing;
        };
        fn = and(isAVItem, fn);
        break;
        //comp item
      case 'dropframe':
        fn = function(item) {
          return item.dropFrame;
        };
        fn = and(isCompItem, fn);
        break;
      case 'workareastart':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.workAreaStart;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isCompItem, fn);
        break;
      case 'workareaduration':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.workAreaDuration;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isCompItem, fn);
        break;
      case 'numlayers':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.numLayers;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isCompItem, fn);
        break;
      case 'hideshylayers':
        fn = function(item) {
          return item.hideShyLayers;
        };
        fn = and(isCompItem, fn);
        break;
      case 'motionblur':
        fn = function(item) {
          return item.motionBlur;
        };
        fn = and(isCompItem, fn);
        break;
      case 'draft3d':
        fn = function(item) {
          return item.draft3d;
        };
        fn = and(isCompItem, fn);
        break;
      case 'frameblending':
        fn = function(item) {
          return item.frameBlending;
        };
        fn = and(isCompItem, fn);
        break;
      case 'preservenestedframerate':
        fn = function(item) {
          return item.preserveNestedFrameRate;
        };
        fn = and(isCompItem, fn);
        break;
      case 'displaystarttime':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.displayStartTime;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isCompItem, fn);
        break;
      case 'shutterangle':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.shutterAngle;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isCompItem, fn);
        break;
      case 'shutterphase':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(item) {
            return item.shutterPhase;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isCompItem, fn);
        break;
      default:
        error('not supported');
        break;
    }

    if (invert) {
      fn = not(fn);
    }

    return fn;
  }

  function createItemFilter(filters) {
    if (isUndefined(filters)) {
      filters = ['all'];
    } else if (!isArray(filters)) {
      filters = [filters];
    }

    var fns = [];
    forEach(filters, function(filter) {
      if (isArray(filter)) {
        fns.push(getItemFilter.apply(null, filter));
      } else if (isFunction(filter)) {
        fns.push(filter);
      } else {
        fns.push(getItemFilter(filter));
      }
    });

    return and(fns);
  }

  function getItems(fn) {
    fn = isFunction(fn) ? fn : createItemFilter(fn);

    var project = app.project,
      items = [];
    for (var i = 1, l = project.numItems; i <= l; i++) {
      var item = project.item(i);
      if (fn(item)) {
        items.push(item);
      }
    }
    return items;
  }

  function getItem(fn) {
    fn = isFunction(fn) ? fn : createItemFilter(fn);

    var project = app.project;
    for (var i = 1, l = project.numItems; i <= l; i++) {
      var item = project.item(i);
      if (fn(item)) {
        return item;
      }
    }
    return null;
  }

  function getActiveItem() {
    var project = app.project;
    if (!project) {
      return null;
    }
    var item = project.activeItem;
    if (!item) {
      return null;
    }
    return item;
  }

  function getActiveComp() {
    var item = getActiveItem();
    if (item !== null && isCompItem(item)) {
      return item;
    }
    return null;
  }

  function getCompByName(name) {
    return getItem(function(item) {
      if (isCompItem(item) && item.name === name) {
        return true;
      }
      return false;
    });
  }

  function getAVItemByName(name) {
    return getItem(function(item) {
      if (isAVItem(item) && item.name === name) {
        return true;
      }
      return false;
    });
  }

  //layer
  function isTextLayer(layer) {
    return layer instanceof TextLayer;
  }

  function isShapeLayer(layer) {
    return layer instanceof ShapeLayer;
  }

  function isAVLayer(layer, strict) {
    return (layer instanceof AVLayer && (layer.hasVideo || !strict)) || isTextLayer(layer) || isShapeLayer(layer);
  }

  function isCameraLayer(layer) {
    return layer instanceof CameraLayer;
  }

  function isLightLayer(layer) {
    return layer instanceof LightLayer;
  }

  function isNullLayer(layer) {
    return layer.nullLayer;
  }

  function isSolidLayer(layer) {
    return isAVLayer(layer) && isFootageItem(layer.source) && layer.source.mainSource instanceof SolidSource;
  }

  function isCompLayer(layer) {
    return isAVLayer(layer) && isCompItem(layer.source);
  }

  function getLayerFilter() {
    function error(str) {
      throw new Error(str + ': ' + type);
    }

    function requireArgs(num) {
      if (args.length < num) {
        error('few arguments');
      }
    }

    var args = Array.prototype.slice.call(arguments),
      type = args.shift(),
      invert = false,
      fn = null;

    if (type[0] === '!') {
      invert = true;
      type = type.slice(1);
    }

    switch (toLowerCase(type)) {
      case 'none':
        fn = function() {
          return false;
        };
        break;
      case 'all':
        fn = function() {
          return true;
        };
        break;
      case 'av':
        fn = isAVLayer;
        break;
      case 'text':
        fn = isTextLayer;
        break;
      case 'shape':
        fn = isShapeLayer;
        break;
      case 'null':
        fn = isNullLayer;
        break;
      case 'camera':
        fn = isCameraLayer;
        break;
      case 'light':
        fn = isLightLayer;
        break;
      case 'index':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(layer) {
            return layer.index;
          }, op, rhs);
        })(args[0], args[1]);
        break;
      case 'name':
        requireArgs(1);
        fn = (function(name) {
          return function(layer) {
            return layer.name === name;
          };
        })(args[0]);
        break;
      case 'time':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(layer) {
            return layer.time;
          }, op, rhs);
        })(args[0], args[1]);
        break;
      case 'starttime':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(layer) {
            return layer.startTime;
          }, op, rhs);
        })(args[0], args[1]);
        break;
      case 'stretch':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(layer) {
            return layer.stretch;
          }, op, rhs);
        })(args[0], args[1]);
        break;
      case 'inpoint':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(layer) {
            return layer.inPoint;
          }, op, rhs);
        })(args[0], args[1]);
        break;
      case 'outpoint':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(layer) {
            return layer.outPoint;
          }, op, rhs);
        })(args[0], args[1]);
        break;
      case 'enabled':
        fn = function(layer) {
          return layer.enabled;
        };
        break;
      case 'solo':
        fn = function(layer) {
          return layer.solo;
        };
        break;
      case 'shy':
        fn = function(layer) {
          return layer.shy;
        };
        break;
      case 'locked':
        fn = function(layer) {
          return layer.locked;
        };
        break;
      case 'hasvideo':
        fn = function(layer) {
          return layer.hasVideo;
        };
        break;
      case 'active':
        fn = function(layer) {
          return layer.active;
        };
        break;
      case 'comment':
        requireArgs(1);
        fn = (function(comment) {
          return function(layer) {
            return layer.comment.indexOf(comment) >= 0;
          };
        })(args[0]);
        break;
      case 'isnameset':
        fn = function(layer) {
          return layer.isNameSet;
        };
        break;
      case 'selected':
        fn = function(layer) {
          return layer.selected;
        };
        break;
        //av
      case 'solid':
        fn = isSolidLayer;
        break;
      case 'file':
        fn = function(layer) {
          return isFootageItem(layer.source) && layer.source.mainSource instanceof FileSource;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'still':
        fn = function(layer) {
          return isFootageItem(layer.source) && layer.source.mainSource.isStill;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'comp':
        fn = isCompLayer;
        break;
      case 'isnamefromsource':
        fn = function(layer) {
          return layer.isNameFromSource;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'height':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(layer) {
            return layer.height;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVLayer, fn);
        break;
      case 'width':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(layer) {
            return layer.width;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isAVLayer, fn);
        break;
      case 'audioenabled':
        fn = function(layer) {
          return layer.audioEnabled;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'motionblur':
        fn = function(layer) {
          return layer.motionBlur;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'effectsactive':
        fn = function(layer) {
          return layer.effectsActive;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'adjustment':
      case 'adjustmentlayer':
        fn = function(layer) {
          return layer.adjustmentLayer;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'guide':
      case 'guidelayer':
        fn = function(layer) {
          return layer.guideLayer;
        };
        fn = and(isAVLayer, fn);
        break;
      case '3d':
      case 'threed':
      case 'threedlayer':
        fn = function(layer) {
          return layer.threeDLayer;
        };
        fn = and(isAVLayer, fn);
        break;
      case '2d':
      case 'twod':
        fn = function(layer) {
          return !layer.threeDLayer;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'threedperchar':
        fn = function(layer) {
          return layer.threeDPerChar;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'environment':
      case 'environmentlayer':
        fn = function(layer) {
          return layer.environmentLayer;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'collapse':
      case 'collapsetransformation':
        fn = function(layer) {
          return layer.collapseTransformation;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'frameblending':
        fn = function(layer) {
          return layer.frameBlending;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'timeremap':
      case 'timeremapenabled':
        fn = function(layer) {
          return layer.timeRemapEnabled;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'hasaudio':
        fn = function(layer) {
          return layer.hasAudio;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'audioactive':
        fn = function(layer) {
          return layer.audioActive;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'preservetransparency':
        fn = function(layer) {
          return layer.preserveTransparency;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'istrackmatte':
        fn = function(layer) {
          return layer.isTrackMatte;
        };
        fn = and(isAVLayer, fn);
        break;
      case 'hastrackmatte':
        fn = function(layer) {
          return layer.hasTrackMatte;
        };
        fn = and(isAVLayer, fn);
        break;
      default:
        error('not supported');
        break;
    }

    if (invert) {
      fn = not(fn);
    }

    return fn;
  }

  function createLayerFilter(filters) {
    if (isUndefined(filters)) {
      filters = ['all'];
    } else if (!isArray(filters)) {
      filters = [filters];
    }

    var fns = [];
    forEach(filters, function(filter) {
      if (isArray(filter)) {
        fns.push(getLayerFilter.apply(null, filter));
      } else if (isFunction(filter)) {
        fns.push(filter);
      } else {
        fns.push(getLayerFilter(filter));
      }
    });

    return and(fns);
  }

  function getArgumentComp(comp) {
    if (isUndefined(comp)) {
      comp = getActiveComp();
    } else if (isString(comp)) {
      comp = getCompByName(comp);
    }
    return comp;
  }

  function getLayer(fn, comp) {
    fn = isFunction(fn) ? fn : createLayerFilter(fn);
    comp = getArgumentComp(comp);
    if (!comp) {
      return null;
    }

    for (var i = 1, l = comp.numLayers; i <= l; i++) {
      var layer = comp.layer(i);
      if (fn(layer)) {
        return layer;
      }
    }

    return null;
  }

  function getLayers(fn, comp) {
    fn = isFunction(fn) ? fn : createLayerFilter(fn);
    comp = getArgumentComp(comp);
    if (!comp) {
      return [];
    }

    var layers = [];
    forEachLayer(comp, function(layer) {
      if (fn(layer)) {
        layers.push(layer);
      }
    });

    return layers;
  }

  function getLayerByName(name, comp) {
    comp = getArgumentComp(comp);
    if (!comp) {
      return null;
    }

    return comp.layers.byName(name);
  }

  function selectLayers(fn, comp, deselect) {
    fn = isFunction(fn) ? fn : createLayerFilter(fn);
    comp = getArgumentComp(comp);
    deselect = deselect || false;
    if (!comp) {
      return false;
    }

    var selected = false;
    forEachLayer(comp, function(layer) {
      if (fn(layer)) {
        layer.selected = true;
        selected = true;
      } else if (deselect) {
        layer.selected = false;
      }
    });

    return selected;
  }

  function selectLayer(fn, comp, deselect) {
    fn = isFunction(fn) ? fn : createLayerFilter(fn);
    comp = getArgumentComp(comp);
    deselect = deselect || false;
    if (!comp) {
      return false;
    }

    var selected = false;
    forEachLayer(comp, function(layer) {
      if (!selected && fn(layer)) {
        layer.selected = true;
        selected = true;
      } else if (deselect) {
        layer.selected = false;
      }
    });

    return selected;
  }

  function deselectLayers(comp) {
    comp = getArgumentComp(comp);
    if (!comp) {
      return;
    }
    forEach(comp.selectedLayers, function(layer) {
      layer.selected = false;
    });
  }

  function getSelectedLayers(comp) {
    comp = getArgumentComp(comp);
    if (!comp) {
      return [];
    }
    return comp.selectedLayers.slice();
  }

  function getSelectedLayer(comp) {
    var layers = getSelectedLayers(comp);
    if (layers.length === 0) {
      return null;
    }
    return layers[0];
  }

  //property
  function isProperty(property) {
    return property instanceof Property;
  }

  function isPropertyGroup(property) {
    return property instanceof PropertyGroup || property instanceof MaskPropertyGroup;
  }

  function isHiddenProperty(property) {
    var hidden = false;
    try {
      var selected = property.selected;
      property.selected = selected;
    } catch (e) {
      hidden = true;
    }
    return hidden;
  }

  function getPropertyFilter() {
    function error(str) {
      throw new Error(str + ': ' + type);
    }

    function requireArgs(num) {
      if (args.length < num) {
        error('few arguments');
      }
    }

    var args = Array.prototype.slice.call(arguments),
      type = args.shift(),
      invert = false,
      fn = null;

    if (type[0] === '!') {
      invert = true;
      type = type.slice(1);
    }

    switch (toLowerCase(type)) {
      case 'none':
        fn = function() {
          return false;
        };
        break;
      case 'all':
        fn = function() {
          return true;
        };
        break;
      case 'property':
        fn = isProperty;
        break;
      case 'propertygroup':
        fn = isPropertyGroup;
        break;
      case 'name':
        requireArgs(1);
        fn = (function(name) {
          return function(property) {
            return property.name === name;
          };
        })(args[0]);
        break;
      case 'matchname':
        requireArgs(1);
        fn = (function(name) {
          return function(property) {
            return property.matchName === name;
          };
        })(args[0]);
        break;
      case 'propertyindex':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(property) {
            return property.propertyIndex;
          }, op, rhs);
        })(args[0], args[1]);
        break;
      case 'propertydepth':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(property) {
            return property.propertyDepth;
          }, op, rhs);
        })(args[0], args[1]);
        break;
      case 'ismodified':
        fn = function(property) {
          return property.isModified;
        };
        break;
      case 'cansetenabled':
        fn = function(property) {
          return property.canSetEnabled;
        };
        break;
      case 'enabled':
        fn = function(property) {
          return property.enabled;
        };
        break;
      case 'active':
        fn = function(property) {
          return property.active;
        };
        break;
      case 'elided':
        fn = function(property) {
          return property.elided;
        };
        break;
      case 'iseffect':
        fn = function(property) {
          return property.isEffect;
        };
        break;
      case 'ismask':
        fn = function(property) {
          return property.isMask;
        };
        break;
      case 'selected':
        fn = function(property) {
          return property.selected;
        };
        break;
        //property
      case 'novalue':
      case 'no_value':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.NO_VALUE;
        };
        fn = and(isProperty, fn);
        break;
      case 'threedspatial':
      case 'threed_spatial':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.ThreeD_SPATIAL;
        };
        fn = and(isProperty, fn);
        break;
      case 'threed':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.ThreeD;
        };
        fn = and(isProperty, fn);
        break;
      case '3d':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.ThreeD_SPATIAL || property.propertyValueType === PropertyValueType.ThreeD;
        };
        fn = and(isProperty, fn);
        break;
      case 'twodspatial':
      case 'twod_spatial':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.TwoD_SPATIAL;
        };
        fn = and(isProperty, fn);
        break;
      case 'twod':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.TwoD;
        };
        fn = and(isProperty, fn);
        break;
      case '2d':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.TwoD_SPATIAL || property.propertyValueType === PropertyValueType.TwoD;
        };
        fn = and(isProperty, fn);
        break;
      case 'oned':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.OneD;
        };
        fn = and(isProperty, fn);
        break;
      case 'color':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.COLOR;
        };
        fn = and(isProperty, fn);
        break;
      case 'customvalue':
      case 'custom_value':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.CUSTOM_VALUE;
        };
        fn = and(isProperty, fn);
        break;
      case 'marker':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.MARKER;
        };
        fn = and(isProperty, fn);
        break;
      case 'layerindex':
      case 'layer_index':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.LAYER_INDEX;
        };
        fn = and(isProperty, fn);
        break;
      case 'maskindex':
      case 'mask_index':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.MASK_INDEX;
        };
        fn = and(isProperty, fn);
        break;
      case 'shape':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.SHAPE;
        };
        fn = and(isProperty, fn);
        break;
      case 'textdocument':
      case 'text_document':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.TEXT_DOCUMENT;
        };
        fn = and(isProperty, fn);
        break;
      case '1d':
        fn = function(property) {
          return property.propertyValueType === PropertyValueType.OneD || property.propertyValueType === PropertyValueType.LAYER_INDEX || property.propertyValueType === PropertyValueType.MASK_INDEX;
        };
        fn = and(isProperty, fn);
        break;
      case 'hasmin':
        fn = function(property) {
          return property.hasMin;
        };
        fn = and(isProperty, fn);
        break;
      case 'hasmax':
        fn = function(property) {
          return property.hasMax;
        };
        fn = and(isProperty, fn);
        break;
      case 'isspatial':
        fn = function(property) {
          return property.isSpatial;
        };
        fn = and(isProperty, fn);
        break;
      case 'canvaryovertime':
        fn = function(property) {
          return property.canVaryOverTime;
        };
        fn = and(isProperty, fn);
        break;
      case 'istimevarying':
        fn = function(property) {
          return property.isTimeVarying;
        };
        fn = and(isProperty, fn);
        break;
      case 'numkeys':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(property) {
            return property.numKeys;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isProperty, fn);
        break;
      case 'cansetexpression':
        fn = function(property) {
          return property.canSetExpression;
        };
        fn = and(isProperty, fn);
        break;
      case 'expressionenabled':
        fn = function(property) {
          return property.expressionEnabled;
        };
        fn = and(isProperty, fn);
        break;
      case 'propertyindex':
        requireArgs(2);
        fn = (function(op, rhs) {
          return createOperatorFilter(function(property) {
            return property.propertyIndex;
          }, op, rhs);
        })(args[0], args[1]);
        fn = and(isProperty, fn);
        break;
      case 'dimensionsseparated':
        fn = function(property) {
          return property.dimensionsSeparated;
        };
        fn = and(isProperty, fn);
        break;
      case 'isseparationfollower':
        fn = function(property) {
          return property.isSeparationFollower;
        };
        fn = and(isProperty, fn);
        break;
      default:
        error('not supported');
        break;
    }

    if (invert) {
      fn = not(fn);
    }

    return fn;
  }

  function createPropertyFilter(filters) {
    if (isUndefined(filters)) {
      filters = ['all'];
    } else if (!isArray(filters)) {
      filters = [filters];
    }

    var fns = [];
    forEach(filters, function(filter) {
      if (isArray(filter)) {
        fns.push(getPropertyFilter.apply(null, filter));
      } else if (isFunction(filter)) {
        fns.push(filter);
      } else {
        fns.push(getPropertyFilter(filter));
      }
    });

    return and(fns);
  }

  function getSelectedProperties(options) {
    if (isUndefined(options) || isObject(options)) {
      options = extend({
        multiple: true,
        propertyGroup: false,
        filter: function() {
          return true;
        }
      }, options);
    } else if (isArray(options) || isString(options)) {
      options = {
        multiple: true,
        propertyGroup: true,
        filter: createPropertyFilter(options)
      };
    } else if (isFunction(options)) {
      options = {
        multiple: true,
        propertyGroup: true,
        filter: options
      };
    }

    var layers = getSelectedLayers();
    if (layers.length === 0) {
      return [];
    }

    if (!options.multiple) {
      layers = [layers[0]];
    }

    var result = [];
    forEach(layers, function(layer) {
      var selected_properties = layer.selectedProperties.slice();
      forEach(selected_properties, function(selected_property) {
        if ((options.propertyGroup || isProperty(selected_property)) && options.filter(selected_property)) {
          result.push(selected_property);
        }
      });
    });

    return result;
  }
  
  function getSelectedPropertiesWithLayer(options) {
    if (isUndefined(options) || isObject(options)) {
      options = extend({
        multiple: true,
        propertyGroup: false,
        filter: function() {
          return true;
        }
      }, options);
    } else if (isArray(options) || isString(options)) {
      options = {
        multiple: true,
        propertyGroup: true,
        filter: createPropertyFilter(options)
      };
    } else if (isFunction(options)) {
      options = {
        multiple: true,
        propertyGroup: true,
        filter: options
      };
    }

    var layers = getSelectedLayers();
    if (layers.length === 0) {
      return [];
    }

    if (!options.multiple) {
      layers = [layers[0]];
    }

    var result = [];
    forEach(layers, function(layer) {
      var selected_properties = layer.selectedProperties.slice(),
        properties = [];
      forEach(selected_properties, function(selected_property) {
        if ((options.propertyGroup || isProperty(selected_property)) && options.filter(selected_property)) {
          properties.push(selected_property);
        }
      });
      if (properties.length > 0) {
        result.push({
          layer: layer,
          properties: properties
        });
      }
    });

    return result;
  }

  function getSelectedProperty() {
    var layer = getSelectedLayer();
    if (layer === null) {
      return null;
    }

    var properties = layer.selectedProperties.slice(),
      property = find(properties, function(property) {
        return isProperty(property);
      });

    return property;
  }
  
  function getSelectedPropertyWithLayer() {
    var layer = getSelectedLayer();
    if (layer === null) {
      return null;
    }

    var properties = layer.selectedProperties.slice(),
      property = find(properties, function(property) {
        return isProperty(property);
      });

    if (property === null) {
      return null;
    }

    return {
      layer: layer,
      property: property
    };
  }

  function getPathOfProperty(property, type) {
    type = type || 'name';
    var names = [];
    while (property !== null) {
      if (type == 'name') {
        names.push(property.name);
      } else if (type == 'matchname') {
        names.push(property.matchName);
      }
      property = property.parentProperty;
    }
    names.pop();
    names.reverse();
    return names;
  }

  function getPathOfSelectedProperty(type) {
    type = type || 'name';
    if (!(type == 'name' || type == 'matchname')) {
      throw new Error('type must be "name" or "matchname"');
    }

    var property = getSelectedProperty();
    if (property === null) {
      return null;
    }

    return getPathOfProperty(property, type);
  }

  function getPropertyFromPath(layer, path) {
    var property = layer;
    for (var i = 0, l = path.length; i < l; i++) {
      var name = path[i];
      if (isString(name) && /^\d+$/.test(name)) {
        name = parseInt(name);
      }
      property = property.property(name);
      if (property === null) {
        return null;
      }
    }
    return property;
  }

  function getLayerOfProperty(property) {
    var parent;
    while (parent = property.parentProperty) {
      property = parent;
    }
    return property;
  }

  //color
  function rgbToHsl(rgba) {
    var r = clamp(rgba[0], 0, 1),
      g = clamp(rgba[1], 0, 1),
      b = clamp(rgba[2], 0, 1);

    var max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      h,
      s,
      l = (max + min) / 2;

    if (max == min) {
      h = s = 0;
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l, rgba[3]];
  }

  function hslToRgb(hsla) {
    function clampH(h) {
      return (((h % 1) + 1) % 1);
    }

    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var h = clampH(hsla[0]),
      s = clamp(hsla[1], 0, 1),
      l = clamp(hsla[2], 0, 1),
      r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
        p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b, hsla[3]];
  }

  function rgbToYuv(rgba) {
    var r = clamp(rgba[0], 0, 1),
      g = clamp(rgba[1], 0, 1),
      b = clamp(rgba[2], 0, 1),
      y = 0.299 * r + 0.587 * g + 0.114 * b,
      u = -0.169 * r - 0.331 * g + 0.5 * b,
      v = 0.5 * r - 0.419 * g - 0.081 * b;

    return [y, u + 0.5, v + 0.5, rgba[3]];
  }

  function yuvToRgb(yuva) {
    var y = clamp(yuva[0], 0, 1),
      u = clamp(yuva[1], 0, 1) - 0.5,
      v = clamp(yuva[2], 0, 1) - 0.5,
      r = 1 * y + 1.402 * v,
      g = 1 * y - 0.344 * u - 0.714 * v,
      b = 1 * y + 1.772 * u;

    return [r, g, b, yuva[3]];
  }

  root.Utils = Utils;

})(KIKAKU);
