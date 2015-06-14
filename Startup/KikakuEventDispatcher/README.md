# KikakuEventDispatcher

単純なイベントディスパッチャークラス。

## Usage

```
var event_dispatcher = new KIKAKU.EventDispatcher();
event_dispatcher.addEventListener('custom event', function () {
	alert('Custom Event is fired.');
});
event_dispatcher.dispatchEvent('custom event');
```

## Version

- v0.0.0