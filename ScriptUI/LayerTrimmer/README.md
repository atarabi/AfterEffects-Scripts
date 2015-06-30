# LayerTrimmer

シェイプレイヤー、テキストレイヤーをコンテンツに応じてトリミングする。

## 使い方

![UI](ui.png)

### 基本

1. **Scan**で現在のフレームの境界のみをチェックするか、全フレームの境界をチェックするかを決める。また、シェイプレイヤーの場合は**Extents**でストローク等による描写範囲の拡大を考慮するかを決める。

1. **Center**で、コンポジションの中心とコンテンツの中心のどちらを基準にするか決める（テキストレイヤーはコンテンツ中心のみ）。

1. **Execute**をクリックで実行。

### 更新

1. 更新したいシェイプレイヤーまたはテキストレイヤーを選択(一度実行したレイヤーにはコメントに情報が付加されるのでそれを参照)。

1. **Execute**をクリックで更新。

## Dependencies

- [KIKAKU.JSON](https://github.com/atarabi/AfterEffects-Scripts/tree/master/Startup/KikakuJSON)
- [KIKAKU.Utils 1.0.0](https://github.com/atarabi/AfterEffects-Scripts/tree/master/Startup/KikakuUtils)
- [KIKAKU.UIBuilder 2.0.0](https://github.com/atarabi/AfterEffects-Scripts/tree/master/Startup/KikakuUIBuilder)

## Version

- v0.0.0