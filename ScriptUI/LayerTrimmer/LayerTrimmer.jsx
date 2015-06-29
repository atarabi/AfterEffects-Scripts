/*
 *  LayerTrimmer v0.0.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.Utils 1.0.0
 *    KIKAKU.UIBuilder 2.0.0
 */

(function (global) {
  //Lib
  var  Utils = KIKAKU.Utils,
    UIBuilder = KIKAKU.UIBuilder;
    
  //Utility
  var isTextLayer = Utils.isTextLayer,
    isShapeLayer = Utils.isShapeLayer,
    getActiveComp = Utils.getActiveComp,
    getCompByName = Utils.getCompByName,
    getSelectedLayer = Utils.getSelectedLayer;
    
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

  //Main
  var builder = new UIBuilder(global, 'LayerTrimmer', {
    version: '0.0.0',
    author: 'Kareobana',
    url: 'http://atarabi.com/'
  });

  builder
  .add('popup', 'Scan', {value: SCAN.ALL_FRAMES, items: getValues(SCAN)})
  .add('popup', 'Center', {value: CENTER.CONTENTS, items: getValues(CENTER)})
  .add('number', 'Padding', {value: 0, minvalue: 0}, function () {
    this.set('Padding', ~~this.get('Padding'));
  })
  .add('script', 'Execute', function () {
    function getRect(scan) {
      var rect = {
        left: Infinity,
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
      };
      
      if (scan === SCAN.CURRENT_FRAME) {
        var _rect = layer.sourceRectAtTime(layer.time, false);
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
          var _rect = layer.sourceRectAtTime(t, false);
          rect.left = Math.min(rect.left, _rect.left);
          rect.top = Math.min(rect.top, _rect.top);
          rect.right = Math.max(rect.right, _rect.left + _rect.width);
          rect.bottom = Math.max(rect.bottom, _rect.top + _rect.height);
        }
      }
      
      return rect;
    }
    
    function createPrecomp(name, rect, center, padding) {
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
      
      var precomp = app.project.items.addComp(name, width, height, pixel_aspect, duration, frame_rate);
      layer.copyToComp(precomp);
      
      var copied_layer = precomp.layer(1);
      if (layer.inPoint < layer.outPoint) {
        copied_layer.startTime = 0;
      } else {
        copied_layer.startTime = comp.duration;
      }
      setValue(copied_layer.transform.position, position, 0);
      
      return precomp;
    }
    
    var layer = getSelectedLayer();
    if (!layer) {
      return alert('Select a layer.');
    } else if (!(isTextLayer(layer) || isShapeLayer(layer))) {
      return alert('Select a text layer or shape layer.');
    }
    
    var comp = getActiveComp(),
      rect = getRect(this.get('Scan'));
      
    var precomp_name = prompt('Input a composition\'s name', '');
    if (!precomp_name) {
      return;
    } else if (getCompByName(precomp_name)) {
      return alert(precomp_name + ' already exists.');
    }
    
    var precomp = createPrecomp(precomp_name, rect, isTextLayer(layer) ? CENTER.CONTENTS : this.get('Center'), this.get('Padding')),
      precomp_layer = comp.layers.add(precomp);
      
    precomp_layer.moveBefore(layer);
    precomp_layer.startTime = Math.min(layer.inPoint, layer.outPoint);
    layer.enabled = false;
  })
  .build();

})(this);
