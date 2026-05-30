// sandboxRunner.js
//
// One reusable, isolated code runner shared by CodingSolo, CodingCompete and
// CodingCollab. The application origin no longer calls new Function / eval.
//
// Isolation model:
//   - Code runs inside a sandboxed, opaque-origin iframe (sandbox="allow-scripts",
//     NO allow-same-origin) carrying a restrictive CSP (default-src 'none';
//     connect-src 'none'), so it cannot reach the parent DOM/window, cookies,
//     localStorage, the app's JS objects, camera/microphone, or the network.
//   - Inside that iframe the code runs in a Web Worker, so an infinite loop can
//     be terminated (worker.terminate()) without freezing the app.
//   - Messages are validated by source (must be the iframe/parent) and by a
//     per-run nonce, and the executed program only ever sees a captured console.

import {
  SANDBOX_LIMITS,
  serialize,
  createCapturedConsole,
  runUserCode,
} from './sandboxWorkerCore.js';

// --- pure, unit-tested helpers -------------------------------------------------

export function secureNonce() {
  var bytes = new Uint8Array(16);
  var c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes);
  } else {
    // Extremely unlikely fallback; nonce is a message tag, not a secret.
    for (var i = 0; i < bytes.length; i++) bytes[i] = (i * 131 + 7) & 0xff;
  }
  var hex = '';
  for (var j = 0; j < bytes.length; j++) hex += ('0' + bytes[j].toString(16)).slice(-2);
  return hex;
}

export function isValidRunnerMessage(data, expectedNonce) {
  return (
    !!data &&
    typeof data === 'object' &&
    typeof data.nonce === 'string' &&
    data.nonce === expectedNonce &&
    (data.type === 'result' || data.type === 'timeout' || data.type === 'error')
  );
}

export function capText(str, max) {
  if (typeof str !== 'string') return '';
  max = max || SANDBOX_LIMITS.maxChars;
  return str.length > max ? str.slice(0, max) + '\n... (output truncated)' : str;
}

// The worker source is generated from the tested core so there is a single
// source of truth for execution semantics.
export function buildWorkerSource() {
  return [
    'var SANDBOX_LIMITS = ' + JSON.stringify(SANDBOX_LIMITS) + ';',
    'var serialize = ' + serialize.toString() + ';',
    'var createCapturedConsole = ' + createCapturedConsole.toString() + ';',
    'var runUserCode = ' + runUserCode.toString() + ';',
    // Neuter network/ambient globals at the worker scope (defense in depth on
    // top of the iframe CSP connect-src none).
    'try { self.fetch = undefined; self.XMLHttpRequest = undefined;',
    '      self.WebSocket = undefined; self.importScripts = undefined; } catch (e) {}',
    'self.onmessage = function (e) {',
    '  var d = e.data || {};',
    '  if (d.type !== "run") return;',
    '  var cap = createCapturedConsole(SANDBOX_LIMITS);',
    '  try {',
    '    runUserCode(String(d.code || ""), cap);',
    '    self.postMessage({ output: cap.getOutput(), error: null });',
    '  } catch (err) {',
    '    self.postMessage({ output: cap.getOutput(), error: String(err && err.message ? err.message : err) });',
    '  }',
    '};',
  ].join('\n');
}

