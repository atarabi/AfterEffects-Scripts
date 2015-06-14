# KikakuUIBuilder

ScriptUIを楽に作る用ライブラリ。

## Usage

**Example #1**

![Example #1 UI](ui_example1.png)

```
(function (global) {

  new KIKAKU.UIBuilder(global, 'Add a Fill Plugin', {version: '1.0.0', author: 'Kareobana', url: 'http://atarabi.com/'})
  .add('color', 'Color', [1, 0, 0, 1])
  .add('number', 'Opacity', {value: 100, minvalue: 0, maxvalue: 100})
  .add('script', 'Add', function () {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
      return alert('Select a comp.');
    }
    
    var layers = comp.selectedLayers;
    if (!layers.length) {
      return alert('Select a layer.');
    }
    
    var layer = layers[0];
    if (!(layer instanceof AVLayer || layer instanceof TextLsyer || layer instanceof CameraLayer)) {
      return alert('Select an AV layer.');
    }
    
    var effect = layer.Effects.addProperty('ADBE Fill'),
      color = this.get('Color'),
      opacity = this.get('Opacity') * 0.01;
      
    effect.property(3).setValue(color);
    effect.property(7).setValue(opacity);
  })
  .build();

})(this);
```

**Example #2**

![Example #2 UI](ui_example2.png)

```
(function (global) {
  
  //Lib
  var UIBuilder = KIKAKU.UIBuilder,
    Utils = KIKAKU.Utils;
    
  //global variables
  var do_select = false,
    layer = null;
  
  //functions
  function setValue(property, value, time) {
    if (property.numKeys) {
      property.setValueAtTime(time, value);
    } else {
      property.setValue(value);
    }
  }
  
  function transformLayer() {
    if (do_select) {
      return;
    }
    
    try {
      if (layer === null) {
        return alert('Select a layer');
      }
    } catch (e) {
      layer = null;
      this.set('Comp Name', '');
      this.set('Layer Name', '');
      return alert('The layer is invalid');
    }
    
    try {
      app.beginUndoGroup('Transform Layer');
      var time = layer.time;
      setValue(layer.transform.anchorPoint, this.get('Anchor'), time);
      setValue(layer.transform.position, this.get('Position'), time);
      setValue(layer.transform.scale, this.get('Scale'), time);
      if (layer.threeDLayer) {
        setValue(layer.transform.orientation, this.get('Orientation'), time);
        setValue(layer.transform.xRotation, this.get('X Rotation'), time);
        setValue(layer.transform.yRotation, this.get('Y Rotation'), time);
        setValue(layer.transform.zRotation, this.get('Z Rotation'), time);
      } else {
        setValue(layer.transform.rotation, this.get('Z Rotation'), time);
      }
      setValue(layer.transform.opacity, this.get('Opacity'), time);
    } catch (e) {
      //pass
    } finally {
      app.endUndoGroup();
    }
  }

  new UIBuilder(global, 'Transform Layer', {version: '1.0.0', author: 'Kareobana', url: 'http://atarabi.com/'})
  .add('panel', 'Layer')
  .add('statictext', 'Comp Name', '', {
    title: 'Comp'
  })
  .add('statictext', 'Layer Name', '', {
    title: 'Layer'
  })
  .add('script', 'Select', function () {
    var selected_layer = Utils.getSelectedLayer();
    try {
      if (selected_layer === null) {
        throw new Error('Select a layer');
      } else if (!Utils.isAVLayer(selected_layer)) {
        throw new Error('Select an AV layer');
      }
      
      try {
        do_select = true;
        layer = selected_layer;
        this.set('Comp Name', layer.containingComp.name);
        this.set('Layer Name', layer.name);
        
        this.set('Anchor', layer.transform.anchorPoint.value);
        this.set('Position', layer.transform.position.value);
        this.set('Scale', layer.transform.scale.value);
        if (layer.threeDLayer) {
          this.set('Orientation', layer.transform.orientation.value);
          this.enable('Orientation');
          this.set('X Rotation', layer.transform.xRotation.value);
          this.enable('X Rotation');
          this.set('Y Rotation', layer.transform.yRotation.value);
          this.enable('Y Rotation');
          this.set('Z Rotation', layer.transform.zRotation.value);
          this.enable('Z Rotation');
        } else {
          this.disable('Orientation');
          this.disable('X Rotation');
          this.disable('Y Rotation');
          this.set('Z Rotation', layer.transform.rotation.value);
          this.enable('Z Rotation');
        }
        this.set('Opacity', layer.transform.opacity.value);
      } catch (e) {
        //pass        
      } finally {
        do_select = false;
      }
    } catch (e) {
      layer = null;
      this.set('Comp Name', '');
      this.set('Layer Name', '');
      alert(e);
    }
  })
  .add('panelend', 'Layer End')
  .add('panel', 'Transform')
  .add('point3d', 'Anchor', [640, 360, 0], transformLayer)
  .add('point3d', 'Position', [640, 360, 0], transformLayer)
  .add('numbers', 'Scale', [100, 100, 100], transformLayer)
  .add('numbers', 'Orientation', [0, 0, 0], transformLayer)
  .add('number', 'X Rotation', 0, transformLayer)
  .add('number', 'Y Rotation', 0, transformLayer)
  .add('number', 'Z Rotation', 0, transformLayer)
  .add('number', 'Opacity', {value: 100, minvalue: 0, maxvalue: 100}, transformLayer)
  .add('panelend', 'Transform End')
  .build();

})(this);
```

## Dependencies

- KIKAKU.JSON
- KIKAKU.FileManager 0.0.0
- KIKAKU.SettingManager 0.0.0
- KIKAKU.EventDispatcher 0.0.0

## Version

- v2.0.0