(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*!
 * deep-diff.
 * Licensed under the MIT License.
 */
;(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return factory();
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.DeepDiff = factory();
  }
}(this, function(undefined) {
  'use strict';

  var $scope, conflict, conflictResolution = [];
  if (typeof global === 'object' && global) {
    $scope = global;
  } else if (typeof window !== 'undefined') {
    $scope = window;
  } else {
    $scope = {};
  }
  conflict = $scope.DeepDiff;
  if (conflict) {
    conflictResolution.push(
      function() {
        if ('undefined' !== typeof conflict && $scope.DeepDiff === accumulateDiff) {
          $scope.DeepDiff = conflict;
          conflict = undefined;
        }
      });
  }

  // nodejs compatible on server side and in the browser.
  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }

  function Diff(kind, path) {
    Object.defineProperty(this, 'kind', {
      value: kind,
      enumerable: true
    });
    if (path && path.length) {
      Object.defineProperty(this, 'path', {
        value: path,
        enumerable: true
      });
    }
  }

  function DiffEdit(path, origin, value) {
    DiffEdit.super_.call(this, 'E', path);
    Object.defineProperty(this, 'lhs', {
      value: origin,
      enumerable: true
    });
    Object.defineProperty(this, 'rhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffEdit, Diff);

  function DiffNew(path, value) {
    DiffNew.super_.call(this, 'N', path);
    Object.defineProperty(this, 'rhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffNew, Diff);

  function DiffDeleted(path, value) {
    DiffDeleted.super_.call(this, 'D', path);
    Object.defineProperty(this, 'lhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffDeleted, Diff);

  function DiffArray(path, index, item) {
    DiffArray.super_.call(this, 'A', path);
    Object.defineProperty(this, 'index', {
      value: index,
      enumerable: true
    });
    Object.defineProperty(this, 'item', {
      value: item,
      enumerable: true
    });
  }
  inherits(DiffArray, Diff);

  function arrayRemove(arr, from, to) {
    var rest = arr.slice((to || from) + 1 || arr.length);
    arr.length = from < 0 ? arr.length + from : from;
    arr.push.apply(arr, rest);
    return arr;
  }

  function realTypeOf(subject) {
    var type = typeof subject;
    if (type !== 'object') {
      return type;
    }

    if (subject === Math) {
      return 'math';
    } else if (subject === null) {
      return 'null';
    } else if (Array.isArray(subject)) {
      return 'array';
    } else if (Object.prototype.toString.call(subject) === '[object Date]') {
      return 'date';
    } else if (typeof subject.toString !== 'undefined' && /^\/.*\//.test(subject.toString())) {
      return 'regexp';
    }
    return 'object';
  }

  function deepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
    path = path || [];
    var currentPath = path.slice(0);
    if (typeof key !== 'undefined') {
      if (prefilter) {
        if (typeof(prefilter) === 'function' && prefilter(currentPath, key)) { return; }
        else if (typeof(prefilter) === 'object') {
          if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) { return; }
          if (prefilter.normalize) {
            var alt = prefilter.normalize(currentPath, key, lhs, rhs);
            if (alt) {
              lhs = alt[0];
              rhs = alt[1];
            }
          }
        }
      }
      currentPath.push(key);
    }

    // Use string comparison for regexes
    if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
      lhs = lhs.toString();
      rhs = rhs.toString();
    }

    var ltype = typeof lhs;
    var rtype = typeof rhs;
    if (ltype === 'undefined') {
      if (rtype !== 'undefined') {
        changes(new DiffNew(currentPath, rhs));
      }
    } else if (rtype === 'undefined') {
      changes(new DiffDeleted(currentPath, lhs));
    } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
      changes(new DiffEdit(currentPath, lhs, rhs));
    } else if (Object.prototype.toString.call(lhs) === '[object Date]' && Object.prototype.toString.call(rhs) === '[object Date]' && ((lhs - rhs) !== 0)) {
      changes(new DiffEdit(currentPath, lhs, rhs));
    } else if (ltype === 'object' && lhs !== null && rhs !== null) {
      stack = stack || [];
      if (stack.indexOf(lhs) < 0) {
        stack.push(lhs);
        if (Array.isArray(lhs)) {
          var i, len = lhs.length;
          for (i = 0; i < lhs.length; i++) {
            if (i >= rhs.length) {
              changes(new DiffArray(currentPath, i, new DiffDeleted(undefined, lhs[i])));
            } else {
              deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack);
            }
          }
          while (i < rhs.length) {
            changes(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i++])));
          }
        } else {
          var akeys = Object.keys(lhs);
          var pkeys = Object.keys(rhs);
          akeys.forEach(function(k, i) {
            var other = pkeys.indexOf(k);
            if (other >= 0) {
              deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack);
              pkeys = arrayRemove(pkeys, other);
            } else {
              deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack);
            }
          });
          pkeys.forEach(function(k) {
            deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack);
          });
        }
        stack.length = stack.length - 1;
      }
    } else if (lhs !== rhs) {
      if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
        changes(new DiffEdit(currentPath, lhs, rhs));
      }
    }
  }

  function accumulateDiff(lhs, rhs, prefilter, accum) {
    accum = accum || [];
    deepDiff(lhs, rhs,
      function(diff) {
        if (diff) {
          accum.push(diff);
        }
      },
      prefilter);
    return (accum.length) ? accum : undefined;
  }

  function applyArrayChange(arr, index, change) {
    if (change.path && change.path.length) {
      var it = arr[index],
          i, u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          applyArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          delete it[change.path[i]];
          break;
        case 'E':
        case 'N':
          it[change.path[i]] = change.rhs;
          break;
      }
    } else {
      switch (change.kind) {
        case 'A':
          applyArrayChange(arr[index], change.index, change.item);
          break;
        case 'D':
          arr = arrayRemove(arr, index);
          break;
        case 'E':
        case 'N':
          arr[index] = change.rhs;
          break;
      }
    }
    return arr;
  }

  function applyChange(target, source, change) {
    if (target && source && change && change.kind) {
      var it = target,
          i = -1,
          last = change.path ? change.path.length - 1 : 0;
      while (++i < last) {
        if (typeof it[change.path[i]] === 'undefined') {
          it[change.path[i]] = (typeof change.path[i] === 'number') ? [] : {};
        }
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
          break;
        case 'D':
          delete it[change.path[i]];
          break;
        case 'E':
        case 'N':
          it[change.path[i]] = change.rhs;
          break;
      }
    }
  }

  function revertArrayChange(arr, index, change) {
    if (change.path && change.path.length) {
      // the structure of the object at the index has changed...
      var it = arr[index],
          i, u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          revertArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          it[change.path[i]] = change.lhs;
          break;
        case 'E':
          it[change.path[i]] = change.lhs;
          break;
        case 'N':
          delete it[change.path[i]];
          break;
      }
    } else {
      // the array item is different...
      switch (change.kind) {
        case 'A':
          revertArrayChange(arr[index], change.index, change.item);
          break;
        case 'D':
          arr[index] = change.lhs;
          break;
        case 'E':
          arr[index] = change.lhs;
          break;
        case 'N':
          arr = arrayRemove(arr, index);
          break;
      }
    }
    return arr;
  }

  function revertChange(target, source, change) {
    if (target && source && change && change.kind) {
      var it = target,
          i, u;
      u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        if (typeof it[change.path[i]] === 'undefined') {
          it[change.path[i]] = {};
        }
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          // Array was modified...
          // it will be an array...
          revertArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          // Item was deleted...
          it[change.path[i]] = change.lhs;
          break;
        case 'E':
          // Item was edited...
          it[change.path[i]] = change.lhs;
          break;
        case 'N':
          // Item is new...
          delete it[change.path[i]];
          break;
      }
    }
  }

  function applyDiff(target, source, filter) {
    if (target && source) {
      var onChange = function(change) {
        if (!filter || filter(target, source, change)) {
          applyChange(target, source, change);
        }
      };
      deepDiff(target, source, onChange);
    }
  }

  Object.defineProperties(accumulateDiff, {

    diff: {
      value: accumulateDiff,
      enumerable: true
    },
    observableDiff: {
      value: deepDiff,
      enumerable: true
    },
    applyDiff: {
      value: applyDiff,
      enumerable: true
    },
    applyChange: {
      value: applyChange,
      enumerable: true
    },
    revertChange: {
      value: revertChange,
      enumerable: true
    },
    isConflict: {
      value: function() {
        return 'undefined' !== typeof conflict;
      },
      enumerable: true
    },
    noConflict: {
      value: function() {
        if (conflictResolution) {
          conflictResolution.forEach(function(it) {
            it();
          });
          conflictResolution = null;
        }
        return accumulateDiff;
      },
      enumerable: true
    }
  });

  return accumulateDiff;
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":9}],3:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":2,"./_getRawTag":6,"./_objectToString":7}],4:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":8}],6:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":2}],7:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],8:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],9:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":4}],10:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],11:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    getPrototype = require('./_getPrototype'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

},{"./_baseGetTag":3,"./_getPrototype":5,"./isObjectLike":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.printBuffer = printBuffer;

var _helpers = require('./helpers');

var _diff = require('./diff');

var _diff2 = _interopRequireDefault(_diff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Get log level string based on supplied params
 *
 * @param {string | function | object} level - console[level]
 * @param {object} action - selected action
 * @param {array} payload - selected payload
 * @param {string} type - log entry type
 *
 * @returns {string} level
 */
function getLogLevel(level, action, payload, type) {
  switch (typeof level === 'undefined' ? 'undefined' : _typeof(level)) {
    case 'object':
      return typeof level[type] === 'function' ? level[type].apply(level, _toConsumableArray(payload)) : level[type];
    case 'function':
      return level(action);
    default:
      return level;
  }
}

function defaultTitleFormatter(options) {
  var timestamp = options.timestamp,
      duration = options.duration;


  return function (action, time, took) {
    var parts = ['action'];

    if (timestamp) parts.push('@ ' + time);
    parts.push(String(action.type));
    if (duration) parts.push('(in ' + took.toFixed(2) + ' ms)');

    return parts.join(' ');
  };
}

function printBuffer(buffer, options) {
  var logger = options.logger,
      actionTransformer = options.actionTransformer,
      _options$titleFormatt = options.titleFormatter,
      titleFormatter = _options$titleFormatt === undefined ? defaultTitleFormatter(options) : _options$titleFormatt,
      collapsed = options.collapsed,
      colors = options.colors,
      level = options.level,
      diff = options.diff;


  buffer.forEach(function (logEntry, key) {
    var started = logEntry.started,
        startedTime = logEntry.startedTime,
        action = logEntry.action,
        prevState = logEntry.prevState,
        error = logEntry.error;
    var took = logEntry.took,
        nextState = logEntry.nextState;

    var nextEntry = buffer[key + 1];

    if (nextEntry) {
      nextState = nextEntry.prevState;
      took = nextEntry.started - started;
    }

    // Message
    var formattedAction = actionTransformer(action);
    var isCollapsed = typeof collapsed === 'function' ? collapsed(function () {
      return nextState;
    }, action, logEntry) : collapsed;

    var formattedTime = (0, _helpers.formatTime)(startedTime);
    var titleCSS = colors.title ? 'color: ' + colors.title(formattedAction) + ';' : null;
    var title = titleFormatter(formattedAction, formattedTime, took);

    // Render
    try {
      if (isCollapsed) {
        if (colors.title) logger.groupCollapsed('%c ' + title, titleCSS);else logger.groupCollapsed(title);
      } else {
        if (colors.title) logger.group('%c ' + title, titleCSS);else logger.group(title);
      }
    } catch (e) {
      logger.log(title);
    }

    var prevStateLevel = getLogLevel(level, formattedAction, [prevState], 'prevState');
    var actionLevel = getLogLevel(level, formattedAction, [formattedAction], 'action');
    var errorLevel = getLogLevel(level, formattedAction, [error, prevState], 'error');
    var nextStateLevel = getLogLevel(level, formattedAction, [nextState], 'nextState');

    if (prevStateLevel) {
      if (colors.prevState) logger[prevStateLevel]('%c prev state', 'color: ' + colors.prevState(prevState) + '; font-weight: bold', prevState);else logger[prevStateLevel]('prev state', prevState);
    }

    if (actionLevel) {
      if (colors.action) logger[actionLevel]('%c action', 'color: ' + colors.action(formattedAction) + '; font-weight: bold', formattedAction);else logger[actionLevel]('action', formattedAction);
    }

    if (error && errorLevel) {
      if (colors.error) logger[errorLevel]('%c error', 'color: ' + colors.error(error, prevState) + '; font-weight: bold', error);else logger[errorLevel]('error', error);
    }

    if (nextStateLevel) {
      if (colors.nextState) logger[nextStateLevel]('%c next state', 'color: ' + colors.nextState(nextState) + '; font-weight: bold', nextState);else logger[nextStateLevel]('next state', nextState);
    }

    if (diff) {
      (0, _diff2.default)(prevState, nextState, logger, isCollapsed);
    }

    try {
      logger.groupEnd();
    } catch (e) {
      logger.log('\u2014\u2014 log end \u2014\u2014');
    }
  });
}
},{"./diff":14,"./helpers":15}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  level: "log",
  logger: console,
  logErrors: true,
  collapsed: undefined,
  predicate: undefined,
  duration: false,
  timestamp: true,
  stateTransformer: function stateTransformer(state) {
    return state;
  },
  actionTransformer: function actionTransformer(action) {
    return action;
  },
  errorTransformer: function errorTransformer(error) {
    return error;
  },
  colors: {
    title: function title() {
      return "inherit";
    },
    prevState: function prevState() {
      return "#9E9E9E";
    },
    action: function action() {
      return "#03A9F4";
    },
    nextState: function nextState() {
      return "#4CAF50";
    },
    error: function error() {
      return "#F20404";
    }
  },
  diff: false,
  diffPredicate: undefined,

  // Deprecated options
  transformer: undefined
};
module.exports = exports["default"];
},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = diffLogger;

var _deepDiff = require('deep-diff');

var _deepDiff2 = _interopRequireDefault(_deepDiff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// https://github.com/flitbit/diff#differences
var dictionary = {
  'E': {
    color: '#2196F3',
    text: 'CHANGED:'
  },
  'N': {
    color: '#4CAF50',
    text: 'ADDED:'
  },
  'D': {
    color: '#F44336',
    text: 'DELETED:'
  },
  'A': {
    color: '#2196F3',
    text: 'ARRAY:'
  }
};

function style(kind) {
  return 'color: ' + dictionary[kind].color + '; font-weight: bold';
}

function render(diff) {
  var kind = diff.kind,
      path = diff.path,
      lhs = diff.lhs,
      rhs = diff.rhs,
      index = diff.index,
      item = diff.item;


  switch (kind) {
    case 'E':
      return [path.join('.'), lhs, '\u2192', rhs];
    case 'N':
      return [path.join('.'), rhs];
    case 'D':
      return [path.join('.')];
    case 'A':
      return [path.join('.') + '[' + index + ']', item];
    default:
      return [];
  }
}

function diffLogger(prevState, newState, logger, isCollapsed) {
  var diff = (0, _deepDiff2.default)(prevState, newState);

  try {
    if (isCollapsed) {
      logger.groupCollapsed('diff');
    } else {
      logger.group('diff');
    }
  } catch (e) {
    logger.log('diff');
  }

  if (diff) {
    diff.forEach(function (elem) {
      var kind = elem.kind;

      var output = render(elem);

      logger.log.apply(logger, ['%c ' + dictionary[kind].text, style(kind)].concat(_toConsumableArray(output)));
    });
  } else {
    logger.log('\u2014\u2014 no diff \u2014\u2014');
  }

  try {
    logger.groupEnd();
  } catch (e) {
    logger.log('\u2014\u2014 diff end \u2014\u2014 ');
  }
}
module.exports = exports['default'];
},{"deep-diff":1}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var repeat = exports.repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};

var pad = exports.pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};

var formatTime = exports.formatTime = function formatTime(time) {
  return pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use performance API if it's available in order to get better precision
var timer = exports.timer = typeof performance !== "undefined" && performance !== null && typeof performance.now === "function" ? performance : Date;
},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _core = require('./core');

var _helpers = require('./helpers');

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates logger with following options
 *
 * @namespace
 * @param {object} options - options for logger
 * @param {string | function | object} options.level - console[level]
 * @param {boolean} options.duration - print duration of each action?
 * @param {boolean} options.timestamp - print timestamp with each action?
 * @param {object} options.colors - custom colors
 * @param {object} options.logger - implementation of the `console` API
 * @param {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @param {boolean} options.collapsed - is group collapsed?
 * @param {boolean} options.predicate - condition which resolves logger behavior
 * @param {function} options.stateTransformer - transform state before print
 * @param {function} options.actionTransformer - transform action before print
 * @param {function} options.errorTransformer - transform error before print
 *
 * @returns {function} logger middleware
 */
function createLogger() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var loggerOptions = _extends({}, _defaults2.default, options);

  var logger = loggerOptions.logger,
      transformer = loggerOptions.transformer,
      stateTransformer = loggerOptions.stateTransformer,
      errorTransformer = loggerOptions.errorTransformer,
      predicate = loggerOptions.predicate,
      logErrors = loggerOptions.logErrors,
      diffPredicate = loggerOptions.diffPredicate;

  // Return if 'console' object is not defined

  if (typeof logger === 'undefined') {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error('Option \'transformer\' is deprecated, use \'stateTransformer\' instead!'); // eslint-disable-line no-console
  }

  var logBuffer = [];

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // Exit early if predicate function returns 'false'
        if (typeof predicate === 'function' && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = _helpers.timer.now();
        logEntry.startedTime = new Date();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = void 0;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = _helpers.timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        var diff = loggerOptions.diff && typeof diffPredicate === 'function' ? diffPredicate(getState, action) : loggerOptions.diff;

        (0, _core.printBuffer)(logBuffer, _extends({}, loggerOptions, { diff: diff }));
        logBuffer.length = 0;

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

exports.default = createLogger;
module.exports = exports['default'];
},{"./core":12,"./defaults":13,"./helpers":15}],17:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = applyMiddleware;

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":20}],18:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
},{}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = combineReducers;

var _createStore = require('./createStore');

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2['default'])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });

  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if ("development" !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  if ("development" !== 'production') {
    var unexpectedKeyCache = {};
  }

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if ("development" !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        (0, _warning2['default'])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
},{"./createStore":21,"./utils/warning":23,"lodash/isPlainObject":11}],20:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  var last = funcs[funcs.length - 1];
  var rest = funcs.slice(0, -1);
  return function () {
    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}
},{}],21:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports['default'] = createStore;

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _symbolObservable = require('symbol-observable');

var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2['default'])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[_symbolObservable2['default']] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[_symbolObservable2['default']] = observable, _ref2;
}
},{"lodash/isPlainObject":11,"symbol-observable":24}],22:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = require('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = require('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = require('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if ("development" !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2['default'])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2['default'];
exports.combineReducers = _combineReducers2['default'];
exports.bindActionCreators = _bindActionCreators2['default'];
exports.applyMiddleware = _applyMiddleware2['default'];
exports.compose = _compose2['default'];
},{"./applyMiddleware":17,"./bindActionCreators":18,"./combineReducers":19,"./compose":20,"./createStore":21,"./utils/warning":23}],23:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],24:[function(require,module,exports){
module.exports = require('./lib/index');

},{"./lib/index":25}],25:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = require('./ponyfill');

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./ponyfill":26}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};
},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * DayCycle service
 */
class DayCycle {

  /**
   * @param {Number} dayLength Length of day in milliseconds
   */
  constructor({ game = {}, dayLength = 300000 } = {}) {
    this.game = game;
    this.dayLength = dayLength;
  }

  /**
   * Load sun
   * @param {Object} sprite Sun sprite
   */
  initSun(sprite) {
    this.sunSprite = sprite;
    this.sunset();
  }

  /**
   * Load moon
   * @param {Object} sprite Moon sprite
   */
  initMoon(sprite) {
    this.moonSprite = sprite;
    this.moonrise();
  }

  /**
   * Load shading
   * @param {Array} shades Shading range
   */
  initShading(shades) {
    this.shading = shades;
  }

  /**
   * Run sunrise animation, then sunset on complete
   * @param {Object} sprite Sun sprite
   */
  sunrise() {
    this.sunTween = this.game.add.tween(this.sunSprite.cameraOffset).to({ y: -250 }, this.dayLength, null, true);
    this.sunTween.onComplete.add(this.sunset, this);

    if (this.shading) {
      this.shading.forEach(shade => {
        this.tweenTint(shade.sprite, shade.from, shade.to, this.dayLength);
      });
    }
  }

  /**
   * Run sunset animation, then sunrise on complete
   * @param {Object} sprite Sun sprite
   */
  sunset() {
    this.sunTween = this.game.add.tween(this.sunSprite.cameraOffset).to({ y: this.game.world.height + 400 }, this.dayLength, null, true);
    this.sunTween.onComplete.add(this.sunrise, this);

    if (this.shading) {
      this.shading.forEach(shade => {
        this.tweenTint(shade.sprite, shade.to, shade.from, this.dayLength);
      });
    }
  }

  /**
   * Run moonrise animation, then moonset on complete
   * @param {Object} sprite Moon sprite
   */
  moonrise() {
    this.moonTween = this.game.add.tween(this.moonSprite.cameraOffset).to({ y: -350 }, this.dayLength, null, true);
    this.moonTween.onComplete.add(this.moonset, this);
  }

  /**
   * Run moonset animation, then moonrise on complete
   * @param {Object} sprite Moon sprite
   */
  moonset() {
    this.moonTween = this.game.add.tween(this.moonSprite.cameraOffset).to({ y: this.game.world.height + 400 }, this.dayLength, null, true);
    this.moonTween.onComplete.add(this.moonrise, this);
  }

  /**
   * Run through shading cycle as sun rises and sets
   * @param {Object} spriteToTween Sky sprite
   * @param {String} startColor Start color
   * @param {String} endColor End color
   * @param {Number} duration Duration in milliseconds
   */
  tweenTint(spriteToTween, startColor, endColor, duration) {
    const colorBlend = { step: 0 };

    this.game.add.tween(colorBlend).to({ step: 100 }, duration, Phaser.Easing.Default, false).onUpdateCallback(() => {
      spriteToTween.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step, 1);
    }).start();
  }

}
exports.DayCycle = DayCycle;

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @class MoonSprite
 */
class MoonSprite extends Phaser.Sprite {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Object} location X and Y coordinates to render the sprite
   * @param {Number} scale Scale to render the sprite
   */
  constructor({ game = {}, location = {}, scale = 1 } = {}) {
    super(game, location.x, location.y, 'sky');
    this.config = {
      scale,
      location
    };
    this.render();
  }

  /**
   * Render the sprite
   */
  render() {
    this.game.add.existing(this);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0, 1);
    this.fixedToCamera = true;
  }

  /**
   * Displays a still frame or an animation on update loop
   */
  update() {
    this.frameName = 'moon';
  }

}
exports.MoonSprite = MoonSprite;

},{}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkySprite = undefined;

var _layerManager = require('../layerManager/layerManager');

var _moon = require('./moon.sprite');

var _sun = require('./sun.sprite');

var _dayCycle = require('./dayCycle.service');

/**
 * Sets up the bitmap canvas and sprite for the sky.
 */

/**
 * Configuration of health bar.
 * @type {Object}
 */
const config = {
  width: window.innerWidth,
  height: window.innerHeight,
  x: 0,
  y: 0,
  bg: {
    color: '#2B97FC'
  },
  bar: {
    color: '#AB1111'
  },
  animationDuration: 200
};

/**
 * Canvas drawing for sky.
 */
class SkyCanvas extends Phaser.BitmapData {
  constructor({ game = {}, width = window.innerWidth } = {}) {
    super(game, 'sky', width, config.height);
    this.ctx.fillStyle = config.bg.color;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, width, config.height);
    this.ctx.fill();
  }
}

/**
 * Loads sky canvas as a sprite to allow tweening of color.
 */
class SkySprite extends Phaser.Sprite {

  constructor({ game = {}, width = window.innerWidth } = {}) {
    super(game, config.x, config.y, new SkyCanvas({ game, width }));
    this.dayCycle = new _dayCycle.DayCycle({ game });
    game.add.existing(this);
    this.game = game;
    this.render();
  }

  /**
   * Renders sky and initializes sky events
   */
  render() {

    this.moonSprite = new _moon.MoonSprite({
      game: this.game,
      location: {
        x: this.game.width - this.game.width / 4,
        y: this.game.height + 500
      }
    });
    this.game.layerManager.layers.get('skyLayer').add(this.moonSprite);

    this.sunSprite = new _sun.SunSprite({
      game: this.game,
      location: {
        x: 50,
        y: -250
      }
    });
    this.game.layerManager.layers.get('skyLayer').add(this.sunSprite);

    // Extendable array of sky shades for tweening
    const skyTones = [{ sprite: this, from: 0x1f2a27, to: 0x7ec0ee }];

    // Init tweening of sky color, sun and moon
    this.dayCycle.initShading(skyTones);
    this.dayCycle.initSun(this.sunSprite);
    this.dayCycle.initMoon(this.moonSprite);
  }

}
exports.SkySprite = SkySprite;

},{"../layerManager/layerManager":36,"./dayCycle.service":27,"./moon.sprite":28,"./sun.sprite":30}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @class SunSprite
 */
class SunSprite extends Phaser.Sprite {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Object} location X and Y coordinates to render the sprite
   * @param {Number} scale Scale to render the sprite
   */
  constructor({ game = {}, location = {}, scale = 1.25 } = {}) {
    super(game, location.x, location.y, 'sky');
    this.config = {
      scale,
      location
    };
    this.render();
  }

  /**
   * Render the sprite
   */
  render() {
    this.game.add.existing(this);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0, 1);
    this.fixedToCamera = true;
  }

  /**
   * Displays a still frame or an animation on update loop
   */
  update() {
    this.frameName = 'sun';
  }

}
exports.SunSprite = SunSprite;

},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * TileSprite is an individual tile rendered by the tile generator
 * 
 * @class TileSprite
 */
class TileSprite extends Phaser.Sprite {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Object} location X and Y coordinates to render the sprite
   * @param {Number} scale Scale to render the sprite
   * @param {String} tileName Name of the tile to render
   */
  constructor({ game = {}, location = {}, scale = 1, tileName = 'grass-light' } = {}) {
    super(game, location.x, location.y, 'ground');
    this.config = {
      scale,
      location,
      tileName
    };
    this.render();
  }

  /**
   * Render the sprite
   */
  render() {
    this.game.add.existing(this);
    /**
     * Phaser.Animations.add(name, generateFrameNames, frameRate, loop )
     * name — Name ot assign the animation
     * generateFrameNames — Phaser automatically will grab oak1 through oak3
     * frameRate — Frame rate to play animation
     * loop — Whether or not to loop the animation
     */
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0, 1);
    this.game.physics.p2.enable(this, false, true);
    this.body.kinematic = true;
  }

  /**
   * Sets the frame to the tile that needs to be displayed
   */
  update() {
    this.frameName = this.config.tileName;
  }

}
exports.TileSprite = TileSprite;

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Tree sprite is used for background trees and can load various types of trees from an atlas
 * 
 * @class TreeSprite
 */
class TreeSprite extends Phaser.Sprite {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Object} location X and Y coordinates to render the sprite
   * @param {Number} scale Scale to render the sprite
   * @param {String} stillFrameName Name to render sprite when no animation is playing
   * @param {Boolean} isAnimated Whether or not the sprite should be animated 
   */
  constructor({ game = {}, location = {}, scale = 1, stillFrameName = 'oak1', isAnimated = false } = {}) {

    super(game, location.x, location.y, 'trees');
    this.config = {
      scale,
      stillFrameName,
      isAnimated,
      location
    };
    this.render();
  }

  /**
   * Render the sprite
   */
  render() {
    this.game.add.existing(this);
    /**
     * Phaser.Animations.add(name, generateFrameNames, frameRate, loop )
     * name — Name ot assign the animation
     * generateFrameNames — Phaser automatically will grab oak1 through oak3
     * frameRate — Frame rate to play animation
     * loop — Whether or not to loop the animation
     */
    this.animations.add('sway', Phaser.Animation.generateFrameNames('oak', 1, 4), 1, true);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0, 1);
  }

  /**
   * Displays a still frame or an animation on update loop
   */
  update() {
    if (this.config.isAnimated) {
      this.animations.play('sway');
    } else {
      this.frameName = this.config.stillFrameName;
    }
  }

}
exports.TreeSprite = TreeSprite;

},{}],33:[function(require,module,exports){
'use strict';

var _zone = require('./states/zone1/zone1');

const zone1 = new _zone.Zone1();

class Game extends Phaser.Game {

  constructor() {
    super(window.innerWidth, window.innerHeight, Phaser.AUTO, '', null);
    this.state.add('Zone1', zone1, false);
    this.state.start('Zone1');
  }

}

const game = new Game();

},{"./states/zone1/zone1":44}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HealthBarSprite = undefined;

var _layerManager = require('../layerManager/layerManager');

/**
 * Sets up the bitmap canvases and sprites for the health bar and health bar background.
 */

/**
 * Configuration of health bar.
 * @type {Object}
 */
const config = {
  width: 300,
  height: 12,
  x: 10,
  y: 10,
  bg: {
    color: '#404040'
  },
  bar: {
    color: '#AB1111'
  },
  animationDuration: 200
};

/**
 * Canvas drawing for health bar background.
 */
class HealthBarBGCanvas extends Phaser.BitmapData {
  constructor({ game = {} } = {}) {
    super(game, 'health bar background', config.width, config.height);
    this.ctx.fillStyle = config.bg.color;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, config.width, config.height);
    this.ctx.fill();
  }
}

/**
 * Loads health bar background canvas as sprite.
 */
class HealthBarBGSprite extends Phaser.Sprite {
  constructor({ game = {} } = {}) {
    super(game, config.x, config.y, new HealthBarBGCanvas({ game }));
    game.add.existing(this);
  }
}

/**
 * Canvas drawing for health bar.
 */
class HealthBarCanvas extends Phaser.BitmapData {
  constructor({ game = {} } = {}) {
    super(game, 'health bar', config.width, config.height);
    this.ctx.fillStyle = config.bar.color;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, config.width - 10, config.height / 2);
    this.ctx.fill();
  }
}

