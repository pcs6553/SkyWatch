# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SkyWatch — a live flight-tracking web app (Vite + React + Leaflet), styled as a phone-simulator UI (a smartphone mockup frame in the browser, not a responsive page). It has two data modes: a built-in flight **simulator** (mock data, generated client-side) and a **live** mode that pulls real aircraft positions through a proxy.

A native Android port of this same UI lives in the sibling `../skywatch-android/` repo — see "Android port" below.

## Commands

```bash
npm install
npm run dev       # Vite dev server (proxies /api/opensky → FlightRadar24, see vite.config.js)
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
npm run lint       # oxlint
```

There is no test suite configured.

## Architecture

### Single-file app shell

`src/App.jsx` (~930 lines) owns almost all state — there is no Redux/Context/router. It renders one fixed top-level `<div className="phone-simulator-container">` containing a faux smartphone frame (`smartphone-mockup`), and conditionally renders panels (`MapView`, `BottomSheet`, `SearchPanel`, `BookmarksPanel`, `StatsPanel`, `SettingsPanel`, `CockpitHUD`, `ARScanner`) based on `activeTab` / `viewing3D` / `viewingAR`. All child components in `src/simulator/` are presentation + interaction layers driven by props/callbacks from `App.jsx` — none of them own significant state of their own beyond local UI toggles.

### Two data sources, one `flights` array

`dataSourceMode` (`'simulated'` | `'opensky'`) decides where `flights` state comes from:
- **Simulated**: `generateFlights()` creates mock aircraft once, then `updateSimulation()` advances them on a tick. Lives in `src/mock/flightData.js`.
- **Live** (`'opensky'`, the default): a `useEffect` in `App.jsx` polls `fetchLiveOpenSkyFlights()` (also in `flightData.js`) every 30s and on viewport change, replacing `flights` wholesale.

Despite the name, **the live feed is not the OpenSky Network API** — `fetchLiveOpenSkyFlights()` actually calls **FlightRadar24's undocumented internal feed** (`data-cloud.flightradar24.com/zones/fcgi/feed.js`) with spoofed `Referer`/`Origin`/`User-Agent` headers impersonating a browser on flightradar24.com. This naming mismatch is pre-existing and intentional in the current code — don't assume `opensky` in code/variable names means the public OpenSky API.

The bounding box for the live fetch comes from the **current map viewport** (`mapBounds`, reported by `MapView` via `onBoundsChange`, debounced 600ms on `moveend`), falling back to GPS coords, then a per-hub default. This was a deliberate fix — earlier the box was pinned to GPS/hub only, so flights stopped updating once you panned away. If you touch the fetch loop, preserve the bbox-follows-viewport behavior (`mapBoundsRef` + `fetchLiveRef` pattern in `App.jsx`).

### CORS proxy layers (three different ones, used in different environments)

The browser can't call FlightRadar24 directly (CORS), so the `/api/opensky` path is proxied differently per environment — all three must stay behaviorally equivalent if you change the upstream call:
1. **Vite dev server**: `vite.config.js` has a `server.proxy['/api/opensky']` rewrite straight to FR24's `feed.js`, with `Referer`/`Origin` headers injected.
2. **Vercel production**: `api/opensky.js` is a serverless function doing the same proxy+header-spoofing server-side (see `vercel.json` for routing/CORS headers).
3. **Android app**: `OpenSkyWebViewClient.kt` in the sibling Android repo intercepts WebView requests and proxies natively (see below).

A leftover `OPENSKY_CLIENT_ID`/`OPENSKY_CLIENT_SECRET` Basic-Auth pair in `vite.config.js` is dead code from an earlier real-OpenSky integration — it's computed into `OPENSKY_AUTH` but never actually attached to the FR24 proxy request. The secret value has been scrubbed to a placeholder (`REPLACE_WITH_YOUR_OPENSKY_CLIENT_SECRET`) in both `vite.config.js` and the Android Kotlin file — don't restore a real secret in either without confirming it's meant to be committed (this repo is public on GitHub).

