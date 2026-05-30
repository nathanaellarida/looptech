// sandboxWorkerCore.js
//
// The pure execution core for the isolated code runner. These functions are
// the single source of truth: they are unit tested directly, AND their source
// is serialized (via Function.prototype.toString) into the Web Worker that runs
// inside the sandboxed opaque-origin iframe (see sandboxRunner.js).
//
// IMPORTANT: every function here must be self-contained. It may only reference
// its own parameters, other functions defined in this file (which are also
// injected into the worker by name), and SANDBOX_LIMITS. No closures over
// module scope, no imports — otherwise the .toString() serialization breaks.

export const SANDBOX_LIMITS = {
  maxLines: 1000,
  maxChars: 100000,
  maxDepth: 5,
  maxArrayItems: 100,
  maxObjectKeys: 100,
  timeoutMs: 2000,
};

// Depth- and size-bounded serialization so a hostile program cannot blow up
// memory with deeply nested or circular structures.
export function serialize(value, limits, depth, seen) {
  limits = limits || SANDBOX_LIMITS;
  depth = depth || 0;
  seen = seen || [];
  var maxDepth = limits.maxDepth;
  if (value === null) return 'null';
  var t = typeof value;
  if (t === 'string') return value;
  if (t === 'number' || t === 'boolean' || t === 'undefined') return String(value);
  if (t === 'bigint') return value.toString() + 'n';
  if (t === 'function') return '[Function]';
  if (t === 'symbol') return value.toString();
  if (t === 'object') {
    if (seen.indexOf(value) !== -1) return '[Circular]';
    if (depth >= maxDepth) return Array.isArray(value) ? '[Array]' : '[Object]';
    var nextSeen = seen.concat([value]);
    if (Array.isArray(value)) {
      var items = value.slice(0, limits.maxArrayItems).map(function (v) {
        return serialize(v, limits, depth + 1, nextSeen);
      });
      if (value.length > limits.maxArrayItems) items.push('...');
      return '[' + items.join(', ') + ']';
    }
    try {
      var keys = Object.keys(value).slice(0, limits.maxObjectKeys);
      var parts = keys.map(function (k) {
        return k + ': ' + serialize(value[k], limits, depth + 1, nextSeen);
      });
      return '{' + parts.join(', ') + '}';
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}

// A console replacement that captures output with hard caps on line count and
// total character count.
export function createCapturedConsole(limits) {
  limits = limits || SANDBOX_LIMITS;
  var lines = [];
  var truncated = false;
  var totalChars = 0;
  function push(prefix, args) {
    if (truncated || lines.length >= limits.maxLines) {
      truncated = true;
      return;
    }
    var text = Array.prototype.map
      .call(args, function (a) { return serialize(a, limits); })
      .join(' ');
    if (prefix) text = prefix + text;
    if (totalChars + text.length > limits.maxChars) {
      truncated = true;
      return;
    }
    totalChars += text.length;
    lines.push(text);
  }
  return {
    console: {
      log: function () { push('', arguments); },
      info: function () { push('', arguments); },
      warn: function () { push('', arguments); },
      debug: function () { push('', arguments); },
      error: function () { push('Error: ', arguments); },
    },
    getOutput: function () {
      var out = lines.join('\n');
      if (truncated) out += (out ? '\n' : '') + '... (output truncated)';
      return out;
    },
  };
}

// Execute untrusted code with ambient/dangerous identifiers shadowed to
// undefined. The authoritative isolation is the Worker + sandboxed iframe
// boundary; this shadowing is defense-in-depth so common escape identifiers
// are not even in scope. Using Function() here is safe: it only ever runs
// inside the isolated worker, never on the application origin.
export function runUserCode(code, captured) {
  // Note: 'eval' / 'arguments' are intentionally NOT shadowed here because
  // they are illegal parameter names under "use strict". The authoritative
  // isolation is the Worker + sandboxed-iframe boundary, not this list.
  var shadowed = [
    'self', 'globalThis', 'window', 'document', 'parent', 'top', 'frames',
    'fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts',
    'localStorage', 'sessionStorage', 'indexedDB', 'navigator', 'location',
    'postMessage',
  ];
  var params = ['console'].concat(shadowed);
  var body = '"use strict";\n' + String(code);
  var fn = Function.apply(null, params.concat([body]));
  var args = [captured.console].concat(shadowed.map(function () { return undefined; }));
  fn.apply(undefined, args);
}
