/*
 *  PartialAdjustment v0.0.0 / ScriptUI
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
    filter = Utils.filter,
    isString = Utils.isString,
    isAVLayer = Utils.isAVLayer,
    forEachPropertyGroup = Utils.forEachPropertyGroup,
    forEachEffect = Utils.forEachEffect,
    getActiveComp = Utils.getActiveComp,
    getCompByName = Utils.getCompByName,
    isCompLayer = Utils.isCompLayer,
    getLayers = Utils.getLayers,
    getSelectedLayers = Utils.getSelectedLayers,
    getSelectedLayer = Utils.getSelectedLayer,
    isHiddenProperty = Utils.isHiddenProperty;
    
  //constants
  var Expression = {
    Transform: 0,
    Effect: 1,
  };
  
  //functions
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

    delete layer[key];

    var only_comment = true;
    for (var k in comment) {
      if (k !== 'comment') {
        only_comment = false;
        break;
      }
    }

    layer.comment = only_comment ? comment.comment : JSON.stringify(comment);
  }
  
  //Main
  var builder = new UIBuilder(global, 'PartialAdjustment', {
    version: '0.0.0',
    author: 'Kareobana',
    url: 'http://atarabi.com/'
  });

  builder
  .add('checkboxes', 'Expression', [{ text: 'Transform', value: true }, { text: 'Effect', value: true }], { title: false })
  .add('script', 'Execute', function () {
    var comp = getActiveComp(),
      layers = getSelectedLayers();
    if (!layers.length) {
      return;
    }

    layers.sort(function (lhs, rhs) {
      return lhs.index < rhs.index;
    });

    for (var i = 0, l = layers.length - 1; i < l; i++) {
      if (layers[i].index - layers[i + 1].index !== 1) {
        throw new Error('Select successive layers');
      }
    }

    var precomp_name = prompt('Give a precomp name', '');
    if (!precomp_name) {
      return;
    } else if (getCompByName(precomp_name)) {
      return alert('"' + precomp_name + '"' + ' already exists');
    }

    var precomp = app.project.items.addComp(precomp_name, comp.width, comp.height, comp.pixelAspect, comp.duration, comp.frameRate),
      comp_layer = comp.layers.add(precomp);
    comp_layer.moveBefore(layers[layers.length - 1]);

    var obj = {};
    obj[this.getName()] = {
      comp: precomp_name,
    };
    forEach(layers, function (layer) {
      setComment(layer, obj);
    });

    this.trigger('copy', layers, comp, precomp);
  })
  .add('script', 'Refresh', function () {
    var script_name = this.getName(),
      comp = getActiveComp(),
      comp_layer = getSelectedLayer(),
      target_comp;
    if (!comp_layer) {
      return;
    } else if (isCompLayer(comp_layer)) {
      target_comp = comp_layer.source;
    } else {
      var comment = getComment(comp_layer);
      if (comment[script_name] && isString(comment[script_name].comp)) {
        target_comp = getCompByName(comment[script_name].comp);
      }
      if (!target_comp) {
        return alert('Select a comp layer');
      }
    }

    var precomp_name = target_comp.name,
      layers = filter(getLayers('all', comp), function (layer) {
      var comment = getComment(layer);
      return comment[script_name] && comment[script_name].comp === precomp_name;
    });

    if (!layers.length) {
      return;
    }

    this.trigger('copy', layers, comp, target_comp);
  })
  .on('copy', function (layers, source_comp, target_comp) {
    function removeAllKeys(property) {
      var num_keys = property.numKeys;
      if (!num_keys) {
        return;
      }
      for (var i = num_keys; i >= 1; i--) {
        property.removeKey(i);
      }
    }
    
    target_comp.displayStartTime = source_comp.displayStartTime;

    //desc
    layers.sort(function (lhs, rhs) {
      return lhs.index < rhs.index;
    });

    //remove layers
    forEach(getLayers('all', target_comp), function (layer) {
      layer.remove();
    });

    //copy
    forEach(layers, function (layer) {
      layer.locked = false;
      layer.enabled = true;
      layer.solo = false;
      layer.copyToComp(target_comp);
      layer.enabled = false;
    });

    //asc
    layers.sort(function (lhs, rhs) {
      return lhs.index > rhs.index;
    });

    //set expression
    var do_transform = this.get('Expression', Expression.Transform),
      do_effect = this.get('Expression', Expression.Effect);

    var expression_template = 'comp("' + source_comp.name + '").layer("#{LayerName}").',
      script_name = this.getName();
    forEach(layers, function (layer, i) {
      var expression = expression_template.replace('#{LayerName}', layer.name);
      var target_layer = target_comp.layer(i + 1);
      removeComment(layer, script_name);
      if (do_transform) {
        forEachPropertyGroup(target_layer.transform, function (property) {
          if (isHiddenProperty(property) || !property.canSetExpression) {
            return;
          }
          removeAllKeys(property);
          property.expression = expression + 'transform("' + property.matchName + '");';
        });
      }
      if (do_effect && isAVLayer(target_layer)) {
        forEachEffect(target_layer, function (effect) {
          forEachPropertyGroup(effect, function (property, i) {
            if (isHiddenProperty(property) || !property.canSetExpression) {
              return;
            }
            removeAllKeys(property);
            property.expression = expression + 'effect("' + effect.name + '")(' + i + ');';
          });
        });
      }
    });
  })
  .build();

})(this);
