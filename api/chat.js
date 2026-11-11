const SYSTEM = `You are the friendly assistant on the website of Sirish Sah (Nexify), a web and app developer in Surat, Gujarat, India.
You help visitors with website development, online stores, mobile apps and the upcoming website development course.
Keep answers short (2 to 4 sentences). Never invent prices, deadlines or promises.
For quotes or to start a project, tell the visitor to message Sirish on WhatsApp: https://wa.me/916207620864
For the course, say details and payment will be announced soon and they can join the waitlist on WhatsApp.
If you do not know something, say so and suggest WhatsApp. Only talk about Sirish's services and web or app topics.`;

const hits = new Map();

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ reply: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (recent.length >= 6) {
    return res.status(429).json({ reply: 'You are sending messages too fast. Please wait a minute or message me on WhatsApp.' });
  }
  hits.set(ip, [...recent, now]);

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const clean = (body.messages || []).slice(-10).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content).slice(0, 1000),
  }));
  while (clean.length && clean[0].role !== 'user') clean.shift();
  if (!clean.length) return res.status(400).json({ reply: 'Please type a question.' });

  const contents = clean.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { maxOutputTokens: 400 },
        }),
      }
    );
    if (!r.ok) {
      console.error('Gemini error status:', r.status, await r.text());
      throw new Error('Gemini error ' + r.status);
    }
    const d = await r.json();
    const reply = ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [])
      .map((p) => p.text || '').join('');
    return res.status(200).json({ reply: reply || 'Sorry, I could not answer that. Please message me on WhatsApp.' });
  } catch (e) {
    return res.status(500).json({ reply: 'Sorry, I am having trouble right now. Please message me on WhatsApp.' });
  }
};
