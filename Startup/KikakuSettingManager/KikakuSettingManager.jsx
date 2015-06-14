/*
 *  KikakuSettingManager v0.0.0
 * 
 *  Author: Kareobana (http://atarabi.com/)
 *  License: MIT
 *  Dependencies:
 *    KIKAKU.JSON
 */

var KIKAKU = KIKAKU || function(fn) {
  app.beginUndoGroup('KIKAKU');
  try {
    fn();
  } catch (e) {
    alert(e);
  }
  app.endUndoGroup();
};

(function(root) {
  /*
   * Declaration
   */
  function SettingManager(section) {
    this._initialize.apply(this, arguments);
  }

  SettingManager.VERSION = '0.0.0';

  SettingManager.AUTHOR = 'Kareobana';

  SettingManager.prototype.have = have;

  SettingManager.prototype.get = get_;

  SettingManager.prototype.save = save;

  SettingManager.prototype.delete = delete_;

  /*
   * Implementation
   */
  //utility
  function isString(arg) {
    return Object.prototype.toString.call(arg) === '[object String]';
  }

  function isUndefined(arg) {
    return typeof arg === 'undefined';
  }

  SettingManager.prototype._initialize = function(section) {
    if (!isString(section)) {
      throw new Error('"section" must be string');
    }

    this._section = section;
  };

  function have(key) {
    if (!isString(key)) {
      throw new Error('"key" must be string');
    }
    return app.settings.haveSetting(this._section, key);
  }

  function get_(key, default_value) {
    if (!isString(key)) {
      throw new Error('"key" must be string');
    } else if (isUndefined(default_value)) {
      throw new Error('"default_value" is required');
    }

    if (!this.have(key)) {
      return default_value;
    }

    var value = app.settings.getSetting(this._section, key);

    return KIKAKU.JSON.parse(value);
  }

  function save(key, value) {
    if (!isString(key)) {
      throw new Error('"key" must be string');
    } else if (isUndefined(value)) {
      throw new Error('"value" is required');
    }

    app.settings.saveSetting(this._section, key, KIKAKU.JSON.stringify(value));
  }

  function delete_(key) {
    if (!isString(key)) {
      throw new Error('Key is required');
    }

    if (!this.have(key)) {
      return;
    }

    app.preferences.deletePref('Settings_' + this._section, key);
  }

  root.SettingManager = SettingManager;

})(KIKAKU);
