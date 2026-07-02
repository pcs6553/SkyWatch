/**
 * Vercel Serverless Function — OpenSky Network Proxy
 *
 * Endpoint: GET /api/opensky?lamin=...&lomin=...&lamax=...&lomax=...
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const params = new URLSearchParams(req.query).toString();
  const upstream = `https://opensky-network.org/api/states/all${params ? '?' + params : ''}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const upstream_res = await fetch(upstream, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream_res.ok) {
      return res.status(upstream_res.status).json({
        error: `OpenSky API error: ${upstream_res.status} ${upstream_res.statusText}`,
      });
    }

    const data = await upstream_res.json();

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'OpenSky request timed out' });
    }
    console.error('[SkyWatch proxy] error:', err.message);
    return res.status(502).json({ error: err.message });
  }
}
