# KikakuUnit

簡易テスト用。

## Usage

**Template**
```
KIKAKU.Unit.test('Script Test', {
  before: function () {
  },
  beforeEach: function () {
  },
  afterEach: function () {
  },
  after: function () {
  }
}, {
  'Test 1': function (assert) {
    var actual = 1,
      expected = 1;
    assert.equal(actual, expected);

    actual = 2;
    assert.notEqual(actual, expected);
  },
  'Test 2': function (assert) {
    var result = true;
    assert.ok(result);

    result = false;
    assert.notOk(result);
  },
});
```

**Example #1**
```
(function () {

  function renameLayer(layer, name) {
    layer.name = name;
  }

  var Unit = KIKAKU.Unit;

  Unit.test('Test 1', {
    before: function () {
      var comp = app.project.items.addComp('Test Comp', 1280, 720, 1, 10, 30),
      layer = comp.layers.addSolid([1, 0, 0], 'Test Solid', comp.width, comp.height, comp.pixelAspect);
      this.comp = comp;
      this.solid = layer.source;
      layer.remove();
    },
    beforeEach: function () {
      this.layer = this.comp.layers.add(this.solid);
    },
    afterEach: function () {
      this.layer.remove();  
    },
    after: function () {
      var folder = this.solid.parentFolder,
        num_items = folder.numItems;
      this.solid.remove();
      if (num_items === 1) {
        folder.remove();
      }
      this.comp.remove();
    }
  }, {
    'renameLayer': function (assert) {
      var expected = 'This is the Layer.';
      renameLayer(this.layer, expected);
      assert.equal(this.layer.name, expected);
    },
  });

})();
```

## Version

- v0.0.0