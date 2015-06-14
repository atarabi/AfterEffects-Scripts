/*
 *  KikakuEventDispatcher v0.0.0
 * 
 *  Author: Kareobana (http://atarabi.com/)
 *  License: MIT
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
  function EventDispatcher() {}

  EventDispatcher.VERSION = '0.0.0';

  EventDispatcher.AUTHOR = 'Kareobana';

  EventDispatcher.prototype.addEventListener = addEventListener;

  EventDispatcher.prototype.removeEventListener = removeEventListener;

  EventDispatcher.prototype.dispatchEvent = dispatchEvent;

  /*
   * Implementation
   */
  function addEventListener(type, fn, ctx) {
    this._listeners = this._listeners || {};
    
    fn = typeof fn === 'function' ? fn : ctx[fn];

    if (typeof this._listeners[type] === 'undefined') {
      this._listeners[type] = [];
    }

    this._listeners[type].push({
      fn: fn,
      ctx: ctx || this
    });
  }

  function removeEventListener(type, fn, ctx) {
    this._listeners = this._listeners || {};

    ctx = ctx || this;

    var listeners = this._listeners[type],
      mx = listeners ? listeners.length : 0;

    for (var i = 0; i < mx; i++) {
      if (listeners[i].fn === fn && listeners[i].ctx === ctx) {
        listeners.splice(i, 1);
        break;
      }
    }
  }

  function dispatchEvent(type) {
    this._listeners = this._listeners || {};

    var listeners = this._listeners[type],
      mx = listeners ? listeners.length : 0,
      args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < mx; i++) {
      listeners[i].fn.apply(listeners[i].ctx, args);
    }
  }

  /*
  * Exports
  */
  root.EventDispatcher = EventDispatcher;

})(KIKAKU);
