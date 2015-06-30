/*
 *  LayerTrimmer v0.0.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.JSON
 *    KIKAKU.Utils 1.0.0
 *    KIKAKU.UIBuilder 2.0.0
 */

(function (global) {
  //Lib
  var JSON = KIKAKU.JSON,
    Utils = KIKAKU.Utils,
    UIBuilder = KIKAKU.UIBuilder;
    
  //Utility
  var assign = Utils.assign,
    forEach = Utils.forEach,
    isTextLayer = Utils.isTextLayer,
    isShapeLayer = Utils.isShapeLayer,
    isCompLayer = Utils.isCompLayer,
    getActiveComp = Utils.getActiveComp,
    getCompByName = Utils.getCompByName,
    getSelectedLayer = Utils.getSelectedLayer,
    getLayer = Utils.getLayer,
    getLayers = Utils.getLayers;
    
  //Constants
  var SCAN = {
    CURRENT_FRAME: 'Current Frame',
    ALL_FRAMES: 'All Frames',
  };
  
  var CENTER = {
    COMPOSITION: 'Composition',
    CONTENTS: 'Contents',
  };
  
  //Functions
  function getValues(obj) {
    var values = [];
    for (var key in obj) {
      values.push(obj[key]);
    }
    return values;
  }
  
  function setValue(property, value, time) {
    if (property.numKeys) {
      property.setValueAtTime(time, value);
    } else {
      property.setValue(value);
    }
  }
  
  function setComment(layer, obj) {
    var comment = layer.comment;
    try {
      comment = JSON.parse(comment);
    } catch (e) {
      comment = comment ? {comment: comment} : {};
    }
    assign(comment, obj);

    layer.comment = JSON.stringify(comment);
  }

  function getComment(layer) {
    var comment = layer.comment;
    try {
      comment = JSON.parse(comment);
    } catch (e) {
      comment = {
        comment: comment
      };
    }
    return comment;
  }

  function removeComment(layer, key) {
    var comment = layer.comment;
    try {
      comment = JSON.parse(comment);
    } catch (e) {
      return;
    }
  
    delete comment[key];

    var has_key = false,
      only_comment = true;
    for (var k in comment) {
      has_key = true;
      if (k !== 'comment') {
        only_comment = false;
        break;
      }
    }
  
    if (!has_key) {
      layer.comment = '';
    } else {
      layer.comment = only_comment ? comment.comment : JSON.stringify(comment);
    }
  }
  
  function getRect(comp, layer, scan, extents) {
    var rect = {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity,
    };
    
    if (scan === SCAN.CURRENT_FRAME) {
      var _rect = layer.sourceRectAtTime(layer.time, extents);
      rect.left = _rect.left;
      rect.top = _rect.top;
      rect.right = _rect.left + _rect.width;
      rect.bottom = _rect.top + _rect.height;
    } else if (scan === SCAN.ALL_FRAMES) {
      var in_point = layer.inPoint,
        out_point = layer.outPoint,
        frame_duration = comp.frameDuration;
        
      if (in_point > out_point) {
        var temp = in_point;
        in_point = out_point;
        out_point = temp;
      }
      
      for (var t = in_point; t < out_point; t += frame_duration) {
        var _rect = layer.sourceRectAtTime(t, extents);
        rect.left = Math.min(rect.left, _rect.left);
        rect.top = Math.min(rect.top, _rect.top);
        rect.right = Math.max(rect.right, _rect.left + _rect.width);
        rect.bottom = Math.max(rect.bottom, _rect.top + _rect.height);
      }
    }
    
    return rect;
  }
  
  function createPrecomp(script_name, comp, layer, name, rect, center, padding, precomp) {
    var width,
      height,
      position,
      pixel_aspect = comp.pixelAspect,
      duration = Math.abs(layer.inPoint - layer.outPoint),
      frame_rate = comp.frameRate;
      
    if (center === CENTER.COMPOSITION) {
      width = 2 * (Math.ceil(Math.max(Math.abs(rect.left), Math.abs(rect.right))) + padding);
      height = 2 * (Math.ceil(Math.max(Math.abs(rect.top), Math.abs(rect.bottom))) + padding);
      position = [width / 2, height / 2];
    } else if (center === CENTER.CONTENTS) {
      width = Math.ceil(rect.right - rect.left) + 2 * padding;
      height = Math.ceil(rect.bottom - rect.top) + 2 * padding;
      position = [width / 2 - (rect.left + rect.right) / 2, height / 2 - (rect.top + rect.bottom) / 2];
    }
    
    if (precomp) {
      forEach(getLayers('all', precomp), function (layer) {
        layer.remove();
      });
      precomp.name = name;
      precomp.width = width;
      precomp.height = height;
      precomp.pixelAspect = pixel_aspect;
      precomp.duration = duration;
      precomp.frameRate = frame_rate;
    } else {
      precomp = app.project.items.addComp(name, width, height, pixel_aspect, duration, frame_rate);
    }
    layer.copyToComp(precomp);
    
    var copied_layer = precomp.layer(1);
    removeComment(copied_layer, script_name);
    copied_layer.enabled = true;
    if (layer.inPoint < layer.outPoint) {
      copied_layer.startTime = 0;
    } else {
      copied_layer.startTime = comp.duration;
    }
    setValue(copied_layer.transform.position, position, 0);
    
    return precomp;
  }

  //Main
  var builder = new UIBuilder(global, 'LayerTrimmer', {
    version: '0.0.0',
    author: 'Kareobana',
    url: 'http://atarabi.com/',
    titleWidth: 60,
  });

  builder
  .add('popup', 'Scan', {value: SCAN.ALL_FRAMES, items: getValues(SCAN)})
  .add('checkbox', 'Extents', true)
  .add('popup', 'Center', {value: CENTER.CONTENTS, items: getValues(CENTER)})
  .add('number', 'Padding', {value: 0, minvalue: 0}, function () {
    this.set('Padding', ~~this.get('Padding'));
  })
  .add('script', 'Execute', function () {
    var layer = getSelectedLayer();
    if (!layer) {
      return alert('Select a layer.');
    } else if (!(isTextLayer(layer) || isShapeLayer(layer))) {
      return alert('Select a text layer or shape layer.');
    }
    
    var comp = getActiveComp(),
      comment = getComment(layer)[this.getName()],
      update = false;
      
    if (comment && comment.comp) {
      update = true;
    }
    
    if (!update) {
      var rect = getRect(comp, layer, this.get('Scan'), this.get('Extents'));
      var precomp_name = prompt('Input a composition\'s name', '');
      if (!precomp_name) {
        return;
      } else if (getCompByName(precomp_name)) {
        removeComment(layer, this.getName());
        return alert(precomp_name + ' already exists.');
      }
      
      var precomp = createPrecomp(this.getName(), comp, layer, precomp_name, rect, isTextLayer(layer) ? CENTER.CONTENTS : this.get('Center'), this.get('Padding')),
        precomp_layer = comp.layers.add(precomp);
      precomp_layer.moveBefore(layer);
      precomp_layer.startTime = Math.min(layer.inPoint, layer.outPoint);
  
      comment = {};
      comment[this.getName()] = {
        comp: precomp_name
      };
      setComment(layer, comment);
      
      layer.enabled = false;
    } else {
      var precomp = getCompByName(comment.comp);
      if (!precomp) {
        return alert(comment.comp + ' is not found.');
      }
      var rect = getRect(comp, layer, this.get('Scan'), this.get('Extents'));
      
      createPrecomp(this.getName(), comp, layer, precomp.name, rect, isTextLayer(layer) ? CENTER.CONTENTS : this.get('Center'), this.get('Padding'), precomp);
      
      var precomp_layer = getLayer(function (layer) {
        return isCompLayer(layer) && layer.source === precomp;
      }, comp);
      precomp_layer.moveBefore(layer);
      precomp_layer.startTime = Math.min(layer.inPoint, layer.outPoint);
      precomp_layer.inPoint = precomp_layer.startTime;
      precomp_layer.outPoint = precomp_layer.startTime + precomp.duration;
      
      layer.enabled = false;
    }
  })
  .build();

})(this);