/**
 * Loads health bar canvas as a sprite and render all healthbar assets.
 */
class HealthBarSprite extends Phaser.Sprite {

  constructor({ game = {}, character = {} } = {}) {
    super(game, config.x + 5, config.y + 3, new HealthBarCanvas({ game }));
    game.add.existing(this);

    this.character = character;
    this.layerManager = new _layerManager.LayerManager();

    this.render();
  }

  /**
   * Render the healthbar background and load both sprites into the layer manager.
   */
  render() {
    this.healthBarBG = new HealthBarBGSprite({ game: this.game });
    this.game.layerManager.layers.get('uiLayer').add(this.healthBarBG);
    this.game.layerManager.layers.get('uiLayer').add(this);

    this.fixedToCamera = true;
    this.healthBarBG.fixedToCamera = true;
  }

  /**
   * Tween health bar when there is a change in player's heatlh.
   */
  update() {
    this.game.add.tween(this).to({ width: this.character.state.health / this.character.state.maxHealth * config.width }, config.animationDuration, Phaser.Easing.Linear.None, true);
  }

}
exports.HealthBarSprite = HealthBarSprite;

},{"../layerManager/layerManager":36}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Defines game inputs and methods in various classes on event listeners
 * @class Input manager
 */

class InputManager extends Phaser.Input {

  /**
   * @param {Object} game Reference to Phaser game
   * @param {Class} player Reference to player
   */
  constructor({ game = {}, player = {} } = {}) {
    super(game);
    this.player = player;
    this.keys = game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Default control values
    this.actions = {
      run: 'idle',
      jump: false
    };
    this.init();
  }

  init() {
    this.onKeyDown();
  }

  /** 
   * Initializes listeners for keyboard input and executes the listener callbacks
   * Note: Listener callbacks are defined within the context of this method because the listener will
   * not accept a class method as a callback 
   */
  onKeyDown() {
    // Listen for direction key presses
    for (const key in this.keys) {
      if (this.keys.hasOwnProperty(key)) {
        /**
         * Arguments for the following functions
         * Phaser.Input.onDown.add(callback, context, priority, argument)
         */
        this.keys[key].onDown.add(broadcastAction, this, 0, { move: key });
        this.keys[key].onUp.add(broadcastAction, this, 0, { move: 'idle' });
      }
    }
    // Listen for jump button press
    this.jumpButton.onDown.add(broadcastAction, this, 0, { jump: true });
    this.jumpButton.onUp.add(broadcastAction, this, 0, { jump: false });

    /**
     * Fire action on relevant classes
     * @param {Object} event Phaser event
     * @param {String} values Values of actions to perform
     */
    function broadcastAction(event, { move = this.actions.move, jump = this.actions.jump } = {}) {
      this.actions.move = move;
      this.actions.jump = jump;
      this.player.sprite.setAction({ move: this.actions.move, jump: this.actions.jump });
    }
  }

  /**
   * Check if user can jump by looping over P2 bodies and trajectories
   * @returns {Boolean} result Whether or not the user can jump
   */
  checkIfCanJump() {
    const yAxis = p2.vec2.fromValues(0, 1);
    let result = false;
    for (const c of this.game.physics.p2.world.narrowphase.contactEquations) {
      if (c.bodyA === this.player.sprite.body.data || c.bodyB === this.player.sprite.body.data) {
        let d = p2.vec2.dot(c.normalA, yAxis);
        if (c.bodyA === this.player.sprite.body.data) {
          d *= -1;
        }
        if (d > 0.5) {
          result = true;
        }
      }
    }
    return result;
  }

}
exports.InputManager = InputManager;

},{}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Layers added here will be Loaded by order of index.
 * @type {Array}
 */
const layerRegistry = ['sky', 'environment', 'land', 'enemy', 'player', 'ui'];

/**
 *  Manages the registering of groups and setting their render order
 *  @type {Class}
 */
class LayerManager {
  constructor({ game = {} } = {}) {
    this.game = game;
    this.layerRegistry = layerRegistry;
    this.layers = new Map();
  }

  /**
   * setup
   * Adds items in layerRegistry to the LayerManager's layers Map with post-fix 'Layer'
   * @example 'ui' will be added as 'uiLayer'
   */
  setup() {
    for (const layer in this.layerRegistry) {
      this.layers.set(`${layerRegistry[layer]}Layer`, this.game.add.group());
      this.game.world.bringToTop(this.layers.get(`${layerRegistry[layer]}Layer`));
    }
  }

}
exports.LayerManager = LayerManager;

},{}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @class HealthTimer
 * Reduces health over time
 */

class HealthTimer {

  /**
   * @param {Object} player Player object
   */
  constructor({ player = {} } = {}) {
    this.player = player;
    this.init();
  }

  /**
   * Starts an interval for gradual health reduction
   */
  init() {
    setInterval(() => {
      if (this.player.state.health >= 0) {
        this.player.state.health -= 1;
      }
    }, 10000);
  }
}
exports.HealthTimer = HealthTimer;

},{}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlayerManager = undefined;

var _player = require('./player.sprite');

var _healthBar = require('../healthBar/healthBar');

var _input = require('../input/input.manager');

var _healthTimer = require('./healthTimer.service');

/**
 * Player manager is responsible for managing the state of the player and any aspects that are not
 * directly related to the body of the sprite such as user input and various stats and configuration
 * settings
 * 
 * @class PlayerManager
 */

class PlayerManager {

  /**
   * @param {Object} game Reference to the state's game object
   * @param {Number} health Current player health
   * @param {Number} maxHealth Maximum health the player can have
   * @param {Number} speed Base speed modifier for the player
   * @param {String} direction The direction the player should be facing
   */
  constructor({ game = {}, health = 100, maxHealth = 100, speed = 25, direction = 'right' } = {}) {
    this.state = {
      health,
      maxHealth,
      speed,
      direction
    };

    this.game = game;
    this.healthTimer = new _healthTimer.HealthTimer({ player: this });
    this.inputManager = new _input.InputManager({ game, player: this });
    this.sprite = new _player.PlayerSprite({ game, speed });
    this.healthBar = new _healthBar.HealthBarSprite({ game, character: this });

    // TODO: add a new class to configure camera by extending Phaser.Camera
    this.game.camera.follow(this.sprite);
    this.game.camera.setBoundsToWorld();
  }

}
exports.PlayerManager = PlayerManager;

},{"../healthBar/healthBar":34,"../input/input.manager":35,"./healthTimer.service":37,"./player.sprite":39}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Player sprite is responsible for the visual aspects of the sprite such as laoding its image,
 * its physics body, animations, and its collision polygon
 *
 * TODO: Consider whether to separate body into a new file to abstract physics from the sprite file.
 *
 * @class PlayerSprite
 */
class PlayerSprite extends Phaser.Sprite {

  /**
   * @param  {Object} game Reference to the state's game object
   */
  constructor({ game = {}, speed = 25 } = {}) {
    super(game, 150, window.innerHeight - 170, 'player');
    this.config = {
      scale: 1,
      speed
    };
    this.jumpTimer = 0;
    this.actions = {};
    this.detectionBounds = {};
    this.render();
  }

  /**
   * Setup sprite body settings
   */
  bodySetup() {
    this.body.fixedRotation = true;
    this.body.damping = 0.2;
    this.body.clearShapes();
    this.body.loadPolygon('player-polygon', 'player');
  }

  /**
   * Render the sprite body
   */
  render() {
    this.game.add.existing(this);
    this.animations.add('run', Phaser.Animation.generateFrameNames('run', 1, 5), 15, true);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0.5, 0);
    this.game.layerManager.layers.get('playerLayer').add(this);
    this.game.physics.p2.enable(this.game.layerManager.layers.get('playerLayer'), false, true);
    this.bodySetup();
  }

  /**
   * Sets actions for the sprite to perform. Executed from other managers such as InputListener
   */
  setAction({ move = 'idle', jump = false } = {}) {
    this.actions.move = move;
    this.actions.jump = jump;
  }

  /**
   * Phaser's update lifecycle hook
   */
  update() {

    this.updateDetectionBounds();
    // Listen for move (direction) separately from jump so both can be executed simultaneously
    switch (this.actions.move) {
      case 'right':
        this.animations.play('run');
        if (this.scale.x === -this.config.scale) {
          this.scale.x = this.config.scale;
        }
        this.body.velocity.x = 15 * this.config.speed;
        break;
      case 'left':
        this.animations.play('run');
        if (this.scale.x === this.config.scale) {
          this.scale.x = -this.config.scale;
        }
        this.body.velocity.x = -15 * this.config.speed;
        break;
      case 'idle':
        this.frameName = 'idle';
        break;
      default:
        this.frameName = 'idle';
    }
    if (this.actions.jump && this.game.time.now > this.jumpTimer) {
      this.body.moveUp(375);
      this.jumpTimer = this.game.time.now + 750;
    }
  }

  updateDetectionBounds() {
    this.detectionBounds.top = new Phaser.Line(this.x - this.width / 2, this.y - this.height / 2, this.x + this.width / 2, this.y - this.height / 2);
    this.detectionBounds.bottom = new Phaser.Line(this.x - this.width / 2, this.y + this.height / 2, this.x + this.width / 2, this.y + this.height / 2);
    this.detectionBounds.right = new Phaser.Line(this.x + this.width / 2, this.y - this.height / 2, this.x + this.width / 2, this.y + this.height / 2);
    this.detectionBounds.left = new Phaser.Line(this.x - this.width / 2, this.y - this.height / 2, this.x - this.width / 2, this.y + this.height / 2);
  }

}
exports.PlayerSprite = PlayerSprite;

},{}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Spawn = undefined;

var _zone = require('../states/zone1/zone1.config');

/**
 * Service for generating spawn points.
 * @class Spawn
 */
class Spawn {

  constructor() {
    this.location = this.getSpawn();
  }

  getSpawn() {
    const worldWidth = _zone.store.getState().worldWidth;
    return {
      x: Math.random() * (worldWidth - 0) + 0,
      y: window.innerHeight - 170
    };
  }

}
exports.Spawn = Spawn;

},{"../states/zone1/zone1.config":43}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateTiles = generateTiles;
/**
 * Generates the settings for rendering each light grass tile
 * @param {String} tileName Name of the tile's reference in the atlas
 * @param {Object} config Config object specifying where to render the tiles in the world
 * @returns {Array} Array of settings for each individual tile
 */
function generateTiles({ tileName = '', config = {} } = {}) {
  const tiles = [];
  // Value is the location object on each entry
  for (const [key, value] of config.location.entries()) {
    // Draw tiles from the beginning until the end of the range at intervals equal to the size of the tile
    for (let i = value.range[0] / config.size; i < value.range[1] / config.size; i++) {
      tiles.push({
        x: config.size * i,
        y: window.innerHeight - config.size * value.yLevel,
        scale: 1,
        tileName
      });
    }
  }
  return tiles;
}

},{}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTileMap = getTileMap;
function getTileMap() {
  /**
   * @type {Map} location
   * location map should consist of a key and an object of settings
   * range is an array consisting of a start and end point for rendering tiles horizontally across the WORLD_WIDTH
   * yLevel the distance from the bottom of the page in units equal to the size fo the tile
   */
  return {
    grass: {
      size: 32,
      location: new Map([['grass', { range: [0, 5000], yLevel: 1 }]])
    },
    dirt: {
      size: 32,
      location: new Map([[1, { range: [0, 5000], yLevel: 0 }]])
    }
  };
};

},{}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.store = undefined;

var _tileGenerator = require('../utilities/tileGenerator');

var _tileMap = require('./tileMap.config');

var _redux = require('redux');

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reduce state and return new state
 * @param {Object} state Current state
 * @param {Object} action Contains name of action and update to state
 * @returns {Object} New state
 */
function reducer(state = {}, action) {
  switch (action.type) {
    case 'WORLD_WIDTH':
      return Object.assign({}, state, {
        worldWidth: action.worldWidth
      });
    case 'TREES':
      return Object.assign({}, state, {
        trees: action.trees
      });
    case 'TILES':
      return Object.assign({}, state, {
        tiles: action.tiles
      });
    default:
      return state;
  }
}

/**
 * @type {Function}
 * Redux store for dispatching to reducer and logging all state updates
 * This can be imported to eigther dispatch updates to the state or to get state with .getState()
 */
const store = exports.store = (0, _redux.createStore)(reducer, (0, _redux.applyMiddleware)((0, _reduxLogger2.default)()));

/**
 * @type {String} worldWidth Width of zone1's world container
 */
const worldWidth = 5000;
store.dispatch({
  type: 'WORLD_WIDTH',
  worldWidth
});

/**
 * @type {Set} trees Manually set tree coordinates to allow for map creating.
 */
const trees = new Set([{ x: 100, y: window.innerHeight - 40, scale: 1.1 }, { x: 1000, y: window.innerHeight - 40, scale: 1.25 }, { x: 2250, y: window.innerHeight - 40, scale: 1 }, { x: 4000, y: window.innerHeight - 40, scale: 1.75 }]);
store.dispatch({
  type: 'TREES',
  trees
});

/**
 * @type {Function} tileLocations Calls getTileMap to generate the tile map for the zone
 */
const tileLocations = (0, _tileMap.getTileMap)();

/**
 * @type {Map} tiles Each key represents a tile to render with a value of an array of objects which represent the settings of each tile
 */
const tiles = new Map([['grass', (0, _tileGenerator.generateTiles)({ tileName: 'grass-dark', config: tileLocations.grass })], ['dirt', (0, _tileGenerator.generateTiles)({ tileName: 'dirt-brown', config: tileLocations.dirt })]]);
store.dispatch({
  type: 'TILES',
  tiles
});

},{"../utilities/tileGenerator":41,"./tileMap.config":42,"redux":22,"redux-logger":16}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Zone1 = undefined;

var _tree = require('../../environment/tree.sprite');

var _tile = require('../../environment/tile.sprite');

var _player = require('../../player/player.manager');

var _layerManager = require('../../layerManager/layerManager');

var _enemyManager = require('../../zombie/enemyManager');

var _sky = require('../../environment/sky.sprite');

var _zone = require('./zone1.config');

const config = _zone.store.getState();

class Zone1 extends Phaser.State {

  /**
   * Preload
   */
  preload() {
    // Load sprites and manage layers
    this.game.load.atlas('player', './dist/atlases/player/player.png', './dist/atlases/player/player.json');
    this.game.load.physics('player-polygon', './dist/atlases/player/player-polygon.json');
    this.game.load.atlas('zombie', './dist/atlases/zombie/zombie.png', './dist/atlases/zombie/zombie.json');
    this.game.load.physics('zombie-polygon', './dist/atlases/zombie/zombie-polygon.json');
    this.game.load.atlas('trees', './dist/atlases/trees/trees.png', './dist/atlases/trees/trees.json');
    this.game.load.atlas('ground', './dist/atlases/tilemaps/tiles.png', './dist/atlases/tilemaps/tiles.json');
    this.game.load.atlas('sky', './dist/atlases/sky/sky.png', './dist/atlases/sky/sky.json');
    this.game.layerManager = new _layerManager.LayerManager({ game: this.game });
    this.game.layerManager.setup();

    // Set game scale
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;

    // Set Physics for Zone
    this.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.gravity.y = 1000;
  }

  /**
   * Create
   */
  create() {
    this.game.enemyManager = new _enemyManager.EnemyManager({ game: this.game });
    this.player = new _player.PlayerManager({ game: this.game });
    this.game.enemyManager.addZombie({ player: this.player.sprite });
    this.skySprite = new _sky.SkySprite({ game: this.game, width: config.worldWidth });
    this.game.layerManager.layers.get('skyLayer').add(this.skySprite);
    this.renderTrees();
    this.renderTiles();
    /**
     * Phaser.World.setBounds(x, y, width, height )
     * x — Top left most corner of the world..
     * y — Top left most corner of the world.
     * width — New width of the game world in pixels.
     * height — New height of the game world in pixels.
     */
    this.game.world.setBounds(0, 0, config.worldWidth, window.innerHeight);
  }

  /**
   * Sets up the trees based on the settings provided in a given zone's config object
   */
  renderTrees() {
    for (const tree of config.trees) {
      const treeToAdd = new _tree.TreeSprite({
        game: this.game,
        location: { x: tree.x, y: tree.y },
        scale: tree.scale
      });
      this.game.layerManager.layers.get('environmentLayer').add(treeToAdd);
    }
  }

  /**
   * Renders a zone's tiles based on a config file
   */
  renderTiles() {
    for (const [key, value] of config.tiles.entries()) {
      for (const tile of value) {
        const tileToAdd = new _tile.TileSprite({
          game: this.game,
          location: { x: tile.x, y: tile.y },
          scale: tile.scale,
          tileName: tile.tileName
        });
        this.game.layerManager.layers.get('environmentLayer').add(tileToAdd);
      }
    }
  }

}
exports.Zone1 = Zone1;

},{"../../environment/sky.sprite":29,"../../environment/tile.sprite":31,"../../environment/tree.sprite":32,"../../layerManager/layerManager":36,"../../player/player.manager":38,"../../zombie/enemyManager":45,"./zone1.config":43}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnemyManager = undefined;

var _zombie = require('../zombie/zombie');

var _zombieDetection = require('../zombie/zombie-detection');

/**
 *  Manages the Enemies
 *  @type {Class}
 */
class EnemyManager {
  constructor({ game = {} } = {}) {
    this.game = game;
    this.zombies = [];
  }

  addZombie({ player = {} }) {
    const zombie = new _zombie.Zombie({ game: this.game, speed: 1, player });
    zombie.detector = new _zombieDetection.ZombieDetector({ game: this.game, zombie });
    this.zombies.push(zombie);
  }
}
exports.EnemyManager = EnemyManager;

},{"../zombie/zombie":47,"../zombie/zombie-detection":46}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Creates a new Zombie detection collider
 */

/**
 * Configuration of Zombie detection collider.
 * @type {Object}
 */
const config = {
  width: 500,
  height: 25
};

/**
 * Add sprite for detection
 */
class ZombieDetector {
  constructor({ game = {}, zombie = {} } = {}) {
    this.game = game;
    this.detectionTimer = this.game.time.now;
    this.zombie = zombie;
  }

  update() {

    this.game.layerManager.layers.get('playerLayer').forEach(player => {

      let line = -180;
      let ray;

      while (line < 90) {
        if (this.zombie.direction === 'left') {
          ray = new Phaser.Line(this.zombie.x, this.zombie.y - 75, this.zombie.x - this.zombie.perception, this.zombie.y + line);
          this.zombie.alerted = this.intersectionCheck(ray, player) ? true : false;
        } else {
          ray = new Phaser.Line(this.zombie.x, this.zombie.y - 75, this.zombie.x + this.zombie.perception, this.zombie.y + line);
          this.zombie.alerted = this.intersectionCheck(ray, player) ? true : false;
        }
        // this.game.debug.geom(ray);
        line = line + 15;
      }
    });

    this.dirty = true;
  }

  intersectionCheck(ray, player) {
    let intersection = false;
    if (ray.intersects(player.detectionBounds.right) || ray.intersects(player.detectionBounds.left) || ray.intersects(player.detectionBounds.top) || ray.intersects(player.detectionBounds.bottom)) {
      this.detectionTimer = this.game.time.now + 300;
      intersection = true;
    }
    if (this.detectionTimer > this.game.time.now) {
      intersection = true;
    }
    return intersection;
  }

}
exports.ZombieDetector = ZombieDetector;

},{}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Zombie = undefined;

var _spawn = require('../services/spawn');

var _zombieDetection = require('./zombie-detection');

/**
 * Spawn point coordinates
 * @type {Object}
 */
const spawn = new _spawn.Spawn();

/**
 * Zombie
 * @class Zombie
 */
class Zombie extends Phaser.Sprite {

  /**
   * @param  {Number} health Current health of the zombie
   * @param  {Number} maxHealth Maximum possible health for the zombie
   * @param  {Number} speed Walking speed for zombie
   * @property {Boolean} alerted Toggles whether the zombie moves toward the player
   */
  constructor({ game = {}, health = 100, maxHealth = 100, speed = 10, player = {}, perception = 300 } = {}) {
    super(game, spawn.location.x, spawn.location.y, 'zombie');

    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.alerted = false;
    this.perception = perception;
    this.direction = 'left';
    this.player = player;
    this.config = {
      scale: 1
    };

    this.detector = {};

    this.render();
  }

  /**
   * Setup sprite body settings
   */
  bodySetup() {
    this.body.fixedRotation = true;
    this.body.damping = 0.2;
    this.body.clearShapes();
    this.body.loadPolygon('zombie-polygon', 'zombie');
  }

  /**
  * Render on constructor instantiation
  */
  render() {
    this.game.add.existing(this);
    /**
     * Phaser provides a method to play all of the frames in a series of number frames. If there are six frames of "Run",
     * naming them Run1, Run2, etc will result in Phaser playing the full animation.
     * 
     * Phaser.Sprite.animations.add(name, generateFrameNames(frameNamePrefix, startNumber, endNumber), speed, loop)
     * name — Name to give the animation
     * frameNamePrefix — Name of frame in atlas without the number (e.g. Run1 would be "run")
     * startNumber — Starting frame number in a series of numbered frame names (e.g. Run1 would be "1")
     * endNumber — Ending frame number in a series of numbered frame names (e.g. Run6 would be "6")
     * speed - Framerate for animation
     * loop - If false, the animatino only plays once
     */
    this.animations.add('shamble', Phaser.Animation.generateFrameNames('shamble', 1, 2), 2, true);
    this.animations.add('lunge', Phaser.Animation.generateFrameNames('devour', 1, 4), 5, false);
    this.animations.add('devour', Phaser.Animation.generateFrameNames('devour', 5, 9), 5, true);
    this.scale.setTo(this.config.scale, this.config.scale);
    this.anchor.setTo(0.5, 0);
    this.game.layerManager.layers.get('enemyLayer').add(this);
    this.game.physics.p2.enable(this.game.layerManager.layers.get('enemyLayer'), false, true);
    this.bodySetup();

    this.game.debug.bodyInfo(this, 32, 32);
  }

  /**
   * Phaser's game loop
   */
  update() {
    if (this.contact && !this.dead) {
      this.onZombieGrab();
    }
    if (!this.contact) {
      this.onZombiePatrol();
    }
    // Run when zombie begins contact with a sprite
    this.body.onBeginContact.add(contact, this);
    function contact(body) {
      if (body) {
        if (body.sprite && body.sprite.key === 'player') {
          this.contact = true;
        }
      }
    }
  }

  onZombiePatrol() {
    this.detector.update();
    this.setPatrol();
    if (this.alerted) {
      this.perception = 400;
      this.speed = 60;
    } else {
      this.perception = 300;
      this.speed = 10;
    }
  }

  onZombieGrab() {
    const enemyLayer = this.game.layerManager.layers.get('enemyLayer');
    this.game.world.bringToTop(enemyLayer);
    this.animations.play('lunge');
    this.animations.currentAnim.onComplete.add(() => {
      // Bring zombie to top so we can see him devour P
      this.animations.play('devour');
    }, this);
    this.dead = true;
  }

  /**
   * Sets the partol behavior of a zombie
   */
  setPatrol() {
    if (this.alerted) {
      if (this.x > this.player.x) {
        this.shamble({ direction: 'left' });
        this.direction = 'left';
      } else {
        this.shamble({ direction: 'right' });
        this.direction = 'right';
      }
    } else {
      if (!this.behaviorDuration || this.behaviorDuration <= this.game.time.now) {
        // Set a duration for a new behavior
        this.behaviorDuration = this.game.time.now + 5000;
        // Stand when 0, walk when 1
        this.behavior = Math.round(Math.random());
        // Walk left when 0, walk right when 1
        this.direction = Math.round(Math.random()) === 0 ? 'left' : 'right';
      }
      if (this.behaviorDuration > this.game.time.now) {
        if (this.behavior === 1) {
          if (this.direction === 'left') {
            this.shamble({ direction: 'left' });
          } else {
            this.shamble({ direction: 'right' });
          }
        } else {
          this.frameName = 'idle';
        }
      }
    }
  }

