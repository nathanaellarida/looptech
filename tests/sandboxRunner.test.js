import { describe, it, expect, vi } from 'vitest'
import {
  isValidRunnerMessage,
  capText,
  buildWorkerSource,
  createSandboxFrame,
  runWithTransport,
  secureNonce,
} from '../src/challenges/sandboxRunner.js'

function makeTransport() {
  let cb = () => {}
  return {
    send: vi.fn(),
    onMessage: (fn) => { cb = fn },
    reset: vi.fn(),
    emit: (data) => cb(data),
  }
}

describe('isValidRunnerMessage (source/shape/nonce validation)', () => {
  it('accepts a valid result with the matching nonce', () => {
    expect(isValidRunnerMessage({ type: 'result', nonce: 'n', output: '' }, 'n')).toBe(true)
  })
  it('rejects wrong nonce, unknown type, and non-objects', () => {
    expect(isValidRunnerMessage({ type: 'result', nonce: 'x' }, 'n')).toBe(false)
    expect(isValidRunnerMessage({ type: 'evil', nonce: 'n' }, 'n')).toBe(false)
    expect(isValidRunnerMessage(null, 'n')).toBe(false)
    expect(isValidRunnerMessage('str', 'n')).toBe(false)
    expect(isValidRunnerMessage({ nonce: 'n' }, 'n')).toBe(false)
  })
})

describe('capText', () => {
  it('truncates strings past the limit', () => {
    expect(capText('abcdef', 3)).toBe('abc\n... (output truncated)')
    expect(capText('ab', 3)).toBe('ab')
    expect(capText(42, 3)).toBe('')
  })
})

describe('buildWorkerSource', () => {
  it('neuters network globals and includes the tested core', () => {
    const s = buildWorkerSource()
    expect(s).toContain('self.fetch = undefined')
    expect(s).toContain('self.XMLHttpRequest = undefined')
    expect(s).toContain('self.WebSocket = undefined')
    expect(s).toContain('runUserCode')
  })
})

describe('createSandboxFrame', () => {
  it('is opaque-origin: allow-scripts WITHOUT allow-same-origin, restrictive CSP', () => {
    const f = createSandboxFrame(document)
    const sandbox = f.getAttribute('sandbox')
    expect(sandbox).toContain('allow-scripts')
    expect(sandbox).not.toContain('allow-same-origin')
    expect(f.srcdoc).toContain("default-src 'none'")
    expect(f.srcdoc).toContain("connect-src 'none'")
  })
})

describe('runWithTransport', () => {
  it('resolves normal output on a valid result message', async () => {
    const t = makeTransport()
    const p = runWithTransport(t, 'console.log(1)', { nonce: 'n1', timeoutMs: 1000 })
    t.emit({ type: 'result', nonce: 'n1', output: 'hi', error: null })
    await expect(p).resolves.toEqual({ output: 'hi', error: null, timedOut: false })
    expect(t.send).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'run', nonce: 'n1', code: 'console.log(1)' })
    )
  })

  it('ignores spoofed wrong-nonce messages and resolves on the real one', async () => {
    const t = makeTransport()
    const p = runWithTransport(t, 'code', { nonce: 'good', timeoutMs: 1000 })
    t.emit({ type: 'result', nonce: 'evil', output: 'attacker' })
    t.emit({ type: 'result', nonce: 'good', output: 'real' })
    const r = await p
    expect(r.output).toBe('real')
  })

  it('returns error safely when the sandbox reports one', async () => {
    const t = makeTransport()
    const p = runWithTransport(t, 'throw 1', { nonce: 'n', timeoutMs: 1000 })
    t.emit({ type: 'result', nonce: 'n', output: 'partial', error: 'boom' })
    await expect(p).resolves.toEqual({ output: 'partial', error: 'boom', timedOut: false })
  })

  it('times out and tears down the sandbox on an infinite loop', async () => {
    vi.useFakeTimers()
    const t = makeTransport()
    const p = runWithTransport(t, 'while(true){}', { nonce: 'n', timeoutMs: 100 })
    await vi.advanceTimersByTimeAsync(700)
    const r = await p
    expect(r.timedOut).toBe(true)
    expect(t.reset).toHaveBeenCalled()
    vi.useRealTimers()
  })
})

describe('secureNonce', () => {
  it('produces 128 bits of hex entropy', () => {
    expect(secureNonce()).toMatch(/^[0-9a-f]{32}$/)
    expect(secureNonce()).not.toBe(secureNonce())
  })
})
