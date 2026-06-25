import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Encode OpenSky credentials from credentials.json as Base64 for Basic Auth
// clientId = username, clientSecret = password (OpenSky Network OAuth API client)
const OPENSKY_CLIENT_ID = 'prashanthcs-api-client';
const OPENSKY_CLIENT_SECRET = 'REPLACE_WITH_YOUR_OPENSKY_CLIENT_SECRET';
const OPENSKY_AUTH = Buffer.from(`${OPENSKY_CLIENT_ID}:${OPENSKY_CLIENT_SECRET}`).toString('base64');

export default defineConfig({
  base: './',
  plugins: [react()],

  server: {
    proxy: {
      // GET /api/opensky?lamin=...  →  https://opensky-network.org/api/states/all?lamin=...
      // Matches the same path used by the Vercel serverless function (api/opensky.js)
      // so the same URL works in both dev and production.
      '/api/opensky': {
        target: 'https://data-cloud.flightradar24.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'Referer': 'https://www.flightradar24.com/',
          'Origin': 'https://www.flightradar24.com'
        },
        rewrite: (path) => {
          // Keep the query string and route to feed.js
          const queryStart = path.indexOf('?');
          const query = queryStart >= 0 ? path.slice(queryStart) : '';
          return '/zones/fcgi/feed.js' + query;
        },
      },
      // GET /api/aircraft-photo?hex=ICAO24  →  Planespotters' public photo API.
      // Browsers can't send a custom User-Agent from fetch()/XHR (it's a
      // forbidden header), and Planespotters rejects generic/default UAs —
      // so this has to be proxied server-side, same as /api/opensky above.
      // Matches the same path used by api/aircraft-photo.js (Vercel) and the
      // Android WebViewClient, so the same URL works in all three.
      '/api/aircraft-photo': {
        target: 'https://api.planespotters.net',
        changeOrigin: true,
        secure: true,
        headers: {
          'User-Agent': 'SkyWatch/1.0 (+https://github.com/pcs6553/SkyWatch)',
        },
        rewrite: (path) => {
          const url = new URL(path, 'http://x');
          const hex = url.searchParams.get('hex') || '';
          return '/pub/photos/hex/' + encodeURIComponent(hex);
        },
      },
    },
  },
})
