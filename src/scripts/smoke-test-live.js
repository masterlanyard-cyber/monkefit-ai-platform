const baseUrl = String(process.env.DEPLOY_URL || '').replace(/\/$/, '');
const apiKey = process.env.API_SECRET || '';

if (!baseUrl) {
  console.error('DEPLOY_URL is required, e.g. https://your-app.hostingersite.com');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  ...(apiKey ? { 'X-API-Key': apiKey } : {})
};

async function request(name, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }

  const passed = response.ok;
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name} [${response.status}]`);
  if (!passed) console.log(body);
  return { passed, status: response.status, body };
}

const results = [];
results.push(await request('root', '/'));
results.push(await request('health', '/api/health'));
results.push(await request('discovery', '/api/discovery', {
  method: 'POST',
  body: JSON.stringify({ city: 'Depok', businessType: 'personal_training', targetUsers: 20 })
}));
results.push(await request('recommendation', '/api/recommendation', {
  method: 'POST',
  body: JSON.stringify({
    usageType: 'semi_commercial',
    city: 'Depok',
    budget: 100000000,
    targetUsers: 20,
    roomSize: '6x12 m'
  })
}));

const leadResult = await request('create lead', '/api/leads', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Smoke Test',
    city: 'Depok',
    product: 'HUSSAR800RS',
    quantity: 1,
    budget: 100000000,
    timeline: '30 hari',
    requestQuotation: true
  })
});
results.push(leadResult);

const leadId = leadResult.body?.lead?.id;
if (leadId) {
  results.push(await request('get lead', `/api/leads/${encodeURIComponent(leadId)}`));
  results.push(await request('handover', '/api/lead/handover', {
    method: 'POST',
    body: JSON.stringify({ leadId })
  }));
}

results.push(await request('quotation', '/api/quotation', {
  method: 'POST',
  body: JSON.stringify({
    customerName: 'Smoke Test',
    city: 'Depok',
    items: [{ product: 'HUSSAR800RS', quantity: 1, unitPrice: 18490000 }]
  })
}));

if (process.env.TEST_CHAT === 'true') {
  results.push(await request('chat', '/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: `smoke-${Date.now()}`,
      message: 'Halo, saya ingin tahu tentang HUSSAR800RS untuk studio personal training.'
    })
  }));
}

const failed = results.filter((result) => !result.passed);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exit(failed.length ? 1 : 0);
