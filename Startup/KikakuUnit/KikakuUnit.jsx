/*
 *  KikakuUnit v0.0.0
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

  var Unit = {};
  
  Unit.test = function (name, hooks, tests) {
    if (!(arguments.length === 2 || arguments.length === 3)) {
      throw new Error('bad argument count');
    }
    
    if (arguments.length === 2) {
      tests = hooks;
      hooks = {};
    }
    
    var test = new Test(name, hooks, tests);
    test.run();
  };
  
  function Test(name, hooks, tests) {
    this.name = name;
    this.hooks = {
      before: function () {},
      beforeEach: function () {},
      afterEach: function () {},
      after: function () {},
    };
    assign(this.hooks, hooks);
    this.tests = tests;
  }
  
  Test.prototype.run = function () {
    var name = this.name,
    hooks = this.hooks,
    tests = this.tests;
    
    var context = {},
    passed = 0,
    exception = 0,
    total = 0;
    
    $.writeln('\n------- ' + name +  ' started -------');
    
    hooks.before.call(context);
    
    for (var key in tests) {
      var test = tests[key],
      assert = new Assert(key);
      
      $.writeln('*** ' + key + ' started ***');
      
      hooks.beforeEach.call(context);
      
      try {
        test.call(context, assert);
        if (assert.passed === assert.total) {
          passed++;
        }
      } catch (e) {
        $.writeln(e);
        exception++;
      }
      
      hooks.afterEach.call(context);
      
      $.writeln('*** ' + key + ' finished: ' + assert.passed + ' / ' + assert.total + ' ***');
      
      total++;
    }
    
    hooks.after.call(context);
    
    $.writeln('------- ' + name + ' finished: ' + passed + ' / ' + total + (exception ? ' (Exception: ' + exception + ')' : '') + ' -------');
  };
  
  function Assert(name) {
    this.name = name;
    this.passed = 0;
    this.total = 0;
  }

  Assert.prototype.ok = function (result, message) {
    message = message || this.name + '#' + (this.total + 1);
    
    if (result) {
      this.passed++;
    } else {
      $.writeln(message + ': bad');
    }
    this.total++;
  };
  
  Assert.prototype.notOk = function (result, message) {
    message = message || this.name + '#' + (this.total + 1);
    
    if (!result) {
      this.passed++;
    } else {
      $.writeln(message + ': bad');
    }
    this.total++;
  };
  
  Assert.prototype.equal = function (actual, expected, message) {
    message = message || this.name + '#' + (this.total + 1);

    var result = actual.toSource() === expected.toSource();
    if (result) {
      this.passed++;
    } else {
      $.writeln(message + ': ' + String(actual) + ' is different from ' + String(expected));
    }
    this.total++;
  };
  
  Assert.prototype.notEqual = function (actual, expected, message) {
    message = message || this.name + '#' + (this.total + 1);

    var result = expected.toSource() === actual.toSource();
    if (!result) {
      this.passed++;
    } else {
      $.writeln(message + ': ' + String(actual) + ' is same as ' + String(expected));
    }
    this.total++;
  };
  
  //utility
  function isObject(arg) {
    return Object.prototype.toString.call(arg) === '[object Object]';
  }

  function assign(obj) {
    obj = Object(obj);
    
    for (var i = 1, l = arguments.length; i <l; i++) {
      var target = arguments[i];
      if (!isObject(target)) {
        continue;
      }
      
      for (var key in target) {
        if (target.hasOwnProperty(key)) {
          obj[key] = target[key];
        }
      }
    }
    
    return obj;
  }
  
  //export
  root.Unit = Unit;

})(KIKAKU);
