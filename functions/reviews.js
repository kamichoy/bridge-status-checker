// Cloudflare Pages Function, served at /reviews. Stores the match-warning reviews for
// Bridge Status Checker as one JSON document in KV: GET returns it, PUT replaces it.
// Both need the TOKEN secret, so the page also works when opened from a local folder.
// Needs a KV binding named REVIEWS and a secret named TOKEN on the Pages project.
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json'
};
const reply = (body, status = 200) => new Response(body, { status, headers: HEADERS });
const MAX_BYTES = 5 * 1024 * 1024;

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return reply(null, 204);
  if (!env.TOKEN || request.headers.get('Authorization') !== `Bearer ${env.TOKEN}`) return reply('{"error":"bad token"}', 401);
  if (!env.REVIEWS) return reply('{"error":"REVIEWS binding is missing"}', 500);

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
