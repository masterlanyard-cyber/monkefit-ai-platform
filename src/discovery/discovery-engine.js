const REQUIRED_BY_GOAL = {
  home_fitness: ['city', 'budget', 'targetUsers'],
  pt_studio: ['city', 'budget', 'roomSize', 'targetUsers', 'timeline'],
  commercial_gym: ['city', 'budget', 'roomSize', 'targetUsers', 'quantity', 'timeline'],
  project: ['city', 'companyName', 'quantity', 'timeline']
};

const QUESTIONS = {
  city: 'Lokasinya berada di kota mana?',
  budget: 'Kisaran budget yang sedang dipertimbangkan berapa?',
  roomSize: 'Berapa perkiraan ukuran ruangannya?',
  targetUsers: 'Berapa target pengguna atau member yang akan dilayani?',
  quantity: 'Berapa unit yang dibutuhkan?',
  timeline: 'Kapan rencana pembelian atau pembukaannya?',
  companyName: 'Boleh diinformasikan nama perusahaannya?'
};

export function inferGoal(profile = {}) {
  if (profile.companyName || profile.usageType === 'project') return 'project';
  if (profile.usageType === 'commercial') return 'commercial_gym';
  if (profile.usageType === 'semi_commercial') return 'pt_studio';
  return 'home_fitness';
}

export function getDiscoveryStatus(profile = {}) {
  const goal = inferGoal(profile);
  const required = REQUIRED_BY_GOAL[goal] || [];
  const missing = required.filter((field) => profile[field] === undefined || profile[field] === null || profile[field] === '');
  return {
    goal,
    complete: missing.length === 0,
    missing,
    nextQuestions: missing.slice(0, 3).map((field) => ({ field, question: QUESTIONS[field] }))
  };
}
