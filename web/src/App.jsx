import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Search, Bookmark, BarChart3, User, 
  ShieldAlert, Compass, CloudLightning, RefreshCw, 
  MapPin, Clock, Info, Shield, Plane, BookOpen, AlertTriangle
} from 'lucide-react';

import MapView from './simulator/MapView';
import BottomSheet from './simulator/BottomSheet';
import SearchPanel from './simulator/SearchPanel';
import BookmarksPanel from './simulator/BookmarksPanel';
import StatsPanel from './simulator/StatsPanel';
import SettingsPanel from './simulator/SettingsPanel';
import CockpitHUD from './simulator/CockpitHUD';
import ARScanner from './simulator/ARScanner';

import { 
  generateFlights, 
  updateSimulation, 
  AIRPORTS, 
  getDistance, 
  getBearing,
  fetchLiveOpenSkyFlights
} from './mock/flightData';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('map'); // map, search, bookmarks, stats, profile
  
  // Simulation State
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [bookmarks, setBookmarks] = useState(['FL-1000', 'FL-1001', 'LHR']);
  
  // Controls & Developer Injection
  const [userLocation, setUserLocation] = useState('LHR'); // LHR, JFK, DXB
  const [squawkTrigger, setSquawkTrigger] = useState(null); // { flightId, code }
  const [stormActive, setStormActive] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0); // in hours
  const [heatmapActive, setHeatmapActive] = useState(false);

  // Data Source Mode
  const [dataSourceMode, setDataSourceMode] = useState('opensky'); // simulated, opensky
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveFlightCount, setLiveFlightCount] = useState(0);

  // Real GPS location state
  const [userRealCoords, setUserRealCoords] = useState(null);   // { lat, lng }
  const [locating, setLocating]             = useState(false);
  const [locationError, setLocationError]   = useState(null);
  const mapViewRef                          = useRef(null);      // used to call panTo from outside

  // App Settings
  const [tier, setTier] = useState('Free'); // Free, Silver, Gold
  const [units, setUnits] = useState('Imperial'); // Imperial, Metric
  const [timeFormat, setTimeFormat] = useState('UTC'); // UTC, Local
  const [mapStyle, setMapStyle] = useState('flightradar'); // flightradar, light, satellite, topographic, weather, aeronautical
  const [trailLength, setTrailLength] = useState(40);
  const [sheetHeight, setSheetHeight] = useState('collapsed'); // collapsed, half, full, hidden

  // Screen Overlay States (Full Screen inside phone mockup)
  const [viewing3D, setViewing3D] = useState(false);
  const [viewingAR, setViewingAR] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  // Initialize Flight Data
  useEffect(() => {
    if (dataSourceMode === 'simulated') {
      const initial = generateFlights();
      setFlights(initial);
    }
  }, [dataSourceMode]);

  // Simulation Update Loop (Ticking position updates every 3 seconds)
  useEffect(() => {
    if (dataSourceMode !== 'simulated' || flights.length === 0) return;
    
    const interval = setInterval(() => {
      setFlights(prev => {
        const updated = updateSimulation(prev, squawkTrigger, stormActive);
        
        // If selected flight is currently updated, sync its new position to selected flight state
        if (selectedFlight) {
          const matched = updated.find(f => f.id === selectedFlight.id);
          if (matched) {
            setSelectedFlight(matched);
          }
        }
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [dataSourceMode, flights, squawkTrigger, stormActive, selectedFlight]);

  // OpenSky Real-time Fetch Loop
  // NOTE: selectedFlight intentionally excluded from deps — re-syncing inside
  // the setter avoids restarting the interval on every flight selection.
  useEffect(() => {
    if (dataSourceMode !== 'opensky') return;

    const fetchLive = async () => {
      setLoadingLive(true);
      try {
        let bbox = null;
        if (userRealCoords) {
          // Bounding box centered on user's real GPS coordinates (+/- 6 deg lat, +/- 10 deg lng)
          bbox = {
            lamin: userRealCoords.lat - 6.0,
            lomin: userRealCoords.lng - 10.0,
            lamax: userRealCoords.lat + 6.0,
            lomax: userRealCoords.lng + 10.0
          };
        }
        const liveFlights = await fetchLiveOpenSkyFlights(userLocation, bbox);
        if (liveFlights && liveFlights.length > 0) {
          setFlights(liveFlights);
          setLiveFlightCount(liveFlights.length);
          // Re-sync selected flight by reading current state inside setter
          setSelectedFlight(prev => {
            if (!prev) return prev;
            return liveFlights.find(f => f.id === prev.id) || prev;
          });
        }
      } catch (err) {
        console.error('[SkyWatch] Live fetch error:', err);
      } finally {
        setLoadingLive(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 30000); // refresh every 30s

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceMode, userLocation, userRealCoords]);

  // Handle Squawk Triggers and Trigger Banner Toasts
  useEffect(() => {
    if (squawkTrigger) {
      const flight = flights.find(f => f.id === squawkTrigger.flightId);
      if (flight) {
        setToast({
          title: `SQUAWK WARNING: ${squawkTrigger.code}`,
          desc: `${flight.airline} flight ${flight.callsign} broadcasting emergency squawk!`,
          flightId: flight.id
        });
        
        // Auto-dismiss toast after 8 seconds
        const t = setTimeout(() => setToast(null), 8000);
        return () => clearTimeout(t);
      }
    }
  }, [squawkTrigger]);

  // Bookmarks Logic
  const handleToggleBookmark = (id) => {
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter(b => b !== id));
    } else {
      // Free tier restriction
      if (bookmarks.length >= 3 && tier === 'Free') {
        alert('Free tier limit reached (Max 3 bookmarks). Upgrade to Silver or Gold in the Profile tab for unlimited bookmarks!');
        return;
      }
      setBookmarks([...bookmarks, id]);
    }
  };

  const handleRemoveBookmark = (id) => {
    setBookmarks(bookmarks.filter(b => b !== id));
  };

  // Get active coordinates — real GPS first, then hub fallback
  const getUserCoordinates = () => {
    if (userRealCoords) return userRealCoords;
    const hub = AIRPORTS[userLocation];
    return { lat: hub.lat, lng: hub.lng };
  };

  // Request real GPS location and pan the map
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserRealCoords(coords);
        setLocating(false);
        // Pan the Leaflet map via the ref exposed by MapView
        if (mapViewRef.current && mapViewRef.current.panTo) {
          mapViewRef.current.panTo(coords, 7);
        }
      },
      (err) => {
        setLocating(false);
        setLocationError(err.message || 'Location access denied.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Calculate distance & direction bearing from simulated phone location
  const getNearbyFlights = () => {
    const coords = getUserCoordinates();
    return flights.map(f => {
      const dist = getDistance(coords.lat, coords.lng, f.lat, f.lng);
      const bearing = getBearing(coords.lat, coords.lng, f.lat, f.lng);
      return { ...f, dist, bearing };
    })
    .filter(f => f.dist <= 150)
    .sort((a, b) => a.dist - b.dist);
  };

  const nearbyList = getNearbyFlights();

  // Handle search panels or notifications selecting target
  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    setSelectedAirport(null);
    setSheetHeight('half');
    setActiveTab('map');
  };

  const handleSelectAirport = (airport) => {
    setSelectedAirport(airport);
    setSelectedFlight(null);
    setSheetHeight('half');
    setActiveTab('map');
  };

  // Handle map style overrides if weather layer selected
  useEffect(() => {
    if (mapStyle === 'weather') {
      setMapStyle('weather');
    }
  }, [mapStyle]);

  return (
    <div className="phone-simulator-container">
      
      {/* LEFT AREA: Smartphone Simulator Frame */}
      <div className="phone-view-area">
        
        {/* Smartphone Shell Mockup */}
        <div className="smartphone-mockup">
          
          {/* Top Notch speaker and camera */}
          <div className="phone-notch">
            <div className="phone-camera" />
            <div className="phone-speaker" />
          </div>

          {/* Status Bar */}
          <div className="phone-status-bar">
            <span className="data-font">11:24</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <WifiIcon />
              <span className="data-font">5G</span>
              <BatteryIcon />
            </div>
          </div>

          {/* Internal Mobile App Screen content */}
          <div className="phone-screen-content">
            
            {/* Real-time Toast banner warning */}
            {toast && (
              <div 
                onClick={() => {
                  const target = flights.find(f => f.id === toast.flightId);
                  if (target) handleSelectFlight(target);
                  setToast(null);
                }}
                style={{
                  position: 'absolute',
                  top: '60px',
                  left: '16px',
                  right: '16px',
                  background: 'rgba(255, 77, 106, 0.95)',
                  border: '1.5px solid #ff4d6a',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#fff',
                  boxShadow: 'var(--shadow-red)',
                  zIndex: 9999,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  animation: 'pulse 1s infinite alternate'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                  <ShieldAlert size={14} />
                  <span>{toast.title}</span>
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9 }}>{toast.desc}</div>
                <div style={{ fontSize: '8px', color: '#ffdee3', marginTop: '2px', textAlign: 'right' }}>TAP TO INTERCEPT →</div>
              </div>
            )}

            {/* SCREEN LAYERS: AR Feed Overlay */}
            {viewingAR && (
              <ARScanner 
                flights={flights}
                userCoords={getUserCoordinates()}
                onSelectFlight={handleSelectFlight}
                onClose={() => setViewingAR(false)}
              />
            )}

            {/* SCREEN LAYERS: 3D Cockpit HUD Overlay */}
            {viewing3D && selectedFlight && (
              <CockpitHUD 
                flight={selectedFlight}
                onClose={() => setViewing3D(false)}
              />
            )}

            {/* ACTIVE PAGE CONTENT */}
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
              
              {/* Tab 1: Live Map View */}
              {activeTab === 'map' && (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  
                  {/* Floating Map Controls overlay */}
                  <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 999, pointerEvents: 'auto', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* Live data status badge */}
                    {dataSourceMode === 'opensky' && (
                      <div style={{
                        background: 'rgba(8, 14, 28, 0.92)',
                        border: `1px solid ${loadingLive ? 'rgba(0,212,255,0.3)' : 'rgba(57,255,138,0.4)'}`,
                        color: loadingLive ? 'var(--cyan)' : 'var(--green)',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: loadingLive ? 'var(--shadow-glow)' : '0 0 8px rgba(57,255,138,0.25)'
                      }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: loadingLive ? 'var(--cyan)' : 'var(--green)',
                          animation: loadingLive ? 'pulse 0.8s infinite alternate' : 'pulse 2s infinite alternate',
                          display: 'inline-block'
                        }} />
                        {loadingLive ? 'FETCHING…' : `LIVE · ${liveFlightCount} A/C`}
                      </div>
                    )}

                    {/* "What's Flying Over Me" quick search banner button */}
                    <button 
                      onClick={() => {
                        const nearest = nearbyList[0];
                        if (nearest) {
                          handleSelectFlight(nearest);
                        } else {
                          alert(`No flights within 150km of ${userLocation} hub right now.`);
                        }
                      }}
                      style={{
                        background: 'rgba(8, 14, 28, 0.9)',
                        border: '1px solid var(--border-cyan)',
                        color: 'var(--cyan)',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                    >
                      <Compass size={11} />
                      <span>Overhead</span>
                    </button>

                    {/* AR button */}
                    <button 
                      onClick={() => setViewingAR(true)}
                      style={{
                        background: 'rgba(8, 14, 28, 0.9)',
                        border: '1px solid var(--border-cyan)',
                        color: '#fff',
                        padding: '5px 9px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                    >
                      📷 AR
                    </button>
                  </div>

                  {/* My Location Button — bottom-right corner of the map */}
                  <div style={{ position: 'absolute', bottom: '120px', right: '12px', zIndex: 999, pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <button
                      id="locate-me-btn"
                      onClick={handleLocateMe}
                      title="Go to my current location"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: userRealCoords ? 'rgba(0,212,255,0.18)' : 'rgba(8,14,28,0.92)',
                        border: `2px solid ${userRealCoords ? 'var(--cyan)' : 'rgba(255,255,255,0.15)'}`,
                        color: userRealCoords ? 'var(--cyan)' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: locating ? 'wait' : 'pointer',
                        boxShadow: userRealCoords ? 'var(--shadow-glow)' : '0 2px 8px rgba(0,0,0,0.5)',
                        transition: 'all 0.25s',
                        flexShrink: 0
                      }}
                    >
                      {locating
                        ? <RefreshCw size={16} style={{ animation: 'spin 1.2s infinite linear' }} />
                        : <MapPin size={16} fill={userRealCoords ? 'var(--cyan)' : 'none'} />
                      }
                    </button>
                    {locationError && (
                      <div style={{
                        background: 'rgba(255,77,106,0.9)',
                        color: '#fff',
                        fontSize: '9px',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        maxWidth: '120px',
                        textAlign: 'center',
                        lineHeight: 1.4
                      }}>{locationError}</div>
                    )}
                  </div>

                  {/* Leaflet map instance container */}
                  <MapView 
                    ref={mapViewRef}
                    flights={flights}
                    selectedFlight={selectedFlight}
                    selectedAirport={selectedAirport}
                    onSelectFlight={handleSelectFlight}
                    onSelectAirport={handleSelectAirport}
                    mapStyle={mapStyle}
                    heatmapActive={heatmapActive}
                    tier={tier}
                    userRealCoords={userRealCoords}
                  />

                  {/* iOS Style Bottom Sheet Drawer */}
                  <BottomSheet 
                    selectedFlight={selectedFlight}
                    selectedAirport={selectedAirport}
                    flights={flights}
                    bookmarks={bookmarks}
                    onToggleBookmark={handleToggleBookmark}
                    onOpen3D={(f) => {
                      setSelectedFlight(f);
                      setViewing3D(true);
                    }}
                    onClose={() => {
                      setSelectedFlight(null);
                      setSelectedAirport(null);
                      setSheetHeight('hidden');
                    }}
                    sheetHeight={sheetHeight}
                    setSheetHeight={setSheetHeight}
                    units={units}
                    timeFormat={timeFormat}
                    tier={tier}
                  />
                </div>
              )}

              {/* Tab 2: Full Search View */}
              {activeTab === 'search' && (
                <SearchPanel 
                  flights={flights}
                  onSelectFlight={handleSelectFlight}
                  onSelectAirport={handleSelectAirport}
                  recentSearches={bookmarks.slice(0,3)} // mocked searches
                  setRecentSearches={() => {}}
                  onClose={() => setActiveTab('map')}
                />
              )}

              {/* Tab 3: Bookmarks */}
              {activeTab === 'bookmarks' && (
                <BookmarksPanel 
                  flights={flights}
                  bookmarks={bookmarks}
                  onRemoveBookmark={handleRemoveBookmark}
                  onSelectFlight={handleSelectFlight}
                  onSelectAirport={handleSelectAirport}
                />
              )}

              {/* Tab 4: Live stats */}
              {activeTab === 'stats' && (
                <StatsPanel 
                  flights={flights}
                  onSelectFlight={handleSelectFlight}
                  onToggleHeatmap={() => setHeatmapActive(!heatmapActive)}
                  heatmapActive={heatmapActive}
                />
              )}

              {/* Tab 5: Profile/Settings */}
              {activeTab === 'profile' && (
                <SettingsPanel 
                  tier={tier}
                  setTier={setTier}
                  units={units}
                  setUnits={setUnits}
                  timeFormat={timeFormat}
                  setTimeFormat={setTimeFormat}
                  mapStyle={mapStyle}
                  setMapStyle={setMapStyle}
                  trailLength={trailLength}
                  setTrailLength={setTrailLength}
                />
              )}
            </div>

            {/* Bottom Tab Navigation Bar */}
            <div style={{ height: '60px', borderTop: '1px solid var(--border-cyan)', background: 'var(--panel-bg)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 10 }}>
              {[
                { id: 'map', label: 'Map', icon: <Map size={18} /> },
                { id: 'search', label: 'Search', icon: <Search size={18} /> },
                { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark size={18} /> },
                { id: 'stats', label: 'Stats', icon: <BarChart3 size={18} /> },
                { id: 'profile', label: 'Profile', icon: <User size={18} /> }
              ].map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Close bottom sheets on page changes
                      if (tab.id !== 'map') {
                        setSheetHeight('hidden');
                        setSelectedFlight(null);
                        setSelectedAirport(null);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: active ? 'var(--cyan)' : 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: active ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Home Indicator overlay */}
            <div className="phone-home-indicator" />
          </div>
        </div>
      </div>

      {/* RIGHT AREA: ADS-B Control Terminal Side Panel */}
      <div className="simulator-side-panel">
        
        {/* Terminal Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-cyan)', background: 'var(--bg-dark)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} style={{ color: 'var(--cyan)' }} />
            <span style={{ fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-primary)' }}>
              ADS-B Control Panel
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Simulate real-world aviation events and monitor live telemetry in the SkyWatch viewport.
          </p>
        </div>

        {/* Section 0: Data Source Selection */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-cyan)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={11} style={{ color: 'var(--cyan)' }} />
            <span>Telemetry Data Source</span>
          </div>

          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.03)', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setDataSourceMode('simulated')}
              style={{
                flex: 1,
                background: dataSourceMode === 'simulated' ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                border: 'none',
                color: dataSourceMode === 'simulated' ? 'var(--cyan)' : 'var(--text-muted)',
                padding: '10px 0',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              MOCK SIMULATOR
            </button>
            
            <button
              onClick={() => setDataSourceMode('opensky')}
              style={{
                flex: 1,
                background: dataSourceMode === 'opensky' ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                border: 'none',
                color: dataSourceMode === 'opensky' ? 'var(--cyan)' : 'var(--text-muted)',
                padding: '10px 0',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              {loadingLive && <RefreshCw size={10} style={{ animation: 'spin 1.5s infinite linear', marginRight: '4px' }} />}
              REAL-TIME (OPENSKY)
            </button>
          </div>
          
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {dataSourceMode === 'simulated' 
              ? 'Ticking mock ADS-B paths over London, New York, and Dubai hubs.'
              : 'Pulling real-time global aircraft telemetry coordinates in the hub airspace.'}
          </div>
        </div>

        {/* Section 1: Simulated Geolocation */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-cyan)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={11} style={{ color: 'var(--cyan)' }} />
            <span>Simulate Device Location</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {['LHR', 'JFK', 'DXB'].map(hub => {
              const active = userLocation === hub;
              return (
                <button
                  key={hub}
                  onClick={() => {
                    setUserLocation(hub);
                    setUserRealCoords(null);
                  }}
                  style={{
                    background: active ? 'rgba(2, 132, 199, 0.12)' : 'rgba(15, 23, 42, 0.03)',
                    border: `1.5px solid ${active ? 'var(--cyan)' : 'rgba(15, 23, 42, 0.08)'}`,
                    color: active ? 'var(--cyan)' : 'var(--text-primary)',
                    padding: '8px 0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: active ? 'bold' : 'normal',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {hub}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Calculates bearings/distances for the "AR View" and "Overhead Scan" around this hub.
          </div>
        </div>

        {/* Section 2: Squawk Emergency Injection */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(0, 212, 255, 0.06)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={11} style={{ color: 'var(--red)' }} />
            <span>Emergency Squawk Injector</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setSquawkTrigger({ flightId: 'FL-1001', code: '7700' })}
                style={{
                  flex: 1,
                  background: 'rgba(255, 77, 106, 0.12)',
                  border: '1.5px solid rgba(255, 77, 106, 0.3)',
                  color: 'var(--red)',
                  padding: '8px 0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                7700 (Emergency)
              </button>

              <button
                onClick={() => setSquawkTrigger({ flightId: 'FL-1000', code: '7600' })}
                style={{
                  flex: 1,
                  background: 'rgba(255, 179, 71, 0.12)',
                  border: '1.5px solid rgba(255, 179, 71, 0.3)',
                  color: 'var(--amber)',
                  padding: '8px 0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                7600 (Comms Fail)
              </button>
            </div>

            {squawkTrigger && (
              <button
                onClick={() => setSquawkTrigger(null)}
                style={{
                  background: 'rgba(15, 23, 42, 0.04)',
                  border: '1px solid rgba(15, 23, 42, 0.1)',
                  color: 'var(--text-primary)',
                  padding: '6px 0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Clear Simulated Emergency
              </button>
            )}
          </div>
        </div>

        {/* Section 3: Weather Turbulence Simulator */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CloudLightning size={11} style={{ color: 'var(--amber)' }} />
              <span>Turbulence & Storms</span>
            </div>
            <span style={{ fontSize: '9px', background: stormActive ? 'var(--red)' : 'rgba(15, 23, 42, 0.06)', color: stormActive ? '#fff' : 'var(--text-primary)', padding: '1px 5px', borderRadius: '3px' }}>
              {stormActive ? 'ACTIVE' : 'OFF'}
            </span>
          </div>

          <button
            onClick={() => setStormActive(!stormActive)}
            style={{
              width: '100%',
              background: stormActive ? 'rgba(185, 28, 28, 0.12)' : 'rgba(15, 23, 42, 0.03)',
              border: `1.5px solid ${stormActive ? 'var(--red)' : 'rgba(15, 23, 42, 0.08)'}`,
              color: stormActive ? 'var(--red)' : 'var(--text-primary)',
              padding: '10px 0',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {stormActive ? 'Disable Severe Weather' : 'Simulate Trans-Atlantic Storms'}
          </button>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Activating storm clouds reduces flight speeds over active oceans to simulate route vectors.
          </div>
        </div>

        {/* Section 4: Time Machine slider */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} style={{ color: 'var(--cyan)' }} />
              <span>Time Machine Replay</span>
            </div>
            <span className="data-font" style={{ fontSize: '10px', color: 'var(--cyan)', fontWeight: 'bold' }}>
              {timeOffset === 0 ? 'LIVE FEED' : `-${timeOffset} HOURS`}
            </span>
          </div>

          <input 
            type="range"
            min="0"
            max="24"
            step="6"
            value={timeOffset}
            onChange={(e) => setTimeOffset(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--cyan)' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }} className="data-font">
            <span>LIVE</span>
            <span>-6H</span>
            <span>-12H</span>
            <span>-18H</span>
            <span>-24H</span>
          </div>
        </div>

        {/* Section 5: "What's Flying Over Me" Radar Compass */}
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={11} style={{ color: 'var(--cyan)' }} />
            <span>Overhead Radar (150km around {userLocation})</span>
          </div>

          {nearbyList.length === 0 ? (
            <div style={{ border: '1px dashed rgba(0,212,255,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
              No active targets detected.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {nearbyList.map(f => {
                const isSelected = selectedFlight?.id === f.id;
                const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
                const dir = directions[Math.round(f.bearing / 45) % 8];

                return (
                  <div
                    key={f.id}
                    onClick={() => handleSelectFlight(f)}
                    style={{
                      background: isSelected ? 'rgba(180, 83, 9, 0.1)' : 'rgba(15, 23, 42, 0.03)',
                      border: `1px solid ${isSelected ? 'var(--amber)' : 'rgba(15, 23, 42, 0.08)'}`,
                      borderRadius: '6px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div className="data-font" style={{ fontSize: '11px', fontWeight: 'bold', color: isSelected ? 'var(--amber)' : 'var(--cyan)' }}>
                        {f.callsign} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '9px' }}>({f.type})</span>
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {f.origin} → {f.dest} • {f.airline}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }} className="data-font">
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{Math.round(f.dist)} km</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{dir} ({Math.round(f.bearing)}°)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// Battery & Wifi Custom SVG Icons for the Phone Status Bar
function BatteryIcon() {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="16" height="9" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <rect x="2" y="2" width="10" height="6" rx="0.5" fill="var(--green)" />
      <path d="M18 3.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 9C8.10457 9 9 8.10457 9 7C9 5.89543 8.10457 5 7 5C5.89543 5 5 5.89543 5 7C5 8.10457 5.89543 9 7 9Z" fill="currentColor" />
      <path d="M3.5 5.5C4.5 4.5 5.7 4 7 4C8.3 4 9.5 4.5 10.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M1.5 3.5C3 2 5 1 7 1C9 1 11 2 12.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
