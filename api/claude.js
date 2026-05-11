export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({error:'API key not configured.'});
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');
    let body = {};
    try { body = JSON.parse(raw); } catch(e) { body = {}; }
    body.model = 'claude-sonnet-4-6';
    if (!body.max_tokens || body.max_tokens < 4000) body.max_tokens = 6000;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      body: JSON.stringify(body)
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch(e) { return res.status(500).json({error:'Proxy error: '+e.message}); }
}
