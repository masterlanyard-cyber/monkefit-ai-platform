import test from 'node:test';
import assert from 'node:assert/strict';
import { getDiscoveryStatus } from '../discovery/discovery-engine.js';
import { recommendEquipment } from '../recommendation/recommendation-engine.js';
import { scoreLead, createLead } from '../lead/lead-manager.js';
import { buildQuotation } from '../quotation/quotation-builder.js';
import { buildHandoverPayload } from '../handover/handover-engine.js';


test('PT studio recommends HUSSAR800RS', () => {
  const result = recommendEquipment({ usageType: 'semi_commercial', targetUsers: 20 });
  assert.equal(result.primary, 'HUSSAR800RS');
});

test('discovery reports missing PT studio fields', () => {
  const result = getDiscoveryStatus({ usageType: 'semi_commercial', city: 'Depok' });
  assert.equal(result.goal, 'pt_studio');
  assert.equal(result.complete, false);
  assert.ok(result.missing.includes('budget'));
});

test('ready project lead scores as priority', () => {
  const result = scoreLead({
    city: 'Depok',
    budget: 100000000,
    product: 'HUSSAR800RS',
    quantity: 2,
    timeline: 'bulan ini',
    requestQuotation: true,
    readyToBuy: true,
    companyName: 'PT Test'
  });
  assert.equal(result.score, 100);
  assert.equal(result.category, 'priority');
});

test('quotation uses approved public price', () => {
  const quotation = buildQuotation({ items: [{ product: 'HUSSAR800RS', quantity: 2 }] });
  assert.equal(quotation.subtotal, 36980000);
  assert.equal(quotation.status, 'draft_for_niken_review');
});

test('handover is assigned to Niken', () => {
  const lead = createLead({ city: 'Depok', product: 'HUSSAR800RS', quantity: 1 });
  const payload = buildHandoverPayload(lead);
  assert.equal(payload.assignedTo, 'Niken');
  assert.equal(payload.opportunity.product, 'HUSSAR800RS');
});
