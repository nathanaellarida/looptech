import { describe, it, expect } from 'vitest'
import {
  normalizeStoredChats,
  createChatItem,
  LIMITS,
} from '../public/chatbot-history.js'

describe('normalizeStoredChats (untrusted localStorage parsing)', () => {
  it('returns {} for malformed / hostile input', () => {
    expect(normalizeStoredChats('not json')).toEqual({})
    expect(normalizeStoredChats(null)).toEqual({})
    expect(normalizeStoredChats('')).toEqual({})
    expect(normalizeStoredChats('[]')).toEqual({})
    expect(normalizeStoredChats('123')).toEqual({})
    expect(normalizeStoredChats('"a string"')).toEqual({})
  })

  it('coerces types and caps title/message/collection lengths', () => {
    const raw = JSON.stringify({
      a: {
        title: 'x'.repeat(500),
        timestamp: 5,
        messages: [
          { text: 'y'.repeat(9000), isUser: 1 },
          'not-an-object',
          null,
          { text: 'ok', isUser: false },
        ],
      },
    })
    const out = normalizeStoredChats(raw)
    expect(out.a.title).toHaveLength(LIMITS.MAX_TITLE)
    expect(out.a.messages).toHaveLength(2)
    expect(out.a.messages[0].text).toHaveLength(LIMITS.MAX_MESSAGE)
    expect(out.a.messages[0].isUser).toBe(true)
    expect(out.a.messages[1]).toEqual({ text: 'ok', isUser: false })
  })

  it('drops non-object chat entries', () => {
    expect(normalizeStoredChats(JSON.stringify({ a: 5, b: 'x', c: [] }))).toEqual({})
  })
})

describe('createChatItem stored-XSS regression', () => {
  const payloads = [
    '<img src=x onerror="window.__pwned = 1">',
    '</div><scr' + 'ipt>window.__pwned = 1</scr' + 'ipt>',
    '<svg/onload=alert(1)>',
    '"><iframe src=javascript:alert(1)>',
  ]

  for (const payload of payloads) {
    it('renders a malicious title as inert text: ' + payload.slice(0, 24), () => {
      delete window.__pwned
      const { item } = createChatItem(document, {
        id: '1',
        title: payload,
        timestamp: Date.now(),
        active: false,
      })

      const titleEl = item.querySelector('.title')
      // The payload is preserved verbatim as TEXT (not parsed into markup).
      expect(titleEl.textContent).toBe(payload)
      // No element nodes were injected from the payload.
      expect(item.querySelector('img')).toBeNull()
      expect(item.querySelector('script')).toBeNull()
      expect(item.querySelector('iframe')).toBeNull()
      expect(item.querySelector('svg[onload]')).toBeNull()

      // Attaching to the live DOM must not execute anything.
      document.body.appendChild(item)
      expect(window.__pwned).toBeUndefined()
      item.remove()
    })
  }
})
