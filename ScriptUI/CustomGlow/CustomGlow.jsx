/*
 *  CustomGlow v0.0.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies :
 *    KIKAKU.Utils 0.0.0
 *    KIKAKU.UIBuilder 2.0.0
 */

(function (global) {

  var Utils = KIKAKU.Utils,
    builder = new KIKAKU.UIBuilder(global, 'CustomGlow', {version: '0.0.0', author: 'Kareobana', url: 'http://atarabi.com/'});

  builder
  .add('popup', 'Keying', {value: 'Extract', items: ['None', 'Extract']})
  .add('popup', 'Blur', ['Fast Blur', 'Box Blur', 'Directional Blur', 'Radial Blur', 'Camera Lens Blur', 'Channel Blur', 'CC Radial Fast Blur', 'CC Radial Blur',  'CC Cross Blur', 'FL Out Of Focus'])
  .add('popup', 'Toner', {value: 'KikakuToner', items: ['None', 'KikakuToner', 'CC Toner', 'Tritone', 'Colorama', 'Tint', 'VC Color Vibrance']})
  .add('popup', 'Intensity', {value: 'KikakuExposure', items: ['None', 'KikakuExposure', 'Exposure', 'Levels', 'Curves']})
  .add('script', 'Execute', function () {
    function addEffect(name) {
      if (layer.Effects.canAddProperty(name)) {
        return layer.Effects.addProperty(name);
      } else {
        alert('Not Found: ' + name);
        return null;
      }
    }

    var layer = Utils.getSelectedLayer();
    if (layer === null) {
      return;
    }

    switch (this.get('Keying')) {
      case 'Extract':
        addEffect('ADBE Extract');
        break;
    }

    switch (this.get('Blur')) {
      case 'Fast Blur':
        addEffect('ADBE Fast Blur');
        break;
      case 'Box Blur':
        addEffect('ADBE Box Blur2');
        break;
      case 'Directional Blur':
        addEffect('ADBE Motion Blur');
        break;
      case 'Radial Blur':
        addEffect('ADBE Radial Blur');
        break;
      case 'Camera Lens Blur':
        addEffect('ADBE Camera Lens Blur');
        break;
      case 'Channel Blur':
        addEffect('ADBE Channel Blur');
        break;
      case 'CC Radial Fast Blur':
        addEffect('CC Radial Fast Blur');
        break;
      case 'CC Radial Blur':
        addEffect('CC Radial Blur');
        break;
      case 'CC Cross Blur':
        addEffect('CS CrossBlur');
        break;
      case 'FL Out Of Focus':
        addEffect('DRFL Out of Focus');
        break;
    }

    switch (this.get('Toner')) {
      case 'KikakuToner':
        addEffect('KikakuToner');
        break;
      case 'CC Toner':
        addEffect('CC Toner');
        break;
      case 'Tritone':
        addEffect('ADBE Tritone');
        break;
      case 'Colorama':
        addEffect('APC Colorama');
        break;
      case 'VC Color Vibrance':
        addEffect('VIDEOCOPILOT VIBRANCE');
        break;
    }

    switch (this.get('Intensity')) {
      case 'KikakuExposure':
        addEffect('KikakuExposure');
        break;
      case 'Exposure':
        addEffect('ADBE Exposure2');
        break;
      case 'Levels':
        addEffect('ADBE Pro Levels2');
        break;
      case 'Curves':
        addEffect('ADBE CurvesCustom');
        break;
    }

    var composite = addEffect('KikakuComposite');
    if (composite) {
      composite.property(2).setValue(13);
      composite.property(3).setValue(2);
    }
  })
  .build();

})(this);
