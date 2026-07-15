import express from 'express';

process.on('uncaughtException', (error) => console.error('uncaughtException:', error));
process.on('unhandledRejection', (error) => console.error('unhandledRejection:', error));

const app = express();
const startedAt = new Date().toISOString();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

function applyCors(req, res) {
  const configured = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const origin = req.headers.origin;
  if (origin && (configured.length === 0 || configured.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
}

app.use((req, res, next) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
});

app.use((req, res, next) => {
  const authEnabled = String(process.env.API_AUTH_ENABLED || 'false').toLowerCase() === 'true';
  if (!authEnabled) return next();

  const publicPaths = new Set(['/', '/api/health', '/api/ping']);
  const secret = process.env.API_SECRET;
  if (!secret || publicPaths.has(req.path)) return next();
  if (req.header('X-API-Key') !== secret) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return next();
});

app.get('/', (_req, res) => {
  return res.status(200).json({
    success: true,
    service: 'monkefit-ai-platform',
    version: '2.1.1-live',
    status: 'running',
    startedAt,
    health: '/api/health'
  });
});

app.get('/api/ping', (_req, res) => {
  return res.status(200).json({ success: true, pong: true, timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  const authEnabled = String(process.env.API_AUTH_ENABLED || 'false').toLowerCase() === 'true';
  return res.status(200).json({
    success: true,
    service: 'monkefit-ai-platform',
    version: '2.1.1-live',
    runtime: {
      node: process.version,
      host,
      port,
      uptimeSeconds: Math.round(process.uptime())
    },
    configuration: {
      openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
      apiProtected: authEnabled && Boolean(process.env.API_SECRET),
      apiAuthEnabled: authEnabled,
      storageAdapter: process.env.STORAGE_ADAPTER || 'memory'
    },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/discovery', async (req, res) => {
  try {
    const { getDiscoveryStatus } = await import('./discovery/discovery-engine.js');
    return res.json({ success: true, discovery: getDiscoveryStatus(req.body || {}) });
  } catch (error) {
    console.error('discovery route error:', error);
    return res.status(500).json({ success: false, error: 'Discovery engine unavailable' });
  }
});

app.post('/api/recommendation', async (req, res) => {
  try {
    const { getDiscoveryStatus } = await import('./discovery/discovery-engine.js');
    const { recommendEquipment } = await import('./recommendation/recommendation-engine.js');
    const input = req.body || {};
    if (!['personal', 'semi_commercial', 'commercial'].includes(input.usageType)) {
      return res.status(400).json({ success: false, error: 'usageType must be personal, semi_commercial, or commercial' });
    }
    return res.json({
      success: true,
      discovery: getDiscoveryStatus(input),
      recommendation: recommendEquipment(input),
      inputs: input
    });
  } catch (error) {
    console.error('recommendation route error:', error);
    return res.status(500).json({ success: false, error: 'Recommendation engine unavailable' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { createLead } = await import('./lead/lead-manager.js');
    return res.status(201).json({ success: true, lead: createLead(req.body || {}) });
  } catch (error) {
    console.error('create lead error:', error);
    return res.status(500).json({ success: false, error: 'Lead service unavailable' });
  }
});

app.get('/api/leads', async (_req, res) => {
  try {
    const { listLeads } = await import('./lead/lead-manager.js');
    return res.json({ success: true, leads: listLeads() });
  } catch (error) {
    console.error('list leads error:', error);
    return res.status(500).json({ success: false, error: 'Lead service unavailable' });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  try {
    const { getLead } = await import('./lead/lead-manager.js');
    const lead = getLead(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    return res.json({ success: true, lead });
  } catch (error) {
    console.error('get lead error:', error);
    return res.status(500).json({ success: false, error: 'Lead service unavailable' });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  try {
    const { updateLead } = await import('./lead/lead-manager.js');
    const lead = updateLead(req.params.id, req.body || {});
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    return res.json({ success: true, lead });
  } catch (error) {
    console.error('update lead error:', error);
    return res.status(500).json({ success: false, error: 'Lead service unavailable' });
  }
});

app.post('/api/quotation', async (req, res) => {
  try {
    const { buildQuotation } = await import('./quotation/quotation-builder.js');
    return res.status(201).json({ success: true, quotation: buildQuotation(req.body || {}) });
  } catch (error) {
    console.error('quotation route error:', error);
    return res.status(500).json({ success: false, error: 'Quotation service unavailable' });
  }
});

app.post('/api/lead/handover', async (req, res) => {
  try {
    const { getLead } = await import('./lead/lead-manager.js');
    const { buildHandoverPayload } = await import('./handover/handover-engine.js');
    const lead = req.body?.leadId ? getLead(req.body.leadId) : req.body;
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    return res.json({ success: true, status: 'queued_for_sales_review', payload: buildHandoverPayload(lead) });
  } catch (error) {
    console.error('handover route error:', error);
    return res.status(500).json({ success: false, error: 'Handover service unavailable' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId || '').trim();
    const message = String(req.body?.message || '').trim();
    if (!sessionId || !message) {
      return res.status(400).json({ success: false, error: 'sessionId and message are required' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ success: false, error: 'OPENAI_API_KEY is not configured' });
    }

    const [knowledgeModule, conversationModule, guardrailModule, openAiModule] = await Promise.all([
      import('./engine/knowledge-loader.js'),
      import('./engine/conversation-engine.js'),
      import('./engine/guardrail-engine.js'),
      import('./services/openai-service.js')
    ]);

    const knowledgeBase = await knowledgeModule.loadKnowledgeBase();
    const current = conversationModule.getSession(sessionId);
    const detected = conversationModule.detectContext(message, current);
    const session = conversationModule.updateSession(sessionId, detected);
    conversationModule.appendMessage(sessionId, 'user', message);

    const systemDoc = knowledgeBase.documents.find((doc) => doc.path === 'mkb/ai/master-system-prompt.md');
    const systemPrompt = typeof systemDoc?.parsed === 'string'
      ? systemDoc.parsed
      : 'You are Monkefit AI Consultant. Use verified knowledge only.';
    const knowledgeContext = knowledgeModule.buildKnowledgeContext(knowledgeBase, [
      'company', 'products', 'service', 'pricing', 'sales', 'faq',
      'decision_engine', 'intelligence', 'consultant', 'ai'
    ]);

    let answer = await openAiModule.generateResponse({ systemPrompt, knowledgeContext, session, message });
    const inspection = guardrailModule.inspectOutput(answer);
    if (!inspection.safe) answer = guardrailModule.safeFallback();
    conversationModule.appendMessage(sessionId, 'assistant', answer);

    return res.json({ success: true, answer, session: conversationModule.getSession(sessionId) });
  } catch (error) {
    console.error('chat route error:', error);
    return res.status(500).json({ success: false, error: 'AI response generation failed' });
  }
});

app.use((_req, res) => res.status(404).json({ success: false, error: 'Not found' }));

const server = app.listen(port, host, () => {
  console.log(`Monkefit AI runtime v2 listening on ${host}:${port}`);
});

server.on('error', (error) => {
  console.error('server listen error:', error);
  process.exitCode = 1;
});