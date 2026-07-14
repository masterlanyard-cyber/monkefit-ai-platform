import { createRepository } from '../storage/repository-factory.js';

const repository = createRepository('leads');

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
  const now = new Date().toISOString();
  const lead = {
    id: `LEAD-${Date.now()}`,
    status: 'new',
    assignedTo: 'Niken',
    ...input,
    ...scoreLead(input),
    createdAt: now,
    updatedAt: now
  };
  return repository.upsert(lead);
}

export function updateLead(id, patch = {}) {
  const current = repository.get(id);
  if (!current) return null;
  const nextInput = { ...current, ...patch };
  const next = {
    ...nextInput,
    ...scoreLead(nextInput),
    updatedAt: new Date().toISOString()
  };
  return repository.upsert(next);
}

export function getLead(id) {
  return repository.get(id);
}

export function listLeads() {
  return repository.list();
}

export function deleteLead(id) {
  return repository.remove(id);
}

export function getLeadStorageAdapter() {
  return repository.adapter;
}
