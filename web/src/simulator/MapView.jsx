import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { AIRPORTS } from '../mock/flightData';

// Fix Leaflet default icon issues in some environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// The ~112 rich "hub" airport pins only render once zoomed in this far. Tile
// layers cap at maxZoom 20, so "60%" zoomed in ≈ z12 — below that they add
// visual clutter for no real benefit at a world/country view. (The separate
// ~72k-marker world-airport layer handles its own zoom-based density via
// clustering instead of this constant — see the comment where it's built.)
const AIRPORT_MIN_ZOOM = 12;

// SVG airplane silhouette string
const getPlaneSVG = (color, isSelected) => {
  const scale = isSelected ? 1.3 : 1.0;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#1a1a1a" stroke-width="1.1" width="${24 * scale}px" height="${24 * scale}px" style="transform: rotate(0deg); filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.45));">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
  `;
};

const MapView = forwardRef(function MapView({ 
  flights, 
  selectedFlight, 
  selectedAirport, 
  onSelectFlight, 
  onSelectAirport,
  mapStyle,
  heatmapActive,
  tier,
  userRealCoords,   // { lat, lng } | null — the user's real GPS position
  onBoundsChange,   // (bbox: {lamin,lomin,lamax,lomax}) => void — current viewport
}, ref) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Storage for Leaflet layers to update them dynamically
  const markersRef = useRef({});
  const trailsRef = useRef({});
  const airportsRef = useRef({});
  const worldAirportsClusterRef = useRef(null); // leaflet.markercluster group for all world airports
  const tileLayerRef = useRef(null);
  const selectedPulseRef = useRef(null);
  const plannedAirwayRef = useRef(null);
  const userLocationPinRef = useRef(null);  // "You Are Here" GPS marker
  const lastMarkerClickTimeRef = useRef(0); // touch event click prevent deselect
  
  // Custom Overlays
  const weatherLayerRef = useRef(null);
  const airwaysLayerRef = useRef(null);
  const heatmapLayerRef = useRef(null);

  const [zoom, setZoom] = useState(3);
  
  const onSelectFlightRef = useRef(onSelectFlight);
  const onSelectAirportRef = useRef(onSelectAirport);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const flightsRef = useRef(flights);
  const boundsDebounceRef = useRef(null);

  useEffect(() => {
    onSelectFlightRef.current = onSelectFlight;
  }, [onSelectFlight]);

  useEffect(() => {
    onSelectAirportRef.current = onSelectAirport;
  }, [onSelectAirport]);

  useEffect(() => {
    flightsRef.current = flights;
  }, [flights]);

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  // Expose imperative panTo so parent (App.jsx) can pan after GPS resolves
  useImperativeHandle(ref, () => ({
    panTo: (coords, zoom = 10) => {
      if (mapRef.current) {
        mapRef.current.setView([coords.lat, coords.lng], zoom, { animate: true });
      }
    }
  }), []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet Map centered over Atlantic / Europe
    const map = L.map(mapContainerRef.current, {
      center: [35, -20],
      zoom: 3,
      // zoomControl disabled here — we add a single explicit control below.
      // Leaving this true as well as calling L.control.zoom() was rendering
      // two sets of +/- buttons (one default top-left, one custom top-right).
      zoomControl: false,
      attributionControl: false
    });

    mapRef.current = map;

    // Add standard zoom buttons override container class
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer (Positron Light)
    // maxNativeZoom caps real tile requests at the provider's actual resolution;
    // maxZoom lets Leaflet keep zooming past that by upscaling the last tile
    // instead of showing a blank/grey "no data" tile.
    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxNativeZoom: 19,
      maxZoom: 20
    }).addTo(map);
    tileLayerRef.current = tiles;

    // Handle clicks on empty map to deselect
    map.on('click', (e) => {
      // If we recently clicked on a marker, ignore empty map click (for mobile/touch support)
      if (Date.now() - lastMarkerClickTimeRef.current < 1000) {
        return;
      }
      // Small timeout to allow marker clicks to prevent firing deselect
      setTimeout(() => {
        if (e.originalEvent.defaultPrevented) return;
        onSelectFlightRef.current(null);
        onSelectAirportRef.current(null);
      }, 50);
    });

    map.on('zoomend', () => {
      setZoom(map.getZoom());
    });

    // Live flight data is fetched for a bounding box — without this, panning
    // away from wherever that box was centered (e.g. the GPS "locate me"
    // point) shows an empty map, since no flights were ever fetched for the
    // area now in view. Debounced so we don't fire on every drag frame.
    const emitBounds = () => {
      if (!onBoundsChangeRef.current) return;
      const b = map.getBounds();
      onBoundsChangeRef.current({
        lamin: b.getSouth(),
        lomin: b.getWest(),
        lamax: b.getNorth(),
        lomax: b.getEast(),
      });
    };
    map.on('moveend', () => {
      clearTimeout(boundsDebounceRef.current);
      boundsDebounceRef.current = setTimeout(emitBounds, 600);
    });
    emitBounds(); // report the initial viewport immediately

    return () => {
      clearTimeout(boundsDebounceRef.current);
      // Cancel all active animation frames on unmount
      Object.values(markersRef.current).forEach(marker => {
        if (marker.animationFrameId) {
          cancelAnimationFrame(marker.animationFrameId);
        }
      });
      map.remove();
    };
  }, []);

  // Update Tile Layers based on MapStyle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;

    // Remove existing tile layer
    map.removeLayer(tileLayerRef.current);

    // maxNativeZoom = the provider's real tile resolution; maxZoom kept higher
    // so Leaflet overzooms (upscales) past it instead of rendering a blank
    // "no data" tile once you zoom in further than the source actually covers.
    // 'flightradar' used to be a dedicated Esri basemap (first "Ocean
    // Base/Reference" — bathymetry-only, native max z13 — then
    // "World_Street_Map", which turned out to have only sparse street
    // coverage outside the US/EU: past its actual coverage it serves a valid
    // HTTP 200 "Map data not yet available" placeholder *image*, so it never
    // shows up as a tile-load error, it just silently has no useful content).
    // CartoDB's light_all (OSM-based) has real, consistent global coverage at
    // city zoom, so 'flightradar' now shares that same basemap as the
    // default style below instead of a dedicated source.
    {
      let newUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      let options = { maxNativeZoom: 19, maxZoom: 20 };

      if (mapStyle === 'satellite') {
        newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        options = { maxNativeZoom: 19, maxZoom: 20 };
      } else if (mapStyle === 'topographic') {
        newUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        options = { maxNativeZoom: 17, maxZoom: 20 };
      } else if (mapStyle === 'aeronautical' || mapStyle === 'weather') {
        newUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      }

      tileLayerRef.current = L.tileLayer(newUrl, options).addTo(map);
    }
  }, [mapStyle]);

  // Handle Airport Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing airports
    Object.values(airportsRef.current).forEach(m => map.removeLayer(m));
    airportsRef.current = {};

    // Hide all airport pins when zoomed out — see AIRPORT_MIN_ZOOM.
    if (zoom < AIRPORT_MIN_ZOOM) return;

    // Render airports
    Object.values(AIRPORTS).forEach(a => {
      const isSelected = selectedAirport?.iata === a.iata;

      const airportIcon = L.divIcon({
        className: 'custom-airport-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: auto; width: 100%; height: 100%;">
            <!-- Outer circle with control tower icon -->
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              width: 20px; 
              height: 20px; 
              border-radius: 50%; 
              background-color: ${isSelected ? 'var(--amber)' : 'var(--cyan)'}; 
              border: 2px solid #ffffff; 
              box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2); 
              transition: all 0.2s;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="11px" height="11px">
                <path d="M3 21h18" />
                <path d="M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4" />
                <path d="M9 15V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10" />
                <path d="M8 7h8" />
              </svg>
            </div>
            ${(zoom >= 5 || isSelected) ? `
              <span style="font-family: var(--font-mono); font-size: 8px; font-weight: bold; color: ${isSelected ? 'var(--amber)' : '#ffffff'}; margin-top: 3px; background: ${isSelected ? 'var(--amber)' : 'var(--cyan)'}; padding: 1px 4.5px; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); text-transform: uppercase;">${a.iata}</span>
            ` : ''}
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([a.lat, a.lng], { icon: airportIcon })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          lastMarkerClickTimeRef.current = Date.now();
          // onSelectAirport already clears any selected flight; calling
          // onSelectFlight(null) here would reset selectedAirport back to null.
          onSelectAirportRef.current(a);
        })
        .addTo(map);

      airportsRef.current[a.iata] = marker;
    });
  }, [selectedAirport, zoom]);

  // Render ALL world airports (OurAirports dataset, ~72k) via marker
  // clustering. Runs once after the map exists. The ~112 rich hub airports
  // above render on top of these with full stats; here we skip any IATA
  // already covered by a hub.
  //
  // No zoom-based attach/detach here — see the comment on the cluster options
  // below for why, and how plain clustering already keeps this cheap at low
  // zoom without it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || worldAirportsClusterRef.current) return;

    let cancelled = false;

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      removeOutsideVisibleBounds: true,
      maxClusterRadius: 55,
      // No disableClusteringAtZoom needed: plain clustering already gives the
      // "hide at low zoom, show individually at high zoom" outcome on its
      // own. An airport with no neighbor within maxClusterRadius (55px)
      // renders using its own icon, not a cluster bubble — at high zoom, 55px
      // covers a tiny ground distance, so most airports end up "alone" and
      // show individually. At low zoom, the same 55px covers a huge area, so
      // everything collapses into a handful of cluster bubbles, which is what
      // keeps it cheap when zoomed out.
      spiderfyOnMaxZoom: false,
      iconCreateFunction: (c) => {
        const n = c.getChildCount();
        const size = n < 100 ? 28 : n < 1000 ? 34 : 40;
        return L.divIcon({
          html: `<div class="airport-cluster-inner">${n >= 1000 ? Math.round(n / 1000) + 'k' : n}</div>`,
          className: 'airport-cluster',
          iconSize: [size, size],
        });
      },
    });

    const TYPE_STYLE = {
      large_airport:  { size: 9,  color: '#00d4ff', z: 5 },
      medium_airport: { size: 7,  color: '#39b6c9', z: 4 },
      small_airport:  { size: 5,  color: '#6b9aa6', z: 3 },
      seaplane_base:  { size: 5,  color: '#4a90b8', z: 2 },
      heliport:       { size: 4,  color: '#8a8f99', z: 1 },
      balloonport:    { size: 4,  color: '#8a8f99', z: 1 },
    };

    const buildAirport = (a) => ({
      iata: a.iata || a.icao,
      icao: a.icao,
      name: a.name,
      city: a.city,
      country: a.country,
      lat: a.lat,
      lng: a.lng,
      type: a.type,
      scheduled: a.scheduled === 1,
      isWorld: true,
    });

    // Load via XHR, not fetch(): Android WebView blocks fetch() of file:// URLs
    // ("Failed to fetch"), but XHR honors allowFileAccessFromFileURLs.
    const loadAirports = () => new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', new URL('airports.json', document.baseURI).toString());
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(e); }
        } else reject(new Error('HTTP ' + xhr.status));
      };
      xhr.onerror = () => reject(new Error('XHR failed'));
      xhr.send();
    });

    loadAirports()
      .then((data) => {
        if (cancelled) return;

        // IATA codes already shown as rich hub pins — don't duplicate them.
        const hubIatas = new Set(Object.keys(AIRPORTS));

        const markers = [];
        for (const row of data) {
          // row: [lat,lng,name,iata,icao,type,country,city,scheduled]
          const a = {
            lat: row[0], lng: row[1], name: row[2], iata: row[3],
            icao: row[4], type: row[5], country: row[6], city: row[7],
            scheduled: row[8],
          };
          if (a.iata && hubIatas.has(a.iata)) continue;

          const style = TYPE_STYLE[a.type] || TYPE_STYLE.small_airport;
          const icon = L.divIcon({
            className: 'world-airport-pin',
            html: `<div class="world-airport-dot" style="width:${style.size}px;height:${style.size}px;background:${style.color};"></div>`,
            iconSize: [style.size, style.size],
            iconAnchor: [style.size / 2, style.size / 2],
          });

          const marker = L.marker([a.lat, a.lng], { icon, zIndexOffset: style.z });
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            lastMarkerClickTimeRef.current = Date.now();
            onSelectAirportRef.current(buildAirport(a));
          });
          markers.push(marker);
        }

        cluster.addLayers(markers);
        if (!cancelled && mapRef.current) {
          mapRef.current.addLayer(cluster);
          worldAirportsClusterRef.current = cluster;
        }
      })
      .catch((err) => console.error('[SkyWatch] world airports load failed:', err));

    return () => { cancelled = true; };
  }, []);

  // Render Weather & Aeronautical Charts overlays
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Weather Precipitation Overlay (simulated with radar cloud cells)
    if (weatherLayerRef.current) {
      map.removeLayer(weatherLayerRef.current);
      weatherLayerRef.current = null;
    }
    
    // Only Gold tier can view Weather overlays
    if (mapStyle === 'weather') {
      if (tier === 'Gold') {
        const storm1 = L.circle([38, -60], { radius: 350000, color: '#ff4d6a', fillColor: '#ff4d6a', fillOpacity: 0.25 });
        const storm2 = L.circle([50, -5], { radius: 250000, color: '#ff4d6a', fillColor: '#ff4d6a', fillOpacity: 0.2 });
        const rain1 = L.circle([25, 45], { radius: 400000, color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.15 });
        
        weatherLayerRef.current = L.layerGroup([storm1, storm2, rain1]).addTo(map);
      } else {
        alert('Weather overlays require Gold membership.');
      }
    }

    // 2. Aeronautical Routes (highways between hubs)
    if (airwaysLayerRef.current) {
      map.removeLayer(airwaysLayerRef.current);
      airwaysLayerRef.current = null;
    }

    if (mapStyle === 'aeronautical') {
      if (tier === 'Gold') {
        const routeLines = [];
        const hubs = Object.values(AIRPORTS);
        
        // Draw airways connecting nearest airport pairs
        for (let i = 0; i < hubs.length; i++) {
          for (let j = i + 1; j < hubs.length; j++) {
            const dist = getDistanceKm(hubs[i].lat, hubs[i].lng, hubs[j].lat, hubs[j].lng);
            if (dist < 8000) {
              const airwayLine = L.polyline([[hubs[i].lat, hubs[i].lng], [hubs[j].lat, hubs[j].lng]], {
                color: 'rgba(0, 212, 255, 0.08)',
                weight: 1,
                dashArray: '4,4'
              });
              routeLines.push(airwayLine);
            }
          }
        }
        
        // Mock FIR Oceanic boundaries
        const firBound = L.polygon([
          [60, -40], [60, -10], [45, -15], [30, -30], [30, -50], [45, -55]
        ], {
          color: 'rgba(192, 132, 252, 0.2)',
          fillColor: 'transparent',
          weight: 1.5,
          dashArray: '3,6'
        });
        routeLines.push(firBound);

        airwaysLayerRef.current = L.layerGroup(routeLines).addTo(map);
      } else {
        alert('Aeronautical maps (FIR & Oceanic lines) require Gold membership.');
      }
    }
  }, [mapStyle, tier]);

  // Update Flight markers and path trails
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Track active flight IDs
    const currentFlightIds = flights.map(f => f.id);

    // Remove obsolete markers/trails
    Object.keys(markersRef.current).forEach(id => {
      if (!currentFlightIds.includes(id)) {
        const marker = markersRef.current[id];
        if (marker.animationFrameId) {
          cancelAnimationFrame(marker.animationFrameId);
        }
        map.removeLayer(marker);
        delete markersRef.current[id];
        
        if (trailsRef.current[id]) {
          map.removeLayer(trailsRef.current[id]);
          delete trailsRef.current[id];
        }
      }
    });

    // Render flights
    flights.forEach(f => {
      const isSelected = selectedFlight?.id === f.id;
      
      // Determine aircraft plane color based on type/category (Flightradar24 Yellow Style)
      let color = '#fecd00'; // Standard Golden Yellow
      if (f.category === 'Cargo') color = '#e2b007'; // Cargo Gold
      if (f.category === 'Private') color = '#d29d00'; // Private Gold-brown
      if (f.category === 'Military') color = '#8c8000'; // Military Olive-gold
      if (f.category === 'Helicopter') color = '#a28800'; // Helicopter Muted Gold

      if (f.squawkState !== 'Normal') {
        color = '#ff003c'; // Emergency Red override
      }

      // Generate HTML DivIcon
      const showCallsign = zoom >= 6 || isSelected;

      const aircraftIcon = L.divIcon({
        className: 'custom-aircraft-marker',
        html: `
          <div class="aircraft-marker-container" style="width: 100%; height: 100%;">
            ${isSelected ? `<div class="selection-ring"></div>` : ''}
            <div class="aircraft-icon-svg ${isSelected ? 'selected' : ''}" style="transform: rotate(${f.heading}deg);">
              ${getPlaneSVG(isSelected ? '#ff9e00' : color, isSelected)}
            </div>
            ${showCallsign ? `
              <span class="aircraft-callsign-label ${isSelected ? 'selected' : ''}">
                ${f.callsign}
              </span>
            ` : ''}
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      // Check if icon properties changed to avoid setting icon and canceling touch event sequences on mobile
      const lastIconProps = markersRef.current[f.id]?.lastIconProps || {};
      const newIconProps = {
        isSelected,
        heading: f.heading,
        color,
        showCallsign,
        callsign: f.callsign
      };

      const iconChanged = 
        lastIconProps.isSelected !== newIconProps.isSelected ||
        lastIconProps.heading !== newIconProps.heading ||
        lastIconProps.color !== newIconProps.color ||
        lastIconProps.showCallsign !== newIconProps.showCallsign ||
        lastIconProps.callsign !== newIconProps.callsign;

      // Update marker coordinates smoothly
      if (markersRef.current[f.id]) {
        const marker = markersRef.current[f.id];
        
        // Cancel any existing animation for this marker
        if (marker.animationFrameId) {
          cancelAnimationFrame(marker.animationFrameId);
        }

        const startLat = marker.getLatLng().lat;
        const startLng = marker.getLatLng().lng;
        const endLat = f.lat;
        const endLng = f.lng;
        const startTime = Date.now();
        // Live data refreshes every ~30s. Animating for the full interval means
        // on-screen planes repaint every frame nonstop. Instead glide briefly to
        // the new position (~2.5s) then sit static until the next update.
        const duration = f.id.startsWith('LIVE-') ? 2500 : 3000;

        // Throttle position updates to ~20fps. Each setLatLng forces a
        // projection + DOM z-index rewrite; at 60fps across many markers this
        // pins the main thread. 20fps is visually smooth but ~3x cheaper.
        const FRAME_MS = 50;
        let lastUpdate = 0;

        const animateMarker = () => {
          const now = Date.now();
          const progress = Math.min(1, (now - startTime) / duration);

          if (now - lastUpdate >= FRAME_MS || progress >= 1) {
            lastUpdate = now;
            marker.setLatLng([
              startLat + (endLat - startLat) * progress,
              startLng + (endLng - startLng) * progress,
            ]);
          }

          if (progress < 1) {
            marker.animationFrameId = requestAnimationFrame(animateMarker);
          } else {
            marker.animationFrameId = null;
          }
        };

        // Only smoothly animate planes that are actually on-screen. Off-screen
        // markers (the majority of a live feed) and large teleports jump
        // straight to their position — no per-frame projection cost.
        const dist = Math.abs(endLat - startLat) + Math.abs(endLng - startLng);
        const bounds = map.getBounds().pad(0.25);
        const onScreen = bounds.contains([endLat, endLng]) || bounds.contains([startLat, startLng]);
        if (dist > 5.0 || !onScreen) {
          marker.setLatLng([endLat, endLng]);
          marker.animationFrameId = null;
        } else {
          marker.animationFrameId = requestAnimationFrame(animateMarker);
        }

        if (iconChanged) {
          marker.setIcon(aircraftIcon);
          marker.lastIconProps = newIconProps;
        }
      } else {
        // Create new marker
        const marker = L.marker([f.lat, f.lng], { icon: aircraftIcon })
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            lastMarkerClickTimeRef.current = Date.now();
            const latestFlight = flightsRef.current.find(flight => flight.id === f.id) || f;
            // onSelectFlight already clears any selected airport; calling
            // onSelectAirport(null) here would reset selectedFlight back to null,
            // instantly deselecting the flight we just tapped.
            onSelectFlightRef.current(latestFlight);
          })
          .addTo(map);

        marker.lastIconProps = newIconProps;
        markersRef.current[f.id] = marker;
      }

      // Update fading trail paths
      if (trailsRef.current[f.id]) {
        map.removeLayer(trailsRef.current[f.id]);
      }
      
      const trailLine = L.polyline(f.trail.map(t => [t.lat, t.lng]), {
        color: isSelected ? 'var(--amber)' : color,
        weight: isSelected ? 2.0 : 1.2,
        opacity: isSelected ? 0.75 : 0.4,
        dashArray: isSelected ? 'none' : '2,2'
      }).addTo(map);

      trailsRef.current[f.id] = trailLine;
    });
  }, [flights, selectedFlight, zoom]);

  // Handle panning to selected aircraft and drawing flight paths
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedFlight) {
      map.panTo([selectedFlight.lat, selectedFlight.lng]);
      
      // Clear existing flight path layers
      if (plannedAirwayRef.current) {
        if (plannedAirwayRef.current.animatedLayer) {
          map.removeLayer(plannedAirwayRef.current.animatedLayer);
        }
        if (plannedAirwayRef.current.plannedRoute) {
          map.removeLayer(plannedAirwayRef.current.plannedRoute);
        }
        map.removeLayer(plannedAirwayRef.current);
      }

      const layers = [];

      // 1. Draw planned route from origin to destination (dashed line)
      if (selectedFlight.plannedAirway && selectedFlight.plannedAirway.length > 0) {
        const plannedRoute = L.polyline(
          selectedFlight.plannedAirway.map(pt => [pt.lat, pt.lng]),
          {
            color: '#00d4ff',      // Cyan for planned route
            weight: 2.5,
            opacity: 0.4,
            dashArray: '8,12',     // Dashed line for planned route
            className: 'planned-route-line'
          }
        ).addTo(map);
        layers.push(plannedRoute);
      }

      // 2. Draw actual traveled path (historical trail + current position)
      if (selectedFlight.trail && selectedFlight.trail.length > 0) {
        // Combine trail with current position to show the full path traveled
        const flightPath = [
          ...selectedFlight.trail.map(t => [t.lat, t.lng]),
          [selectedFlight.lat, selectedFlight.lng]
        ];

        // Solid line for actual path traveled
        const traveledPath = L.polyline(flightPath, {
          color: '#ffb347',     // Amber/orange for traveled path
          weight: 3.5,
          opacity: 0.8,
          dashArray: 'none',    // Solid line for actual path taken
          className: 'flight-path-line'
        }).addTo(map);

        // Add animated dashes overlay to show direction of travel
        const animatedOverlay = L.polyline(flightPath, {
          color: '#ff9e00',
          weight: 2.5,
          opacity: 0.9,
          dashArray: '10,15',
          className: 'flight-path-animated'
        }).addTo(map);

        layers.push(traveledPath);
        layers.push(animatedOverlay);
        
        // Store reference to animated layer for cleanup
        traveledPath.animatedLayer = animatedOverlay;
        plannedAirwayRef.current = traveledPath;
      }

      // Store planned route reference for cleanup
      if (layers.length > 0 && layers[0]) {
        if (plannedAirwayRef.current) {
          plannedAirwayRef.current.plannedRoute = layers[0];
        } else {
          plannedAirwayRef.current = layers[0];
        }
      }
    } else {
      if (plannedAirwayRef.current) {
        if (plannedAirwayRef.current.animatedLayer) {
          map.removeLayer(plannedAirwayRef.current.animatedLayer);
        }
        if (plannedAirwayRef.current.plannedRoute) {
          map.removeLayer(plannedAirwayRef.current.plannedRoute);
        }
        map.removeLayer(plannedAirwayRef.current);
        plannedAirwayRef.current = null;
      }
    }
  }, [selectedFlight]);

  // Handle panning to selected airport
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedAirport) return;
    map.panTo([selectedAirport.lat, selectedAirport.lng]);
    map.setZoom(8);
  }, [selectedAirport]);

  // Density Heatmap Layer toggling
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (heatmapActive) {
      // Simulate flight coordinates as heat points
      const heatPoints = flights.map(f => L.circle([f.lat, f.lng], {
        radius: 380000,
        color: 'var(--cyan)',
        fillColor: 'var(--cyan)',
        fillOpacity: 0.15,
        weight: 0
      }));
      heatmapLayerRef.current = L.layerGroup(heatPoints).addTo(map);
    }
  }, [heatmapActive, flights]);

  // ── "You Are Here" GPS marker ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old pin
    if (userLocationPinRef.current) {
      map.removeLayer(userLocationPinRef.current);
      userLocationPinRef.current = null;
    }

    if (!userRealCoords) return;

    const youAreHereIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative; width:24px; height:24px;">
          <!-- Outer pulse ring -->
          <div style="
            position:absolute; inset:-6px;
            border-radius:50%;
            border:2px solid rgba(0,212,255,0.5);
            animation:pulse 1.8s infinite alternate;
          "></div>
          <!-- Inner filled dot -->
          <div style="
            width:14px; height:14px;
            border-radius:50%;
            background:var(--cyan);
            border:2.5px solid #fff;
            box-shadow:0 0 12px var(--cyan), 0 0 4px #fff;
            position:absolute; top:5px; left:5px;
          "></div>
        </div>
        <div style="
          position:absolute; top:26px; left:50%; transform:translateX(-50%);
          font-family:var(--font-mono); font-size:8px; font-weight:bold;
          color:var(--cyan); background:rgba(4,8,16,0.9);
          padding:1px 5px; border-radius:3px;
          border:1px solid rgba(0,212,255,0.35);
          white-space:nowrap;
        ">YOU ARE HERE</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userLocationPinRef.current = L.marker(
      [userRealCoords.lat, userRealCoords.lng],
      { icon: youAreHereIcon, zIndexOffset: 1000 }
    ).addTo(map);

    // Pan to real location
    map.setView([userRealCoords.lat, userRealCoords.lng], 10, { animate: true });
  }, [userRealCoords]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div className="leaflet-vignette" />
      <div className="radar-sweep" />
    </div>
  );
});

export default MapView;

// Distance Helper
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