### Map layer (`src/simulator/MapView.jsx`, ~760 lines)

Leaflet, not react-leaflet — markers, the airport layer, and tile layers are all imperative Leaflet calls inside `useEffect`s keyed off props, with refs (`markersRef`, `airportsRef`, `tileLayerRef`, etc.) holding live Leaflet objects across renders. Notable details if you're working in here:

- **Two airport layers, not one**: ~112 hand-curated "hub" airports (full mock stats — on-time %, delays, METAR) from `AIRPORTS` in `flightData.js` render as individual pins always; a separate **world airport layer** (~72k airports from the OurAirports dataset, bundled as `public/airports.json`) renders via `leaflet.markercluster`, loaded with **`XMLHttpRequest`, not `fetch()`** — Android WebView blocks `fetch()` of `file://` URLs, so this is required for the Android build to load the dataset at all; don't change it back to `fetch`.
- **Flight/airport marker click handlers must call exactly one of `onSelectFlight`/`onSelectAirport`**, never both. Each handler already clears the other selection internally (`handleSelectFlight` clears `selectedAirport` and vice versa in `App.jsx`); calling both from a marker's click handler creates a race that instantly un-selects whatever was just clicked. This was a real bug here once — don't reintroduce the redundant second call.
- **Live flight marker animation is deliberately short-lived**: markers glide ~2.5s toward their new position after each fetch, then sit static (real fetches happen every 30s) — animating for the full 30s interval pins the main thread at all times even when idle (measured 7fps when this was wrong). Off-screen markers skip animation and jump straight to position.
- **Tile layers split `maxNativeZoom` from `maxZoom`** (e.g. the default flightradar/Ocean basemap is natively zoom-13 max) so Leaflet overzooms/upscales past the provider's real resolution instead of rendering a blank tile. If you add a new tile style, set both, not just `maxZoom`.
- Only **one** `L.control.zoom()` should exist — map is created with `zoomControl: false` and a single explicit zoom control is added manually; don't set `zoomControl: true` as well or you get two stacked +/- button sets.

### Tier gating

`tier` state (`'Free' | 'Silver' | 'Gold'`) gates a few UI features (bookmark limit in `App.jsx`, weather/aeronautical overlays in `MapView.jsx`, some panel features). It's pure client-side mock state with no backend — there's no real subscription/auth system.

## Android port (sibling repo: `../skywatch-android/`)

A separate Kotlin/Compose Android project that wraps this web app's **production build** in a `WebView`, not a from-scratch native UI:
- `MainActivity.kt` loads `WebView.loadUrl("file:///android_asset/web/index.html")`. The contents of `app/src/main/assets/web/` are a **copy of this repo's `npm run build` output (`dist/`)** — there is no automated sync. After changing anything here, you must `npm run build`, then copy `dist/*` into `skywatch-android/app/src/main/assets/web/`, then rebuild the APK.
- `OpenSkyWebViewClient.kt` plays the same role as `vite.config.js`'s dev proxy / `api/opensky.js`: it intercepts `shouldInterceptRequest` for `/api/opensky` and forwards to FR24 natively, with the same spoofed headers.
- The Compose scaffolding (`MainScreen.kt`, `Navigation.kt`, `MainScreenViewModel.kt`, `DataRepository.kt`) is unused template boilerplate from project creation — `MainActivity` renders the `WebView` directly and never reaches it.
- Android build: `cd ../skywatch-android && ./gradlew assembleDebug` (needs JDK 17+ — `JAVA_HOME=$(brew --prefix openjdk@17)` if not already configured — and the Android SDK at `local.properties`' `sdk.dir`).
- `WebView.setWebContentsDebuggingEnabled(true)` is enabled in `MainActivity.kt`, so the live WebView can be inspected via `chrome://inspect` or the Chrome DevTools Protocol over `adb forward` — useful for diagnosing anything that only reproduces on-device (rendering/perf/touch issues didn't always reproduce in desktop browser testing).
