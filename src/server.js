import 'dotenv/config';
import express from 'express';
import { z } from 'zod';
import { loadKnowledgeBase, buildKnowledgeContext } from './engine/knowledge-loader.js';
import { getSession, updateSession, appendMessage, detectContext } from './engine/conversation-engine.js';
import { inspectOutput, safeFallback } from './engine/guardrail-engine.js';
import { generateResponse } from './services/openai-service.js';

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
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.flatten() });
  }

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

app.post('/api/recommendation', (req, res) => {
  const { usageType, city, budget, targetUsers } = req.body || {};
  let product = null;
  if (usageType === 'personal') product = 'HUSSAR300RS';
  if (usageType === 'semi_commercial') product = 'HUSSAR800RS';
  if (usageType === 'commercial') product = 'HUSSAR1000RS';

  res.json({
    success: true,
    recommendation: product,
    inputs: { usageType, city, budget, targetUsers },
    requiresHumanReview: !product
  });
});

app.post('/api/lead/handover', (req, res) => {
  const payload = req.body || {};
  res.json({
    success: true,
    assignedTo: 'Niken',
    status: 'queued_for_sales_review',
    payload,
    createdAt: new Date().toISOString()
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Monkefit AI API listening on port ${port}`);
});
