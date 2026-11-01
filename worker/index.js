// Stores the match-warning reviews for Bridge Status Checker as one JSON document in KV.
// GET /reviews returns it, PUT /reviews replaces it. Both need the TOKEN secret, so the
// page can be opened from anywhere, including a local folder.
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json'
};
const reply = (body, status = 200) => new Response(body, { status, headers: HEADERS });
const MAX_BYTES = 5 * 1024 * 1024;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return reply(null, 204);
    if (new URL(request.url).pathname !== '/reviews') return reply('{"error":"not found"}', 404);
    if (!env.TOKEN || request.headers.get('Authorization') !== `Bearer ${env.TOKEN}`) return reply('{"error":"bad token"}', 401);

    if (request.method === 'GET') return reply(await env.REVIEWS.get('reviews') || '{}');
    if (request.method === 'PUT') {
      const text = await request.text();
      if (text.length > MAX_BYTES) return reply('{"error":"too large"}', 413);
      let doc;
      try { doc = JSON.parse(text); } catch (e) { doc = null; }
      if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return reply('{"error":"expected a JSON object"}', 400);
      await env.REVIEWS.put('reviews', text);
      return reply('{"ok":true}');
    }
    return reply('{"error":"method not allowed"}', 405);
  }
};
