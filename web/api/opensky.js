/**
 * Vercel Serverless Function — FlightRadar24 Proxy
 *
 * Endpoint: GET /api/opensky?bounds=...
 *
 * This function proxies requests to https://data-cloud.flightradar24.com/zones/fcgi/feed.js
 * bypassing CORS on the client-side.
 */

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Forward all query parameters (bounds, faa, adsb, etc.)
  const params  = new URLSearchParams(req.query).toString();
  const upstream = `https://data-cloud.flightradar24.com/zones/fcgi/feed.js${params ? '?' + params : ''}`;

  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 10000);

    const upstream_res = await fetch(upstream, {
      headers: {
        Accept:        'application/json',
        'User-Agent':  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream_res.ok) {
      return res.status(upstream_res.status).json({
        error: `FlightRadar24 API error: ${upstream_res.status} ${upstream_res.statusText}`,
      });
    }

    const data = await upstream_res.json();

    res.setHeader('Cache-Control',               's-maxage=5, stale-while-revalidate=10');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type',                'application/json');

    return res.status(200).json(data);

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'FlightRadar24 request timed out' });
    }
    console.error('[SkyWatch proxy] error:', err.message);
    return res.status(502).json({ error: err.message });
  }
}
