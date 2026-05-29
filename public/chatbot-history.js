// chatbot-history.js
//
// Safe, validated handling of chat history that is read from localStorage and
// rendered into the sidebar. All values loaded from localStorage are treated as
// UNTRUSTED: they are validated, length-capped, and rendered via DOM APIs
// (createElement + textContent). There is no HTML string interpolation of user
// data anywhere in here, so a malicious chat title cannot execute script.
//
// This module is imported by public/chatbot.html and unit tested directly.

export const LIMITS = {
  MAX_CHATS: 100,
  MAX_ID: 64,
  MAX_TITLE: 80,
  MAX_MESSAGE: 4000,
  MAX_MESSAGES_PER_CHAT: 500,
};

export function clampString(value, max, fallback) {
  if (typeof value !== 'string') return fallback !== undefined ? fallback : '';
  return value.length > max ? value.slice(0, max) : value;
}

// Parse and validate the raw localStorage string into a safe chat map.
// Never throws; returns {} on any malformed / hostile input.
export function normalizeStoredChats(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return {};
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

  const out = {};
  let count = 0;
  for (const [rawId, chat] of Object.entries(parsed)) {
    if (count >= LIMITS.MAX_CHATS) break;
    if (!chat || typeof chat !== 'object' || Array.isArray(chat)) continue;

    const id = clampString(String(rawId), LIMITS.MAX_ID);
    if (!id) continue;

    const title = clampString(chat.title, LIMITS.MAX_TITLE, 'New Chat') || 'New Chat';
    const timestamp = Number.isFinite(chat.timestamp) ? chat.timestamp : Date.now();

    const messagesIn = Array.isArray(chat.messages) ? chat.messages : [];
    const messages = [];
    for (const m of messagesIn) {
      if (messages.length >= LIMITS.MAX_MESSAGES_PER_CHAT) break;
      if (!m || typeof m !== 'object') continue;
      messages.push({
        text: clampString(m.text, LIMITS.MAX_MESSAGE, ''),
        isUser: Boolean(m.isUser),
      });
    }

    out[id] = { title, timestamp, messages };
    count += 1;
  }
  return out;
}

export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function svgIcon(doc) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = doc.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'chat-icon');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  const path = doc.createElementNS(NS, 'path');
  path.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
  svg.appendChild(path);
  return svg;
}

// Build a chat-history list item entirely with DOM APIs. The untrusted title
// is assigned via textContent, so markup in the title renders as literal text.
// Returns { item, optionsBtn } so the caller can wire event listeners.
export function createChatItem(doc, { id, title, timestamp, active }) {
  const item = doc.createElement('div');
  item.className = 'chat-item' + (active ? ' active' : '');
  item.dataset.id = id;

  item.appendChild(svgIcon(doc));

  const textWrap = doc.createElement('div');
  textWrap.style.flex = '1';

  const titleEl = doc.createElement('div');
  titleEl.className = 'title';
  titleEl.textContent = clampString(title, LIMITS.MAX_TITLE, 'New Chat') || 'New Chat';

  const tsEl = doc.createElement('div');
  tsEl.className = 'timestamp';
  tsEl.textContent = formatTimestamp(timestamp);

  textWrap.appendChild(titleEl);
  textWrap.appendChild(tsEl);
  item.appendChild(textWrap);

  const optionsBtn = doc.createElement('button');
  optionsBtn.className = 'chat-options-btn';
  optionsBtn.dataset.id = id;
  optionsBtn.title = 'Options';
  optionsBtn.textContent = '⋮';
  item.appendChild(optionsBtn);

  return { item, optionsBtn };
}
