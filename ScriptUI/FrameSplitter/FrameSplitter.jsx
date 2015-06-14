/*
 *  FrameSplitter v0.0.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.Utils 1.0.0
 *    KIKAKU.UIBuilder 2.0.0
 */

(function (global) {

  var Utils = KIKAKU.Utils,
    builder = new KIKAKU.UIBuilder(global, 'FrameSplitter', {version: '0.0.0', author: 'Kareobana', url: 'http://atarabi.com/'});

  builder
  .add('number', 'Frame', {value: 1, minvalue: 1})
  .add('checkbox', 'Remove', true)
  .add('script', 'Split', function () {
    var comp = Utils.getActiveComp(),
    layer = Utils.getSelectedLayer();
    if (layer === null) {
      return;
    }

    var frame = this.get('Frame'),
    frame_duration = comp.frameDuration,
    delta = frame * frame_duration,
    prev_layer = layer;
    for (var t = layer.inPoint; t <= layer.outPoint - frame_duration; t += delta) {
      var duplicated_layer = layer.duplicate();
      duplicated_layer.inPoint = t;
      duplicated_layer.outPoint = t + delta > layer.outPoint ? layer.outPoint : t + delta;
      duplicated_layer.moveBefore(prev_layer);
      prev_layer = duplicated_layer;
    }
    if (this.get('Remove')) {
      layer.remove();
    }
  })
  .build();

})(this);
