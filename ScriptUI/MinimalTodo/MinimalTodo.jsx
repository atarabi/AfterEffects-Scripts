/*
 *  MinimalTodo v0.0.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.UIBuilder 1.0.0
 */

(function (global) {

  new KIKAKU.UIBuilder(global, 'MinimalTodo', {version: '0.0.0', author: 'Kareobana', url: 'http://atarabi.com/', width: 250, help: false, autoSave: true})
  .add('checkbox', 'Unlock', true, {
    title: false
  })
  .add('listbox', 'Todos', '', {
    title: false,
    height: 150,
    onDoubleClick: function () {
      if (this.get('Unlock')) {
        var todo = this.get('Todos');
        if (todo !== null) {
          this.removeItem('Todos', todo);
        }
      }
    }
  })
  .add('text', 'Text', '', {title: false})
  .add('script', 'Add', function () {
    var text = this.get('Text');
    if (text !== '') {
      this.set('Text', '');
      this.addItems('Todos', text);
      this.set('Todos', text);
    }
  })
  .build();

})(this);
