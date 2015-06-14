/*
 *  KikakuFileManager v0.0.0
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
  function FileManager(path, type) {
    this._initialize.apply(this, arguments);
  }

  FileManager.VERSION = '0.0.0';

  FileManager.AUTHOR = 'Kareobana';

  FileManager.validateFileName = validateFileName;

  FileManager.prototype.getFiles = getFiles;

  FileManager.prototype.getFile = getFile;

  FileManager.prototype.getFileNames = getFileNames;

  FileManager.prototype.exists = exists;

  FileManager.prototype.get = get_;

  FileManager.prototype.save = save;

  FileManager.prototype.delete = delete_;

  /*
   * Implementation
   */
  //utility
  function isObject(arg) {
    return Object.prototype.toString.call(arg) === '[object Object]';
  }

  function isArray(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }

  function isString(arg) {
    return Object.prototype.toString.call(arg) === '[object String]';
  }

  function forEach(obj, fn) {
    if (isArray(obj)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        fn(obj[i], i);
      }
    } else if (isObject(obj)) {
      for (var key in obj) {
        fn(obj[key], key);
      }
    }
  }

  function filter(arr, fn) {
    var result = [];
    forEach(arr, function(v, i) {
      if (fn(v, i)) {
        result.push(v);
      }
    });
    return result;
  }

  function assign() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 0) {
      return {};
    }
    var obj1 = isObject(args[0]) ? args[0] : {};
    for (var i = 1, l = args.length; i < l; i++) {
      var obj2 = args[i];
      if (isObject(obj2)) {
        for (var key in obj2) {
          if (obj2.hasOwnProperty(key)) {
            obj1[key] = obj2[key];
          }
        }
      }
    }
    return obj1;
  }

  function createFolder(path) {
    var folder = new Folder(path),
      folders = [];

    while (!folder.exists) {
      folders.push(folder);
      folder = folder.parent;
    }

    while (folder = folders.pop()) {
      if (!folder.create()) {
        throw new Error('Failed to create folder');
      }
    }
  }

  //class
  function validateFileName(file_name) {
    if (!isString(file_name) || file_name === '') {
      return false;
    }
    return file_name.match(/[:;\/|,*?"'<>]/) === null;
  }

  //instance
  function getDirectoryPath(type) {
    switch (type) {
      case 'custom':
        return '';
      case 'appData':
        return Folder.appData.absoluteURI + '/';
      case 'commonFiles':
        return Folder.commonFiles.absoluteURI + '/';
      case 'desktop':
        return Folder.desktop.absoluteURI + '/';
      case 'myDocuments':
        return Folder.myDocuments.absoluteURI + '/';
      case 'userData':
        return Folder.userData.absoluteURI + '/';
      default:
        throw new Error('invalid type');
    }
  }

  FileManager.prototype._initialize = function(path, type) {
    function check(path) {
      var paths = path.split('/');
      forEach(paths, function(folder_name) {
        if (folder_name === '') {
          throw new Error('invalid path');
        }
      });
    }
    type = type || 'userData';
    if (!isString(path)) {
      throw new Error('"path" must be string');
    }
    check(path);

    this._cd = getDirectoryPath(type) + path;
  };

  function getFiles(options) {
    options = assign({
      path: null,
      mask: '*'
    }, options);

    var folder_path = options.path === null ? this._cd : this._cd + '/' + options.path,
      folder = new Folder(folder_path),
      files = folder.exists ? filter(folder.getFiles(options.mask), function(file) {
        return file instanceof File;
      }) : [];

    return files;
  }

  function getFile(path) {
    var file = new File(this._cd + '/' + path);
    return file;
  }

  function getFileNames(options) {
    var files = this.getFiles(options),
      file_names = [];

    forEach(files, function(file) {
      if (file instanceof File) {
        file_names.push(file.displayName);
      }
    });

    return file_names;
  }

  function exists(path) {
    return this.getFile(path).exists;
  }

  function get_(path) {
    var file = new File(this._cd + '/' + path);
    file.encoding = 'UTF-8';

    if (!file.exists) {
      return null;
    }

    if (!file.open('r')) {
      throw new Error('Can\'t read file');
    }

    var text = file.read();
    file.close();

    return text;
  }

  function save(path, text) {
    var paths = path.split('/'),
      file_name = paths.pop();
    if (!FileManager.validateFileName(file_name)) {
      throw new Error('Invalid file name: ' + file_name);
    }
    createFolder(this._cd + '/' + paths.join('/'));

    var file = new File(this._cd + '/' + path);
    if (!file.open('w')) {
      throw new Error('Can\'t write file');
    }
    file.write(text);
    file.close();
  }

  function delete_(path) {
    var file = new File(this._cd + '/' + path);
    if (file.exists) {
      return file.remove();
    }
    return true;
  }

  /*
  * Exports
  */
  root.FileManager = FileManager;

})(KIKAKU);
