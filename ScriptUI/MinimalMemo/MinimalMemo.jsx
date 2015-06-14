/*
 *  MinimalMemo v0.0.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.UIBuilder 2.0.0
 */

(function (global) {

  new KIKAKU.UIBuilder(global, 'MinimalMemo', {version: '0.0.0', author: 'Kareobana', url: 'http://atarabi.com/', autoSave: true, help: false})
  .add('textarea', 'Memo', '', {title: false, height: 150})
  .api('write', function (text) {
    if (typeof text === 'string') {
      this.set('Memo', text);
    }
  })
  .api('append', function (text) {
    if (typeof text === 'string') {
      this.set('Memo', this.get('Memo') + text);
    }
  })
  .build();

})(this);
