import { createRepository } from '../storage/repository-factory.js';

const repository = createRepository('sessions');

function normalizeSession(session) {
  if (!session) return null;
  return { ...session, id: session.id || session.sessionId };
}

export function getSession(sessionId) {
  const existing = repository.get(sessionId);
  if (existing) return normalizeSession(existing);

  const now = new Date().toISOString();
  const session = {
    id: sessionId,
    sessionId,
    stage: 'discovery',
    persona: null,
    customerGoal: null,
    known: {},
    recommendedProduct: null,
    messages: [],
    createdAt: now,
    updatedAt: now
  };
  repository.upsert(session);
  return session;
}

export function updateSession(sessionId, patch = {}) {
  const current = getSession(sessionId);
  const next = {
    ...current,
    ...patch,
    id: sessionId,
    sessionId,
    known: { ...current.known, ...(patch.known || {}) },
    updatedAt: new Date().toISOString()
  };
  return repository.upsert(next);
}

export function appendMessage(sessionId, role, content) {
  const current = getSession(sessionId);
  const messages = [...(current.messages || []), { role, content, at: new Date().toISOString() }].slice(-30);
  return repository.upsert({
    ...current,
    id: sessionId,
    sessionId,
    messages,
    updatedAt: new Date().toISOString()
  });
}

export function deleteSession(sessionId) {
  return repository.remove(sessionId);
}

export function getSessionStorageAdapter() {
  return repository.adapter;
}

export function detectContext(message, session) {
  const text = message.toLowerCase();
  const known = { ...session.known };

  if (text.includes('depok')) known.city = 'Depok';
  if (text.includes('bandung')) known.city = 'Bandung';
  if (text.includes('medan')) known.city = 'Medan';
  if (text.includes('surabaya')) known.city = 'Surabaya';
  if (text.includes('yogyakarta') || text.includes('jogja')) known.city = 'Yogyakarta';

  let persona = session.persona;
  let recommendedProduct = session.recommendedProduct;
  if (text.includes('rumah') || text.includes('personal use')) {
    persona = 'HOME_USER'; recommendedProduct = 'HUSSAR300RS';
  } else if (text.includes('personal training') || text.includes('studio kecil') || text.includes('semi komersial')) {
    persona = 'PERSONAL_TRAINING_STUDIO'; recommendedProduct = 'HUSSAR800RS';
  } else if (text.includes('gym komersial') || text.includes('commercial gym')) {
    persona = 'COMMERCIAL_GYM'; recommendedProduct = 'HUSSAR1000RS';
  }

  return { known, persona, recommendedProduct };
}
