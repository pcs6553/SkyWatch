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
    },
  },
})
