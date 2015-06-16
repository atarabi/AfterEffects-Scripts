# KikakuSettingManager

設定操作用クラス。

## Usage

```
var setting_manager = new KIKAKU.SettingManager('Example Section');
var test = setting_manager.get('Test', 0);
setting_manager.save('Test', 100);
setting_manager.delete('Test');
```

## Dependencies

- [KIKAKU.JSON](https://github.com/atarabi/AfterEffects-Scripts/tree/master/Startup/KikakuJSON)

## Version

- v0.0.0