/*
 *  TimeRemap v0.1.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.Utils 1.0.0
 *    KIKAKU.UIBuilder 2.0.0
 */

(function (global) {
  var Utils = KIKAKU.Utils,
    builder = new KIKAKU.UIBuilder(global, 'TimeRemap', {version: '0.1.0', author: 'Kareobana', url: 'http://atarabi.com/'});

  builder
  .add('popup', 'Mode', ['OneShot', 'Loop', 'Pingpong', 'Stop', 'Shuffle'], function () {
    var mode = this.get('Mode');
    if (mode === 'Shuffle') {
      this.enable('Shuffle Type');
    } else {
      this.disable('Shuffle Type');
    }
  })
  .add('popup', 'Shuffle Type', ['Inverse', 'Random'])
  .add('script', 'Execute', function () {
    function isAVLayer(layer) {
      return layer instanceof AVLayer || layer instanceof TextLayer|| layer instanceof ShapeLayer;
    }

    var layer = Utils.getSelectedLayer();
    if (layer === null || !isAVLayer(layer) || !layer.canSetTimeRemapEnabled) {
      return;
    }

    var mode = this.get('Mode');
    if (mode === 'OneShot' || mode === 'Loop' || mode === 'Pingpong') {
      var timeramp = layer.Effects.addProperty('ADBE Angle Control'),
      expression = '';

      layer.timeRemapEnabled = true;
      timeramp.enabled = false;
      timeramp.name = 'Time Remap';

      switch (mode) {
        case 'OneShot':
          expression = 'duration = thisLayer.source.duration - thisComp.frameDuration;\nphase = effect("' + timeramp.name + '")(1) / 360;\nphase = phase < 0 ? 0 : phase > 1 ? 1: phase;\nduration * phase;';
          break;
        case 'Loop':
          expression = 'duration = thisLayer.source.duration - thisComp.frameDuration;\nphase = (effect("' + timeramp.name + '")(1) / 360) % 1;\nif (phase < 0) {\n  phase += 1;\n}\nduration * phase;';
          break;
        case 'Pingpong':
          expression = 'duration = thisLayer.source.duration - thisComp.frameDuration;\nphase = (effect("' + timeramp.name + '")(1) / 360) % 2;\nif (phase < 0) {\n  phase += 2;\n}\nif (phase < 1) {\n  duration * phase;\n} else {\n  duration * (2 - phase);\n}';
          break;
      }

      layer.timeRemap.expression = expression;
    } else if (mode === 'Stop') {
      var stop = layer.Effects.addProperty('ADBE Checkbox Control'),
      expression = """function findPrevKey(property) {
  if (property.numKeys === 0) {
    return null;
  }
  var prev_key = property.nearestKey(time);
  if (prev_key.time > time) {
    if (prev_key.index === 1) {
      return null;
    }
    prev_key = property.key(prev_key.index - 1);
  }
  return prev_key;
}
var stop = effect("Stop")(1),
prev_key = findPrevKey(stop);
if (stop.value && prev_key !== null) {
  thisProperty.valueAtTime(prev_key.time);
} else {
  value;
}""";

      stop.enabled = false;
      stop.name = 'Stop';

      layer.timeRemapEnabled = true;
      layer.timeRemap.expression = expression;
    } else if (mode === 'Shuffle') {
      var shuffle_type = this.get('Shuffle Type');

      var shuffle = layer.Effects.addProperty('ADBE Checkbox Control');
      shuffle.enabled = false;
      shuffle.name = 'Shuffle';
      shuffle(1).setValue(1);

      var frames = layer.Effects.addProperty('ADBE Slider Control');
      frames.enabled = false;
      frames.name = 'Frames';
      frames(1).setValue(5);

      if (shuffle_type === 'Random') {
        var shuffle_seed = layer.Effects.addProperty('ADBE Slider Control');
        shuffle_seed.enabled = false;
        shuffle_seed.name = 'Shuffle Seed';
      }

      var expression = '';

      if (shuffle_type === 'Inverse') {
        expression = """var do_shuffle = effect("Shuffle")(1).value,
frames = ~~effect("Frames")(1).value;
if (do_shuffle && frames > 2) {
  var mapping = (function (n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push(n - 1 - i);
    }
    return arr;
  })(frames);

  var frame_duration = thisComp.frameDuration,
  fps = 1 / frame_duration,
  current_frame = ~~(thisProperty.value * fps),
  bar = ~~(current_frame / frames),
  beat = current_frame % frames;
  if (beat < 0) {
    beat += frames;
  }
  (bar * frames + mapping[beat]) * frame_duration;
} else {
  value;
}""";
      } else if (shuffle_type === 'Random') {
        expression = """function shuffle(arr) {
  for (var i = 0, l = arr.length; i < l; i++) {
    var j = ~~random(l);
    arr[j] = [arr[i], arr[i] = arr[j]][0];
  }
}
var do_shuffle = effect("Shuffle")(1).value,
frames = ~~effect("Frames")(1).value,
shuffle_seed = effect("Shuffle Seed")(1).value;
if (do_shuffle && frames > 2) {
  seedRandom(shuffle_seed, true);
  var mapping = (function (n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push(i);
    }
    shuffle(arr);
    return arr;
  })(frames);

  var frame_duration = thisComp.frameDuration,
  fps = 1 / frame_duration,
  current_frame = ~~(thisProperty.value * fps),
  bar = ~~(current_frame / frames),
  beat = current_frame % frames;
  if (beat < 0) {
    beat += frames;
  }
  (bar * frames + mapping[beat]) * frame_duration;
} else {
  value;
}""";
      }

      layer.timeRemapEnabled = true;
      layer.timeRemap.expression = expression;
    }

  })
  .on('init', function () {
    var mode = this.get('Mode');
    if (mode === 'Shuffle') {
      this.enable('Shuffle Type');
    } else {
      this.disable('Shuffle Type');
    }
  })
  .build();

})(this);
