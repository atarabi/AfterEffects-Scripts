/*
 *  MakeItStill v0.0.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.Utils 1.0.0
 *    KIKAKU.UIBuilder 2.0.0
 */

(function(global) {
  //Lib
  var Utils = KIKAKU.Utils,
    UIBuilder = KIKAKU.UIBuilder;

  //Utility
  var isAVLayer = Utils.isAVLayer,
    getSelectedLayer = Utils.getSelectedLayer;

  //Main
  var TIME_MODE = {
    CURRENT: 'Current',
    IN_POINT: 'inPoint'
  };
  
  var builder = new KIKAKU.UIBuilder(global, 'MakeItStill', {
    version: '0.0.0',
    author: 'Kareobana',
    url: 'http://atarabi.com/'
  });

  builder
  .add('popup', 'Time', [TIME_MODE.CURRENT, TIME_MODE.IN_POINT])
  .add('script', 'Execute', function() {
    var layer = getSelectedLayer();
    if (!(layer && isAVLayer(layer) && layer.canSetTimeRemapEnabled)) {
      return;
    }
    var type = this.get('Time'),
      start_time = layer.startTime,
      in_point = layer.inPoint,
      out_point = layer.outPoint,
      timeremap_enabled = layer.timeRemapEnabled,
      time;

    switch (type) {
      case TIME_MODE.CURRENT:
        if (timeremap_enabled) {
          time = layer.timeRemap.value;
        } else {
          time = layer.time - start_time;
        }
        break;
      case TIME_MODE.IN_POINT:
        if (timeremap_enabled) {
          time = layer.timeRemap.valueAtTime(in_point, false);
        } else {
          time = in_point - start_time;
        }
        break;
    }

    layer.timeRemapEnabled = false;
    layer.timeRemapEnabled = true;
    layer.timeRemap.setValueAtKey(1, time);
    layer.timeRemap.setValueAtKey(2, time);
    layer.inPoint = in_point;
    layer.outPoint = out_point;
  })
  .build();

})(this);
