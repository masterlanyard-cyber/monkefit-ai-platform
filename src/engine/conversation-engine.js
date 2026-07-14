const sessions = new Map();

export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      stage: 'discovery',
      persona: null,
      customerGoal: null,
      known: {},
      recommendedProduct: null,
      messages: [],
      updatedAt: new Date().toISOString()
    });
  }
  return sessions.get(sessionId);
}

export function updateSession(sessionId, patch = {}) {
  const current = getSession(sessionId);
  const next = {
    ...current,
    ...patch,
    known: { ...current.known, ...(patch.known || {}) },
    updatedAt: new Date().toISOString()
  };
  sessions.set(sessionId, next);
  return next;
}

export function appendMessage(sessionId, role, content) {
  const session = getSession(sessionId);
  session.messages.push({ role, content, at: new Date().toISOString() });
  if (session.messages.length > 30) session.messages = session.messages.slice(-30);
  session.updatedAt = new Date().toISOString();
  return session;
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