export function buildSandboxSrcdoc() {
  var workerSrc = JSON.stringify(buildWorkerSource());
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; ',
    "script-src 'unsafe-inline' blob:; worker-src blob:; connect-src 'none'; ",
    "style-src 'none'; img-src 'none'; base-uri 'none'; form-action 'none'\">",
    '</head><body><script>(function () {',
    '  var WORKER_SRC = ' + workerSrc + ';',
    '  window.addEventListener("message", function (e) {',
    '    if (e.source !== window.parent) return;',
    '    var d = e.data || {};',
    '    if (d.type !== "run" || typeof d.code !== "string" || typeof d.nonce !== "string") return;',
    '    var nonce = d.nonce;',
    '    var timeoutMs = typeof d.timeoutMs === "number" ? d.timeoutMs : ' + SANDBOX_LIMITS.timeoutMs + ';',
    '    var worker = null, timer = null, finished = false;',
    '    function finish(payload) {',
    '      if (finished) return; finished = true;',
    '      if (timer) clearTimeout(timer);',
    '      try { if (worker) worker.terminate(); } catch (err) {}',
    '      payload.nonce = nonce;',
    '      parent.postMessage(payload, "*");',
    '    }',
    '    try {',
    '      var blob = new Blob([WORKER_SRC], { type: "application/javascript" });',
    '      worker = new Worker(URL.createObjectURL(blob));',
    '      worker.onmessage = function (ev) {',
    '        var r = ev.data || {};',
    '        finish({ type: "result", output: String(r.output || ""), error: r.error ? String(r.error) : null });',
    '      };',
    '      worker.onerror = function () { finish({ type: "error", output: "", error: "Execution error" }); };',
    '      timer = setTimeout(function () { finish({ type: "timeout", output: "" }); }, timeoutMs);',
    '      worker.postMessage({ type: "run", code: d.code });',
    '    } catch (err) { finish({ type: "error", output: "", error: "Sandbox unavailable" }); }',
    '  });',
    '})();</scr' + 'ipt></body></html>',
  ].join('');
}

// Creates the sandboxed iframe element. Exported so tests can assert the
// isolation-critical attributes (allow-scripts WITHOUT allow-same-origin).
export function createSandboxFrame(doc) {
  var frame = doc.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.display = 'none';
  frame.srcdoc = buildSandboxSrcdoc();
  return frame;
}

// --- transport-driven runner (unit-tested with a fake transport) ---------------

export function runWithTransport(transport, code, opts) {
  opts = opts || {};
  var timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : SANDBOX_LIMITS.timeoutMs;
  var nonce = opts.nonce || secureNonce();
  return new Promise(function (resolve) {
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      if (transport.reset) transport.reset();
      resolve({ output: '', error: null, timedOut: true });
    }, timeoutMs + 500);

    transport.onMessage(function (data) {
      if (done) return;
      if (!isValidRunnerMessage(data, nonce)) return; // wrong source/nonce/type ignored
      done = true;
      clearTimeout(timer);
      if (transport.reset) transport.reset();
      if (data.type === 'timeout') {
        resolve({ output: capText(data.output || ''), error: null, timedOut: true });
      } else {
        resolve({
          output: capText(data.output || ''),
          error: data.error ? String(data.error) : null,
          timedOut: false,
        });
      }
    });

    transport.send({ type: 'run', nonce: nonce, code: String(code == null ? '' : code), timeoutMs: timeoutMs });
  });
}

function browserTransport() {
  var frame = createSandboxFrame(document);
  document.body.appendChild(frame);
  var loaded = false;
  var queue = [];
  var listeners = [];
  frame.addEventListener('load', function () {
    loaded = true;
    queue.splice(0).forEach(function (m) { frame.contentWindow.postMessage(m, '*'); });
  });
  function handle(e) {
    if (e.source !== frame.contentWindow) return; // source validation
    listeners.forEach(function (cb) { cb(e.data); });
  }
  window.addEventListener('message', handle);
  return {
    send: function (msg) {
      if (loaded && frame.contentWindow) frame.contentWindow.postMessage(msg, '*');
      else queue.push(msg);
    },
    onMessage: function (cb) { listeners.push(cb); },
    reset: function () {
      window.removeEventListener('message', handle);
      try { frame.remove(); } catch { /* noop */ } // removing the frame terminates the worker
    },
  };
}

// Public API used by the three coding modes. Each run uses a fresh isolated
// iframe so infinite loops are always reclaimed.
export function runInSandbox(code, opts) {
  if (typeof document === 'undefined' || typeof Worker === 'undefined') {
    return Promise.resolve({
      output: '',
      error: 'Code execution is not supported in this environment.',
      timedOut: false,
    });
  }
  return runWithTransport(browserTransport(), code, opts);
}
