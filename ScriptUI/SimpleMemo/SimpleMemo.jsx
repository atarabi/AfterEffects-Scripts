/*
 *  SimpleMemo v0.1.0 / ScriptUI
 *
 *  Author: Kareobana(http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.UIBuilder 2.0.0
 */

(function (global) {

  var titles = [];

  new KIKAKU.UIBuilder(global, 'SimpleMemo', {version: '0.1.0', author: 'Kareobana', url: 'http://atarabi.com/', width: 250, resizeable: true})
  .add('textarea', 'Memo', '', {
    title: false,
    height: 150,
    callback: function () {
      var title = this.get('Title');
      if (title !== null) {
        var memo = this.get('Memo');
        try {
          this.saveFile(title, memo);
        } catch (e) {
          alert(e);
        }
      }
    }
  })
  .add('popup', 'Title', undefined, function () {
    var title = this.get('Title');
    if (title !== null) {
      try {
        var memo = this.getFile(title);
        this.set('Memo', memo);
      } catch (e) {
        alert(e);
      }
    }
  })
  .add('script', 'Add', function () {
    var title = prompt('Input a title', '');
    if (title === null || title === '') {
      return;
    }

    for (var i = 0, l = titles.length; i < l; i++) {
      if (title === titles[i]) {
        alert(title + ' has exists');
        return;
      }
    }

    try {
      if (titles.length === 0) {
        this.saveFile(title, this.get('Memo'));
      } else {
        this.saveFile(title, '');
      }
      titles.push(title);
      this.replaceItems('Title', titles);
      this.set('Title', title);
      this.trigger('refresh');
    } catch (e) {
      alert(e);
    }
  })
  .add('script', 'Remove', function () {
    var title = this.get('Title');
    if (title === null) {
      return;
    }

    var do_remove = confirm('Remove ' + title + '?');
    if (do_remove) {
      try {
        this.deleteFile(title);

        for (var i = 0, l = titles.length; i < l; i++) {
          if (title === titles[i]) {
            titles.splice(i, 1);
            break;
          }
        }
        this.replaceItems('Title', titles);
        this.trigger('refresh');
      } catch (e) {
        alert(e);
      }
    }
  })
  .on('refresh', function () {
    var title = this.get('Title');
    if (title !== null) {
      try {
        var text = this.getFile(title);
        this.set('Memo', text);
      } catch (e) {
        alert(e);
      }
    }
  })
  .on('init', function () {
    try {
      titles = this.getFileNames();
      this.replaceItems('Title', titles);
      this.trigger('refresh');
    } catch (e) {
      alert(e);
    }
  })
  .build();

})(this);
