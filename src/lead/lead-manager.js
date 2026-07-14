const leads = new Map();

export function scoreLead(input = {}) {
  let score = 0;
  const reasons = [];
  const add = (condition, points, reason) => {
    if (condition) {
      score += points;
      reasons.push(reason);
    }
  };

  add(Boolean(input.city), 10, 'Lokasi diketahui');
  add(Boolean(input.budget), 15, 'Budget diketahui');
  add(Boolean(input.product), 10, 'Produk diminati diketahui');
  add(Number(input.quantity) > 0, 15, 'Jumlah unit diketahui');
  add(Boolean(input.timeline), 15, 'Timeline pembelian diketahui');
  add(Boolean(input.requestQuotation), 20, 'Meminta quotation');
  add(Boolean(input.readyToBuy), 25, 'Siap membeli');
  add(Number(input.quantity) > 1 || Boolean(input.companyName), 15, 'Lead proyek atau multi-unit');

  score = Math.max(0, Math.min(100, score));
  const category = score >= 81 ? 'priority' : score >= 61 ? 'hot' : score >= 31 ? 'warm' : 'cold';
  return { score, category, reasons };
}

export function createLead(input = {}) {
  const id = `LEAD-${Date.now()}`;
  const scoring = scoreLead(input);
  const lead = {
    id,
    status: 'new',
    assignedTo: 'Niken',
    ...input,
    ...scoring,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  leads.set(id, lead);
  return lead;
}

export function updateLead(id, patch = {}) {
  const current = leads.get(id);
  if (!current) return null;
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  leads.set(id, next);
  return next;
}

export function getLead(id) {
  return leads.get(id) || null;
}

export function listLeads() {
  return [...leads.values()];
}
