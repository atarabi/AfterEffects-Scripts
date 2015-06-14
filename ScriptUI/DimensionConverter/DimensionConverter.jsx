/*
 *  DimensionConverter v0.0.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies :
 *    KIKAKU.Utils 0.2.0
 *    KIKAKU.UIBuilder 1.0.0
 */

(function (global) {

  //Lib
  var Utils = KIKAKU.Utils,
    UIBuilder = KIKAKU.UIBuilder;

  //functions
  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  function getPropertyDimensions(property) {
    switch (property.propertyValueType) {
      case PropertyValueType.ThreeD_SPATIAL:
      case PropertyValueType.ThreeD:
        return 3;
      case PropertyValueType.TwoD_SPATIAL:
      case PropertyValueType.TwoD:
        return 2;
      case PropertyValueType.OneD:
        return 1;
      case PropertyValueType.COLOR:
        return 4;
      default:
        return -1;
    }
  }
  
  //Main
  var builder = new UIBuilder(global, 'DimensionConverter', { version: '0.0.0', author: 'Kareobana', url: 'http://atarabi.com/' });

  builder
  .add('popup', 'Unite Type', ['Controls', 'Null'], function () {
    var unite_type = this.get('Unite Type');
    switch (unite_type) {
      case 'Controls':
        this.enable('Separate');
        break;
      case 'Null':
        this.disable('Separate');
        break;
    }
  })
  .add('script', 'Separate', function () {
    var layer = Utils.getSelectedLayer();
    if (layer === null) {
      return;
    }

    var properties = layer.selectedProperties.slice();
    for (var i = 0, l = properties.length; i < l; i++) {
      var property = properties[i];
      if (Utils.isProperty(property)) {
        var dimensions = getPropertyDimensions(property);
        if (dimensions > 1) {
          var property_value = property.value,
            property_name = property.name,
            property_path = Utils.getPathOfProperty(property),
            parent_property = property.parentProperty;
          $.writeln(property_path);

          property_name = parent_property.name + ' - ' + property_name;

          if (dimensions === 2) {
            var x_slider = layer.Effects.addProperty('ADBE Slider Control'),
              x_slider_name = property_name + ' X';

            x_slider.enabled = false;
            x_slider.name = x_slider_name;
            x_slider.property(1).setValue(property_value[0]);

            var y_slider = layer.Effects.addProperty('ADBE Slider Control'),
              y_slider_name = property_name + ' Y';

            y_slider.enabled = false;
            y_slider.name = y_slider_name;
            y_slider.property(1).setValue(property_value[1]);

            property = Utils.getPropertyFromPath(layer, property_path);
            property.expression = 'x = effect("' + x_slider_name + '")(1); y = effect("' + y_slider_name + '")(1); [x, y];';
            break;
          } else if (dimensions === 3) {
            var x_slider = layer.Effects.addProperty('ADBE Slider Control'),
              x_slider_name = property_name + ' X';

            x_slider.enabled = false;
            x_slider.name = x_slider_name;
            x_slider.property(1).setValue(property_value[0]);

            var y_slider = layer.Effects.addProperty('ADBE Slider Control'),
              y_slider_name = property_name + ' Y';

            y_slider.enabled = false;
            y_slider.name = y_slider_name;
            y_slider.property(1).setValue(property_value[1]);

            var z_slider = layer.Effects.addProperty('ADBE Slider Control'),
              z_slider_name = property_name + ' Z';

            z_slider.enabled = false;
            z_slider.name = z_slider_name;
            z_slider.property(1).setValue(property_value[2]);

            property = Utils.getPropertyFromPath(layer, property_path);
            property.expression = 'x = effect("' + x_slider_name + '")(1); y = effect("' + y_slider_name + '")(1); z = effect("' + z_slider_name + '")(1); [x, y, z];';
            break;
          } else if (dimensions === 4) {
            var hsl = Utils.rgbToHsl(property_value);

            var h_slider = layer.Effects.addProperty('ADBE Angle Control'),
              h_slider_name = property_name + ' H';

            h_slider.enabled = false;
            h_slider.name = h_slider_name;
            h_slider.property(1).setValue(hsl[0] * 360);

            var s_slider = layer.Effects.addProperty('ADBE Slider Control'),
              s_slider_name = property_name + ' S';

            s_slider.enabled = false;
            s_slider.name = s_slider_name;
            s_slider.property(1).setValue(hsl[1] * 100);

            var l_slider = layer.Effects.addProperty('ADBE Slider Control'),
              l_slider_name = property_name + ' L';

            l_slider.enabled = false;
            l_slider.name = l_slider_name;
            l_slider.property(1).setValue(hsl[2] * 100);

            property = Utils.getPropertyFromPath(layer, property_path);
            property.expression = 'h = (effect("' + h_slider_name + '")(1) / 360) % 1; if (h < 0) h += 1; s = effect("' + s_slider_name + '")(1) / 100; l = effect("' + l_slider_name + '")(1) / 100; hslToRgb([h, s, l, 1]);';
            break;
          }
        }
      }
    }
  })
  .add('script', 'Unite', function () {
    function uniteNames(name1, name2) {
      if (name1 === null || name1 === name2) {
        return name2;
      }
      return '';
    }

    function getPrefix(name1, name2) {
      if (name1 === null) {
        return name2;
      }
      var name = '';
      for (var i = 0, l = Math.min(name1.length, name2.length); i < l; i++) {
        if (name1[i] === name2[i]) {
          name += name1[i];
        } else {
          break;
        }
      }
      return name;
    }

    function getSuffix(name1, name2) {
      if (name1 === null) {
        return name2;
      }
      var name = '';
      for (var i = 0, l = Math.min(name1.length, name2.length); i < l; i++) {
        if (name1[name1.length - (i + 1)] === name2[name2.length - (i + 1)]) {
          name = name1[name1.length - (i + 1)] + name;
        } else {
          break;
        }
      }
      return name;
    }

    function getControlName(parent_name, prefix, suffix, property_infos, default_dimensions_name) {
      function getDimensionsName() {
        if (prefix === '' && suffix === '') {
          return '';
        }
        var name = '';
        for (var i = 0, l = property_infos.length; i < l; i++) {
          var property_name = property_infos[i].name;
          name += trim(property_name.replace(new RegExp('(^' + escapeRegExp(prefix) + ')|(' + escapeRegExp(suffix) + '$)', 'g'), ''));
        }
        return name;
      }

      function getExistingNames() {
        var names = {};

        if (unite_type === 'Controls') {
          for (var i = 1, l = layer.Effects.numProperties; i <= l; i++) {
            names[layer.Effects.property(i).name] = true;
          }
        } else if (unite_type === 'Null') {
          for (var i = 1, l = comp.numLayers; i <= l; i++) {
            names[comp.layer(i).name] = true;
          }
        }

        return names;
      }

      var dimensions_name = getDimensionsName() || default_dimensions_name;

      if (prefix !== '') {
        prefix = prefix + ' ';
      }
      if (suffix !== '') {
        suffix = ' ' + suffix;
      }
      if (parent_name !== '') {
        parent_name += ' - ';
      }

      var existing_names = getExistingNames(),
        name = parent_name + prefix + dimensions_name + suffix;

      if (unite_type === 'Null') {
        name = layer.name + ' / ' + name;
      }

      if (existing_names[name]) {
        var n = 2;
        while (existing_names[name + ' ' + n]) {
          n++;
        }
        name += ' ' + n;
      }
      return name;
    }

    var comp = Utils.getActiveComp(),
      layer = Utils.getSelectedLayer();
    if (layer === null) {
      return;
    }

    var properties = layer.selectedProperties.slice(),
      property_value = [],
      property_prefix = null,
      property_suffix = null,
      parent_name = null,
      property_infos = [],
      total_dimensions = 0;
    for (var i = 0, l = properties.length; i < l; i++) {
      var property = properties[i];
      if (Utils.isProperty(property)) {
        var dimensions = getPropertyDimensions(property);
        if (dimensions > 0) {
          property_prefix = getPrefix(property_prefix, property.name);
          property_suffix = getSuffix(property_suffix, property.name);
          parent_name = uniteNames(parent_name, property.parentProperty.name);
          if (dimensions === 1) {
            property_value.push(property.value);
          } else {
            property_value = property_value.concat(property.value);
          }
          property_infos.push({
            dimensions: dimensions,
            name: property.name,
            path: Utils.getPathOfProperty(property),
          });
          total_dimensions += dimensions;
        }
      }
    }

    if (property_infos.length > 1 && (total_dimensions === 2 || total_dimensions === 3)) {
      property_prefix = trim(property_prefix);
      property_suffix = trim(property_suffix);

      var unite_type = this.get('Unite Type'),
        name = getControlName(parent_name, property_prefix, property_suffix, property_infos, total_dimensions === 2 ? 'XY' : 'XYZ');

      if (unite_type === 'Controls') {
        try {
          var point_control = total_dimensions === 2 ? layer.Effects.addProperty('ADBE Point Control') : layer.Effects.addProperty('ADBE Point3D Control');

          point_control.enabled = false;
          point_control.name = name;
          point_control.property(1).setValue(property_value);

          var offset = 0;
          for (var i = 0, l = property_infos.length; i < l; i++) {
            var property_info = property_infos[i],
              dimensions = property_info.dimensions,
              property = Utils.getPropertyFromPath(layer, property_info.path);

            if (dimensions === 1) {
              if (property.canSetExpression) {
                property.expression = 'effect("' + name + '")(1)[' + offset + ']';
              }
            } else if (dimensions === 2) {
              if (property.canSetExpression) {
                property.expression = 'prop = effect("' + name + '")(1); [prop[' + offset + '], prop[' + (offset + 1) + ']]';
              }
            }
            offset += dimensions;
          }
        } catch (e) {
        }
      } else if (unite_type === 'Null') {
        try {
          var null_layer = comp.layers.addNull(),
            null_layer_name = name;
          null_layer.threeDLayer = total_dimensions === 3;
          null_layer.name = null_layer_name;
          null_layer.transform.position.setValue(property_value);
          null_layer.moveBefore(layer);

          var offset = 0;
          for (var i = 0, l = property_infos.length; i < l; i++) {
            var property_info = property_infos[i],
              dimensions = property_info.dimensions,
              property = Utils.getPropertyFromPath(layer, property_info.path);

            if (dimensions === 1) {
              if (property.canSetExpression) {
                property.expression = 'thisComp.layer("' + null_layer_name + '").transform.position[' + offset + ']';
              }
            } else if (dimensions === 2) {
              if (property.canSetExpression) {
                property.expression = 'prop = thisComp.layer("' + null_layer_name + '").transform.position; [prop[' + offset + '], prop[' + (offset + 1) + ']]';
              }
            }
            offset += dimensions;
          }
        } catch (e) {
        }
      }
    }
  })
  .build();

})(this);
