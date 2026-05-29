import { describe, it, expect } from 'vitest'
import {
  runUserCode,
  createCapturedConsole,
  serialize,
  SANDBOX_LIMITS,
} from '../src/challenges/sandboxWorkerCore.js'

function run(code) {
  const cap = createCapturedConsole()
  let error = null
  try {
    runUserCode(code, cap)
  } catch (e) {
    error = e
  }
  return { output: cap.getOutput(), error }
}

describe('runUserCode', () => {
  it('captures normal console output', () => {
    const { output, error } = run('console.log("hello", 1 + 1)')
    expect(error).toBeNull()
    expect(output).toBe('hello 2')
  })

  it('returns exceptions safely while preserving prior output', () => {
    const cap = createCapturedConsole()
    let threw = null
    try {
      runUserCode('console.log("before"); throw new Error("boom")', cap)
    } catch (e) {
      threw = e
    }
    expect(threw).not.toBeNull()
    expect(threw.message).toBe('boom')
    expect(cap.getOutput()).toBe('before')
  })

  it('cannot reach parent/DOM/network/storage identifiers', () => {
    const { output } = run(
      'console.log(typeof window, typeof document, typeof parent, typeof fetch, typeof XMLHttpRequest, typeof localStorage, typeof navigator)'
    )
    expect(output).toBe('undefined undefined undefined undefined undefined undefined undefined')
  })

  it('caps console output line count', () => {
    const { output } = run('for (let i = 0; i < 5000; i++) console.log(i)')
    expect(output).toContain('output truncated')
    expect(output.split('\n').length).toBeLessThanOrEqual(SANDBOX_LIMITS.maxLines + 1)
  })
})

describe('serialize', () => {
  it('handles circular references without throwing', () => {
    const a = {}
    a.self = a
    expect(serialize(a)).toContain('[Circular]')
  })

  it('caps nesting depth', () => {
    const deep = { a: { b: { c: { d: { e: { f: 1 } } } } } }
    expect(serialize(deep)).toContain('[Object]')
  })

  it('caps large arrays', () => {
    const big = Array.from({ length: 500 }, (_, i) => i)
    expect(serialize(big)).toContain('...')
  })
})
