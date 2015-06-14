# KikakuUtils

便利ライブラリ。

## Usage

**Example #1**

```
(function () {
  var Utils = KIKAKU.Utils;

  var comp = Utils.getActiveComp();
  if (comp) {
    Utils.forEachLayer(comp, function (layer) {
      if (Utils.isAVLayer(layer)) {
        layer.blendingMode = BlendingMode.SCREEN;
      }
    });
  }
})();
```

## Version

- v1.0.0