  /**
   * Runs shamble animations
   * @param {String} direction Direction of animations
   * @param {Number} speedModifier Multiplier on zombie's default speed attribute
   */
  shamble({ direction = 'left', speedModifier = 15 } = {}) {
    const velocity = direction === 'left' ? -this.speed : this.speed;
    const scale = direction === 'left' ? -this.config.scale : this.config.scale;
    this.animations.play('shamble');
    this.scale.x = scale;
    this.body.velocity.x = velocity;
  }

}
exports.Zombie = Zombie;

},{"../services/spawn":40,"./zombie-detection":46}]},{},[33])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGVlcC1kaWZmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fU3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2ZyZWVHbG9iYWwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19nZXRSYXdUYWcuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJBcmcuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19yb290LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdExpa2UuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzUGxhaW5PYmplY3QuanMiLCJub2RlX21vZHVsZXMvcmVkdXgtbG9nZ2VyL2xpYi9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4LWxvZ2dlci9saWIvZGVmYXVsdHMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgtbG9nZ2VyL2xpYi9kaWZmLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4LWxvZ2dlci9saWIvaGVscGVycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC1sb2dnZXIvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9hcHBseU1pZGRsZXdhcmUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2JpbmRBY3Rpb25DcmVhdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tYmluZVJlZHVjZXJzLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9jb21wb3NlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9jcmVhdGVTdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL3V0aWxzL3dhcm5pbmcuanMiLCJub2RlX21vZHVsZXMvc3ltYm9sLW9ic2VydmFibGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3ltYm9sLW9ic2VydmFibGUvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N5bWJvbC1vYnNlcnZhYmxlL2xpYi9wb255ZmlsbC5qcyIsInNyYy9lbnZpcm9ubWVudC9kYXlDeWNsZS5zZXJ2aWNlLmpzIiwic3JjL2Vudmlyb25tZW50L21vb24uc3ByaXRlLmpzIiwic3JjL2Vudmlyb25tZW50L3NreS5zcHJpdGUuanMiLCJzcmMvZW52aXJvbm1lbnQvc3VuLnNwcml0ZS5qcyIsInNyYy9lbnZpcm9ubWVudC90aWxlLnNwcml0ZS5qcyIsInNyYy9lbnZpcm9ubWVudC90cmVlLnNwcml0ZS5qcyIsInNyYy9nYW1lLmpzIiwic3JjL2hlYWx0aEJhci9oZWFsdGhCYXIuanMiLCJzcmMvaW5wdXQvaW5wdXQubWFuYWdlci5qcyIsInNyYy9sYXllck1hbmFnZXIvbGF5ZXJNYW5hZ2VyLmpzIiwic3JjL3BsYXllci9oZWFsdGhUaW1lci5zZXJ2aWNlLmpzIiwic3JjL3BsYXllci9wbGF5ZXIubWFuYWdlci5qcyIsInNyYy9wbGF5ZXIvcGxheWVyLnNwcml0ZS5qcyIsInNyYy9zZXJ2aWNlcy9zcGF3bi5qcyIsInNyYy9zdGF0ZXMvdXRpbGl0aWVzL3RpbGVHZW5lcmF0b3IuanMiLCJzcmMvc3RhdGVzL3pvbmUxL3RpbGVNYXAuY29uZmlnLmpzIiwic3JjL3N0YXRlcy96b25lMS96b25lMS5jb25maWcuanMiLCJzcmMvc3RhdGVzL3pvbmUxL3pvbmUxLmpzIiwic3JjL3pvbWJpZS9lbmVteU1hbmFnZXIuanMiLCJzcmMvem9tYmllL3pvbWJpZS1kZXRlY3Rpb24uanMiLCJzcmMvem9tYmllL3pvbWJpZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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TCxHQUF3QixLQUFLLElBQUwsQ0FBVSxJQUFWLENBQWUsR0FBM0MsRUFBZ0Q7QUFDOUMsWUFBSSxLQUFLLFFBQUwsS0FBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsY0FBSSxLQUFLLFNBQUwsS0FBbUIsTUFBdkIsRUFBK0I7QUFDN0IsaUJBQUssT0FBTCxDQUFhLEVBQUUsV0FBVyxNQUFiLEVBQWI7QUFDRCxXQUZELE1BRU87QUFDTCxpQkFBSyxPQUFMLENBQWEsRUFBRSxXQUFXLE9BQWIsRUFBYjtBQUNEO0FBQ0YsU0FORCxNQU1PO0FBQ0wsZUFBSyxTQUFMLEdBQWlCLE1BQWpCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7O0FBS0EsVUFBUyxFQUFFLFlBQVksTUFBZCxFQUFzQixnQkFBZ0IsRUFBdEMsS0FBNkMsRUFBdEQsRUFBMEQ7QUFDeEQsVUFBTSxXQUFXLGNBQWMsTUFBZCxHQUF1QixDQUFDLEtBQUssS0FBN0IsR0FBcUMsS0FBSyxLQUEzRDtBQUNBLFVBQU0sUUFBUSxjQUFjLE1BQWQsR0FBdUIsQ0FBQyxLQUFLLE1BQUwsQ0FBWSxLQUFwQyxHQUE0QyxLQUFLLE1BQUwsQ0FBWSxLQUF0RTtBQUNBLFNBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixTQUFyQjtBQUNBLFNBQUssS0FBTCxDQUFXLENBQVgsR0FBZSxLQUFmO0FBQ0EsU0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFuQixHQUF1QixRQUF2QjtBQUNEOztBQTVKdUM7UUFBN0IsTSxHQUFBLE0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBkZWVwLWRpZmYuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cbjsoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAndXNlIHN0cmljdCc7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5EZWVwRGlmZiA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbih1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciAkc2NvcGUsIGNvbmZsaWN0LCBjb25mbGljdFJlc29sdXRpb24gPSBbXTtcbiAgaWYgKHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnICYmIGdsb2JhbCkge1xuICAgICRzY29wZSA9IGdsb2JhbDtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICRzY29wZSA9IHdpbmRvdztcbiAgfSBlbHNlIHtcbiAgICAkc2NvcGUgPSB7fTtcbiAgfVxuICBjb25mbGljdCA9ICRzY29wZS5EZWVwRGlmZjtcbiAgaWYgKGNvbmZsaWN0KSB7XG4gICAgY29uZmxpY3RSZXNvbHV0aW9uLnB1c2goXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgY29uZmxpY3QgJiYgJHNjb3BlLkRlZXBEaWZmID09PSBhY2N1bXVsYXRlRGlmZikge1xuICAgICAgICAgICRzY29wZS5EZWVwRGlmZiA9IGNvbmZsaWN0O1xuICAgICAgICAgIGNvbmZsaWN0ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vIG5vZGVqcyBjb21wYXRpYmxlIG9uIHNlcnZlciBzaWRlIGFuZCBpbiB0aGUgYnJvd3Nlci5cbiAgZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3I7XG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gRGlmZihraW5kLCBwYXRoKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdraW5kJywge1xuICAgICAgdmFsdWU6IGtpbmQsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHBhdGggJiYgcGF0aC5sZW5ndGgpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncGF0aCcsIHtcbiAgICAgICAgdmFsdWU6IHBhdGgsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIERpZmZFZGl0KHBhdGgsIG9yaWdpbiwgdmFsdWUpIHtcbiAgICBEaWZmRWRpdC5zdXBlcl8uY2FsbCh0aGlzLCAnRScsIHBhdGgpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbGhzJywge1xuICAgICAgdmFsdWU6IG9yaWdpbixcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JocycsIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgfVxuICBpbmhlcml0cyhEaWZmRWRpdCwgRGlmZik7XG5cbiAgZnVuY3Rpb24gRGlmZk5ldyhwYXRoLCB2YWx1ZSkge1xuICAgIERpZmZOZXcuc3VwZXJfLmNhbGwodGhpcywgJ04nLCBwYXRoKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JocycsIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9KTtcbiAgfVxuICBpbmhlcml0cyhEaWZmTmV3LCBEaWZmKTtcblxuICBmdW5jdGlvbiBEaWZmRGVsZXRlZChwYXRoLCB2YWx1ZSkge1xuICAgIERpZmZEZWxldGVkLnN1cGVyXy5jYWxsKHRoaXMsICdEJywgcGF0aCk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdsaHMnLCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgaW5oZXJpdHMoRGlmZkRlbGV0ZWQsIERpZmYpO1xuXG4gIGZ1bmN0aW9uIERpZmZBcnJheShwYXRoLCBpbmRleCwgaXRlbSkge1xuICAgIERpZmZBcnJheS5zdXBlcl8uY2FsbCh0aGlzLCAnQScsIHBhdGgpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaW5kZXgnLCB7XG4gICAgICB2YWx1ZTogaW5kZXgsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpdGVtJywge1xuICAgICAgdmFsdWU6IGl0ZW0sXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgaW5oZXJpdHMoRGlmZkFycmF5LCBEaWZmKTtcblxuICBmdW5jdGlvbiBhcnJheVJlbW92ZShhcnIsIGZyb20sIHRvKSB7XG4gICAgdmFyIHJlc3QgPSBhcnIuc2xpY2UoKHRvIHx8IGZyb20pICsgMSB8fCBhcnIubGVuZ3RoKTtcbiAgICBhcnIubGVuZ3RoID0gZnJvbSA8IDAgPyBhcnIubGVuZ3RoICsgZnJvbSA6IGZyb207XG4gICAgYXJyLnB1c2guYXBwbHkoYXJyLCByZXN0KTtcbiAgICByZXR1cm4gYXJyO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVhbFR5cGVPZihzdWJqZWN0KSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdDtcbiAgICBpZiAodHlwZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH1cblxuICAgIGlmIChzdWJqZWN0ID09PSBNYXRoKSB7XG4gICAgICByZXR1cm4gJ21hdGgnO1xuICAgIH0gZWxzZSBpZiAoc3ViamVjdCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdudWxsJztcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc3ViamVjdCkpIHtcbiAgICAgIHJldHVybiAnYXJyYXknO1xuICAgIH0gZWxzZSBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBEYXRlXScpIHtcbiAgICAgIHJldHVybiAnZGF0ZSc7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3ViamVjdC50b1N0cmluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgL15cXC8uKlxcLy8udGVzdChzdWJqZWN0LnRvU3RyaW5nKCkpKSB7XG4gICAgICByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgfVxuICAgIHJldHVybiAnb2JqZWN0JztcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZXBEaWZmKGxocywgcmhzLCBjaGFuZ2VzLCBwcmVmaWx0ZXIsIHBhdGgsIGtleSwgc3RhY2spIHtcbiAgICBwYXRoID0gcGF0aCB8fCBbXTtcbiAgICB2YXIgY3VycmVudFBhdGggPSBwYXRoLnNsaWNlKDApO1xuICAgIGlmICh0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgaWYgKHByZWZpbHRlcikge1xuICAgICAgICBpZiAodHlwZW9mKHByZWZpbHRlcikgPT09ICdmdW5jdGlvbicgJiYgcHJlZmlsdGVyKGN1cnJlbnRQYXRoLCBrZXkpKSB7IHJldHVybjsgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YocHJlZmlsdGVyKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBpZiAocHJlZmlsdGVyLnByZWZpbHRlciAmJiBwcmVmaWx0ZXIucHJlZmlsdGVyKGN1cnJlbnRQYXRoLCBrZXkpKSB7IHJldHVybjsgfVxuICAgICAgICAgIGlmIChwcmVmaWx0ZXIubm9ybWFsaXplKSB7XG4gICAgICAgICAgICB2YXIgYWx0ID0gcHJlZmlsdGVyLm5vcm1hbGl6ZShjdXJyZW50UGF0aCwga2V5LCBsaHMsIHJocyk7XG4gICAgICAgICAgICBpZiAoYWx0KSB7XG4gICAgICAgICAgICAgIGxocyA9IGFsdFswXTtcbiAgICAgICAgICAgICAgcmhzID0gYWx0WzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY3VycmVudFBhdGgucHVzaChrZXkpO1xuICAgIH1cblxuICAgIC8vIFVzZSBzdHJpbmcgY29tcGFyaXNvbiBmb3IgcmVnZXhlc1xuICAgIGlmIChyZWFsVHlwZU9mKGxocykgPT09ICdyZWdleHAnICYmIHJlYWxUeXBlT2YocmhzKSA9PT0gJ3JlZ2V4cCcpIHtcbiAgICAgIGxocyA9IGxocy50b1N0cmluZygpO1xuICAgICAgcmhzID0gcmhzLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgdmFyIGx0eXBlID0gdHlwZW9mIGxocztcbiAgICB2YXIgcnR5cGUgPSB0eXBlb2YgcmhzO1xuICAgIGlmIChsdHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGlmIChydHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY2hhbmdlcyhuZXcgRGlmZk5ldyhjdXJyZW50UGF0aCwgcmhzKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChydHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNoYW5nZXMobmV3IERpZmZEZWxldGVkKGN1cnJlbnRQYXRoLCBsaHMpKTtcbiAgICB9IGVsc2UgaWYgKHJlYWxUeXBlT2YobGhzKSAhPT0gcmVhbFR5cGVPZihyaHMpKSB7XG4gICAgICBjaGFuZ2VzKG5ldyBEaWZmRWRpdChjdXJyZW50UGF0aCwgbGhzLCByaHMpKTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChsaHMpID09PSAnW29iamVjdCBEYXRlXScgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHJocykgPT09ICdbb2JqZWN0IERhdGVdJyAmJiAoKGxocyAtIHJocykgIT09IDApKSB7XG4gICAgICBjaGFuZ2VzKG5ldyBEaWZmRWRpdChjdXJyZW50UGF0aCwgbGhzLCByaHMpKTtcbiAgICB9IGVsc2UgaWYgKGx0eXBlID09PSAnb2JqZWN0JyAmJiBsaHMgIT09IG51bGwgJiYgcmhzICE9PSBudWxsKSB7XG4gICAgICBzdGFjayA9IHN0YWNrIHx8IFtdO1xuICAgICAgaWYgKHN0YWNrLmluZGV4T2YobGhzKSA8IDApIHtcbiAgICAgICAgc3RhY2sucHVzaChsaHMpO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShsaHMpKSB7XG4gICAgICAgICAgdmFyIGksIGxlbiA9IGxocy5sZW5ndGg7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPj0gcmhzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjaGFuZ2VzKG5ldyBEaWZmQXJyYXkoY3VycmVudFBhdGgsIGksIG5ldyBEaWZmRGVsZXRlZCh1bmRlZmluZWQsIGxoc1tpXSkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlZXBEaWZmKGxoc1tpXSwgcmhzW2ldLCBjaGFuZ2VzLCBwcmVmaWx0ZXIsIGN1cnJlbnRQYXRoLCBpLCBzdGFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHdoaWxlIChpIDwgcmhzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2hhbmdlcyhuZXcgRGlmZkFycmF5KGN1cnJlbnRQYXRoLCBpLCBuZXcgRGlmZk5ldyh1bmRlZmluZWQsIHJoc1tpKytdKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgYWtleXMgPSBPYmplY3Qua2V5cyhsaHMpO1xuICAgICAgICAgIHZhciBwa2V5cyA9IE9iamVjdC5rZXlzKHJocyk7XG4gICAgICAgICAgYWtleXMuZm9yRWFjaChmdW5jdGlvbihrLCBpKSB7XG4gICAgICAgICAgICB2YXIgb3RoZXIgPSBwa2V5cy5pbmRleE9mKGspO1xuICAgICAgICAgICAgaWYgKG90aGVyID49IDApIHtcbiAgICAgICAgICAgICAgZGVlcERpZmYobGhzW2tdLCByaHNba10sIGNoYW5nZXMsIHByZWZpbHRlciwgY3VycmVudFBhdGgsIGssIHN0YWNrKTtcbiAgICAgICAgICAgICAgcGtleXMgPSBhcnJheVJlbW92ZShwa2V5cywgb3RoZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVlcERpZmYobGhzW2tdLCB1bmRlZmluZWQsIGNoYW5nZXMsIHByZWZpbHRlciwgY3VycmVudFBhdGgsIGssIHN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwa2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICAgICAgICAgIGRlZXBEaWZmKHVuZGVmaW5lZCwgcmhzW2tdLCBjaGFuZ2VzLCBwcmVmaWx0ZXIsIGN1cnJlbnRQYXRoLCBrLCBzdGFjayk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGxocyAhPT0gcmhzKSB7XG4gICAgICBpZiAoIShsdHlwZSA9PT0gJ251bWJlcicgJiYgaXNOYU4obGhzKSAmJiBpc05hTihyaHMpKSkge1xuICAgICAgICBjaGFuZ2VzKG5ldyBEaWZmRWRpdChjdXJyZW50UGF0aCwgbGhzLCByaHMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhY2N1bXVsYXRlRGlmZihsaHMsIHJocywgcHJlZmlsdGVyLCBhY2N1bSkge1xuICAgIGFjY3VtID0gYWNjdW0gfHwgW107XG4gICAgZGVlcERpZmYobGhzLCByaHMsXG4gICAgICBmdW5jdGlvbihkaWZmKSB7XG4gICAgICAgIGlmIChkaWZmKSB7XG4gICAgICAgICAgYWNjdW0ucHVzaChkaWZmKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHByZWZpbHRlcik7XG4gICAgcmV0dXJuIChhY2N1bS5sZW5ndGgpID8gYWNjdW0gOiB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseUFycmF5Q2hhbmdlKGFyciwgaW5kZXgsIGNoYW5nZSkge1xuICAgIGlmIChjaGFuZ2UucGF0aCAmJiBjaGFuZ2UucGF0aC5sZW5ndGgpIHtcbiAgICAgIHZhciBpdCA9IGFycltpbmRleF0sXG4gICAgICAgICAgaSwgdSA9IGNoYW5nZS5wYXRoLmxlbmd0aCAtIDE7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdTsgaSsrKSB7XG4gICAgICAgIGl0ID0gaXRbY2hhbmdlLnBhdGhbaV1dO1xuICAgICAgfVxuICAgICAgc3dpdGNoIChjaGFuZ2Uua2luZCkge1xuICAgICAgICBjYXNlICdBJzpcbiAgICAgICAgICBhcHBseUFycmF5Q2hhbmdlKGl0W2NoYW5nZS5wYXRoW2ldXSwgY2hhbmdlLmluZGV4LCBjaGFuZ2UuaXRlbSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0QnOlxuICAgICAgICAgIGRlbGV0ZSBpdFtjaGFuZ2UucGF0aFtpXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgICBpdFtjaGFuZ2UucGF0aFtpXV0gPSBjaGFuZ2UucmhzO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKGNoYW5nZS5raW5kKSB7XG4gICAgICAgIGNhc2UgJ0EnOlxuICAgICAgICAgIGFwcGx5QXJyYXlDaGFuZ2UoYXJyW2luZGV4XSwgY2hhbmdlLmluZGV4LCBjaGFuZ2UuaXRlbSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0QnOlxuICAgICAgICAgIGFyciA9IGFycmF5UmVtb3ZlKGFyciwgaW5kZXgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFJzpcbiAgICAgICAgY2FzZSAnTic6XG4gICAgICAgICAgYXJyW2luZGV4XSA9IGNoYW5nZS5yaHM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnI7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseUNoYW5nZSh0YXJnZXQsIHNvdXJjZSwgY2hhbmdlKSB7XG4gICAgaWYgKHRhcmdldCAmJiBzb3VyY2UgJiYgY2hhbmdlICYmIGNoYW5nZS5raW5kKSB7XG4gICAgICB2YXIgaXQgPSB0YXJnZXQsXG4gICAgICAgICAgaSA9IC0xLFxuICAgICAgICAgIGxhc3QgPSBjaGFuZ2UucGF0aCA/IGNoYW5nZS5wYXRoLmxlbmd0aCAtIDEgOiAwO1xuICAgICAgd2hpbGUgKCsraSA8IGxhc3QpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdFtjaGFuZ2UucGF0aFtpXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgaXRbY2hhbmdlLnBhdGhbaV1dID0gKHR5cGVvZiBjaGFuZ2UucGF0aFtpXSA9PT0gJ251bWJlcicpID8gW10gOiB7fTtcbiAgICAgICAgfVxuICAgICAgICBpdCA9IGl0W2NoYW5nZS5wYXRoW2ldXTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoY2hhbmdlLmtpbmQpIHtcbiAgICAgICAgY2FzZSAnQSc6XG4gICAgICAgICAgYXBwbHlBcnJheUNoYW5nZShjaGFuZ2UucGF0aCA/IGl0W2NoYW5nZS5wYXRoW2ldXSA6IGl0LCBjaGFuZ2UuaW5kZXgsIGNoYW5nZS5pdGVtKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnRCc6XG4gICAgICAgICAgZGVsZXRlIGl0W2NoYW5nZS5wYXRoW2ldXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnRSc6XG4gICAgICAgIGNhc2UgJ04nOlxuICAgICAgICAgIGl0W2NoYW5nZS5wYXRoW2ldXSA9IGNoYW5nZS5yaHM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmV2ZXJ0QXJyYXlDaGFuZ2UoYXJyLCBpbmRleCwgY2hhbmdlKSB7XG4gICAgaWYgKGNoYW5nZS5wYXRoICYmIGNoYW5nZS5wYXRoLmxlbmd0aCkge1xuICAgICAgLy8gdGhlIHN0cnVjdHVyZSBvZiB0aGUgb2JqZWN0IGF0IHRoZSBpbmRleCBoYXMgY2hhbmdlZC4uLlxuICAgICAgdmFyIGl0ID0gYXJyW2luZGV4XSxcbiAgICAgICAgICBpLCB1ID0gY2hhbmdlLnBhdGgubGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB1OyBpKyspIHtcbiAgICAgICAgaXQgPSBpdFtjaGFuZ2UucGF0aFtpXV07XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKGNoYW5nZS5raW5kKSB7XG4gICAgICAgIGNhc2UgJ0EnOlxuICAgICAgICAgIHJldmVydEFycmF5Q2hhbmdlKGl0W2NoYW5nZS5wYXRoW2ldXSwgY2hhbmdlLmluZGV4LCBjaGFuZ2UuaXRlbSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0QnOlxuICAgICAgICAgIGl0W2NoYW5nZS5wYXRoW2ldXSA9IGNoYW5nZS5saHM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICAgIGl0W2NoYW5nZS5wYXRoW2ldXSA9IGNoYW5nZS5saHM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ04nOlxuICAgICAgICAgIGRlbGV0ZSBpdFtjaGFuZ2UucGF0aFtpXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRoZSBhcnJheSBpdGVtIGlzIGRpZmZlcmVudC4uLlxuICAgICAgc3dpdGNoIChjaGFuZ2Uua2luZCkge1xuICAgICAgICBjYXNlICdBJzpcbiAgICAgICAgICByZXZlcnRBcnJheUNoYW5nZShhcnJbaW5kZXhdLCBjaGFuZ2UuaW5kZXgsIGNoYW5nZS5pdGVtKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnRCc6XG4gICAgICAgICAgYXJyW2luZGV4XSA9IGNoYW5nZS5saHM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICAgIGFycltpbmRleF0gPSBjaGFuZ2UubGhzO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgICBhcnIgPSBhcnJheVJlbW92ZShhcnIsIGluZGV4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJldmVydENoYW5nZSh0YXJnZXQsIHNvdXJjZSwgY2hhbmdlKSB7XG4gICAgaWYgKHRhcmdldCAmJiBzb3VyY2UgJiYgY2hhbmdlICYmIGNoYW5nZS5raW5kKSB7XG4gICAgICB2YXIgaXQgPSB0YXJnZXQsXG4gICAgICAgICAgaSwgdTtcbiAgICAgIHUgPSBjaGFuZ2UucGF0aC5sZW5ndGggLSAxO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHU7IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGl0W2NoYW5nZS5wYXRoW2ldXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBpdFtjaGFuZ2UucGF0aFtpXV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpdCA9IGl0W2NoYW5nZS5wYXRoW2ldXTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoY2hhbmdlLmtpbmQpIHtcbiAgICAgICAgY2FzZSAnQSc6XG4gICAgICAgICAgLy8gQXJyYXkgd2FzIG1vZGlmaWVkLi4uXG4gICAgICAgICAgLy8gaXQgd2lsbCBiZSBhbiBhcnJheS4uLlxuICAgICAgICAgIHJldmVydEFycmF5Q2hhbmdlKGl0W2NoYW5nZS5wYXRoW2ldXSwgY2hhbmdlLmluZGV4LCBjaGFuZ2UuaXRlbSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0QnOlxuICAgICAgICAgIC8vIEl0ZW0gd2FzIGRlbGV0ZWQuLi5cbiAgICAgICAgICBpdFtjaGFuZ2UucGF0aFtpXV0gPSBjaGFuZ2UubGhzO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdFJzpcbiAgICAgICAgICAvLyBJdGVtIHdhcyBlZGl0ZWQuLi5cbiAgICAgICAgICBpdFtjaGFuZ2UucGF0aFtpXV0gPSBjaGFuZ2UubGhzO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgICAvLyBJdGVtIGlzIG5ldy4uLlxuICAgICAgICAgIGRlbGV0ZSBpdFtjaGFuZ2UucGF0aFtpXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHlEaWZmKHRhcmdldCwgc291cmNlLCBmaWx0ZXIpIHtcbiAgICBpZiAodGFyZ2V0ICYmIHNvdXJjZSkge1xuICAgICAgdmFyIG9uQ2hhbmdlID0gZnVuY3Rpb24oY2hhbmdlKSB7XG4gICAgICAgIGlmICghZmlsdGVyIHx8IGZpbHRlcih0YXJnZXQsIHNvdXJjZSwgY2hhbmdlKSkge1xuICAgICAgICAgIGFwcGx5Q2hhbmdlKHRhcmdldCwgc291cmNlLCBjaGFuZ2UpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZGVlcERpZmYodGFyZ2V0LCBzb3VyY2UsIG9uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhY2N1bXVsYXRlRGlmZiwge1xuXG4gICAgZGlmZjoge1xuICAgICAgdmFsdWU6IGFjY3VtdWxhdGVEaWZmLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgb2JzZXJ2YWJsZURpZmY6IHtcbiAgICAgIHZhbHVlOiBkZWVwRGlmZixcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9LFxuICAgIGFwcGx5RGlmZjoge1xuICAgICAgdmFsdWU6IGFwcGx5RGlmZixcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9LFxuICAgIGFwcGx5Q2hhbmdlOiB7XG4gICAgICB2YWx1ZTogYXBwbHlDaGFuZ2UsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSxcbiAgICByZXZlcnRDaGFuZ2U6IHtcbiAgICAgIHZhbHVlOiByZXZlcnRDaGFuZ2UsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBpc0NvbmZsaWN0OiB7XG4gICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGNvbmZsaWN0O1xuICAgICAgfSxcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9LFxuICAgIG5vQ29uZmxpY3Q6IHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNvbmZsaWN0UmVzb2x1dGlvbikge1xuICAgICAgICAgIGNvbmZsaWN0UmVzb2x1dGlvbi5mb3JFYWNoKGZ1bmN0aW9uKGl0KSB7XG4gICAgICAgICAgICBpdCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbmZsaWN0UmVzb2x1dGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY3VtdWxhdGVEaWZmO1xuICAgICAgfSxcbiAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBhY2N1bXVsYXRlRGlmZjtcbn0pKTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIG92ZXJBcmcgPSByZXF1aXJlKCcuL19vdmVyQXJnJyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFByb3RvdHlwZTtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlckFyZztcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbmV4cG9ydHMucHJpbnRCdWZmZXIgPSBwcmludEJ1ZmZlcjtcblxudmFyIF9oZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbnZhciBfZGlmZiA9IHJlcXVpcmUoJy4vZGlmZicpO1xuXG52YXIgX2RpZmYyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGlmZik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vKipcbiAqIEdldCBsb2cgbGV2ZWwgc3RyaW5nIGJhc2VkIG9uIHN1cHBsaWVkIHBhcmFtc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nIHwgZnVuY3Rpb24gfCBvYmplY3R9IGxldmVsIC0gY29uc29sZVtsZXZlbF1cbiAqIEBwYXJhbSB7b2JqZWN0fSBhY3Rpb24gLSBzZWxlY3RlZCBhY3Rpb25cbiAqIEBwYXJhbSB7YXJyYXl9IHBheWxvYWQgLSBzZWxlY3RlZCBwYXlsb2FkXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIGxvZyBlbnRyeSB0eXBlXG4gKlxuICogQHJldHVybnMge3N0cmluZ30gbGV2ZWxcbiAqL1xuZnVuY3Rpb24gZ2V0TG9nTGV2ZWwobGV2ZWwsIGFjdGlvbiwgcGF5bG9hZCwgdHlwZSkge1xuICBzd2l0Y2ggKHR5cGVvZiBsZXZlbCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YobGV2ZWwpKSB7XG4gICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgIHJldHVybiB0eXBlb2YgbGV2ZWxbdHlwZV0gPT09ICdmdW5jdGlvbicgPyBsZXZlbFt0eXBlXS5hcHBseShsZXZlbCwgX3RvQ29uc3VtYWJsZUFycmF5KHBheWxvYWQpKSA6IGxldmVsW3R5cGVdO1xuICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgIHJldHVybiBsZXZlbChhY3Rpb24pO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbGV2ZWw7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmYXVsdFRpdGxlRm9ybWF0dGVyKG9wdGlvbnMpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IG9wdGlvbnMudGltZXN0YW1wLFxuICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uO1xuXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChhY3Rpb24sIHRpbWUsIHRvb2spIHtcbiAgICB2YXIgcGFydHMgPSBbJ2FjdGlvbiddO1xuXG4gICAgaWYgKHRpbWVzdGFtcCkgcGFydHMucHVzaCgnQCAnICsgdGltZSk7XG4gICAgcGFydHMucHVzaChTdHJpbmcoYWN0aW9uLnR5cGUpKTtcbiAgICBpZiAoZHVyYXRpb24pIHBhcnRzLnB1c2goJyhpbiAnICsgdG9vay50b0ZpeGVkKDIpICsgJyBtcyknKTtcblxuICAgIHJldHVybiBwYXJ0cy5qb2luKCcgJyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByaW50QnVmZmVyKGJ1ZmZlciwgb3B0aW9ucykge1xuICB2YXIgbG9nZ2VyID0gb3B0aW9ucy5sb2dnZXIsXG4gICAgICBhY3Rpb25UcmFuc2Zvcm1lciA9IG9wdGlvbnMuYWN0aW9uVHJhbnNmb3JtZXIsXG4gICAgICBfb3B0aW9ucyR0aXRsZUZvcm1hdHQgPSBvcHRpb25zLnRpdGxlRm9ybWF0dGVyLFxuICAgICAgdGl0bGVGb3JtYXR0ZXIgPSBfb3B0aW9ucyR0aXRsZUZvcm1hdHQgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRUaXRsZUZvcm1hdHRlcihvcHRpb25zKSA6IF9vcHRpb25zJHRpdGxlRm9ybWF0dCxcbiAgICAgIGNvbGxhcHNlZCA9IG9wdGlvbnMuY29sbGFwc2VkLFxuICAgICAgY29sb3JzID0gb3B0aW9ucy5jb2xvcnMsXG4gICAgICBsZXZlbCA9IG9wdGlvbnMubGV2ZWwsXG4gICAgICBkaWZmID0gb3B0aW9ucy5kaWZmO1xuXG5cbiAgYnVmZmVyLmZvckVhY2goZnVuY3Rpb24gKGxvZ0VudHJ5LCBrZXkpIHtcbiAgICB2YXIgc3RhcnRlZCA9IGxvZ0VudHJ5LnN0YXJ0ZWQsXG4gICAgICAgIHN0YXJ0ZWRUaW1lID0gbG9nRW50cnkuc3RhcnRlZFRpbWUsXG4gICAgICAgIGFjdGlvbiA9IGxvZ0VudHJ5LmFjdGlvbixcbiAgICAgICAgcHJldlN0YXRlID0gbG9nRW50cnkucHJldlN0YXRlLFxuICAgICAgICBlcnJvciA9IGxvZ0VudHJ5LmVycm9yO1xuICAgIHZhciB0b29rID0gbG9nRW50cnkudG9vayxcbiAgICAgICAgbmV4dFN0YXRlID0gbG9nRW50cnkubmV4dFN0YXRlO1xuXG4gICAgdmFyIG5leHRFbnRyeSA9IGJ1ZmZlcltrZXkgKyAxXTtcblxuICAgIGlmIChuZXh0RW50cnkpIHtcbiAgICAgIG5leHRTdGF0ZSA9IG5leHRFbnRyeS5wcmV2U3RhdGU7XG4gICAgICB0b29rID0gbmV4dEVudHJ5LnN0YXJ0ZWQgLSBzdGFydGVkO1xuICAgIH1cblxuICAgIC8vIE1lc3NhZ2VcbiAgICB2YXIgZm9ybWF0dGVkQWN0aW9uID0gYWN0aW9uVHJhbnNmb3JtZXIoYWN0aW9uKTtcbiAgICB2YXIgaXNDb2xsYXBzZWQgPSB0eXBlb2YgY29sbGFwc2VkID09PSAnZnVuY3Rpb24nID8gY29sbGFwc2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgfSwgYWN0aW9uLCBsb2dFbnRyeSkgOiBjb2xsYXBzZWQ7XG5cbiAgICB2YXIgZm9ybWF0dGVkVGltZSA9ICgwLCBfaGVscGVycy5mb3JtYXRUaW1lKShzdGFydGVkVGltZSk7XG4gICAgdmFyIHRpdGxlQ1NTID0gY29sb3JzLnRpdGxlID8gJ2NvbG9yOiAnICsgY29sb3JzLnRpdGxlKGZvcm1hdHRlZEFjdGlvbikgKyAnOycgOiBudWxsO1xuICAgIHZhciB0aXRsZSA9IHRpdGxlRm9ybWF0dGVyKGZvcm1hdHRlZEFjdGlvbiwgZm9ybWF0dGVkVGltZSwgdG9vayk7XG5cbiAgICAvLyBSZW5kZXJcbiAgICB0cnkge1xuICAgICAgaWYgKGlzQ29sbGFwc2VkKSB7XG4gICAgICAgIGlmIChjb2xvcnMudGl0bGUpIGxvZ2dlci5ncm91cENvbGxhcHNlZCgnJWMgJyArIHRpdGxlLCB0aXRsZUNTUyk7ZWxzZSBsb2dnZXIuZ3JvdXBDb2xsYXBzZWQodGl0bGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGNvbG9ycy50aXRsZSkgbG9nZ2VyLmdyb3VwKCclYyAnICsgdGl0bGUsIHRpdGxlQ1NTKTtlbHNlIGxvZ2dlci5ncm91cCh0aXRsZSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmxvZyh0aXRsZSk7XG4gICAgfVxuXG4gICAgdmFyIHByZXZTdGF0ZUxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW3ByZXZTdGF0ZV0sICdwcmV2U3RhdGUnKTtcbiAgICB2YXIgYWN0aW9uTGV2ZWwgPSBnZXRMb2dMZXZlbChsZXZlbCwgZm9ybWF0dGVkQWN0aW9uLCBbZm9ybWF0dGVkQWN0aW9uXSwgJ2FjdGlvbicpO1xuICAgIHZhciBlcnJvckxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW2Vycm9yLCBwcmV2U3RhdGVdLCAnZXJyb3InKTtcbiAgICB2YXIgbmV4dFN0YXRlTGV2ZWwgPSBnZXRMb2dMZXZlbChsZXZlbCwgZm9ybWF0dGVkQWN0aW9uLCBbbmV4dFN0YXRlXSwgJ25leHRTdGF0ZScpO1xuXG4gICAgaWYgKHByZXZTdGF0ZUxldmVsKSB7XG4gICAgICBpZiAoY29sb3JzLnByZXZTdGF0ZSkgbG9nZ2VyW3ByZXZTdGF0ZUxldmVsXSgnJWMgcHJldiBzdGF0ZScsICdjb2xvcjogJyArIGNvbG9ycy5wcmV2U3RhdGUocHJldlN0YXRlKSArICc7IGZvbnQtd2VpZ2h0OiBib2xkJywgcHJldlN0YXRlKTtlbHNlIGxvZ2dlcltwcmV2U3RhdGVMZXZlbF0oJ3ByZXYgc3RhdGUnLCBwcmV2U3RhdGUpO1xuICAgIH1cblxuICAgIGlmIChhY3Rpb25MZXZlbCkge1xuICAgICAgaWYgKGNvbG9ycy5hY3Rpb24pIGxvZ2dlclthY3Rpb25MZXZlbF0oJyVjIGFjdGlvbicsICdjb2xvcjogJyArIGNvbG9ycy5hY3Rpb24oZm9ybWF0dGVkQWN0aW9uKSArICc7IGZvbnQtd2VpZ2h0OiBib2xkJywgZm9ybWF0dGVkQWN0aW9uKTtlbHNlIGxvZ2dlclthY3Rpb25MZXZlbF0oJ2FjdGlvbicsIGZvcm1hdHRlZEFjdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yICYmIGVycm9yTGV2ZWwpIHtcbiAgICAgIGlmIChjb2xvcnMuZXJyb3IpIGxvZ2dlcltlcnJvckxldmVsXSgnJWMgZXJyb3InLCAnY29sb3I6ICcgKyBjb2xvcnMuZXJyb3IoZXJyb3IsIHByZXZTdGF0ZSkgKyAnOyBmb250LXdlaWdodDogYm9sZCcsIGVycm9yKTtlbHNlIGxvZ2dlcltlcnJvckxldmVsXSgnZXJyb3InLCBlcnJvcik7XG4gICAgfVxuXG4gICAgaWYgKG5leHRTdGF0ZUxldmVsKSB7XG4gICAgICBpZiAoY29sb3JzLm5leHRTdGF0ZSkgbG9nZ2VyW25leHRTdGF0ZUxldmVsXSgnJWMgbmV4dCBzdGF0ZScsICdjb2xvcjogJyArIGNvbG9ycy5uZXh0U3RhdGUobmV4dFN0YXRlKSArICc7IGZvbnQtd2VpZ2h0OiBib2xkJywgbmV4dFN0YXRlKTtlbHNlIGxvZ2dlcltuZXh0U3RhdGVMZXZlbF0oJ25leHQgc3RhdGUnLCBuZXh0U3RhdGUpO1xuICAgIH1cblxuICAgIGlmIChkaWZmKSB7XG4gICAgICAoMCwgX2RpZmYyLmRlZmF1bHQpKHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBsb2dnZXIsIGlzQ29sbGFwc2VkKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgbG9nZ2VyLmdyb3VwRW5kKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmxvZygnXFx1MjAxNFxcdTIwMTQgbG9nIGVuZCBcXHUyMDE0XFx1MjAxNCcpO1xuICAgIH1cbiAgfSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB7XG4gIGxldmVsOiBcImxvZ1wiLFxuICBsb2dnZXI6IGNvbnNvbGUsXG4gIGxvZ0Vycm9yczogdHJ1ZSxcbiAgY29sbGFwc2VkOiB1bmRlZmluZWQsXG4gIHByZWRpY2F0ZTogdW5kZWZpbmVkLFxuICBkdXJhdGlvbjogZmFsc2UsXG4gIHRpbWVzdGFtcDogdHJ1ZSxcbiAgc3RhdGVUcmFuc2Zvcm1lcjogZnVuY3Rpb24gc3RhdGVUcmFuc2Zvcm1lcihzdGF0ZSkge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfSxcbiAgYWN0aW9uVHJhbnNmb3JtZXI6IGZ1bmN0aW9uIGFjdGlvblRyYW5zZm9ybWVyKGFjdGlvbikge1xuICAgIHJldHVybiBhY3Rpb247XG4gIH0sXG4gIGVycm9yVHJhbnNmb3JtZXI6IGZ1bmN0aW9uIGVycm9yVHJhbnNmb3JtZXIoZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH0sXG4gIGNvbG9yczoge1xuICAgIHRpdGxlOiBmdW5jdGlvbiB0aXRsZSgpIHtcbiAgICAgIHJldHVybiBcImluaGVyaXRcIjtcbiAgICB9LFxuICAgIHByZXZTdGF0ZTogZnVuY3Rpb24gcHJldlN0YXRlKCkge1xuICAgICAgcmV0dXJuIFwiIzlFOUU5RVwiO1xuICAgIH0sXG4gICAgYWN0aW9uOiBmdW5jdGlvbiBhY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXCIjMDNBOUY0XCI7XG4gICAgfSxcbiAgICBuZXh0U3RhdGU6IGZ1bmN0aW9uIG5leHRTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBcIiM0Q0FGNTBcIjtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbiBlcnJvcigpIHtcbiAgICAgIHJldHVybiBcIiNGMjA0MDRcIjtcbiAgICB9XG4gIH0sXG4gIGRpZmY6IGZhbHNlLFxuICBkaWZmUHJlZGljYXRlOiB1bmRlZmluZWQsXG5cbiAgLy8gRGVwcmVjYXRlZCBvcHRpb25zXG4gIHRyYW5zZm9ybWVyOiB1bmRlZmluZWRcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGRpZmZMb2dnZXI7XG5cbnZhciBfZGVlcERpZmYgPSByZXF1aXJlKCdkZWVwLWRpZmYnKTtcblxudmFyIF9kZWVwRGlmZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWVwRGlmZik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmxpdGJpdC9kaWZmI2RpZmZlcmVuY2VzXG52YXIgZGljdGlvbmFyeSA9IHtcbiAgJ0UnOiB7XG4gICAgY29sb3I6ICcjMjE5NkYzJyxcbiAgICB0ZXh0OiAnQ0hBTkdFRDonXG4gIH0sXG4gICdOJzoge1xuICAgIGNvbG9yOiAnIzRDQUY1MCcsXG4gICAgdGV4dDogJ0FEREVEOidcbiAgfSxcbiAgJ0QnOiB7XG4gICAgY29sb3I6ICcjRjQ0MzM2JyxcbiAgICB0ZXh0OiAnREVMRVRFRDonXG4gIH0sXG4gICdBJzoge1xuICAgIGNvbG9yOiAnIzIxOTZGMycsXG4gICAgdGV4dDogJ0FSUkFZOidcbiAgfVxufTtcblxuZnVuY3Rpb24gc3R5bGUoa2luZCkge1xuICByZXR1cm4gJ2NvbG9yOiAnICsgZGljdGlvbmFyeVtraW5kXS5jb2xvciArICc7IGZvbnQtd2VpZ2h0OiBib2xkJztcbn1cblxuZnVuY3Rpb24gcmVuZGVyKGRpZmYpIHtcbiAgdmFyIGtpbmQgPSBkaWZmLmtpbmQsXG4gICAgICBwYXRoID0gZGlmZi5wYXRoLFxuICAgICAgbGhzID0gZGlmZi5saHMsXG4gICAgICByaHMgPSBkaWZmLnJocyxcbiAgICAgIGluZGV4ID0gZGlmZi5pbmRleCxcbiAgICAgIGl0ZW0gPSBkaWZmLml0ZW07XG5cblxuICBzd2l0Y2ggKGtpbmQpIHtcbiAgICBjYXNlICdFJzpcbiAgICAgIHJldHVybiBbcGF0aC5qb2luKCcuJyksIGxocywgJ1xcdTIxOTInLCByaHNdO1xuICAgIGNhc2UgJ04nOlxuICAgICAgcmV0dXJuIFtwYXRoLmpvaW4oJy4nKSwgcmhzXTtcbiAgICBjYXNlICdEJzpcbiAgICAgIHJldHVybiBbcGF0aC5qb2luKCcuJyldO1xuICAgIGNhc2UgJ0EnOlxuICAgICAgcmV0dXJuIFtwYXRoLmpvaW4oJy4nKSArICdbJyArIGluZGV4ICsgJ10nLCBpdGVtXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRpZmZMb2dnZXIocHJldlN0YXRlLCBuZXdTdGF0ZSwgbG9nZ2VyLCBpc0NvbGxhcHNlZCkge1xuICB2YXIgZGlmZiA9ICgwLCBfZGVlcERpZmYyLmRlZmF1bHQpKHByZXZTdGF0ZSwgbmV3U3RhdGUpO1xuXG4gIHRyeSB7XG4gICAgaWYgKGlzQ29sbGFwc2VkKSB7XG4gICAgICBsb2dnZXIuZ3JvdXBDb2xsYXBzZWQoJ2RpZmYnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmdyb3VwKCdkaWZmJyk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmxvZygnZGlmZicpO1xuICB9XG5cbiAgaWYgKGRpZmYpIHtcbiAgICBkaWZmLmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIHZhciBraW5kID0gZWxlbS5raW5kO1xuXG4gICAgICB2YXIgb3V0cHV0ID0gcmVuZGVyKGVsZW0pO1xuXG4gICAgICBsb2dnZXIubG9nLmFwcGx5KGxvZ2dlciwgWyclYyAnICsgZGljdGlvbmFyeVtraW5kXS50ZXh0LCBzdHlsZShraW5kKV0uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShvdXRwdXQpKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgbG9nZ2VyLmxvZygnXFx1MjAxNFxcdTIwMTQgbm8gZGlmZiBcXHUyMDE0XFx1MjAxNCcpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBsb2dnZXIuZ3JvdXBFbmQoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGxvZ2dlci5sb2coJ1xcdTIwMTRcXHUyMDE0IGRpZmYgZW5kIFxcdTIwMTRcXHUyMDE0ICcpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciByZXBlYXQgPSBleHBvcnRzLnJlcGVhdCA9IGZ1bmN0aW9uIHJlcGVhdChzdHIsIHRpbWVzKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodGltZXMgKyAxKS5qb2luKHN0cik7XG59O1xuXG52YXIgcGFkID0gZXhwb3J0cy5wYWQgPSBmdW5jdGlvbiBwYWQobnVtLCBtYXhMZW5ndGgpIHtcbiAgcmV0dXJuIHJlcGVhdChcIjBcIiwgbWF4TGVuZ3RoIC0gbnVtLnRvU3RyaW5nKCkubGVuZ3RoKSArIG51bTtcbn07XG5cbnZhciBmb3JtYXRUaW1lID0gZXhwb3J0cy5mb3JtYXRUaW1lID0gZnVuY3Rpb24gZm9ybWF0VGltZSh0aW1lKSB7XG4gIHJldHVybiBwYWQodGltZS5nZXRIb3VycygpLCAyKSArIFwiOlwiICsgcGFkKHRpbWUuZ2V0TWludXRlcygpLCAyKSArIFwiOlwiICsgcGFkKHRpbWUuZ2V0U2Vjb25kcygpLCAyKSArIFwiLlwiICsgcGFkKHRpbWUuZ2V0TWlsbGlzZWNvbmRzKCksIDMpO1xufTtcblxuLy8gVXNlIHBlcmZvcm1hbmNlIEFQSSBpZiBpdCdzIGF2YWlsYWJsZSBpbiBvcmRlciB0byBnZXQgYmV0dGVyIHByZWNpc2lvblxudmFyIHRpbWVyID0gZXhwb3J0cy50aW1lciA9IHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwZXJmb3JtYW5jZSAhPT0gbnVsbCAmJiB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSBcImZ1bmN0aW9uXCIgPyBwZXJmb3JtYW5jZSA6IERhdGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NvcmUgPSByZXF1aXJlKCcuL2NvcmUnKTtcblxudmFyIF9oZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbnZhciBfZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbnZhciBfZGVmYXVsdHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGVmYXVsdHMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKipcbiAqIENyZWF0ZXMgbG9nZ2VyIHdpdGggZm9sbG93aW5nIG9wdGlvbnNcbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIG9wdGlvbnMgZm9yIGxvZ2dlclxuICogQHBhcmFtIHtzdHJpbmcgfCBmdW5jdGlvbiB8IG9iamVjdH0gb3B0aW9ucy5sZXZlbCAtIGNvbnNvbGVbbGV2ZWxdXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuZHVyYXRpb24gLSBwcmludCBkdXJhdGlvbiBvZiBlYWNoIGFjdGlvbj9cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy50aW1lc3RhbXAgLSBwcmludCB0aW1lc3RhbXAgd2l0aCBlYWNoIGFjdGlvbj9cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmNvbG9ycyAtIGN1c3RvbSBjb2xvcnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLmxvZ2dlciAtIGltcGxlbWVudGF0aW9uIG9mIHRoZSBgY29uc29sZWAgQVBJXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMubG9nRXJyb3JzIC0gc2hvdWxkIGVycm9ycyBpbiBhY3Rpb24gZXhlY3V0aW9uIGJlIGNhdWdodCwgbG9nZ2VkLCBhbmQgcmUtdGhyb3duP1xuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmNvbGxhcHNlZCAtIGlzIGdyb3VwIGNvbGxhcHNlZD9cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5wcmVkaWNhdGUgLSBjb25kaXRpb24gd2hpY2ggcmVzb2x2ZXMgbG9nZ2VyIGJlaGF2aW9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRpb25zLnN0YXRlVHJhbnNmb3JtZXIgLSB0cmFuc2Zvcm0gc3RhdGUgYmVmb3JlIHByaW50XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRpb25zLmFjdGlvblRyYW5zZm9ybWVyIC0gdHJhbnNmb3JtIGFjdGlvbiBiZWZvcmUgcHJpbnRcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdGlvbnMuZXJyb3JUcmFuc2Zvcm1lciAtIHRyYW5zZm9ybSBlcnJvciBiZWZvcmUgcHJpbnRcbiAqXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGxvZ2dlciBtaWRkbGV3YXJlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxvZ2dlcigpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXG4gIHZhciBsb2dnZXJPcHRpb25zID0gX2V4dGVuZHMoe30sIF9kZWZhdWx0czIuZGVmYXVsdCwgb3B0aW9ucyk7XG5cbiAgdmFyIGxvZ2dlciA9IGxvZ2dlck9wdGlvbnMubG9nZ2VyLFxuICAgICAgdHJhbnNmb3JtZXIgPSBsb2dnZXJPcHRpb25zLnRyYW5zZm9ybWVyLFxuICAgICAgc3RhdGVUcmFuc2Zvcm1lciA9IGxvZ2dlck9wdGlvbnMuc3RhdGVUcmFuc2Zvcm1lcixcbiAgICAgIGVycm9yVHJhbnNmb3JtZXIgPSBsb2dnZXJPcHRpb25zLmVycm9yVHJhbnNmb3JtZXIsXG4gICAgICBwcmVkaWNhdGUgPSBsb2dnZXJPcHRpb25zLnByZWRpY2F0ZSxcbiAgICAgIGxvZ0Vycm9ycyA9IGxvZ2dlck9wdGlvbnMubG9nRXJyb3JzLFxuICAgICAgZGlmZlByZWRpY2F0ZSA9IGxvZ2dlck9wdGlvbnMuZGlmZlByZWRpY2F0ZTtcblxuICAvLyBSZXR1cm4gaWYgJ2NvbnNvbGUnIG9iamVjdCBpcyBub3QgZGVmaW5lZFxuXG4gIGlmICh0eXBlb2YgbG9nZ2VyID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHRyYW5zZm9ybWVyKSB7XG4gICAgY29uc29sZS5lcnJvcignT3B0aW9uIFxcJ3RyYW5zZm9ybWVyXFwnIGlzIGRlcHJlY2F0ZWQsIHVzZSBcXCdzdGF0ZVRyYW5zZm9ybWVyXFwnIGluc3RlYWQhJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9XG5cbiAgdmFyIGxvZ0J1ZmZlciA9IFtdO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBnZXRTdGF0ZSA9IF9yZWYuZ2V0U3RhdGU7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICAvLyBFeGl0IGVhcmx5IGlmIHByZWRpY2F0ZSBmdW5jdGlvbiByZXR1cm5zICdmYWxzZSdcbiAgICAgICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgPT09ICdmdW5jdGlvbicgJiYgIXByZWRpY2F0ZShnZXRTdGF0ZSwgYWN0aW9uKSkge1xuICAgICAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9nRW50cnkgPSB7fTtcbiAgICAgICAgbG9nQnVmZmVyLnB1c2gobG9nRW50cnkpO1xuXG4gICAgICAgIGxvZ0VudHJ5LnN0YXJ0ZWQgPSBfaGVscGVycy50aW1lci5ub3coKTtcbiAgICAgICAgbG9nRW50cnkuc3RhcnRlZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBsb2dFbnRyeS5wcmV2U3RhdGUgPSBzdGF0ZVRyYW5zZm9ybWVyKGdldFN0YXRlKCkpO1xuICAgICAgICBsb2dFbnRyeS5hY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgICAgdmFyIHJldHVybmVkVmFsdWUgPSB2b2lkIDA7XG4gICAgICAgIGlmIChsb2dFcnJvcnMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuZWRWYWx1ZSA9IG5leHQoYWN0aW9uKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dFbnRyeS5lcnJvciA9IGVycm9yVHJhbnNmb3JtZXIoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybmVkVmFsdWUgPSBuZXh0KGFjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dFbnRyeS50b29rID0gX2hlbHBlcnMudGltZXIubm93KCkgLSBsb2dFbnRyeS5zdGFydGVkO1xuICAgICAgICBsb2dFbnRyeS5uZXh0U3RhdGUgPSBzdGF0ZVRyYW5zZm9ybWVyKGdldFN0YXRlKCkpO1xuXG4gICAgICAgIHZhciBkaWZmID0gbG9nZ2VyT3B0aW9ucy5kaWZmICYmIHR5cGVvZiBkaWZmUHJlZGljYXRlID09PSAnZnVuY3Rpb24nID8gZGlmZlByZWRpY2F0ZShnZXRTdGF0ZSwgYWN0aW9uKSA6IGxvZ2dlck9wdGlvbnMuZGlmZjtcblxuICAgICAgICAoMCwgX2NvcmUucHJpbnRCdWZmZXIpKGxvZ0J1ZmZlciwgX2V4dGVuZHMoe30sIGxvZ2dlck9wdGlvbnMsIHsgZGlmZjogZGlmZiB9KSk7XG4gICAgICAgIGxvZ0J1ZmZlci5sZW5ndGggPSAwO1xuXG4gICAgICAgIGlmIChsb2dFbnRyeS5lcnJvcikgdGhyb3cgbG9nRW50cnkuZXJyb3I7XG4gICAgICAgIHJldHVybiByZXR1cm5lZFZhbHVlO1xuICAgICAgfTtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnRzLmRlZmF1bHQgPSBjcmVhdGVMb2dnZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGFwcGx5TWlkZGxld2FyZTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzdG9yZSBlbmhhbmNlciB0aGF0IGFwcGxpZXMgbWlkZGxld2FyZSB0byB0aGUgZGlzcGF0Y2ggbWV0aG9kXG4gKiBvZiB0aGUgUmVkdXggc3RvcmUuIFRoaXMgaXMgaGFuZHkgZm9yIGEgdmFyaWV0eSBvZiB0YXNrcywgc3VjaCBhcyBleHByZXNzaW5nXG4gKiBhc3luY2hyb25vdXMgYWN0aW9ucyBpbiBhIGNvbmNpc2UgbWFubmVyLCBvciBsb2dnaW5nIGV2ZXJ5IGFjdGlvbiBwYXlsb2FkLlxuICpcbiAqIFNlZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UgYXMgYW4gZXhhbXBsZSBvZiB0aGUgUmVkdXggbWlkZGxld2FyZS5cbiAqXG4gKiBCZWNhdXNlIG1pZGRsZXdhcmUgaXMgcG90ZW50aWFsbHkgYXN5bmNocm9ub3VzLCB0aGlzIHNob3VsZCBiZSB0aGUgZmlyc3RcbiAqIHN0b3JlIGVuaGFuY2VyIGluIHRoZSBjb21wb3NpdGlvbiBjaGFpbi5cbiAqXG4gKiBOb3RlIHRoYXQgZWFjaCBtaWRkbGV3YXJlIHdpbGwgYmUgZ2l2ZW4gdGhlIGBkaXNwYXRjaGAgYW5kIGBnZXRTdGF0ZWAgZnVuY3Rpb25zXG4gKiBhcyBuYW1lZCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gbWlkZGxld2FyZXMgVGhlIG1pZGRsZXdhcmUgY2hhaW4gdG8gYmUgYXBwbGllZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBzdG9yZSBlbmhhbmNlciBhcHBseWluZyB0aGUgbWlkZGxld2FyZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgbWlkZGxld2FyZXMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBtaWRkbGV3YXJlc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoY3JlYXRlU3RvcmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlLCBlbmhhbmNlcikge1xuICAgICAgdmFyIHN0b3JlID0gY3JlYXRlU3RvcmUocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUsIGVuaGFuY2VyKTtcbiAgICAgIHZhciBfZGlzcGF0Y2ggPSBzdG9yZS5kaXNwYXRjaDtcbiAgICAgIHZhciBjaGFpbiA9IFtdO1xuXG4gICAgICB2YXIgbWlkZGxld2FyZUFQSSA9IHtcbiAgICAgICAgZ2V0U3RhdGU6IHN0b3JlLmdldFN0YXRlLFxuICAgICAgICBkaXNwYXRjaDogZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIF9kaXNwYXRjaChhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2hhaW4gPSBtaWRkbGV3YXJlcy5tYXAoZnVuY3Rpb24gKG1pZGRsZXdhcmUpIHtcbiAgICAgICAgcmV0dXJuIG1pZGRsZXdhcmUobWlkZGxld2FyZUFQSSk7XG4gICAgICB9KTtcbiAgICAgIF9kaXNwYXRjaCA9IF9jb21wb3NlMlsnZGVmYXVsdCddLmFwcGx5KHVuZGVmaW5lZCwgY2hhaW4pKHN0b3JlLmRpc3BhdGNoKTtcblxuICAgICAgcmV0dXJuIF9leHRlbmRzKHt9LCBzdG9yZSwge1xuICAgICAgICBkaXNwYXRjaDogX2Rpc3BhdGNoXG4gICAgICB9KTtcbiAgICB9O1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGJpbmRBY3Rpb25DcmVhdG9ycztcbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoKGFjdGlvbkNyZWF0b3IuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb24gY3JlYXRvcnMsIGludG8gYW4gb2JqZWN0IHdpdGggdGhlXG4gKiBzYW1lIGtleXMsIGJ1dCB3aXRoIGV2ZXJ5IGZ1bmN0aW9uIHdyYXBwZWQgaW50byBhIGBkaXNwYXRjaGAgY2FsbCBzbyB0aGV5XG4gKiBtYXkgYmUgaW52b2tlZCBkaXJlY3RseS4gVGhpcyBpcyBqdXN0IGEgY29udmVuaWVuY2UgbWV0aG9kLCBhcyB5b3UgY2FuIGNhbGxcbiAqIGBzdG9yZS5kaXNwYXRjaChNeUFjdGlvbkNyZWF0b3JzLmRvU29tZXRoaW5nKCkpYCB5b3Vyc2VsZiBqdXN0IGZpbmUuXG4gKlxuICogRm9yIGNvbnZlbmllbmNlLCB5b3UgY2FuIGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQsXG4gKiBhbmQgZ2V0IGEgZnVuY3Rpb24gaW4gcmV0dXJuLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBhY3Rpb25DcmVhdG9ycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb25cbiAqIGNyZWF0b3IgZnVuY3Rpb25zLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpbiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhc2BcbiAqIHN5bnRheC4gWW91IG1heSBhbHNvIHBhc3MgYSBzaW5nbGUgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZGlzcGF0Y2ggVGhlIGBkaXNwYXRjaGAgZnVuY3Rpb24gYXZhaWxhYmxlIG9uIHlvdXIgUmVkdXhcbiAqIHN0b3JlLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbnxPYmplY3R9IFRoZSBvYmplY3QgbWltaWNraW5nIHRoZSBvcmlnaW5hbCBvYmplY3QsIGJ1dCB3aXRoXG4gKiBldmVyeSBhY3Rpb24gY3JlYXRvciB3cmFwcGVkIGludG8gdGhlIGBkaXNwYXRjaGAgY2FsbC4gSWYgeW91IHBhc3NlZCBhXG4gKiBmdW5jdGlvbiBhcyBgYWN0aW9uQ3JlYXRvcnNgLCB0aGUgcmV0dXJuIHZhbHVlIHdpbGwgYWxzbyBiZSBhIHNpbmdsZVxuICogZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9ycyhhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyAhPT0gJ29iamVjdCcgfHwgYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBY3Rpb25DcmVhdG9ycyBleHBlY3RlZCBhbiBvYmplY3Qgb3IgYSBmdW5jdGlvbiwgaW5zdGVhZCByZWNlaXZlZCAnICsgKGFjdGlvbkNyZWF0b3JzID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIGFjdGlvbkNyZWF0b3JzKSArICcuICcgKyAnRGlkIHlvdSB3cml0ZSBcImltcG9ydCBBY3Rpb25DcmVhdG9ycyBmcm9tXCIgaW5zdGVhZCBvZiBcImltcG9ydCAqIGFzIEFjdGlvbkNyZWF0b3JzIGZyb21cIj8nKTtcbiAgfVxuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWN0aW9uQ3JlYXRvcnMpO1xuICB2YXIgYm91bmRBY3Rpb25DcmVhdG9ycyA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IGFjdGlvbkNyZWF0b3JzW2tleV07XG4gICAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBib3VuZEFjdGlvbkNyZWF0b3JzW2tleV0gPSBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBib3VuZEFjdGlvbkNyZWF0b3JzO1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGNvbWJpbmVSZWR1Y2VycztcblxudmFyIF9jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2lzUGxhaW5PYmplY3QnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUGxhaW5PYmplY3QpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKSB7XG4gIHZhciBhY3Rpb25UeXBlID0gYWN0aW9uICYmIGFjdGlvbi50eXBlO1xuICB2YXIgYWN0aW9uTmFtZSA9IGFjdGlvblR5cGUgJiYgJ1wiJyArIGFjdGlvblR5cGUudG9TdHJpbmcoKSArICdcIicgfHwgJ2FuIGFjdGlvbic7XG5cbiAgcmV0dXJuICdHaXZlbiBhY3Rpb24gJyArIGFjdGlvbk5hbWUgKyAnLCByZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQuICcgKyAnVG8gaWdub3JlIGFuIGFjdGlvbiwgeW91IG11c3QgZXhwbGljaXRseSByZXR1cm4gdGhlIHByZXZpb3VzIHN0YXRlLic7XG59XG5cbmZ1bmN0aW9uIGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2UoaW5wdXRTdGF0ZSwgcmVkdWNlcnMsIGFjdGlvbiwgdW5leHBlY3RlZEtleUNhY2hlKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGFyZ3VtZW50TmFtZSA9IGFjdGlvbiAmJiBhY3Rpb24udHlwZSA9PT0gX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgPyAncHJlbG9hZGVkU3RhdGUgYXJndW1lbnQgcGFzc2VkIHRvIGNyZWF0ZVN0b3JlJyA6ICdwcmV2aW91cyBzdGF0ZSByZWNlaXZlZCBieSB0aGUgcmVkdWNlcic7XG5cbiAgaWYgKHJlZHVjZXJLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnU3RvcmUgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHJlZHVjZXIuIE1ha2Ugc3VyZSB0aGUgYXJndW1lbnQgcGFzc2VkICcgKyAndG8gY29tYmluZVJlZHVjZXJzIGlzIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIHJlZHVjZXJzLic7XG4gIH1cblxuICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbJ2RlZmF1bHQnXSkoaW5wdXRTdGF0ZSkpIHtcbiAgICByZXR1cm4gJ1RoZSAnICsgYXJndW1lbnROYW1lICsgJyBoYXMgdW5leHBlY3RlZCB0eXBlIG9mIFwiJyArIHt9LnRvU3RyaW5nLmNhbGwoaW5wdXRTdGF0ZSkubWF0Y2goL1xccyhbYS16fEEtWl0rKS8pWzFdICsgJ1wiLiBFeHBlY3RlZCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nICcgKyAoJ2tleXM6IFwiJyArIHJlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiJyk7XG4gIH1cblxuICB2YXIgdW5leHBlY3RlZEtleXMgPSBPYmplY3Qua2V5cyhpbnB1dFN0YXRlKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiAhcmVkdWNlcnMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAhdW5leHBlY3RlZEtleUNhY2hlW2tleV07XG4gIH0pO1xuXG4gIHVuZXhwZWN0ZWRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHVuZXhwZWN0ZWRLZXlDYWNoZVtrZXldID0gdHJ1ZTtcbiAgfSk7XG5cbiAgaWYgKHVuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gJ1VuZXhwZWN0ZWQgJyArICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAxID8gJ2tleXMnIDogJ2tleScpICsgJyAnICsgKCdcIicgKyB1bmV4cGVjdGVkS2V5cy5qb2luKCdcIiwgXCInKSArICdcIiBmb3VuZCBpbiAnICsgYXJndW1lbnROYW1lICsgJy4gJykgKyAnRXhwZWN0ZWQgdG8gZmluZCBvbmUgb2YgdGhlIGtub3duIHJlZHVjZXIga2V5cyBpbnN0ZWFkOiAnICsgKCdcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIi4gVW5leHBlY3RlZCBrZXlzIHdpbGwgYmUgaWdub3JlZC4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRSZWR1Y2VyU2FuaXR5KHJlZHVjZXJzKSB7XG4gIE9iamVjdC5rZXlzKHJlZHVjZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgcmVkdWNlciA9IHJlZHVjZXJzW2tleV07XG4gICAgdmFyIGluaXRpYWxTdGF0ZSA9IHJlZHVjZXIodW5kZWZpbmVkLCB7IHR5cGU6IF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gICAgaWYgKHR5cGVvZiBpbml0aWFsU3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24uICcgKyAnSWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGUgcmVkdWNlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0ICcgKyAnZXhwbGljaXRseSByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSAnICsgJ25vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgfVxuXG4gICAgdmFyIHR5cGUgPSAnQEByZWR1eC9QUk9CRV9VTktOT1dOX0FDVElPTl8nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpLnNwbGl0KCcnKS5qb2luKCcuJyk7XG4gICAgaWYgKHR5cGVvZiByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiB0eXBlIH0pID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgd2hlbiBwcm9iZWQgd2l0aCBhIHJhbmRvbSB0eXBlLiAnICsgKCdEb25cXCd0IHRyeSB0byBoYW5kbGUgJyArIF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUICsgJyBvciBvdGhlciBhY3Rpb25zIGluIFwicmVkdXgvKlwiICcpICsgJ25hbWVzcGFjZS4gVGhleSBhcmUgY29uc2lkZXJlZCBwcml2YXRlLiBJbnN0ZWFkLCB5b3UgbXVzdCByZXR1cm4gdGhlICcgKyAnY3VycmVudCBzdGF0ZSBmb3IgYW55IHVua25vd24gYWN0aW9ucywgdW5sZXNzIGl0IGlzIHVuZGVmaW5lZCwgJyArICdpbiB3aGljaCBjYXNlIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZSwgcmVnYXJkbGVzcyBvZiB0aGUgJyArICdhY3Rpb24gdHlwZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5IG5vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBkaWZmZXJlbnQgcmVkdWNlciBmdW5jdGlvbnMsIGludG8gYSBzaW5nbGVcbiAqIHJlZHVjZXIgZnVuY3Rpb24uIEl0IHdpbGwgY2FsbCBldmVyeSBjaGlsZCByZWR1Y2VyLCBhbmQgZ2F0aGVyIHRoZWlyIHJlc3VsdHNcbiAqIGludG8gYSBzaW5nbGUgc3RhdGUgb2JqZWN0LCB3aG9zZSBrZXlzIGNvcnJlc3BvbmQgdG8gdGhlIGtleXMgb2YgdGhlIHBhc3NlZFxuICogcmVkdWNlciBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlZHVjZXJzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgY29ycmVzcG9uZCB0byBkaWZmZXJlbnRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZSBjb21iaW5lZCBpbnRvIG9uZS4gT25lIGhhbmR5IHdheSB0byBvYnRhaW5cbiAqIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzIHJlZHVjZXJzYCBzeW50YXguIFRoZSByZWR1Y2VycyBtYXkgbmV2ZXIgcmV0dXJuXG4gKiB1bmRlZmluZWQgZm9yIGFueSBhY3Rpb24uIEluc3RlYWQsIHRoZXkgc2hvdWxkIHJldHVybiB0aGVpciBpbml0aWFsIHN0YXRlXG4gKiBpZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZW0gd2FzIHVuZGVmaW5lZCwgYW5kIHRoZSBjdXJyZW50IHN0YXRlIGZvciBhbnlcbiAqIHVucmVjb2duaXplZCBhY3Rpb24uXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHJlZHVjZXIgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGV2ZXJ5IHJlZHVjZXIgaW5zaWRlIHRoZVxuICogcGFzc2VkIG9iamVjdCwgYW5kIGJ1aWxkcyBhIHN0YXRlIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlLlxuICovXG5mdW5jdGlvbiBjb21iaW5lUmVkdWNlcnMocmVkdWNlcnMpIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgZmluYWxSZWR1Y2VycyA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IHJlZHVjZXJLZXlzW2ldO1xuXG4gICAgaWYgKFwiZGV2ZWxvcG1lbnRcIiAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbJ2RlZmF1bHQnXSkoJ05vIHJlZHVjZXIgcHJvdmlkZWQgZm9yIGtleSBcIicgKyBrZXkgKyAnXCInKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZpbmFsUmVkdWNlcnNba2V5XSA9IHJlZHVjZXJzW2tleV07XG4gICAgfVxuICB9XG4gIHZhciBmaW5hbFJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMoZmluYWxSZWR1Y2Vycyk7XG5cbiAgaWYgKFwiZGV2ZWxvcG1lbnRcIiAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgdmFyIHVuZXhwZWN0ZWRLZXlDYWNoZSA9IHt9O1xuICB9XG5cbiAgdmFyIHNhbml0eUVycm9yO1xuICB0cnkge1xuICAgIGFzc2VydFJlZHVjZXJTYW5pdHkoZmluYWxSZWR1Y2Vycyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzYW5pdHlFcnJvciA9IGU7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluYXRpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIGlmIChzYW5pdHlFcnJvcikge1xuICAgICAgdGhyb3cgc2FuaXR5RXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKFwiZGV2ZWxvcG1lbnRcIiAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgd2FybmluZ01lc3NhZ2UgPSBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKHN0YXRlLCBmaW5hbFJlZHVjZXJzLCBhY3Rpb24sIHVuZXhwZWN0ZWRLZXlDYWNoZSk7XG4gICAgICBpZiAod2FybmluZ01lc3NhZ2UpIHtcbiAgICAgICAgKDAsIF93YXJuaW5nMlsnZGVmYXVsdCddKSh3YXJuaW5nTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhhc0NoYW5nZWQgPSBmYWxzZTtcbiAgICB2YXIgbmV4dFN0YXRlID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaW5hbFJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0gZmluYWxSZWR1Y2VyS2V5c1tpXTtcbiAgICAgIHZhciByZWR1Y2VyID0gZmluYWxSZWR1Y2Vyc1trZXldO1xuICAgICAgdmFyIHByZXZpb3VzU3RhdGVGb3JLZXkgPSBzdGF0ZVtrZXldO1xuICAgICAgdmFyIG5leHRTdGF0ZUZvcktleSA9IHJlZHVjZXIocHJldmlvdXNTdGF0ZUZvcktleSwgYWN0aW9uKTtcbiAgICAgIGlmICh0eXBlb2YgbmV4dFN0YXRlRm9yS2V5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIG5leHRTdGF0ZVtrZXldID0gbmV4dFN0YXRlRm9yS2V5O1xuICAgICAgaGFzQ2hhbmdlZCA9IGhhc0NoYW5nZWQgfHwgbmV4dFN0YXRlRm9yS2V5ICE9PSBwcmV2aW91c1N0YXRlRm9yS2V5O1xuICAgIH1cbiAgICByZXR1cm4gaGFzQ2hhbmdlZCA/IG5leHRTdGF0ZSA6IHN0YXRlO1xuICB9O1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21wb3NlO1xuLyoqXG4gKiBDb21wb3NlcyBzaW5nbGUtYXJndW1lbnQgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG8gbGVmdC4gVGhlIHJpZ2h0bW9zdFxuICogZnVuY3Rpb24gY2FuIHRha2UgbXVsdGlwbGUgYXJndW1lbnRzIGFzIGl0IHByb3ZpZGVzIHRoZSBzaWduYXR1cmUgZm9yXG4gKiB0aGUgcmVzdWx0aW5nIGNvbXBvc2l0ZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jcyBUaGUgZnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gb2J0YWluZWQgYnkgY29tcG9zaW5nIHRoZSBhcmd1bWVudCBmdW5jdGlvbnNcbiAqIGZyb20gcmlnaHQgdG8gbGVmdC4gRm9yIGV4YW1wbGUsIGNvbXBvc2UoZiwgZywgaCkgaXMgaWRlbnRpY2FsIHRvIGRvaW5nXG4gKiAoLi4uYXJncykgPT4gZihnKGgoLi4uYXJncykpKS5cbiAqL1xuXG5mdW5jdGlvbiBjb21wb3NlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZnVuY3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBmdW5jc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIGlmIChmdW5jcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGFyZykge1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICB9XG5cbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBmdW5jc1swXTtcbiAgfVxuXG4gIHZhciBsYXN0ID0gZnVuY3NbZnVuY3MubGVuZ3RoIC0gMV07XG4gIHZhciByZXN0ID0gZnVuY3Muc2xpY2UoMCwgLTEpO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByZXN0LnJlZHVjZVJpZ2h0KGZ1bmN0aW9uIChjb21wb3NlZCwgZikge1xuICAgICAgcmV0dXJuIGYoY29tcG9zZWQpO1xuICAgIH0sIGxhc3QuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLkFjdGlvblR5cGVzID0gdW5kZWZpbmVkO1xuZXhwb3J0c1snZGVmYXVsdCddID0gY3JlYXRlU3RvcmU7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxudmFyIF9zeW1ib2xPYnNlcnZhYmxlID0gcmVxdWlyZSgnc3ltYm9sLW9ic2VydmFibGUnKTtcblxudmFyIF9zeW1ib2xPYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3N5bWJvbE9ic2VydmFibGUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbi8qKlxuICogVGhlc2UgYXJlIHByaXZhdGUgYWN0aW9uIHR5cGVzIHJlc2VydmVkIGJ5IFJlZHV4LlxuICogRm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHlvdSBtdXN0IHJldHVybiB0aGUgY3VycmVudCBzdGF0ZS5cbiAqIElmIHRoZSBjdXJyZW50IHN0YXRlIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLlxuICogRG8gbm90IHJlZmVyZW5jZSB0aGVzZSBhY3Rpb24gdHlwZXMgZGlyZWN0bHkgaW4geW91ciBjb2RlLlxuICovXG52YXIgQWN0aW9uVHlwZXMgPSBleHBvcnRzLkFjdGlvblR5cGVzID0ge1xuICBJTklUOiAnQEByZWR1eC9JTklUJ1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgUmVkdXggc3RvcmUgdGhhdCBob2xkcyB0aGUgc3RhdGUgdHJlZS5cbiAqIFRoZSBvbmx5IHdheSB0byBjaGFuZ2UgdGhlIGRhdGEgaW4gdGhlIHN0b3JlIGlzIHRvIGNhbGwgYGRpc3BhdGNoKClgIG9uIGl0LlxuICpcbiAqIFRoZXJlIHNob3VsZCBvbmx5IGJlIGEgc2luZ2xlIHN0b3JlIGluIHlvdXIgYXBwLiBUbyBzcGVjaWZ5IGhvdyBkaWZmZXJlbnRcbiAqIHBhcnRzIG9mIHRoZSBzdGF0ZSB0cmVlIHJlc3BvbmQgdG8gYWN0aW9ucywgeW91IG1heSBjb21iaW5lIHNldmVyYWwgcmVkdWNlcnNcbiAqIGludG8gYSBzaW5nbGUgcmVkdWNlciBmdW5jdGlvbiBieSB1c2luZyBgY29tYmluZVJlZHVjZXJzYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWR1Y2VyIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBuZXh0IHN0YXRlIHRyZWUsIGdpdmVuXG4gKiB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgYWN0aW9uIHRvIGhhbmRsZS5cbiAqXG4gKiBAcGFyYW0ge2FueX0gW3ByZWxvYWRlZFN0YXRlXSBUaGUgaW5pdGlhbCBzdGF0ZS4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGh5ZHJhdGUgdGhlIHN0YXRlIGZyb20gdGhlIHNlcnZlciBpbiB1bml2ZXJzYWwgYXBwcywgb3IgdG8gcmVzdG9yZSBhXG4gKiBwcmV2aW91c2x5IHNlcmlhbGl6ZWQgdXNlciBzZXNzaW9uLlxuICogSWYgeW91IHVzZSBgY29tYmluZVJlZHVjZXJzYCB0byBwcm9kdWNlIHRoZSByb290IHJlZHVjZXIgZnVuY3Rpb24sIHRoaXMgbXVzdCBiZVxuICogYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUgYXMgYGNvbWJpbmVSZWR1Y2Vyc2Aga2V5cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlbmhhbmNlciBUaGUgc3RvcmUgZW5oYW5jZXIuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBlbmhhbmNlIHRoZSBzdG9yZSB3aXRoIHRoaXJkLXBhcnR5IGNhcGFiaWxpdGllcyBzdWNoIGFzIG1pZGRsZXdhcmUsXG4gKiB0aW1lIHRyYXZlbCwgcGVyc2lzdGVuY2UsIGV0Yy4gVGhlIG9ubHkgc3RvcmUgZW5oYW5jZXIgdGhhdCBzaGlwcyB3aXRoIFJlZHV4XG4gKiBpcyBgYXBwbHlNaWRkbGV3YXJlKClgLlxuICpcbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBSZWR1eCBzdG9yZSB0aGF0IGxldHMgeW91IHJlYWQgdGhlIHN0YXRlLCBkaXNwYXRjaCBhY3Rpb25zXG4gKiBhbmQgc3Vic2NyaWJlIHRvIGNoYW5nZXMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlLCBlbmhhbmNlcikge1xuICB2YXIgX3JlZjI7XG5cbiAgaWYgKHR5cGVvZiBwcmVsb2FkZWRTdGF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZW5oYW5jZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZW5oYW5jZXIgPSBwcmVsb2FkZWRTdGF0ZTtcbiAgICBwcmVsb2FkZWRTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgZW5oYW5jZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW5oYW5jZXIoY3JlYXRlU3RvcmUpKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIHJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciBjdXJyZW50UmVkdWNlciA9IHJlZHVjZXI7XG4gIHZhciBjdXJyZW50U3RhdGUgPSBwcmVsb2FkZWRTdGF0ZTtcbiAgdmFyIGN1cnJlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzO1xuICB2YXIgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKG5leHRMaXN0ZW5lcnMgPT09IGN1cnJlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzLnNsaWNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBzdGF0ZSB0cmVlIG1hbmFnZWQgYnkgdGhlIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7YW55fSBUaGUgY3VycmVudCBzdGF0ZSB0cmVlIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gICAqL1xuICBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gY3VycmVudFN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBjaGFuZ2UgbGlzdGVuZXIuIEl0IHdpbGwgYmUgY2FsbGVkIGFueSB0aW1lIGFuIGFjdGlvbiBpcyBkaXNwYXRjaGVkLFxuICAgKiBhbmQgc29tZSBwYXJ0IG9mIHRoZSBzdGF0ZSB0cmVlIG1heSBwb3RlbnRpYWxseSBoYXZlIGNoYW5nZWQuIFlvdSBtYXkgdGhlblxuICAgKiBjYWxsIGBnZXRTdGF0ZSgpYCB0byByZWFkIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICpcbiAgICogWW91IG1heSBjYWxsIGBkaXNwYXRjaCgpYCBmcm9tIGEgY2hhbmdlIGxpc3RlbmVyLCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAgICogY2F2ZWF0czpcbiAgICpcbiAgICogMS4gVGhlIHN1YnNjcmlwdGlvbnMgYXJlIHNuYXBzaG90dGVkIGp1c3QgYmVmb3JlIGV2ZXJ5IGBkaXNwYXRjaCgpYCBjYWxsLlxuICAgKiBJZiB5b3Ugc3Vic2NyaWJlIG9yIHVuc3Vic2NyaWJlIHdoaWxlIHRoZSBsaXN0ZW5lcnMgYXJlIGJlaW5nIGludm9rZWQsIHRoaXNcbiAgICogd2lsbCBub3QgaGF2ZSBhbnkgZWZmZWN0IG9uIHRoZSBgZGlzcGF0Y2goKWAgdGhhdCBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAqIEhvd2V2ZXIsIHRoZSBuZXh0IGBkaXNwYXRjaCgpYCBjYWxsLCB3aGV0aGVyIG5lc3RlZCBvciBub3QsIHdpbGwgdXNlIGEgbW9yZVxuICAgKiByZWNlbnQgc25hcHNob3Qgb2YgdGhlIHN1YnNjcmlwdGlvbiBsaXN0LlxuICAgKlxuICAgKiAyLiBUaGUgbGlzdGVuZXIgc2hvdWxkIG5vdCBleHBlY3QgdG8gc2VlIGFsbCBzdGF0ZSBjaGFuZ2VzLCBhcyB0aGUgc3RhdGVcbiAgICogbWlnaHQgaGF2ZSBiZWVuIHVwZGF0ZWQgbXVsdGlwbGUgdGltZXMgZHVyaW5nIGEgbmVzdGVkIGBkaXNwYXRjaCgpYCBiZWZvcmVcbiAgICogdGhlIGxpc3RlbmVyIGlzIGNhbGxlZC4gSXQgaXMsIGhvd2V2ZXIsIGd1YXJhbnRlZWQgdGhhdCBhbGwgc3Vic2NyaWJlcnNcbiAgICogcmVnaXN0ZXJlZCBiZWZvcmUgdGhlIGBkaXNwYXRjaCgpYCBzdGFydGVkIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGxhdGVzdFxuICAgKiBzdGF0ZSBieSB0aGUgdGltZSBpdCBleGl0cy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgQSBjYWxsYmFjayB0byBiZSBpbnZva2VkIG9uIGV2ZXJ5IGRpc3BhdGNoLlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoaXMgY2hhbmdlIGxpc3RlbmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBsaXN0ZW5lciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBpc1N1YnNjcmliZWQgPSB0cnVlO1xuXG4gICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgIG5leHRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XG4gICAgICBpZiAoIWlzU3Vic2NyaWJlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlO1xuXG4gICAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgICB2YXIgaW5kZXggPSBuZXh0TGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgbmV4dExpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhbiBhY3Rpb24uIEl0IGlzIHRoZSBvbmx5IHdheSB0byB0cmlnZ2VyIGEgc3RhdGUgY2hhbmdlLlxuICAgKlxuICAgKiBUaGUgYHJlZHVjZXJgIGZ1bmN0aW9uLCB1c2VkIHRvIGNyZWF0ZSB0aGUgc3RvcmUsIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlXG4gICAqIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGdpdmVuIGBhY3Rpb25gLiBJdHMgcmV0dXJuIHZhbHVlIHdpbGxcbiAgICogYmUgY29uc2lkZXJlZCB0aGUgKipuZXh0Kiogc3RhdGUgb2YgdGhlIHRyZWUsIGFuZCB0aGUgY2hhbmdlIGxpc3RlbmVyc1xuICAgKiB3aWxsIGJlIG5vdGlmaWVkLlxuICAgKlxuICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvbmx5IHN1cHBvcnRzIHBsYWluIG9iamVjdCBhY3Rpb25zLiBJZiB5b3Ugd2FudCB0b1xuICAgKiBkaXNwYXRjaCBhIFByb21pc2UsIGFuIE9ic2VydmFibGUsIGEgdGh1bmssIG9yIHNvbWV0aGluZyBlbHNlLCB5b3UgbmVlZCB0b1xuICAgKiB3cmFwIHlvdXIgc3RvcmUgY3JlYXRpbmcgZnVuY3Rpb24gaW50byB0aGUgY29ycmVzcG9uZGluZyBtaWRkbGV3YXJlLiBGb3JcbiAgICogZXhhbXBsZSwgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgYHJlZHV4LXRodW5rYCBwYWNrYWdlLiBFdmVuIHRoZVxuICAgKiBtaWRkbGV3YXJlIHdpbGwgZXZlbnR1YWxseSBkaXNwYXRjaCBwbGFpbiBvYmplY3QgYWN0aW9ucyB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGFjdGlvbiBBIHBsYWluIG9iamVjdCByZXByZXNlbnRpbmcg4oCcd2hhdCBjaGFuZ2Vk4oCdLiBJdCBpc1xuICAgKiBhIGdvb2QgaWRlYSB0byBrZWVwIGFjdGlvbnMgc2VyaWFsaXphYmxlIHNvIHlvdSBjYW4gcmVjb3JkIGFuZCByZXBsYXkgdXNlclxuICAgKiBzZXNzaW9ucywgb3IgdXNlIHRoZSB0aW1lIHRyYXZlbGxpbmcgYHJlZHV4LWRldnRvb2xzYC4gQW4gYWN0aW9uIG11c3QgaGF2ZVxuICAgKiBhIGB0eXBlYCBwcm9wZXJ0eSB3aGljaCBtYXkgbm90IGJlIGB1bmRlZmluZWRgLiBJdCBpcyBhIGdvb2QgaWRlYSB0byB1c2VcbiAgICogc3RyaW5nIGNvbnN0YW50cyBmb3IgYWN0aW9uIHR5cGVzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBGb3IgY29udmVuaWVuY2UsIHRoZSBzYW1lIGFjdGlvbiBvYmplY3QgeW91IGRpc3BhdGNoZWQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCwgaWYgeW91IHVzZSBhIGN1c3RvbSBtaWRkbGV3YXJlLCBpdCBtYXkgd3JhcCBgZGlzcGF0Y2goKWAgdG9cbiAgICogcmV0dXJuIHNvbWV0aGluZyBlbHNlIChmb3IgZXhhbXBsZSwgYSBQcm9taXNlIHlvdSBjYW4gYXdhaXQpLlxuICAgKi9cbiAgZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyWydkZWZhdWx0J10pKGFjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtdXN0IGJlIHBsYWluIG9iamVjdHMuICcgKyAnVXNlIGN1c3RvbSBtaWRkbGV3YXJlIGZvciBhc3luYyBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYWN0aW9uLnR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbWF5IG5vdCBoYXZlIGFuIHVuZGVmaW5lZCBcInR5cGVcIiBwcm9wZXJ0eS4gJyArICdIYXZlIHlvdSBtaXNzcGVsbGVkIGEgY29uc3RhbnQ/Jyk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlcnMgbWF5IG5vdCBkaXNwYXRjaCBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGN1cnJlbnRSZWR1Y2VyKGN1cnJlbnRTdGF0ZSwgYWN0aW9uKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzID0gbmV4dExpc3RlbmVycztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyB0aGUgcmVkdWNlciBjdXJyZW50bHkgdXNlZCBieSB0aGUgc3RvcmUgdG8gY2FsY3VsYXRlIHRoZSBzdGF0ZS5cbiAgICpcbiAgICogWW91IG1pZ2h0IG5lZWQgdGhpcyBpZiB5b3VyIGFwcCBpbXBsZW1lbnRzIGNvZGUgc3BsaXR0aW5nIGFuZCB5b3Ugd2FudCB0b1xuICAgKiBsb2FkIHNvbWUgb2YgdGhlIHJlZHVjZXJzIGR5bmFtaWNhbGx5LiBZb3UgbWlnaHQgYWxzbyBuZWVkIHRoaXMgaWYgeW91XG4gICAqIGltcGxlbWVudCBhIGhvdCByZWxvYWRpbmcgbWVjaGFuaXNtIGZvciBSZWR1eC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dFJlZHVjZXIgVGhlIHJlZHVjZXIgZm9yIHRoZSBzdG9yZSB0byB1c2UgaW5zdGVhZC5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiByZXBsYWNlUmVkdWNlcihuZXh0UmVkdWNlcikge1xuICAgIGlmICh0eXBlb2YgbmV4dFJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIG5leHRSZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgY3VycmVudFJlZHVjZXIgPSBuZXh0UmVkdWNlcjtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJvcGVyYWJpbGl0eSBwb2ludCBmb3Igb2JzZXJ2YWJsZS9yZWFjdGl2ZSBsaWJyYXJpZXMuXG4gICAqIEByZXR1cm5zIHtvYnNlcnZhYmxlfSBBIG1pbmltYWwgb2JzZXJ2YWJsZSBvZiBzdGF0ZSBjaGFuZ2VzLlxuICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlIHRoZSBvYnNlcnZhYmxlIHByb3Bvc2FsOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vemVucGFyc2luZy9lcy1vYnNlcnZhYmxlXG4gICAqL1xuICBmdW5jdGlvbiBvYnNlcnZhYmxlKCkge1xuICAgIHZhciBfcmVmO1xuXG4gICAgdmFyIG91dGVyU3Vic2NyaWJlID0gc3Vic2NyaWJlO1xuICAgIHJldHVybiBfcmVmID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbWluaW1hbCBvYnNlcnZhYmxlIHN1YnNjcmlwdGlvbiBtZXRob2QuXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JzZXJ2ZXIgQW55IG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIGFzIGFuIG9ic2VydmVyLlxuICAgICAgICogVGhlIG9ic2VydmVyIG9iamVjdCBzaG91bGQgaGF2ZSBhIGBuZXh0YCBtZXRob2QuXG4gICAgICAgKiBAcmV0dXJucyB7c3Vic2NyaXB0aW9ufSBBbiBvYmplY3Qgd2l0aCBhbiBgdW5zdWJzY3JpYmVgIG1ldGhvZCB0aGF0IGNhblxuICAgICAgICogYmUgdXNlZCB0byB1bnN1YnNjcmliZSB0aGUgb2JzZXJ2YWJsZSBmcm9tIHRoZSBzdG9yZSwgYW5kIHByZXZlbnQgZnVydGhlclxuICAgICAgICogZW1pc3Npb24gb2YgdmFsdWVzIGZyb20gdGhlIG9ic2VydmFibGUuXG4gICAgICAgKi9cbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gc3Vic2NyaWJlKG9ic2VydmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JzZXJ2ZXIgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgdGhlIG9ic2VydmVyIHRvIGJlIGFuIG9iamVjdC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9ic2VydmVTdGF0ZSgpIHtcbiAgICAgICAgICBpZiAob2JzZXJ2ZXIubmV4dCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChnZXRTdGF0ZSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBvYnNlcnZlU3RhdGUoKTtcbiAgICAgICAgdmFyIHVuc3Vic2NyaWJlID0gb3V0ZXJTdWJzY3JpYmUob2JzZXJ2ZVN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHsgdW5zdWJzY3JpYmU6IHVuc3Vic2NyaWJlIH07XG4gICAgICB9XG4gICAgfSwgX3JlZltfc3ltYm9sT2JzZXJ2YWJsZTJbJ2RlZmF1bHQnXV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LCBfcmVmO1xuICB9XG5cbiAgLy8gV2hlbiBhIHN0b3JlIGlzIGNyZWF0ZWQsIGFuIFwiSU5JVFwiIGFjdGlvbiBpcyBkaXNwYXRjaGVkIHNvIHRoYXQgZXZlcnlcbiAgLy8gcmVkdWNlciByZXR1cm5zIHRoZWlyIGluaXRpYWwgc3RhdGUuIFRoaXMgZWZmZWN0aXZlbHkgcG9wdWxhdGVzXG4gIC8vIHRoZSBpbml0aWFsIHN0YXRlIHRyZWUuXG4gIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICByZXR1cm4gX3JlZjIgPSB7XG4gICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxuICAgIHN1YnNjcmliZTogc3Vic2NyaWJlLFxuICAgIGdldFN0YXRlOiBnZXRTdGF0ZSxcbiAgICByZXBsYWNlUmVkdWNlcjogcmVwbGFjZVJlZHVjZXJcbiAgfSwgX3JlZjJbX3N5bWJvbE9ic2VydmFibGUyWydkZWZhdWx0J11dID0gb2JzZXJ2YWJsZSwgX3JlZjI7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jb21wb3NlID0gZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBleHBvcnRzLmJpbmRBY3Rpb25DcmVhdG9ycyA9IGV4cG9ydHMuY29tYmluZVJlZHVjZXJzID0gZXhwb3J0cy5jcmVhdGVTdG9yZSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxudmFyIF9jcmVhdGVTdG9yZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGVTdG9yZSk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzID0gcmVxdWlyZSgnLi9jb21iaW5lUmVkdWNlcnMnKTtcblxudmFyIF9jb21iaW5lUmVkdWNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tYmluZVJlZHVjZXJzKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuL2JpbmRBY3Rpb25DcmVhdG9ycycpO1xuXG52YXIgX2JpbmRBY3Rpb25DcmVhdG9yczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9iaW5kQWN0aW9uQ3JlYXRvcnMpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZSA9IHJlcXVpcmUoJy4vYXBwbHlNaWRkbGV3YXJlJyk7XG5cbnZhciBfYXBwbHlNaWRkbGV3YXJlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwcGx5TWlkZGxld2FyZSk7XG5cbnZhciBfY29tcG9zZSA9IHJlcXVpcmUoJy4vY29tcG9zZScpO1xuXG52YXIgX2NvbXBvc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zZSk7XG5cbnZhciBfd2FybmluZyA9IHJlcXVpcmUoJy4vdXRpbHMvd2FybmluZycpO1xuXG52YXIgX3dhcm5pbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2FybmluZyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuLypcbiogVGhpcyBpcyBhIGR1bW15IGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBmdW5jdGlvbiBuYW1lIGhhcyBiZWVuIGFsdGVyZWQgYnkgbWluaWZpY2F0aW9uLlxuKiBJZiB0aGUgZnVuY3Rpb24gaGFzIGJlZW4gbWluaWZpZWQgYW5kIE5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsIHdhcm4gdGhlIHVzZXIuXG4qL1xuZnVuY3Rpb24gaXNDcnVzaGVkKCkge31cblxuaWYgKFwiZGV2ZWxvcG1lbnRcIiAhPT0gJ3Byb2R1Y3Rpb24nICYmIHR5cGVvZiBpc0NydXNoZWQubmFtZSA9PT0gJ3N0cmluZycgJiYgaXNDcnVzaGVkLm5hbWUgIT09ICdpc0NydXNoZWQnKSB7XG4gICgwLCBfd2FybmluZzJbJ2RlZmF1bHQnXSkoJ1lvdSBhcmUgY3VycmVudGx5IHVzaW5nIG1pbmlmaWVkIGNvZGUgb3V0c2lkZSBvZiBOT0RFX0VOViA9PT0gXFwncHJvZHVjdGlvblxcJy4gJyArICdUaGlzIG1lYW5zIHRoYXQgeW91IGFyZSBydW5uaW5nIGEgc2xvd2VyIGRldmVsb3BtZW50IGJ1aWxkIG9mIFJlZHV4LiAnICsgJ1lvdSBjYW4gdXNlIGxvb3NlLWVudmlmeSAoaHR0cHM6Ly9naXRodWIuY29tL3plcnRvc2gvbG9vc2UtZW52aWZ5KSBmb3IgYnJvd3NlcmlmeSAnICsgJ29yIERlZmluZVBsdWdpbiBmb3Igd2VicGFjayAoaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMDAzMDAzMSkgJyArICd0byBlbnN1cmUgeW91IGhhdmUgdGhlIGNvcnJlY3QgY29kZSBmb3IgeW91ciBwcm9kdWN0aW9uIGJ1aWxkLicpO1xufVxuXG5leHBvcnRzLmNyZWF0ZVN0b3JlID0gX2NyZWF0ZVN0b3JlMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBfY29tYmluZVJlZHVjZXJzMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBfYmluZEFjdGlvbkNyZWF0b3JzMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBfYXBwbHlNaWRkbGV3YXJlMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5jb21wb3NlID0gX2NvbXBvc2UyWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1snZGVmYXVsdCddID0gd2FybmluZztcbi8qKlxuICogUHJpbnRzIGEgd2FybmluZyBpbiB0aGUgY29uc29sZSBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIHdhcm5pbmcgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiB3YXJuaW5nKG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgdHJ5IHtcbiAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IGlmIHlvdSBlbmFibGVcbiAgICAvLyBcImJyZWFrIG9uIGFsbCBleGNlcHRpb25zXCIgaW4geW91ciBjb25zb2xlLFxuICAgIC8vIGl0IHdvdWxkIHBhdXNlIHRoZSBleGVjdXRpb24gYXQgdGhpcyBsaW5lLlxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuICB9IGNhdGNoIChlKSB7fVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWVtcHR5ICovXG59IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9pbmRleCcpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3BvbnlmaWxsID0gcmVxdWlyZSgnLi9wb255ZmlsbCcpO1xuXG52YXIgX3BvbnlmaWxsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BvbnlmaWxsKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgcm9vdDsgLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG5cbmlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgcm9vdCA9IHNlbGY7XG59IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSBtb2R1bGU7XG59IGVsc2Uge1xuICByb290ID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbn1cblxudmFyIHJlc3VsdCA9ICgwLCBfcG9ueWZpbGwyWydkZWZhdWx0J10pKHJvb3QpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gcmVzdWx0OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHN5bWJvbE9ic2VydmFibGVQb255ZmlsbDtcbmZ1bmN0aW9uIHN5bWJvbE9ic2VydmFibGVQb255ZmlsbChyb290KSB7XG5cdHZhciByZXN1bHQ7XG5cdHZhciBfU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cblx0aWYgKHR5cGVvZiBfU3ltYm9sID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0aWYgKF9TeW1ib2wub2JzZXJ2YWJsZSkge1xuXHRcdFx0cmVzdWx0ID0gX1N5bWJvbC5vYnNlcnZhYmxlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQgPSBfU3ltYm9sKCdvYnNlcnZhYmxlJyk7XG5cdFx0XHRfU3ltYm9sLm9ic2VydmFibGUgPSByZXN1bHQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJlc3VsdCA9ICdAQG9ic2VydmFibGUnO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLyoqXG4gKiBEYXlDeWNsZSBzZXJ2aWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBEYXlDeWNsZSB7XG4gXG4gIC8qKlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGF5TGVuZ3RoIExlbmd0aCBvZiBkYXkgaW4gbWlsbGlzZWNvbmRzXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoeyBnYW1lID0ge30sIGRheUxlbmd0aCA9IDMwMDAwMCB9ID0ge30pIHtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuZGF5TGVuZ3RoID0gZGF5TGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgc3VuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzcHJpdGUgU3VuIHNwcml0ZVxuICAgKi9cbiAgaW5pdFN1biAoc3ByaXRlKSB7XG4gICAgdGhpcy5zdW5TcHJpdGUgPSBzcHJpdGU7XG4gICAgdGhpcy5zdW5zZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIG1vb25cbiAgICogQHBhcmFtIHtPYmplY3R9IHNwcml0ZSBNb29uIHNwcml0ZVxuICAgKi9cbiAgaW5pdE1vb24gKHNwcml0ZSkge1xuICAgIHRoaXMubW9vblNwcml0ZSA9IHNwcml0ZTtcbiAgICB0aGlzLm1vb25yaXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBzaGFkaW5nXG4gICAqIEBwYXJhbSB7QXJyYXl9IHNoYWRlcyBTaGFkaW5nIHJhbmdlXG4gICAqL1xuICBpbml0U2hhZGluZyAoc2hhZGVzKSB7XG4gICAgdGhpcy5zaGFkaW5nID0gc2hhZGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBzdW5yaXNlIGFuaW1hdGlvbiwgdGhlbiBzdW5zZXQgb24gY29tcGxldGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHNwcml0ZSBTdW4gc3ByaXRlXG4gICAqL1xuICBzdW5yaXNlICgpIHtcbiAgICB0aGlzLnN1blR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzLnN1blNwcml0ZS5jYW1lcmFPZmZzZXQpLnRvKCB7IHk6IC0yNTAgfSwgdGhpcy5kYXlMZW5ndGgsIG51bGwsIHRydWUpO1xuICAgIHRoaXMuc3VuVHdlZW4ub25Db21wbGV0ZS5hZGQodGhpcy5zdW5zZXQsIHRoaXMpO1xuXG4gICAgaWYgKHRoaXMuc2hhZGluZykge1xuICAgICAgdGhpcy5zaGFkaW5nLmZvckVhY2goKHNoYWRlKSA9PiB7XG4gICAgICAgIHRoaXMudHdlZW5UaW50KHNoYWRlLnNwcml0ZSwgc2hhZGUuZnJvbSwgc2hhZGUudG8sIHRoaXMuZGF5TGVuZ3RoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gc3Vuc2V0IGFuaW1hdGlvbiwgdGhlbiBzdW5yaXNlIG9uIGNvbXBsZXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzcHJpdGUgU3VuIHNwcml0ZVxuICAgKi9cbiAgc3Vuc2V0ICgpIHtcbiAgICB0aGlzLnN1blR3ZWVuID0gdGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzLnN1blNwcml0ZS5jYW1lcmFPZmZzZXQpLnRvKCB7IHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgKyA0MDAgfSwgdGhpcy5kYXlMZW5ndGgsIG51bGwsIHRydWUpO1xuICAgIHRoaXMuc3VuVHdlZW4ub25Db21wbGV0ZS5hZGQodGhpcy5zdW5yaXNlLCB0aGlzKTtcblxuICAgIGlmICh0aGlzLnNoYWRpbmcpIHtcbiAgICAgIHRoaXMuc2hhZGluZy5mb3JFYWNoKChzaGFkZSkgPT4ge1xuICAgICAgICB0aGlzLnR3ZWVuVGludChzaGFkZS5zcHJpdGUsIHNoYWRlLnRvLCBzaGFkZS5mcm9tLCB0aGlzLmRheUxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUnVuIG1vb25yaXNlIGFuaW1hdGlvbiwgdGhlbiBtb29uc2V0IG9uIGNvbXBsZXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzcHJpdGUgTW9vbiBzcHJpdGVcbiAgICovXG4gIG1vb25yaXNlICgpIHtcbiAgICB0aGlzLm1vb25Ud2VlbiA9IHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcy5tb29uU3ByaXRlLmNhbWVyYU9mZnNldCkudG8oIHsgeTogLTM1MCB9LCB0aGlzLmRheUxlbmd0aCwgbnVsbCwgdHJ1ZSk7XG4gICAgdGhpcy5tb29uVHdlZW4ub25Db21wbGV0ZS5hZGQodGhpcy5tb29uc2V0LCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gbW9vbnNldCBhbmltYXRpb24sIHRoZW4gbW9vbnJpc2Ugb24gY29tcGxldGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHNwcml0ZSBNb29uIHNwcml0ZVxuICAgKi9cbiAgbW9vbnNldCAoKSB7XG4gICAgdGhpcy5tb29uVHdlZW4gPSB0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMubW9vblNwcml0ZS5jYW1lcmFPZmZzZXQpLnRvKCB7IHk6IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgKyA0MDAgfSwgdGhpcy5kYXlMZW5ndGgsIG51bGwsIHRydWUpO1xuICAgIHRoaXMubW9vblR3ZWVuLm9uQ29tcGxldGUuYWRkKHRoaXMubW9vbnJpc2UsIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0aHJvdWdoIHNoYWRpbmcgY3ljbGUgYXMgc3VuIHJpc2VzIGFuZCBzZXRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzcHJpdGVUb1R3ZWVuIFNreSBzcHJpdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0YXJ0Q29sb3IgU3RhcnQgY29sb3JcbiAgICogQHBhcmFtIHtTdHJpbmd9IGVuZENvbG9yIEVuZCBjb2xvclxuICAgKiBAcGFyYW0ge051bWJlcn0gZHVyYXRpb24gRHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzXG4gICAqL1xuICB0d2VlblRpbnQgKHNwcml0ZVRvVHdlZW4sIHN0YXJ0Q29sb3IsIGVuZENvbG9yLCBkdXJhdGlvbikge1xuICAgIGNvbnN0IGNvbG9yQmxlbmQgPSB7IHN0ZXA6IDAgfTtcblxuICAgIHRoaXMuZ2FtZS5hZGQudHdlZW4oY29sb3JCbGVuZCkudG8oeyBzdGVwOiAxMDAgfSwgZHVyYXRpb24sIFBoYXNlci5FYXNpbmcuRGVmYXVsdCwgZmFsc2UpXG4gICAgICAub25VcGRhdGVDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNwcml0ZVRvVHdlZW4udGludCA9IFBoYXNlci5Db2xvci5pbnRlcnBvbGF0ZUNvbG9yKHN0YXJ0Q29sb3IsIGVuZENvbG9yLCAxMDAsIGNvbG9yQmxlbmQuc3RlcCwgMSk7XG4gICAgICB9KVxuICAgICAgLnN0YXJ0KCk7XG4gIH1cbiBcbn1cbiIsIi8qKlxuICogQGNsYXNzIE1vb25TcHJpdGVcbiAqL1xuZXhwb3J0IGNsYXNzIE1vb25TcHJpdGUgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGdhbWUgUmVmZXJlbmNlIHRvIHRoZSBzdGF0ZSdzIGdhbWUgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhdGlvbiBYIGFuZCBZIGNvb3JkaW5hdGVzIHRvIHJlbmRlciB0aGUgc3ByaXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSBTY2FsZSB0byByZW5kZXIgdGhlIHNwcml0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9LCBsb2NhdGlvbiA9IHt9LCBzY2FsZSA9IDEgfSA9IHt9KSB7XG4gICAgc3VwZXIoZ2FtZSwgbG9jYXRpb24ueCwgbG9jYXRpb24ueSwgJ3NreScpO1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgc2NhbGUsXG4gICAgICBsb2NhdGlvbixcbiAgICB9O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBzcHJpdGVcbiAgICovXG4gIHJlbmRlciAoKSB7XG4gICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzKTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMuY29uZmlnLnNjYWxlLCB0aGlzLmNvbmZpZy5zY2FsZSk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMCwgMSk7XG4gICAgdGhpcy5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwbGF5cyBhIHN0aWxsIGZyYW1lIG9yIGFuIGFuaW1hdGlvbiBvbiB1cGRhdGUgbG9vcFxuICAgKi9cbiAgdXBkYXRlICgpIHtcbiAgICB0aGlzLmZyYW1lTmFtZSA9ICdtb29uJztcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBMYXllck1hbmFnZXIgfSBmcm9tICcuLi9sYXllck1hbmFnZXIvbGF5ZXJNYW5hZ2VyJztcbmltcG9ydCB7IE1vb25TcHJpdGUgfSBmcm9tICcuL21vb24uc3ByaXRlJztcbmltcG9ydCB7IFN1blNwcml0ZSB9IGZyb20gJy4vc3VuLnNwcml0ZSc7XG5pbXBvcnQgeyBEYXlDeWNsZSB9IGZyb20gJy4vZGF5Q3ljbGUuc2VydmljZSc7XG5cbi8qKlxuICogU2V0cyB1cCB0aGUgYml0bWFwIGNhbnZhcyBhbmQgc3ByaXRlIGZvciB0aGUgc2t5LlxuICovXG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvZiBoZWFsdGggYmFyLlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuY29uc3QgY29uZmlnID0ge1xuICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXG4gIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0LFxuICB4OiAwLFxuICB5OiAwLFxuICBiZzoge1xuICAgIGNvbG9yOiAnIzJCOTdGQydcbiAgfSxcbiAgYmFyOiB7XG4gICAgY29sb3I6ICcjQUIxMTExJ1xuICB9LFxuICBhbmltYXRpb25EdXJhdGlvbjogMjAwXG59O1xuXG4vKipcbiAqIENhbnZhcyBkcmF3aW5nIGZvciBza3kuXG4gKi9cbmNsYXNzIFNreUNhbnZhcyBleHRlbmRzIFBoYXNlci5CaXRtYXBEYXRhIHtcbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9LCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIH0gPSB7fSkge1xuICAgIHN1cGVyKGdhbWUsICdza3knLCB3aWR0aCwgY29uZmlnLmhlaWdodCk7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gY29uZmlnLmJnLmNvbG9yO1xuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4LnJlY3QoMCwgMCwgd2lkdGgsIGNvbmZpZy5oZWlnaHQpO1xuICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgfVxufVxuXG4vKipcbiAqIExvYWRzIHNreSBjYW52YXMgYXMgYSBzcHJpdGUgdG8gYWxsb3cgdHdlZW5pbmcgb2YgY29sb3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBTa3lTcHJpdGUgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcblxuICBjb25zdHJ1Y3RvciAoeyBnYW1lID0ge30sIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggfSA9IHt9KSB7XG4gICAgc3VwZXIoZ2FtZSwgY29uZmlnLngsIGNvbmZpZy55LCBuZXcgU2t5Q2FudmFzKHsgZ2FtZSwgd2lkdGggfSkpO1xuICAgIHRoaXMuZGF5Q3ljbGUgPSBuZXcgRGF5Q3ljbGUoeyBnYW1lIH0pO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHNreSBhbmQgaW5pdGlhbGl6ZXMgc2t5IGV2ZW50c1xuICAgKi9cbiAgcmVuZGVyICgpIHtcblxuICAgIHRoaXMubW9vblNwcml0ZSA9IG5ldyBNb29uU3ByaXRlKHsgXG4gICAgICBnYW1lOiB0aGlzLmdhbWUsIFxuICAgICAgbG9jYXRpb246IHsgXG4gICAgICAgIHg6IHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMuZ2FtZS53aWR0aCAvIDQsXG4gICAgICAgIHk6IHRoaXMuZ2FtZS5oZWlnaHQgKyA1MDAsXG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5nYW1lLmxheWVyTWFuYWdlci5sYXllcnMuZ2V0KCdza3lMYXllcicpLmFkZCh0aGlzLm1vb25TcHJpdGUpO1xuXG4gICAgdGhpcy5zdW5TcHJpdGUgPSBuZXcgU3VuU3ByaXRlKHtcbiAgICAgIGdhbWU6IHRoaXMuZ2FtZSxcbiAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgIHg6IDUwLCBcbiAgICAgICAgeTogLTI1MCxcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmdhbWUubGF5ZXJNYW5hZ2VyLmxheWVycy5nZXQoJ3NreUxheWVyJykuYWRkKHRoaXMuc3VuU3ByaXRlKTtcblxuICAgIC8vIEV4dGVuZGFibGUgYXJyYXkgb2Ygc2t5IHNoYWRlcyBmb3IgdHdlZW5pbmdcbiAgICBjb25zdCBza3lUb25lcyA9IFtcbiAgICAgICAgeyBzcHJpdGU6IHRoaXMsIGZyb206IDB4MWYyYTI3LCB0bzogMHg3ZWMwZWUgfVxuICAgIF07XG5cbiAgICAvLyBJbml0IHR3ZWVuaW5nIG9mIHNreSBjb2xvciwgc3VuIGFuZCBtb29uXG4gICAgdGhpcy5kYXlDeWNsZS5pbml0U2hhZGluZyhza3lUb25lcyk7XG4gICAgdGhpcy5kYXlDeWNsZS5pbml0U3VuKHRoaXMuc3VuU3ByaXRlKTtcbiAgICB0aGlzLmRheUN5Y2xlLmluaXRNb29uKHRoaXMubW9vblNwcml0ZSk7XG4gIH1cblxufVxuIiwiLyoqXG4gKiBAY2xhc3MgU3VuU3ByaXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBTdW5TcHJpdGUgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGdhbWUgUmVmZXJlbmNlIHRvIHRoZSBzdGF0ZSdzIGdhbWUgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhdGlvbiBYIGFuZCBZIGNvb3JkaW5hdGVzIHRvIHJlbmRlciB0aGUgc3ByaXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSBTY2FsZSB0byByZW5kZXIgdGhlIHNwcml0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9LCBsb2NhdGlvbiA9IHt9LCBzY2FsZSA9IDEuMjUgfSA9IHt9KSB7XG4gICAgc3VwZXIoZ2FtZSwgbG9jYXRpb24ueCwgbG9jYXRpb24ueSwgJ3NreScpO1xuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgc2NhbGUsXG4gICAgICBsb2NhdGlvbixcbiAgICB9O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBzcHJpdGVcbiAgICovXG4gIHJlbmRlciAoKSB7XG4gICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzKTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMuY29uZmlnLnNjYWxlLCB0aGlzLmNvbmZpZy5zY2FsZSk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMCwgMSk7XG4gICAgdGhpcy5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwbGF5cyBhIHN0aWxsIGZyYW1lIG9yIGFuIGFuaW1hdGlvbiBvbiB1cGRhdGUgbG9vcFxuICAgKi9cbiAgdXBkYXRlICgpIHtcbiAgICB0aGlzLmZyYW1lTmFtZSA9ICdzdW4nO1xuICB9XG5cbn1cbiIsIi8qKlxuICogVGlsZVNwcml0ZSBpcyBhbiBpbmRpdmlkdWFsIHRpbGUgcmVuZGVyZWQgYnkgdGhlIHRpbGUgZ2VuZXJhdG9yXG4gKiBcbiAqIEBjbGFzcyBUaWxlU3ByaXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBUaWxlU3ByaXRlIGV4dGVuZHMgUGhhc2VyLlNwcml0ZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBnYW1lIFJlZmVyZW5jZSB0byB0aGUgc3RhdGUncyBnYW1lIG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdH0gbG9jYXRpb24gWCBhbmQgWSBjb29yZGluYXRlcyB0byByZW5kZXIgdGhlIHNwcml0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgU2NhbGUgdG8gcmVuZGVyIHRoZSBzcHJpdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHRpbGVOYW1lIE5hbWUgb2YgdGhlIHRpbGUgdG8gcmVuZGVyXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoeyBnYW1lID0ge30sIGxvY2F0aW9uID0ge30sIHNjYWxlID0gMSwgdGlsZU5hbWUgPSAnZ3Jhc3MtbGlnaHQnIH0gPSB7fSkge1xuICAgIHN1cGVyKGdhbWUsIGxvY2F0aW9uLngsIGxvY2F0aW9uLnksICdncm91bmQnKTtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHNjYWxlLFxuICAgICAgbG9jYXRpb24sXG4gICAgICB0aWxlTmFtZSxcbiAgICB9O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBzcHJpdGVcbiAgICovXG4gIHJlbmRlciAoKSB7XG4gICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzKTtcbiAgICAvKipcbiAgICAgKiBQaGFzZXIuQW5pbWF0aW9ucy5hZGQobmFtZSwgZ2VuZXJhdGVGcmFtZU5hbWVzLCBmcmFtZVJhdGUsIGxvb3AgKVxuICAgICAqIG5hbWUg4oCUIE5hbWUgb3QgYXNzaWduIHRoZSBhbmltYXRpb25cbiAgICAgKiBnZW5lcmF0ZUZyYW1lTmFtZXMg4oCUIFBoYXNlciBhdXRvbWF0aWNhbGx5IHdpbGwgZ3JhYiBvYWsxIHRocm91Z2ggb2FrM1xuICAgICAqIGZyYW1lUmF0ZSDigJQgRnJhbWUgcmF0ZSB0byBwbGF5IGFuaW1hdGlvblxuICAgICAqIGxvb3Ag4oCUIFdoZXRoZXIgb3Igbm90IHRvIGxvb3AgdGhlIGFuaW1hdGlvblxuICAgICAqL1xuICAgIHRoaXMuc2NhbGUuc2V0VG8odGhpcy5jb25maWcuc2NhbGUsIHRoaXMuY29uZmlnLnNjYWxlKTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLCAxKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcywgZmFsc2UsIHRydWUpO1xuICAgIHRoaXMuYm9keS5raW5lbWF0aWMgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGZyYW1lIHRvIHRoZSB0aWxlIHRoYXQgbmVlZHMgdG8gYmUgZGlzcGxheWVkXG4gICAqL1xuICB1cGRhdGUgKCkge1xuICAgIHRoaXMuZnJhbWVOYW1lID0gdGhpcy5jb25maWcudGlsZU5hbWU7XG4gIH1cblxufVxuIiwiLyoqXG4gKiBUcmVlIHNwcml0ZSBpcyB1c2VkIGZvciBiYWNrZ3JvdW5kIHRyZWVzIGFuZCBjYW4gbG9hZCB2YXJpb3VzIHR5cGVzIG9mIHRyZWVzIGZyb20gYW4gYXRsYXNcbiAqIFxuICogQGNsYXNzIFRyZWVTcHJpdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFRyZWVTcHJpdGUgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGdhbWUgUmVmZXJlbmNlIHRvIHRoZSBzdGF0ZSdzIGdhbWUgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhdGlvbiBYIGFuZCBZIGNvb3JkaW5hdGVzIHRvIHJlbmRlciB0aGUgc3ByaXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSBTY2FsZSB0byByZW5kZXIgdGhlIHNwcml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RpbGxGcmFtZU5hbWUgTmFtZSB0byByZW5kZXIgc3ByaXRlIHdoZW4gbm8gYW5pbWF0aW9uIGlzIHBsYXlpbmdcbiAgICogQHBhcmFtIHtCb29sZWFufSBpc0FuaW1hdGVkIFdoZXRoZXIgb3Igbm90IHRoZSBzcHJpdGUgc2hvdWxkIGJlIGFuaW1hdGVkIFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9LCBsb2NhdGlvbiA9IHt9LCBzY2FsZSA9IDEsIHN0aWxsRnJhbWVOYW1lID0gJ29hazEnLCBpc0FuaW1hdGVkID0gZmFsc2UgfSA9IHt9KSB7XG5cbiAgICBzdXBlcihnYW1lLCBsb2NhdGlvbi54LCBsb2NhdGlvbi55LCAndHJlZXMnKTtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHNjYWxlLFxuICAgICAgc3RpbGxGcmFtZU5hbWUsXG4gICAgICBpc0FuaW1hdGVkLFxuICAgICAgbG9jYXRpb24sXG4gICAgfTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgc3ByaXRlXG4gICAqL1xuICByZW5kZXIgKCkge1xuICAgIHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcyk7XG4gICAgLyoqXG4gICAgICogUGhhc2VyLkFuaW1hdGlvbnMuYWRkKG5hbWUsIGdlbmVyYXRlRnJhbWVOYW1lcywgZnJhbWVSYXRlLCBsb29wIClcbiAgICAgKiBuYW1lIOKAlCBOYW1lIG90IGFzc2lnbiB0aGUgYW5pbWF0aW9uXG4gICAgICogZ2VuZXJhdGVGcmFtZU5hbWVzIOKAlCBQaGFzZXIgYXV0b21hdGljYWxseSB3aWxsIGdyYWIgb2FrMSB0aHJvdWdoIG9hazNcbiAgICAgKiBmcmFtZVJhdGUg4oCUIEZyYW1lIHJhdGUgdG8gcGxheSBhbmltYXRpb25cbiAgICAgKiBsb29wIOKAlCBXaGV0aGVyIG9yIG5vdCB0byBsb29wIHRoZSBhbmltYXRpb25cbiAgICAgKi9cbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKCdzd2F5JywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoJ29haycsIDEsIDQpLCAxLCB0cnVlKTtcbiAgICB0aGlzLnNjYWxlLnNldFRvKHRoaXMuY29uZmlnLnNjYWxlLCB0aGlzLmNvbmZpZy5zY2FsZSk7XG4gICAgdGhpcy5hbmNob3Iuc2V0VG8oMCwgMSk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgYSBzdGlsbCBmcmFtZSBvciBhbiBhbmltYXRpb24gb24gdXBkYXRlIGxvb3BcbiAgICovXG4gIHVwZGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmlzQW5pbWF0ZWQpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KCdzd2F5Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnJhbWVOYW1lID0gdGhpcy5jb25maWcuc3RpbGxGcmFtZU5hbWU7XG4gICAgfVxuICB9XG5cbn1cbiIsImltcG9ydCB7IFpvbmUxIH0gZnJvbSAnLi9zdGF0ZXMvem9uZTEvem9uZTEnO1xuXG5jb25zdCB6b25lMSA9IG5ldyBab25lMSgpO1xuXG5jbGFzcyBHYW1lIGV4dGVuZHMgUGhhc2VyLkdhbWUge1xuXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0LCBQaGFzZXIuQVVUTywgJycsIG51bGwpO1xuICAgIHRoaXMuc3RhdGUuYWRkKCdab25lMScsIHpvbmUxLCBmYWxzZSk7XG4gICAgdGhpcy5zdGF0ZS5zdGFydCgnWm9uZTEnKTtcbiAgfVxuICBcbn1cblxuY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XG4iLCJpbXBvcnQgeyBMYXllck1hbmFnZXIgfSBmcm9tICcuLi9sYXllck1hbmFnZXIvbGF5ZXJNYW5hZ2VyJztcblxuLyoqXG4gKiBTZXRzIHVwIHRoZSBiaXRtYXAgY2FudmFzZXMgYW5kIHNwcml0ZXMgZm9yIHRoZSBoZWFsdGggYmFyIGFuZCBoZWFsdGggYmFyIGJhY2tncm91bmQuXG4gKi9cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9mIGhlYWx0aCBiYXIuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5jb25zdCBjb25maWcgPSB7XG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogMTIsXG4gIHg6IDEwLFxuICB5OiAxMCxcbiAgYmc6IHtcbiAgICBjb2xvcjogJyM0MDQwNDAnXG4gIH0sXG4gIGJhcjoge1xuICAgIGNvbG9yOiAnI0FCMTExMSdcbiAgfSxcbiAgYW5pbWF0aW9uRHVyYXRpb246IDIwMFxufTtcblxuLyoqXG4gKiBDYW52YXMgZHJhd2luZyBmb3IgaGVhbHRoIGJhciBiYWNrZ3JvdW5kLlxuICovXG5jbGFzcyBIZWFsdGhCYXJCR0NhbnZhcyBleHRlbmRzIFBoYXNlci5CaXRtYXBEYXRhIHtcbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9IH0gPSB7fSkge1xuICAgIHN1cGVyKGdhbWUsICdoZWFsdGggYmFyIGJhY2tncm91bmQnLCBjb25maWcud2lkdGgsIGNvbmZpZy5oZWlnaHQpO1xuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbmZpZy5iZy5jb2xvcjtcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eC5yZWN0KDAsIDAsIGNvbmZpZy53aWR0aCwgY29uZmlnLmhlaWdodCk7XG4gICAgdGhpcy5jdHguZmlsbCgpO1xuICB9XG59XG5cbi8qKlxuICogTG9hZHMgaGVhbHRoIGJhciBiYWNrZ3JvdW5kIGNhbnZhcyBhcyBzcHJpdGUuXG4gKi9cbmNsYXNzIEhlYWx0aEJhckJHU3ByaXRlIGV4dGVuZHMgUGhhc2VyLlNwcml0ZSB7XG4gIGNvbnN0cnVjdG9yICh7IGdhbWUgPSB7fSB9ID0ge30pIHtcbiAgICBzdXBlcihnYW1lLCBjb25maWcueCwgY29uZmlnLnksIG5ldyBIZWFsdGhCYXJCR0NhbnZhcyh7IGdhbWUgfSkpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xuICB9XG59XG5cbi8qKlxuICogQ2FudmFzIGRyYXdpbmcgZm9yIGhlYWx0aCBiYXIuXG4gKi9cbmNsYXNzIEhlYWx0aEJhckNhbnZhcyBleHRlbmRzIFBoYXNlci5CaXRtYXBEYXRhIHtcbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9IH0gPSB7fSkge1xuICAgIHN1cGVyKGdhbWUsICdoZWFsdGggYmFyJywgY29uZmlnLndpZHRoLCBjb25maWcuaGVpZ2h0KTtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBjb25maWcuYmFyLmNvbG9yO1xuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4LnJlY3QoMCwgMCwgY29uZmlnLndpZHRoIC0gMTAsIGNvbmZpZy5oZWlnaHQgLyAyKTtcbiAgICB0aGlzLmN0eC5maWxsKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBMb2FkcyBoZWFsdGggYmFyIGNhbnZhcyBhcyBhIHNwcml0ZSBhbmQgcmVuZGVyIGFsbCBoZWFsdGhiYXIgYXNzZXRzLlxuICovXG5leHBvcnQgY2xhc3MgSGVhbHRoQmFyU3ByaXRlIGV4dGVuZHMgUGhhc2VyLlNwcml0ZSB7XG5cbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9LCBjaGFyYWN0ZXIgPSB7fSB9ID0ge30pIHtcbiAgICBzdXBlcihnYW1lLCBjb25maWcueCArIDUsIGNvbmZpZy55ICsgMywgbmV3IEhlYWx0aEJhckNhbnZhcyh7IGdhbWUgfSkpO1xuICAgIGdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xuXG4gICAgdGhpcy5jaGFyYWN0ZXIgPSBjaGFyYWN0ZXI7XG4gICAgdGhpcy5sYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKCk7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG4gIFxuICAvKipcbiAgICogUmVuZGVyIHRoZSBoZWFsdGhiYXIgYmFja2dyb3VuZCBhbmQgbG9hZCBib3RoIHNwcml0ZXMgaW50byB0aGUgbGF5ZXIgbWFuYWdlci5cbiAgICovXG4gIHJlbmRlciAoKSB7XG4gICAgdGhpcy5oZWFsdGhCYXJCRyA9IG5ldyBIZWFsdGhCYXJCR1Nwcml0ZSh7IGdhbWU6IHRoaXMuZ2FtZSB9KTtcbiAgICB0aGlzLmdhbWUubGF5ZXJNYW5hZ2VyLmxheWVycy5nZXQoJ3VpTGF5ZXInKS5hZGQodGhpcy5oZWFsdGhCYXJCRyk7XG4gICAgdGhpcy5nYW1lLmxheWVyTWFuYWdlci5sYXllcnMuZ2V0KCd1aUxheWVyJykuYWRkKHRoaXMpO1xuXG4gICAgdGhpcy5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgICB0aGlzLmhlYWx0aEJhckJHLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFR3ZWVuIGhlYWx0aCBiYXIgd2hlbiB0aGVyZSBpcyBhIGNoYW5nZSBpbiBwbGF5ZXIncyBoZWF0bGguXG4gICAqL1xuICB1cGRhdGUgKCkge1xuICAgIHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcykudG8oIHsgd2lkdGg6IHRoaXMuY2hhcmFjdGVyLnN0YXRlLmhlYWx0aCAvIHRoaXMuY2hhcmFjdGVyLnN0YXRlLm1heEhlYWx0aCAqIGNvbmZpZy53aWR0aCB9LCBjb25maWcuYW5pbWF0aW9uRHVyYXRpb24sIFBoYXNlci5FYXNpbmcuTGluZWFyLk5vbmUsIHRydWUpO1xuICB9XG5cbn1cbiIsIi8qKlxuICogRGVmaW5lcyBnYW1lIGlucHV0cyBhbmQgbWV0aG9kcyBpbiB2YXJpb3VzIGNsYXNzZXMgb24gZXZlbnQgbGlzdGVuZXJzXG4gKiBAY2xhc3MgSW5wdXQgbWFuYWdlclxuICovXG5cbmV4cG9ydCBjbGFzcyBJbnB1dE1hbmFnZXIgZXh0ZW5kcyBQaGFzZXIuSW5wdXQge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZ2FtZSBSZWZlcmVuY2UgdG8gUGhhc2VyIGdhbWVcbiAgICogQHBhcmFtIHtDbGFzc30gcGxheWVyIFJlZmVyZW5jZSB0byBwbGF5ZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yICh7IGdhbWUgPSB7fSwgcGxheWVyID0ge30gfSA9IHt9KSB7XG4gICAgc3VwZXIoZ2FtZSk7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgdGhpcy5rZXlzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG4gICAgdGhpcy5qdW1wQnV0dG9uID0gdGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuXG4gICAgLy8gRGVmYXVsdCBjb250cm9sIHZhbHVlc1xuICAgIHRoaXMuYWN0aW9ucyA9IHtcbiAgICAgIHJ1bjogJ2lkbGUnLFxuICAgICAganVtcDogZmFsc2VcbiAgICB9O1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgaW5pdCAoKSB7XG4gICAgdGhpcy5vbktleURvd24oKTtcbiAgfSBcblxuICAvKiogXG4gICAqIEluaXRpYWxpemVzIGxpc3RlbmVycyBmb3Iga2V5Ym9hcmQgaW5wdXQgYW5kIGV4ZWN1dGVzIHRoZSBsaXN0ZW5lciBjYWxsYmFja3NcbiAgICogTm90ZTogTGlzdGVuZXIgY2FsbGJhY2tzIGFyZSBkZWZpbmVkIHdpdGhpbiB0aGUgY29udGV4dCBvZiB0aGlzIG1ldGhvZCBiZWNhdXNlIHRoZSBsaXN0ZW5lciB3aWxsXG4gICAqIG5vdCBhY2NlcHQgYSBjbGFzcyBtZXRob2QgYXMgYSBjYWxsYmFjayBcbiAgICovXG4gIG9uS2V5RG93biAoKSB7XG4gICAgLy8gTGlzdGVuIGZvciBkaXJlY3Rpb24ga2V5IHByZXNzZXNcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmtleXMpIHtcbiAgICAgIGlmICh0aGlzLmtleXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJndW1lbnRzIGZvciB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uc1xuICAgICAgICAgKiBQaGFzZXIuSW5wdXQub25Eb3duLmFkZChjYWxsYmFjaywgY29udGV4dCwgcHJpb3JpdHksIGFyZ3VtZW50KVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5rZXlzW2tleV0ub25Eb3duLmFkZChicm9hZGNhc3RBY3Rpb24sIHRoaXMsIDAsIHsgbW92ZToga2V5IH0pO1xuICAgICAgICB0aGlzLmtleXNba2V5XS5vblVwLmFkZChicm9hZGNhc3RBY3Rpb24sIHRoaXMsIDAsIHsgbW92ZTogJ2lkbGUnIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBMaXN0ZW4gZm9yIGp1bXAgYnV0dG9uIHByZXNzXG4gICAgdGhpcy5qdW1wQnV0dG9uLm9uRG93bi5hZGQoYnJvYWRjYXN0QWN0aW9uLCB0aGlzLCAwLCB7IGp1bXA6IHRydWUgfSk7XG4gICAgdGhpcy5qdW1wQnV0dG9uLm9uVXAuYWRkKGJyb2FkY2FzdEFjdGlvbiwgdGhpcywgMCwgeyBqdW1wOiBmYWxzZSB9KTtcblxuICAgIC8qKlxuICAgICAqIEZpcmUgYWN0aW9uIG9uIHJlbGV2YW50IGNsYXNzZXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgUGhhc2VyIGV2ZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlcyBWYWx1ZXMgb2YgYWN0aW9ucyB0byBwZXJmb3JtXG4gICAgICovXG4gICAgZnVuY3Rpb24gYnJvYWRjYXN0QWN0aW9uIChldmVudCwgeyBtb3ZlID0gdGhpcy5hY3Rpb25zLm1vdmUsIGp1bXAgPSB0aGlzLmFjdGlvbnMuanVtcCB9ID0ge30pIHtcbiAgICAgIHRoaXMuYWN0aW9ucy5tb3ZlID0gbW92ZTtcbiAgICAgIHRoaXMuYWN0aW9ucy5qdW1wID0ganVtcDtcbiAgICAgIHRoaXMucGxheWVyLnNwcml0ZS5zZXRBY3Rpb24oeyBtb3ZlOiB0aGlzLmFjdGlvbnMubW92ZSwganVtcDogdGhpcy5hY3Rpb25zLmp1bXAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHVzZXIgY2FuIGp1bXAgYnkgbG9vcGluZyBvdmVyIFAyIGJvZGllcyBhbmQgdHJhamVjdG9yaWVzXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSByZXN1bHQgV2hldGhlciBvciBub3QgdGhlIHVzZXIgY2FuIGp1bXBcbiAgICovXG4gIGNoZWNrSWZDYW5KdW1wICgpIHtcbiAgICBjb25zdCB5QXhpcyA9IHAyLnZlYzIuZnJvbVZhbHVlcygwLCAxKTtcbiAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG4gICAgZm9yIChjb25zdCBjIG9mIHRoaXMuZ2FtZS5waHlzaWNzLnAyLndvcmxkLm5hcnJvd3BoYXNlLmNvbnRhY3RFcXVhdGlvbnMpIHtcbiAgICAgIGlmICggYy5ib2R5QSA9PT0gdGhpcy5wbGF5ZXIuc3ByaXRlLmJvZHkuZGF0YSB8fCBjLmJvZHlCID09PSB0aGlzLnBsYXllci5zcHJpdGUuYm9keS5kYXRhKSB7XG4gICAgICAgIGxldCBkID0gcDIudmVjMi5kb3QoYy5ub3JtYWxBLCB5QXhpcyk7XG4gICAgICAgIGlmIChjLmJvZHlBID09PSB0aGlzLnBsYXllci5zcHJpdGUuYm9keS5kYXRhKSB7XG4gICAgICAgICAgZCAqPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZCA+IDAuNSkge1xuICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG59XG4iLCIvKipcbiAqIExheWVycyBhZGRlZCBoZXJlIHdpbGwgYmUgTG9hZGVkIGJ5IG9yZGVyIG9mIGluZGV4LlxuICogQHR5cGUge0FycmF5fVxuICovXG5jb25zdCBsYXllclJlZ2lzdHJ5ID0gW1xuICAnc2t5JyxcbiAgJ2Vudmlyb25tZW50JyxcbiAgJ2xhbmQnLFxuICAnZW5lbXknLFxuICAncGxheWVyJyxcbiAgJ3VpJyxcbl07XG5cbi8qKlxuICogIE1hbmFnZXMgdGhlIHJlZ2lzdGVyaW5nIG9mIGdyb3VwcyBhbmQgc2V0dGluZyB0aGVpciByZW5kZXIgb3JkZXJcbiAqICBAdHlwZSB7Q2xhc3N9XG4gKi9cbmV4cG9ydCBjbGFzcyBMYXllck1hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAoeyBnYW1lID0ge30gfSA9IHt9KSB7XG4gICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICB0aGlzLmxheWVyUmVnaXN0cnkgPSBsYXllclJlZ2lzdHJ5O1xuICAgIHRoaXMubGF5ZXJzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIHNldHVwXG4gICAqIEFkZHMgaXRlbXMgaW4gbGF5ZXJSZWdpc3RyeSB0byB0aGUgTGF5ZXJNYW5hZ2VyJ3MgbGF5ZXJzIE1hcCB3aXRoIHBvc3QtZml4ICdMYXllcidcbiAgICogQGV4YW1wbGUgJ3VpJyB3aWxsIGJlIGFkZGVkIGFzICd1aUxheWVyJ1xuICAgKi9cbiAgc2V0dXAgKCkge1xuICAgIGZvciAoIGNvbnN0IGxheWVyIGluIHRoaXMubGF5ZXJSZWdpc3RyeSApIHtcbiAgICAgIHRoaXMubGF5ZXJzLnNldCggYCR7bGF5ZXJSZWdpc3RyeVtsYXllcl19TGF5ZXJgLCB0aGlzLmdhbWUuYWRkLmdyb3VwKCkgKTtcbiAgICAgIHRoaXMuZ2FtZS53b3JsZC5icmluZ1RvVG9wKHRoaXMubGF5ZXJzLmdldChgJHtsYXllclJlZ2lzdHJ5W2xheWVyXX1MYXllcmApKTtcbiAgICB9XG4gIH1cblxufVxuIiwiLyoqXG4gKiBAY2xhc3MgSGVhbHRoVGltZXJcbiAqIFJlZHVjZXMgaGVhbHRoIG92ZXIgdGltZVxuICovXG5cbmV4cG9ydCBjbGFzcyBIZWFsdGhUaW1lciB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbGF5ZXIgUGxheWVyIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHsgcGxheWVyID0ge30gfSA9IHt9KSB7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIGFuIGludGVydmFsIGZvciBncmFkdWFsIGhlYWx0aCByZWR1Y3Rpb25cbiAgICovXG4gIGluaXQgKCkge1xuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnBsYXllci5zdGF0ZS5oZWFsdGggPj0gMCkge1xuICAgICAgICB0aGlzLnBsYXllci5zdGF0ZS5oZWFsdGggLT0gMTtcbiAgICAgIH1cbiAgICB9LCAxMDAwMCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBsYXllclNwcml0ZSB9IGZyb20gJy4vcGxheWVyLnNwcml0ZSc7XG5pbXBvcnQgeyBIZWFsdGhCYXJTcHJpdGUgfSBmcm9tICcuLi9oZWFsdGhCYXIvaGVhbHRoQmFyJztcbmltcG9ydCB7IElucHV0TWFuYWdlciB9IGZyb20gJy4uL2lucHV0L2lucHV0Lm1hbmFnZXInO1xuaW1wb3J0IHsgSGVhbHRoVGltZXIgfSBmcm9tICcuL2hlYWx0aFRpbWVyLnNlcnZpY2UnO1xuXG4vKipcbiAqIFBsYXllciBtYW5hZ2VyIGlzIHJlc3BvbnNpYmxlIGZvciBtYW5hZ2luZyB0aGUgc3RhdGUgb2YgdGhlIHBsYXllciBhbmQgYW55IGFzcGVjdHMgdGhhdCBhcmUgbm90XG4gKiBkaXJlY3RseSByZWxhdGVkIHRvIHRoZSBib2R5IG9mIHRoZSBzcHJpdGUgc3VjaCBhcyB1c2VyIGlucHV0IGFuZCB2YXJpb3VzIHN0YXRzIGFuZCBjb25maWd1cmF0aW9uXG4gKiBzZXR0aW5nc1xuICogXG4gKiBAY2xhc3MgUGxheWVyTWFuYWdlclxuICovXG5cbmV4cG9ydCBjbGFzcyBQbGF5ZXJNYW5hZ2VyIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGdhbWUgUmVmZXJlbmNlIHRvIHRoZSBzdGF0ZSdzIGdhbWUgb2JqZWN0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBoZWFsdGggQ3VycmVudCBwbGF5ZXIgaGVhbHRoXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtYXhIZWFsdGggTWF4aW11bSBoZWFsdGggdGhlIHBsYXllciBjYW4gaGF2ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3BlZWQgQmFzZSBzcGVlZCBtb2RpZmllciBmb3IgdGhlIHBsYXllclxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uIFRoZSBkaXJlY3Rpb24gdGhlIHBsYXllciBzaG91bGQgYmUgZmFjaW5nXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoeyBnYW1lID0ge30sIGhlYWx0aCA9IDEwMCwgbWF4SGVhbHRoID0gMTAwLCBzcGVlZCA9IDI1LCBkaXJlY3Rpb24gPSAncmlnaHQnIH0gPSB7fSkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBoZWFsdGgsXG4gICAgICBtYXhIZWFsdGgsXG4gICAgICBzcGVlZCxcbiAgICAgIGRpcmVjdGlvblxuICAgIH07XG5cbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuaGVhbHRoVGltZXIgPSBuZXcgSGVhbHRoVGltZXIoeyBwbGF5ZXI6IHRoaXMgfSk7XG4gICAgdGhpcy5pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKHsgZ2FtZSwgcGxheWVyOiB0aGlzIH0pO1xuICAgIHRoaXMuc3ByaXRlID0gbmV3IFBsYXllclNwcml0ZSh7IGdhbWUsIHNwZWVkIH0pO1xuICAgIHRoaXMuaGVhbHRoQmFyID0gbmV3IEhlYWx0aEJhclNwcml0ZSh7IGdhbWUsIGNoYXJhY3RlcjogdGhpcyB9KTtcbiAgICBcbiAgICAvLyBUT0RPOiBhZGQgYSBuZXcgY2xhc3MgdG8gY29uZmlndXJlIGNhbWVyYSBieSBleHRlbmRpbmcgUGhhc2VyLkNhbWVyYVxuICAgIHRoaXMuZ2FtZS5jYW1lcmEuZm9sbG93KHRoaXMuc3ByaXRlKTtcbiAgICB0aGlzLmdhbWUuY2FtZXJhLnNldEJvdW5kc1RvV29ybGQoKTtcbiAgfVxuXG59XG4iLCIvKipcbiAqIFBsYXllciBzcHJpdGUgaXMgcmVzcG9uc2libGUgZm9yIHRoZSB2aXN1YWwgYXNwZWN0cyBvZiB0aGUgc3ByaXRlIHN1Y2ggYXMgbGFvZGluZyBpdHMgaW1hZ2UsXG4gKiBpdHMgcGh5c2ljcyBib2R5LCBhbmltYXRpb25zLCBhbmQgaXRzIGNvbGxpc2lvbiBwb2x5Z29uXG4gKlxuICogVE9ETzogQ29uc2lkZXIgd2hldGhlciB0byBzZXBhcmF0ZSBib2R5IGludG8gYSBuZXcgZmlsZSB0byBhYnN0cmFjdCBwaHlzaWNzIGZyb20gdGhlIHNwcml0ZSBmaWxlLlxuICpcbiAqIEBjbGFzcyBQbGF5ZXJTcHJpdGVcbiAqL1xuZXhwb3J0IGNsYXNzIFBsYXllclNwcml0ZSBleHRlbmRzIFBoYXNlci5TcHJpdGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGdhbWUgUmVmZXJlbmNlIHRvIHRoZSBzdGF0ZSdzIGdhbWUgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoeyBnYW1lID0ge30sIHNwZWVkID0gMjUgfSA9IHt9KSB7XG4gICAgc3VwZXIoZ2FtZSwgMTUwLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxNzAsICdwbGF5ZXInKTtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHNjYWxlOiAxLFxuICAgICAgc3BlZWRcbiAgICB9O1xuICAgIHRoaXMuanVtcFRpbWVyID0gMDtcbiAgICB0aGlzLmFjdGlvbnMgPSB7fTtcbiAgICB0aGlzLmRldGVjdGlvbkJvdW5kcyA9IHt9O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0dXAgc3ByaXRlIGJvZHkgc2V0dGluZ3NcbiAgICovXG4gIGJvZHlTZXR1cCAoKSB7XG4gICAgdGhpcy5ib2R5LmZpeGVkUm90YXRpb24gPSB0cnVlO1xuICAgIHRoaXMuYm9keS5kYW1waW5nID0gMC4yO1xuICAgIHRoaXMuYm9keS5jbGVhclNoYXBlcygpO1xuICAgIHRoaXMuYm9keS5sb2FkUG9seWdvbigncGxheWVyLXBvbHlnb24nLCAncGxheWVyJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBzcHJpdGUgYm9keVxuICAgKi9cbiAgcmVuZGVyICgpIHtcbiAgICB0aGlzLmdhbWUuYWRkLmV4aXN0aW5nKHRoaXMpO1xuICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoJ3J1bicsIFBoYXNlci5BbmltYXRpb24uZ2VuZXJhdGVGcmFtZU5hbWVzKCdydW4nLCAxLCA1KSwgMTUsIHRydWUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8odGhpcy5jb25maWcuc2NhbGUsIHRoaXMuY29uZmlnLnNjYWxlKTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgIHRoaXMuZ2FtZS5sYXllck1hbmFnZXIubGF5ZXJzLmdldCgncGxheWVyTGF5ZXInKS5hZGQodGhpcyk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMuZ2FtZS5sYXllck1hbmFnZXIubGF5ZXJzLmdldCgncGxheWVyTGF5ZXInKSwgZmFsc2UsIHRydWUpO1xuICAgIHRoaXMuYm9keVNldHVwKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhY3Rpb25zIGZvciB0aGUgc3ByaXRlIHRvIHBlcmZvcm0uIEV4ZWN1dGVkIGZyb20gb3RoZXIgbWFuYWdlcnMgc3VjaCBhcyBJbnB1dExpc3RlbmVyXG4gICAqL1xuICBzZXRBY3Rpb24gKHsgbW92ZSA9ICdpZGxlJywganVtcCA9IGZhbHNlIH0gPSB7fSkge1xuICAgIHRoaXMuYWN0aW9ucy5tb3ZlID0gbW92ZTtcbiAgICB0aGlzLmFjdGlvbnMuanVtcCA9IGp1bXA7XG4gIH1cblxuICAvKipcbiAgICogUGhhc2VyJ3MgdXBkYXRlIGxpZmVjeWNsZSBob29rXG4gICAqL1xuICB1cGRhdGUgKCkge1xuXG4gICAgdGhpcy51cGRhdGVEZXRlY3Rpb25Cb3VuZHMoKTtcbiAgICAvLyBMaXN0ZW4gZm9yIG1vdmUgKGRpcmVjdGlvbikgc2VwYXJhdGVseSBmcm9tIGp1bXAgc28gYm90aCBjYW4gYmUgZXhlY3V0ZWQgc2ltdWx0YW5lb3VzbHlcbiAgICBzd2l0Y2ggKHRoaXMuYWN0aW9ucy5tb3ZlKSB7XG4gICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KCdydW4nKTtcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA9PT0gLXRoaXMuY29uZmlnLnNjYWxlKSB7XG4gICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5jb25maWcuc2NhbGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ib2R5LnZlbG9jaXR5LnggPSAxNSAqIHRoaXMuY29uZmlnLnNwZWVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucGxheSgncnVuJyk7XG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPT09IHRoaXMuY29uZmlnLnNjYWxlKSB7XG4gICAgICAgICAgdGhpcy5zY2FsZS54ID0gLXRoaXMuY29uZmlnLnNjYWxlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gLTE1ICogdGhpcy5jb25maWcuc3BlZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaWRsZSc6XG4gICAgICAgIHRoaXMuZnJhbWVOYW1lID0gJ2lkbGUnO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuZnJhbWVOYW1lID0gJ2lkbGUnO1xuICAgIH1cbiAgICBpZiAodGhpcy5hY3Rpb25zLmp1bXAgJiYgdGhpcy5nYW1lLnRpbWUubm93ID4gdGhpcy5qdW1wVGltZXIpIHtcbiAgICAgIHRoaXMuYm9keS5tb3ZlVXAoMzc1KTtcbiAgICAgIHRoaXMuanVtcFRpbWVyID0gdGhpcy5nYW1lLnRpbWUubm93ICsgNzUwO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZURldGVjdGlvbkJvdW5kcyAoKSB7XG4gICAgdGhpcy5kZXRlY3Rpb25Cb3VuZHMudG9wID0gbmV3IFBoYXNlci5MaW5lKHRoaXMueCAtIHRoaXMud2lkdGggLyAyLCB0aGlzLnkgLSB0aGlzLmhlaWdodCAvIDIsIHRoaXMueCArIHRoaXMud2lkdGggLyAyLCB0aGlzLnkgLSB0aGlzLmhlaWdodCAvIDIpO1xuICAgIHRoaXMuZGV0ZWN0aW9uQm91bmRzLmJvdHRvbSA9IG5ldyBQaGFzZXIuTGluZSh0aGlzLnggLSB0aGlzLndpZHRoIC8gMiwgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyLCB0aGlzLnggKyB0aGlzLndpZHRoIC8gMiwgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyKTtcbiAgICB0aGlzLmRldGVjdGlvbkJvdW5kcy5yaWdodCA9IG5ldyBQaGFzZXIuTGluZSh0aGlzLnggKyB0aGlzLndpZHRoIC8gMiwgdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyLCB0aGlzLnggKyB0aGlzLndpZHRoIC8gMiwgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyKTtcbiAgICB0aGlzLmRldGVjdGlvbkJvdW5kcy5sZWZ0ID0gbmV3IFBoYXNlci5MaW5lKHRoaXMueCAtIHRoaXMud2lkdGggLyAyLCB0aGlzLnkgLSB0aGlzLmhlaWdodCAvIDIsIHRoaXMueCAtIHRoaXMud2lkdGggLyAyLCB0aGlzLnkgKyB0aGlzLmhlaWdodCAvIDIpO1xuICB9XG5cbn1cbiIsImltcG9ydCB7IHN0b3JlIGFzIGNvbmZpZyB9IGZyb20gJy4uL3N0YXRlcy96b25lMS96b25lMS5jb25maWcnO1xuXG4vKipcbiAqIFNlcnZpY2UgZm9yIGdlbmVyYXRpbmcgc3Bhd24gcG9pbnRzLlxuICogQGNsYXNzIFNwYXduXG4gKi9cbmV4cG9ydCBjbGFzcyBTcGF3biB7XG5cbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMubG9jYXRpb24gPSB0aGlzLmdldFNwYXduKCk7XG4gIH1cblxuICBnZXRTcGF3biAoKSB7XG4gICAgY29uc3Qgd29ybGRXaWR0aCA9IGNvbmZpZy5nZXRTdGF0ZSgpLndvcmxkV2lkdGg7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IE1hdGgucmFuZG9tKCkgKiAod29ybGRXaWR0aCAtIDApICsgMCxcbiAgICAgIHk6IHdpbmRvdy5pbm5lckhlaWdodCAtIDE3MFxuICAgIH07XG4gIH1cblxufVxuIiwiLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHNldHRpbmdzIGZvciByZW5kZXJpbmcgZWFjaCBsaWdodCBncmFzcyB0aWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gdGlsZU5hbWUgTmFtZSBvZiB0aGUgdGlsZSdzIHJlZmVyZW5jZSBpbiB0aGUgYXRsYXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgQ29uZmlnIG9iamVjdCBzcGVjaWZ5aW5nIHdoZXJlIHRvIHJlbmRlciB0aGUgdGlsZXMgaW4gdGhlIHdvcmxkXG4gKiBAcmV0dXJucyB7QXJyYXl9IEFycmF5IG9mIHNldHRpbmdzIGZvciBlYWNoIGluZGl2aWR1YWwgdGlsZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUaWxlcyAoeyB0aWxlTmFtZSA9ICcnLCBjb25maWcgPSB7fSB9ID0ge30pIHtcbiAgY29uc3QgdGlsZXMgPSBbXTtcbiAgLy8gVmFsdWUgaXMgdGhlIGxvY2F0aW9uIG9iamVjdCBvbiBlYWNoIGVudHJ5XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGNvbmZpZy5sb2NhdGlvbi5lbnRyaWVzKCkpIHtcbiAgICAvLyBEcmF3IHRpbGVzIGZyb20gdGhlIGJlZ2lubmluZyB1bnRpbCB0aGUgZW5kIG9mIHRoZSByYW5nZSBhdCBpbnRlcnZhbHMgZXF1YWwgdG8gdGhlIHNpemUgb2YgdGhlIHRpbGVcbiAgICBmb3IgKGxldCBpID0gdmFsdWUucmFuZ2VbMF0gLyBjb25maWcuc2l6ZTsgaSA8IHZhbHVlLnJhbmdlWzFdIC8gY29uZmlnLnNpemU7IGkrKykge1xuICAgICAgdGlsZXMucHVzaCh7XG4gICAgICAgIHg6IGNvbmZpZy5zaXplICogaSxcbiAgICAgICAgeTogd2luZG93LmlubmVySGVpZ2h0IC0gY29uZmlnLnNpemUgKiB2YWx1ZS55TGV2ZWwsXG4gICAgICAgIHNjYWxlOiAxLFxuICAgICAgICB0aWxlTmFtZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGlsZXM7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0VGlsZU1hcCAoKSB7XG4gIC8qKlxuICAgKiBAdHlwZSB7TWFwfSBsb2NhdGlvblxuICAgKiBsb2NhdGlvbiBtYXAgc2hvdWxkIGNvbnNpc3Qgb2YgYSBrZXkgYW5kIGFuIG9iamVjdCBvZiBzZXR0aW5nc1xuICAgKiByYW5nZSBpcyBhbiBhcnJheSBjb25zaXN0aW5nIG9mIGEgc3RhcnQgYW5kIGVuZCBwb2ludCBmb3IgcmVuZGVyaW5nIHRpbGVzIGhvcml6b250YWxseSBhY3Jvc3MgdGhlIFdPUkxEX1dJRFRIXG4gICAqIHlMZXZlbCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgYm90dG9tIG9mIHRoZSBwYWdlIGluIHVuaXRzIGVxdWFsIHRvIHRoZSBzaXplIGZvIHRoZSB0aWxlXG4gICAqL1xuICByZXR1cm4ge1xuICAgIGdyYXNzOiB7XG4gICAgICBzaXplOiAzMixcbiAgICAgIGxvY2F0aW9uOiBuZXcgTWFwKFtcbiAgICAgICAgWyAnZ3Jhc3MnLCB7IHJhbmdlOiBbMCwgNTAwMF0sIHlMZXZlbDogMSB9IF1cbiAgICAgIF0pXG4gICAgfSxcbiAgICBkaXJ0OiB7XG4gICAgICBzaXplOiAzMixcbiAgICAgIGxvY2F0aW9uOiBuZXcgTWFwKFtcbiAgICAgICAgWyAxLCB7IHJhbmdlOiBbMCwgNTAwMF0sIHlMZXZlbDogMCB9IF0sXG4gICAgICBdKVxuICAgIH1cbiAgfTtcbn07XG4iLCJpbXBvcnQgeyBnZW5lcmF0ZVRpbGVzIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3RpbGVHZW5lcmF0b3InO1xuaW1wb3J0IHsgZ2V0VGlsZU1hcCB9IGZyb20gJy4vdGlsZU1hcC5jb25maWcnO1xuaW1wb3J0IHsgYXBwbHlNaWRkbGV3YXJlLCBjcmVhdGVTdG9yZSB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAncmVkdXgtbG9nZ2VyJztcblxuLyoqXG4gKiBSZWR1Y2Ugc3RhdGUgYW5kIHJldHVybiBuZXcgc3RhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBDdXJyZW50IHN0YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIENvbnRhaW5zIG5hbWUgb2YgYWN0aW9uIGFuZCB1cGRhdGUgdG8gc3RhdGVcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBzdGF0ZVxuICovXG5mdW5jdGlvbiByZWR1Y2VyIChzdGF0ZSA9IHt9LCBhY3Rpb24pIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgJ1dPUkxEX1dJRFRIJzpcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgICB3b3JsZFdpZHRoOiBhY3Rpb24ud29ybGRXaWR0aFxuICAgICAgfSk7XG4gICAgY2FzZSAnVFJFRVMnOlxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICAgIHRyZWVzOiBhY3Rpb24udHJlZXNcbiAgICAgIH0pO1xuICAgIGNhc2UgJ1RJTEVTJzpcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgICB0aWxlczogYWN0aW9uLnRpbGVzXG4gICAgICB9KTtcbiAgICBkZWZhdWx0OiBcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufVxuXG4vKipcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqIFJlZHV4IHN0b3JlIGZvciBkaXNwYXRjaGluZyB0byByZWR1Y2VyIGFuZCBsb2dnaW5nIGFsbCBzdGF0ZSB1cGRhdGVzXG4gKiBUaGlzIGNhbiBiZSBpbXBvcnRlZCB0byBlaWd0aGVyIGRpc3BhdGNoIHVwZGF0ZXMgdG8gdGhlIHN0YXRlIG9yIHRvIGdldCBzdGF0ZSB3aXRoIC5nZXRTdGF0ZSgpXG4gKi9cbmV4cG9ydCBjb25zdCBzdG9yZSA9IGNyZWF0ZVN0b3JlKFxuICByZWR1Y2VyLFxuICBhcHBseU1pZGRsZXdhcmUoY3JlYXRlTG9nZ2VyKCkpXG4pO1xuXG4vKipcbiAqIEB0eXBlIHtTdHJpbmd9IHdvcmxkV2lkdGggV2lkdGggb2Ygem9uZTEncyB3b3JsZCBjb250YWluZXJcbiAqL1xuY29uc3Qgd29ybGRXaWR0aCA9IDUwMDA7XG5zdG9yZS5kaXNwYXRjaCh7XG4gIHR5cGU6ICdXT1JMRF9XSURUSCcsXG4gIHdvcmxkV2lkdGgsXG59KTtcblxuLyoqXG4gKiBAdHlwZSB7U2V0fSB0cmVlcyBNYW51YWxseSBzZXQgdHJlZSBjb29yZGluYXRlcyB0byBhbGxvdyBmb3IgbWFwIGNyZWF0aW5nLlxuICovXG5jb25zdCB0cmVlcyA9IG5ldyBTZXQoW1xuICAgIHsgeDogMTAwLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgLSA0MCwgc2NhbGU6IDEuMSB9LFxuICAgIHsgeDogMTAwMCwgeTogd2luZG93LmlubmVySGVpZ2h0IC0gNDAsIHNjYWxlOiAxLjI1IH0sXG4gICAgeyB4OiAyMjUwLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgLSA0MCwgc2NhbGU6IDEgfSxcbiAgICB7IHg6IDQwMDAsIHk6IHdpbmRvdy5pbm5lckhlaWdodCAtIDQwLCBzY2FsZTogMS43NSB9XG5dKTtcbnN0b3JlLmRpc3BhdGNoKHtcbiAgdHlwZTogJ1RSRUVTJyxcbiAgdHJlZXMsXG59KTtcblxuLyoqXG4gKiBAdHlwZSB7RnVuY3Rpb259IHRpbGVMb2NhdGlvbnMgQ2FsbHMgZ2V0VGlsZU1hcCB0byBnZW5lcmF0ZSB0aGUgdGlsZSBtYXAgZm9yIHRoZSB6b25lXG4gKi9cbmNvbnN0IHRpbGVMb2NhdGlvbnMgPSBnZXRUaWxlTWFwKCk7XG5cbi8qKlxuICogQHR5cGUge01hcH0gdGlsZXMgRWFjaCBrZXkgcmVwcmVzZW50cyBhIHRpbGUgdG8gcmVuZGVyIHdpdGggYSB2YWx1ZSBvZiBhbiBhcnJheSBvZiBvYmplY3RzIHdoaWNoIHJlcHJlc2VudCB0aGUgc2V0dGluZ3Mgb2YgZWFjaCB0aWxlXG4gKi9cbmNvbnN0IHRpbGVzID0gbmV3IE1hcChbXG4gIFsgJ2dyYXNzJywgZ2VuZXJhdGVUaWxlcyh7IHRpbGVOYW1lOiAnZ3Jhc3MtZGFyaycsIGNvbmZpZzogdGlsZUxvY2F0aW9ucy5ncmFzcyB9KSBdLFxuICBbICdkaXJ0JywgZ2VuZXJhdGVUaWxlcyh7IHRpbGVOYW1lOiAnZGlydC1icm93bicsIGNvbmZpZzogdGlsZUxvY2F0aW9ucy5kaXJ0IH0pXVxuXSk7XG5zdG9yZS5kaXNwYXRjaCh7XG4gIHR5cGU6ICdUSUxFUycsXG4gIHRpbGVzLFxufSk7XG4iLCJpbXBvcnQgeyBUcmVlU3ByaXRlIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQvdHJlZS5zcHJpdGUnO1xuaW1wb3J0IHsgVGlsZVNwcml0ZSB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50L3RpbGUuc3ByaXRlJztcbmltcG9ydCB7IFBsYXllck1hbmFnZXIgfSBmcm9tICcuLi8uLi9wbGF5ZXIvcGxheWVyLm1hbmFnZXInO1xuaW1wb3J0IHsgTGF5ZXJNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vbGF5ZXJNYW5hZ2VyL2xheWVyTWFuYWdlcic7XG5pbXBvcnQgeyBFbmVteU1hbmFnZXIgfSBmcm9tICcuLi8uLi96b21iaWUvZW5lbXlNYW5hZ2VyJztcbmltcG9ydCB7IFNreVNwcml0ZSB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50L3NreS5zcHJpdGUnO1xuaW1wb3J0IHsgc3RvcmUgfSBmcm9tICcuL3pvbmUxLmNvbmZpZyc7IFxuXG5jb25zdCBjb25maWcgPSBzdG9yZS5nZXRTdGF0ZSgpO1xuXG5leHBvcnQgY2xhc3MgWm9uZTEgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xuXG4gIC8qKlxuICAgKiBQcmVsb2FkXG4gICAqL1xuICBwcmVsb2FkICgpIHtcbiAgICAvLyBMb2FkIHNwcml0ZXMgYW5kIG1hbmFnZSBsYXllcnNcbiAgICB0aGlzLmdhbWUubG9hZC5hdGxhcygncGxheWVyJywgJy4vZGlzdC9hdGxhc2VzL3BsYXllci9wbGF5ZXIucG5nJywgJy4vZGlzdC9hdGxhc2VzL3BsYXllci9wbGF5ZXIuanNvbicpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLnBoeXNpY3MoJ3BsYXllci1wb2x5Z29uJywgJy4vZGlzdC9hdGxhc2VzL3BsYXllci9wbGF5ZXItcG9seWdvbi5qc29uJyk7XG4gICAgdGhpcy5nYW1lLmxvYWQuYXRsYXMoJ3pvbWJpZScsICcuL2Rpc3QvYXRsYXNlcy96b21iaWUvem9tYmllLnBuZycsICcuL2Rpc3QvYXRsYXNlcy96b21iaWUvem9tYmllLmpzb24nKTtcbiAgICB0aGlzLmdhbWUubG9hZC5waHlzaWNzKCd6b21iaWUtcG9seWdvbicsICcuL2Rpc3QvYXRsYXNlcy96b21iaWUvem9tYmllLXBvbHlnb24uanNvbicpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKCd0cmVlcycsICcuL2Rpc3QvYXRsYXNlcy90cmVlcy90cmVlcy5wbmcnLCAnLi9kaXN0L2F0bGFzZXMvdHJlZXMvdHJlZXMuanNvbicpO1xuICAgIHRoaXMuZ2FtZS5sb2FkLmF0bGFzKCdncm91bmQnLCAnLi9kaXN0L2F0bGFzZXMvdGlsZW1hcHMvdGlsZXMucG5nJywgJy4vZGlzdC9hdGxhc2VzL3RpbGVtYXBzL3RpbGVzLmpzb24nKTtcbiAgICB0aGlzLmdhbWUubG9hZC5hdGxhcygnc2t5JywgJy4vZGlzdC9hdGxhc2VzL3NreS9za3kucG5nJywgJy4vZGlzdC9hdGxhc2VzL3NreS9za3kuanNvbicpO1xuICAgIHRoaXMuZ2FtZS5sYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKHsgZ2FtZTogdGhpcy5nYW1lIH0pO1xuICAgIHRoaXMuZ2FtZS5sYXllck1hbmFnZXIuc2V0dXAoKTtcblxuICAgIC8vIFNldCBnYW1lIHNjYWxlXG4gICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XG4gICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnbkhvcml6b250YWxseSA9IHRydWU7XG4gICAgdGhpcy5nYW1lLnNjYWxlLnBhZ2VBbGlnblZlcnRpY2FsbHkgPSB0cnVlO1xuXG4gICAgLy8gU2V0IFBoeXNpY3MgZm9yIFpvbmVcbiAgICB0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XG4gICAgdGhpcy5nYW1lLnBoeXNpY3MucDIuZ3Jhdml0eS55ID0gMTAwMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVcbiAgICovXG4gIGNyZWF0ZSAoKSB7XG4gICAgdGhpcy5nYW1lLmVuZW15TWFuYWdlciA9IG5ldyBFbmVteU1hbmFnZXIoeyBnYW1lOiB0aGlzLmdhbWUgfSk7XG4gICAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyTWFuYWdlcih7IGdhbWU6IHRoaXMuZ2FtZSB9KTtcbiAgICB0aGlzLmdhbWUuZW5lbXlNYW5hZ2VyLmFkZFpvbWJpZSggeyBwbGF5ZXI6IHRoaXMucGxheWVyLnNwcml0ZSB9ICk7XG4gICAgdGhpcy5za3lTcHJpdGUgPSBuZXcgU2t5U3ByaXRlKHsgZ2FtZTogdGhpcy5nYW1lLCB3aWR0aDogY29uZmlnLndvcmxkV2lkdGggfSk7XG4gICAgdGhpcy5nYW1lLmxheWVyTWFuYWdlci5sYXllcnMuZ2V0KCdza3lMYXllcicpLmFkZCh0aGlzLnNreVNwcml0ZSk7XG4gICAgdGhpcy5yZW5kZXJUcmVlcygpO1xuICAgIHRoaXMucmVuZGVyVGlsZXMoKTtcbiAgICAvKipcbiAgICAgKiBQaGFzZXIuV29ybGQuc2V0Qm91bmRzKHgsIHksIHdpZHRoLCBoZWlnaHQgKVxuICAgICAqIHgg4oCUIFRvcCBsZWZ0IG1vc3QgY29ybmVyIG9mIHRoZSB3b3JsZC4uXG4gICAgICogeSDigJQgVG9wIGxlZnQgbW9zdCBjb3JuZXIgb2YgdGhlIHdvcmxkLlxuICAgICAqIHdpZHRoIOKAlCBOZXcgd2lkdGggb2YgdGhlIGdhbWUgd29ybGQgaW4gcGl4ZWxzLlxuICAgICAqIGhlaWdodCDigJQgTmV3IGhlaWdodCBvZiB0aGUgZ2FtZSB3b3JsZCBpbiBwaXhlbHMuXG4gICAgICovXG4gICAgdGhpcy5nYW1lLndvcmxkLnNldEJvdW5kcygwLCAwLCBjb25maWcud29ybGRXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHVwIHRoZSB0cmVlcyBiYXNlZCBvbiB0aGUgc2V0dGluZ3MgcHJvdmlkZWQgaW4gYSBnaXZlbiB6b25lJ3MgY29uZmlnIG9iamVjdFxuICAgKi9cbiAgcmVuZGVyVHJlZXMgKCkge1xuICAgIGZvciAoY29uc3QgdHJlZSBvZiBjb25maWcudHJlZXMpIHtcbiAgICAgIGNvbnN0IHRyZWVUb0FkZCA9IG5ldyBUcmVlU3ByaXRlKHsgXG4gICAgICAgIGdhbWU6IHRoaXMuZ2FtZSxcbiAgICAgICAgbG9jYXRpb246IHsgeDogdHJlZS54LCB5OiB0cmVlLnkgfSxcbiAgICAgICAgc2NhbGU6IHRyZWUuc2NhbGUsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuZ2FtZS5sYXllck1hbmFnZXIubGF5ZXJzLmdldCgnZW52aXJvbm1lbnRMYXllcicpLmFkZCh0cmVlVG9BZGQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIGEgem9uZSdzIHRpbGVzIGJhc2VkIG9uIGEgY29uZmlnIGZpbGVcbiAgICovXG4gIHJlbmRlclRpbGVzICgpIHtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBjb25maWcudGlsZXMuZW50cmllcygpKSB7XG4gICAgICBmb3IgKGNvbnN0IHRpbGUgb2YgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgdGlsZVRvQWRkID0gbmV3IFRpbGVTcHJpdGUoeyBcbiAgICAgICAgICBnYW1lOiB0aGlzLmdhbWUsXG4gICAgICAgICAgbG9jYXRpb246IHsgeDogdGlsZS54LCB5OiB0aWxlLnkgfSxcbiAgICAgICAgICBzY2FsZTogdGlsZS5zY2FsZSxcbiAgICAgICAgICB0aWxlTmFtZTogdGlsZS50aWxlTmFtZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZ2FtZS5sYXllck1hbmFnZXIubGF5ZXJzLmdldCgnZW52aXJvbm1lbnRMYXllcicpLmFkZCh0aWxlVG9BZGQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBab21iaWUgfSBmcm9tICcuLi96b21iaWUvem9tYmllJztcbmltcG9ydCB7IFpvbWJpZURldGVjdG9yIH0gZnJvbSAnLi4vem9tYmllL3pvbWJpZS1kZXRlY3Rpb24nO1xuXG4vKipcbiAqICBNYW5hZ2VzIHRoZSBFbmVtaWVzXG4gKiAgQHR5cGUge0NsYXNzfVxuICovXG5leHBvcnQgY2xhc3MgRW5lbXlNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9IH0gPSB7fSkge1xuICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgdGhpcy56b21iaWVzID0gW107XG4gIH1cblxuICBhZGRab21iaWUgKCB7IHBsYXllciA9IHt9IH0gKSB7XG4gICAgY29uc3Qgem9tYmllID0gbmV3IFpvbWJpZSh7IGdhbWU6IHRoaXMuZ2FtZSwgc3BlZWQ6IDEsIHBsYXllciB9KTtcbiAgICB6b21iaWUuZGV0ZWN0b3IgPSBuZXcgWm9tYmllRGV0ZWN0b3IoIHsgZ2FtZTogdGhpcy5nYW1lLCB6b21iaWUgfSApO1xuICAgIHRoaXMuem9tYmllcy5wdXNoKCB6b21iaWUgKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFpvbWJpZSBkZXRlY3Rpb24gY29sbGlkZXJcbiAqL1xuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb2YgWm9tYmllIGRldGVjdGlvbiBjb2xsaWRlci5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmNvbnN0IGNvbmZpZyA9IHtcbiAgd2lkdGg6IDUwMCxcbiAgaGVpZ2h0OiAyNVxufTtcblxuLyoqXG4gKiBBZGQgc3ByaXRlIGZvciBkZXRlY3Rpb25cbiAqL1xuZXhwb3J0IGNsYXNzIFpvbWJpZURldGVjdG9yIHtcbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9LCB6b21iaWUgPSB7fSB9ID0ge30pIHtcbiAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgIHRoaXMuZGV0ZWN0aW9uVGltZXIgPSB0aGlzLmdhbWUudGltZS5ub3c7XG4gICAgdGhpcy56b21iaWUgPSB6b21iaWU7XG4gIH1cblxuICB1cGRhdGUgKCkge1xuXG4gICAgdGhpcy5nYW1lLmxheWVyTWFuYWdlci5sYXllcnMuZ2V0KCdwbGF5ZXJMYXllcicpLmZvckVhY2goIChwbGF5ZXIpID0+IHtcblxuICAgICAgbGV0IGxpbmUgPSAtMTgwO1xuICAgICAgbGV0IHJheTtcblxuICAgICAgd2hpbGUgKCBsaW5lIDwgOTAgKSB7XG4gICAgICAgIGlmICggdGhpcy56b21iaWUuZGlyZWN0aW9uID09PSAnbGVmdCcgKSB7XG4gICAgICAgICAgcmF5ID0gbmV3IFBoYXNlci5MaW5lKHRoaXMuem9tYmllLngsIHRoaXMuem9tYmllLnkgLSA3NSwgdGhpcy56b21iaWUueCAtIHRoaXMuem9tYmllLnBlcmNlcHRpb24sIHRoaXMuem9tYmllLnkgKyBsaW5lKTtcbiAgICAgICAgICB0aGlzLnpvbWJpZS5hbGVydGVkID0gdGhpcy5pbnRlcnNlY3Rpb25DaGVjayhyYXksIHBsYXllcikgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmF5ID0gbmV3IFBoYXNlci5MaW5lKHRoaXMuem9tYmllLngsIHRoaXMuem9tYmllLnkgLSA3NSwgdGhpcy56b21iaWUueCArIHRoaXMuem9tYmllLnBlcmNlcHRpb24sIHRoaXMuem9tYmllLnkgKyBsaW5lKTtcbiAgICAgICAgICB0aGlzLnpvbWJpZS5hbGVydGVkID0gdGhpcy5pbnRlcnNlY3Rpb25DaGVjayhyYXksIHBsYXllcikgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhpcy5nYW1lLmRlYnVnLmdlb20ocmF5KTtcbiAgICAgICAgbGluZSA9IGxpbmUgKyAxNTtcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gIH1cblxuICBpbnRlcnNlY3Rpb25DaGVjayAocmF5LCBwbGF5ZXIpIHtcbiAgICBsZXQgaW50ZXJzZWN0aW9uID0gZmFsc2U7XG4gICAgaWYgKCByYXkuaW50ZXJzZWN0cyhwbGF5ZXIuZGV0ZWN0aW9uQm91bmRzLnJpZ2h0KSB8fFxuICAgICAgICAgIHJheS5pbnRlcnNlY3RzKHBsYXllci5kZXRlY3Rpb25Cb3VuZHMubGVmdCkgfHxcbiAgICAgICAgICByYXkuaW50ZXJzZWN0cyhwbGF5ZXIuZGV0ZWN0aW9uQm91bmRzLnRvcCkgfHxcbiAgICAgICAgICByYXkuaW50ZXJzZWN0cyhwbGF5ZXIuZGV0ZWN0aW9uQm91bmRzLmJvdHRvbSkgKSB7XG4gICAgICB0aGlzLmRldGVjdGlvblRpbWVyID0gdGhpcy5nYW1lLnRpbWUubm93ICsgMzAwO1xuICAgICAgaW50ZXJzZWN0aW9uID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLmRldGVjdGlvblRpbWVyID4gdGhpcy5nYW1lLnRpbWUubm93ICkge1xuICAgICAgaW50ZXJzZWN0aW9uID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGludGVyc2VjdGlvbjtcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBTcGF3biB9IGZyb20gJy4uL3NlcnZpY2VzL3NwYXduJztcbmltcG9ydCB7IFpvbWJpZURldGVjdG9yIH0gZnJvbSAnLi96b21iaWUtZGV0ZWN0aW9uJztcblxuLyoqXG4gKiBTcGF3biBwb2ludCBjb29yZGluYXRlc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuY29uc3Qgc3Bhd24gPSBuZXcgU3Bhd24oKTtcblxuLyoqXG4gKiBab21iaWVcbiAqIEBjbGFzcyBab21iaWVcbiAqL1xuZXhwb3J0IGNsYXNzIFpvbWJpZSBleHRlbmRzIFBoYXNlci5TcHJpdGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGhlYWx0aCBDdXJyZW50IGhlYWx0aCBvZiB0aGUgem9tYmllXG4gICAqIEBwYXJhbSAge051bWJlcn0gbWF4SGVhbHRoIE1heGltdW0gcG9zc2libGUgaGVhbHRoIGZvciB0aGUgem9tYmllXG4gICAqIEBwYXJhbSAge051bWJlcn0gc3BlZWQgV2Fsa2luZyBzcGVlZCBmb3Igem9tYmllXG4gICAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gYWxlcnRlZCBUb2dnbGVzIHdoZXRoZXIgdGhlIHpvbWJpZSBtb3ZlcyB0b3dhcmQgdGhlIHBsYXllclxuICAgKi9cbiAgY29uc3RydWN0b3IgKHsgZ2FtZSA9IHt9LCBoZWFsdGggPSAxMDAsIG1heEhlYWx0aCA9IDEwMCwgc3BlZWQgPSAxMCwgcGxheWVyID0ge30sIHBlcmNlcHRpb24gPSAzMDAgfSA9IHt9KSB7XG4gICAgc3VwZXIoZ2FtZSwgc3Bhd24ubG9jYXRpb24ueCwgc3Bhd24ubG9jYXRpb24ueSwgJ3pvbWJpZScpO1xuXG4gICAgdGhpcy5oZWFsdGggPSBoZWFsdGg7XG4gICAgdGhpcy5tYXhIZWFsdGggPSBtYXhIZWFsdGg7XG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMuYWxlcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMucGVyY2VwdGlvbiA9IHBlcmNlcHRpb247XG4gICAgdGhpcy5kaXJlY3Rpb24gPSAnbGVmdCc7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBzY2FsZTogMVxuICAgIH07XG5cbiAgICB0aGlzLmRldGVjdG9yID0ge307XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHVwIHNwcml0ZSBib2R5IHNldHRpbmdzXG4gICAqL1xuICBib2R5U2V0dXAgKCkge1xuICAgIHRoaXMuYm9keS5maXhlZFJvdGF0aW9uID0gdHJ1ZTtcbiAgICB0aGlzLmJvZHkuZGFtcGluZyA9IDAuMjtcbiAgICB0aGlzLmJvZHkuY2xlYXJTaGFwZXMoKTtcbiAgICB0aGlzLmJvZHkubG9hZFBvbHlnb24oJ3pvbWJpZS1wb2x5Z29uJywgJ3pvbWJpZScpO1xuICB9XG5cbiAgICAvKipcbiAgICogUmVuZGVyIG9uIGNvbnN0cnVjdG9yIGluc3RhbnRpYXRpb25cbiAgICovXG4gIHJlbmRlciAoKSB7XG4gICAgdGhpcy5nYW1lLmFkZC5leGlzdGluZyh0aGlzKTtcbiAgICAvKipcbiAgICAgKiBQaGFzZXIgcHJvdmlkZXMgYSBtZXRob2QgdG8gcGxheSBhbGwgb2YgdGhlIGZyYW1lcyBpbiBhIHNlcmllcyBvZiBudW1iZXIgZnJhbWVzLiBJZiB0aGVyZSBhcmUgc2l4IGZyYW1lcyBvZiBcIlJ1blwiLFxuICAgICAqIG5hbWluZyB0aGVtIFJ1bjEsIFJ1bjIsIGV0YyB3aWxsIHJlc3VsdCBpbiBQaGFzZXIgcGxheWluZyB0aGUgZnVsbCBhbmltYXRpb24uXG4gICAgICogXG4gICAgICogUGhhc2VyLlNwcml0ZS5hbmltYXRpb25zLmFkZChuYW1lLCBnZW5lcmF0ZUZyYW1lTmFtZXMoZnJhbWVOYW1lUHJlZml4LCBzdGFydE51bWJlciwgZW5kTnVtYmVyKSwgc3BlZWQsIGxvb3ApXG4gICAgICogbmFtZSDigJQgTmFtZSB0byBnaXZlIHRoZSBhbmltYXRpb25cbiAgICAgKiBmcmFtZU5hbWVQcmVmaXgg4oCUIE5hbWUgb2YgZnJhbWUgaW4gYXRsYXMgd2l0aG91dCB0aGUgbnVtYmVyIChlLmcuIFJ1bjEgd291bGQgYmUgXCJydW5cIilcbiAgICAgKiBzdGFydE51bWJlciDigJQgU3RhcnRpbmcgZnJhbWUgbnVtYmVyIGluIGEgc2VyaWVzIG9mIG51bWJlcmVkIGZyYW1lIG5hbWVzIChlLmcuIFJ1bjEgd291bGQgYmUgXCIxXCIpXG4gICAgICogZW5kTnVtYmVyIOKAlCBFbmRpbmcgZnJhbWUgbnVtYmVyIGluIGEgc2VyaWVzIG9mIG51bWJlcmVkIGZyYW1lIG5hbWVzIChlLmcuIFJ1bjYgd291bGQgYmUgXCI2XCIpXG4gICAgICogc3BlZWQgLSBGcmFtZXJhdGUgZm9yIGFuaW1hdGlvblxuICAgICAqIGxvb3AgLSBJZiBmYWxzZSwgdGhlIGFuaW1hdGlubyBvbmx5IHBsYXlzIG9uY2VcbiAgICAgKi9cbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKCdzaGFtYmxlJywgUGhhc2VyLkFuaW1hdGlvbi5nZW5lcmF0ZUZyYW1lTmFtZXMoJ3NoYW1ibGUnLCAxLCAyKSwgMiwgdHJ1ZSk7XG4gICAgdGhpcy5hbmltYXRpb25zLmFkZCgnbHVuZ2UnLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcygnZGV2b3VyJywgMSwgNCksIDUsIGZhbHNlKTtcbiAgICB0aGlzLmFuaW1hdGlvbnMuYWRkKCdkZXZvdXInLCBQaGFzZXIuQW5pbWF0aW9uLmdlbmVyYXRlRnJhbWVOYW1lcygnZGV2b3VyJywgNSwgOSksIDUsIHRydWUpO1xuICAgIHRoaXMuc2NhbGUuc2V0VG8odGhpcy5jb25maWcuc2NhbGUsIHRoaXMuY29uZmlnLnNjYWxlKTtcbiAgICB0aGlzLmFuY2hvci5zZXRUbygwLjUsIDApO1xuICAgIHRoaXMuZ2FtZS5sYXllck1hbmFnZXIubGF5ZXJzLmdldCgnZW5lbXlMYXllcicpLmFkZCh0aGlzKTtcbiAgICB0aGlzLmdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcy5nYW1lLmxheWVyTWFuYWdlci5sYXllcnMuZ2V0KCdlbmVteUxheWVyJyksIGZhbHNlLCB0cnVlKTtcbiAgICB0aGlzLmJvZHlTZXR1cCgpO1xuXG4gICAgdGhpcy5nYW1lLmRlYnVnLmJvZHlJbmZvKHRoaXMsIDMyLCAzMik7XG4gIH1cblxuICAvKipcbiAgICogUGhhc2VyJ3MgZ2FtZSBsb29wXG4gICAqL1xuICB1cGRhdGUgKCkge1xuICAgIGlmICh0aGlzLmNvbnRhY3QgJiYgIXRoaXMuZGVhZCkge1xuICAgICAgdGhpcy5vblpvbWJpZUdyYWIoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmNvbnRhY3QpIHtcbiAgICAgIHRoaXMub25ab21iaWVQYXRyb2woKTtcbiAgICB9XG4gICAgLy8gUnVuIHdoZW4gem9tYmllIGJlZ2lucyBjb250YWN0IHdpdGggYSBzcHJpdGVcbiAgICB0aGlzLmJvZHkub25CZWdpbkNvbnRhY3QuYWRkKGNvbnRhY3QsIHRoaXMpO1xuICAgIGZ1bmN0aW9uIGNvbnRhY3QgKGJvZHkpIHtcbiAgICAgIGlmICggYm9keSApIHtcbiAgICAgICAgaWYgKGJvZHkuc3ByaXRlICYmIGJvZHkuc3ByaXRlLmtleSA9PT0gJ3BsYXllcicpIHtcbiAgICAgICAgICB0aGlzLmNvbnRhY3QgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb25ab21iaWVQYXRyb2wgKCkge1xuICAgIHRoaXMuZGV0ZWN0b3IudXBkYXRlKCk7XG4gICAgdGhpcy5zZXRQYXRyb2woKTtcbiAgICBpZiAoIHRoaXMuYWxlcnRlZCApIHtcbiAgICAgIHRoaXMucGVyY2VwdGlvbiA9IDQwMDtcbiAgICAgIHRoaXMuc3BlZWQgPSA2MDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wZXJjZXB0aW9uID0gMzAwO1xuICAgICAgdGhpcy5zcGVlZCA9IDEwO1xuICAgIH1cbiAgfVxuXG4gIG9uWm9tYmllR3JhYiAoKSB7XG4gICAgY29uc3QgZW5lbXlMYXllciA9IHRoaXMuZ2FtZS5sYXllck1hbmFnZXIubGF5ZXJzLmdldCgnZW5lbXlMYXllcicpO1xuICAgIHRoaXMuZ2FtZS53b3JsZC5icmluZ1RvVG9wKGVuZW15TGF5ZXIpO1xuICAgIHRoaXMuYW5pbWF0aW9ucy5wbGF5KCdsdW5nZScpO1xuICAgIHRoaXMuYW5pbWF0aW9ucy5jdXJyZW50QW5pbS5vbkNvbXBsZXRlLmFkZCgoKSA9PiB7XG4gICAgICAvLyBCcmluZyB6b21iaWUgdG8gdG9wIHNvIHdlIGNhbiBzZWUgaGltIGRldm91ciBQXG4gICAgICB0aGlzLmFuaW1hdGlvbnMucGxheSgnZGV2b3VyJyk7XG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5kZWFkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwYXJ0b2wgYmVoYXZpb3Igb2YgYSB6b21iaWVcbiAgICovXG4gIHNldFBhdHJvbCAoKSB7XG4gICAgaWYgKHRoaXMuYWxlcnRlZCkge1xuICAgICAgaWYgKHRoaXMueCA+IHRoaXMucGxheWVyLngpIHtcbiAgICAgICAgdGhpcy5zaGFtYmxlKHsgZGlyZWN0aW9uOiAnbGVmdCcgfSk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gJ2xlZnQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaGFtYmxlKHsgZGlyZWN0aW9uOiAncmlnaHQnIH0pO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9ICdyaWdodCc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5iZWhhdmlvckR1cmF0aW9uIHx8IHRoaXMuYmVoYXZpb3JEdXJhdGlvbiA8PSB0aGlzLmdhbWUudGltZS5ub3cpIHtcbiAgICAgICAgLy8gU2V0IGEgZHVyYXRpb24gZm9yIGEgbmV3IGJlaGF2aW9yXG4gICAgICAgIHRoaXMuYmVoYXZpb3JEdXJhdGlvbiA9IHRoaXMuZ2FtZS50aW1lLm5vdyArIDUwMDA7XG4gICAgICAgIC8vIFN0YW5kIHdoZW4gMCwgd2FsayB3aGVuIDFcbiAgICAgICAgdGhpcy5iZWhhdmlvciA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSk7XG4gICAgICAgIC8vIFdhbGsgbGVmdCB3aGVuIDAsIHdhbGsgcmlnaHQgd2hlbiAxXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKSA9PT0gMCA/ICdsZWZ0JyA6ICdyaWdodCc7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5iZWhhdmlvckR1cmF0aW9uID4gdGhpcy5nYW1lLnRpbWUubm93KSB7XG4gICAgICAgIGlmICh0aGlzLmJlaGF2aW9yID09PSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhbWJsZSh7IGRpcmVjdGlvbjogJ2xlZnQnIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNoYW1ibGUoeyBkaXJlY3Rpb246ICdyaWdodCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZnJhbWVOYW1lID0gJ2lkbGUnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgc2hhbWJsZSBhbmltYXRpb25zXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb24gRGlyZWN0aW9uIG9mIGFuaW1hdGlvbnNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkTW9kaWZpZXIgTXVsdGlwbGllciBvbiB6b21iaWUncyBkZWZhdWx0IHNwZWVkIGF0dHJpYnV0ZVxuICAgKi9cbiAgc2hhbWJsZSAoeyBkaXJlY3Rpb24gPSAnbGVmdCcsIHNwZWVkTW9kaWZpZXIgPSAxNSB9ID0ge30pIHtcbiAgICBjb25zdCB2ZWxvY2l0eSA9IGRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gLXRoaXMuc3BlZWQgOiB0aGlzLnNwZWVkO1xuICAgIGNvbnN0IHNjYWxlID0gZGlyZWN0aW9uID09PSAnbGVmdCcgPyAtdGhpcy5jb25maWcuc2NhbGUgOiB0aGlzLmNvbmZpZy5zY2FsZTtcbiAgICB0aGlzLmFuaW1hdGlvbnMucGxheSgnc2hhbWJsZScpO1xuICAgIHRoaXMuc2NhbGUueCA9IHNjYWxlO1xuICAgIHRoaXMuYm9keS52ZWxvY2l0eS54ID0gdmVsb2NpdHk7XG4gIH1cblxufVxuIl19
