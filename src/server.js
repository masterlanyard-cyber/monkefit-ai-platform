import 'dotenv/config';
import express from 'express';
import { z } from 'zod';
import { loadKnowledgeBase, buildKnowledgeContext } from './engine/knowledge-loader.js';
import { getSession, updateSession, appendMessage, detectContext } from './engine/conversation-engine.js';
import { inspectOutput, safeFallback } from './engine/guardrail-engine.js';
import { generateResponse } from './services/openai-service.js';
import { getDiscoveryStatus } from './discovery/discovery-engine.js';
import { recommendEquipment } from './recommendation/recommendation-engine.js';
import { createLead, getLead, listLeads, updateLead } from './lead/lead-manager.js';
import { buildQuotation } from './quotation/quotation-builder.js';
import { buildHandoverPayload } from './handover/handover-engine.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

let knowledgeBase;
try {
  knowledgeBase = await loadKnowledgeBase();
} catch (error) {
  console.error('Failed to load MKB:', error);
  knowledgeBase = { documents: [], missing: [{ path: 'mkb/index.yaml', error: error.message }], healthy: false };
}

const chatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(5000)
});

const recommendationSchema = z.object({
  usageType: z.enum(['personal', 'semi_commercial', 'commercial']),
  city: z.string().optional(),
  budget: z.number().nonnegative().optional(),
  targetUsers: z.number().int().positive().optional(),
  roomSize: z.string().optional(),
  timeline: z.string().optional(),
  powerOutageConcern: z.boolean().optional()
});

app.get('/api/health', (_req, res) => {
  res.status(knowledgeBase.healthy ? 200 : 503).json({
    success: knowledgeBase.healthy,
    service: 'monkefit-ai-platform',
    knowledgeDocuments: knowledgeBase.documents.length,
    missingKnowledge: knowledgeBase.missing,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  const { sessionId, message } = parsed.data;
  const current = getSession(sessionId);
  const detected = detectContext(message, current);
  const session = updateSession(sessionId, detected);
  appendMessage(sessionId, 'user', message);

  try {
    const systemDoc = knowledgeBase.documents.find((doc) => doc.path === 'mkb/ai/master-system-prompt.md');
    const systemPrompt = typeof systemDoc?.parsed === 'string'
      ? systemDoc.parsed
      : 'You are Monkefit AI Consultant. Use verified knowledge only.';

    const knowledgeContext = buildKnowledgeContext(knowledgeBase, [
      'company','products','service','pricing','sales','faq','decision_engine','intelligence','consultant','ai'
    ]);

    let answer = await generateResponse({ systemPrompt, knowledgeContext, session, message });
    const inspection = inspectOutput(answer);
    if (!inspection.safe) answer = safeFallback();

    appendMessage(sessionId, 'assistant', answer);
    return res.json({ success: true, answer, session: getSession(sessionId) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'AI response generation failed',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

app.post('/api/discovery', (req, res) => {
  const profile = req.body || {};
  return res.json({ success: true, discovery: getDiscoveryStatus(profile) });
});

app.post('/api/recommendation', (req, res) => {
  const parsed = recommendationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });
  const discovery = getDiscoveryStatus(parsed.data);
  const recommendation = recommendEquipment(parsed.data);
  return res.json({ success: true, discovery, recommendation, inputs: parsed.data });
});

app.post('/api/leads', (req, res) => {
  const lead = createLead(req.body || {});
  return res.status(201).json({ success: true, lead });
});

app.get('/api/leads', (_req, res) => {
  return res.json({ success: true, leads: listLeads() });
});

app.get('/api/leads/:id', (req, res) => {
  const lead = getLead(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  return res.json({ success: true, lead });
});

app.patch('/api/leads/:id', (req, res) => {
  const lead = updateLead(req.params.id, req.body || {});
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  return res.json({ success: true, lead });
});

app.post('/api/quotation', (req, res) => {
  const quotation = buildQuotation(req.body || {});
  return res.status(201).json({ success: true, quotation });
});

app.post('/api/lead/handover', (req, res) => {
  const lead = req.body?.leadId ? getLead(req.body.leadId) : req.body;
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  const payload = buildHandoverPayload(lead);
  return res.json({ success: true, status: 'queued_for_sales_review', payload });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Monkefit AI API listening on port ${port}`);
});
