import OpenAI from 'openai';

let client;
function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  client ||= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function generateResponse({ systemPrompt, knowledgeContext, session, message }) {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  const response = await openai.responses.create({
    model,
    input: [
      {
        role: 'system',
        content: `${systemPrompt}\n\nACTIVE KNOWLEDGE:\n${knowledgeContext}`
      },
      {
        role: 'user',
        content: `SESSION STATE:\n${JSON.stringify(session)}\n\nCUSTOMER MESSAGE:\n${message}`
      }
    ],
    temperature: 0.3
  });

  return response.output_text?.trim() || 'Maaf, saya belum dapat memberikan jawaban saat ini.';
}
