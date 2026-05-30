import { describe, it, expect } from 'vitest'
import {
  createRoomId,
  isValidRoomId,
  buildInviteUrl,
  getSignalingUrl,
  getYjsSignaling,
} from '../src/challenges/collab.js'

describe('createRoomId', () => {
  it('is 128-bit, URL-safe, valid, and unique', () => {
    const id = createRoomId()
    expect(id).toMatch(/^[a-f0-9]{32}$/) // 16 bytes = 128 bits
    expect(isValidRoomId(id)).toBe(true)
    expect(createRoomId()).not.toBe(createRoomId())
  })
})

describe('isValidRoomId', () => {
  it('accepts well-formed ids and rejects hostile ones', () => {
    expect(isValidRoomId('abcd1234')).toBe(true)
    expect(isValidRoomId('short')).toBe(false)
    expect(isValidRoomId('bad room!')).toBe(false)
    expect(isValidRoomId('../../etc/passwd')).toBe(false)
    expect(isValidRoomId('<script>')).toBe(false)
    expect(isValidRoomId(123)).toBe(false)
    expect(isValidRoomId(null)).toBe(false)
  })
})

describe('buildInviteUrl', () => {
  it('URL-encodes the room parameter', () => {
    const url = buildInviteUrl('abc 123&x')
    expect(url).toContain('room=abc+123%26x')
  })
})

describe('getSignalingUrl', () => {
  it('produces a ws/wss URL with the /ws path', () => {
    const u = getSignalingUrl()
    expect(u).toMatch(/^wss?:\/\//)
    expect(u).toContain('/ws')
  })
})

describe('getYjsSignaling', () => {
  it('returns a non-empty, explicit signaling list', () => {
    const s = getYjsSignaling()
    expect(Array.isArray(s)).toBe(true)
    expect(s.length).toBeGreaterThan(0)
  })
})
