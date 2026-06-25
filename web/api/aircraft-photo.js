/**
 * Vercel Serverless Function — Planespotters Photo Proxy
 *
 * Endpoint: GET /api/aircraft-photo?hex=ICAO24
 *
 * Planespotters' public photo API (https://www.planespotters.net/photo/api)
 * requires a descriptive User-Agent identifying the calling app — browsers
 * can't set that header from fetch()/XHR, so this proxies server-side.
 */

const USER_AGENT = 'SkyWatch/1.0 (+https://github.com/pcs6553/SkyWatch)';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hex = (req.query.hex || '').trim();
  if (!hex) {
    return res.status(400).json({ error: 'Missing required "hex" (ICAO24) query param' });
  }

  const upstream = `https://api.planespotters.net/pub/photos/hex/${encodeURIComponent(hex)}`;

  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 8000);

    const upstream_res = await fetch(upstream, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await upstream_res.json();

    res.setHeader('Cache-Control',               's-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type',                'application/json');

    return res.status(upstream_res.status).json(data);

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Planespotters request timed out' });
    }
    console.error('[SkyWatch photo proxy] error:', err.message);
    return res.status(502).json({ error: err.message });
  }
}
