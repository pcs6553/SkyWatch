import React, { useState, useEffect } from 'react';
import { Plane, Star, Bell, Compass, Share2, Landmark, Clock, ArrowRight, Wind, ShieldAlert, Thermometer, User, CompassIcon, Camera } from 'lucide-react';
import { getMETAR, AIRPORTS, fetchAircraftPhoto } from '../mock/flightData';

// Translation helper to access window.__FR24_SSR_LAZY_TRANSLATIONS__
const t = (path, fallback) => {
  if (!window.__FR24_SSR_LAZY_TRANSLATIONS__ || !window.__FR24_SSR_LAZY_TRANSLATIONS__.messages) {
    return fallback;
  }
  const parts = path.split('.');
  let current = window.__FR24_SSR_LAZY_TRANSLATIONS__.messages;
  for (const part of parts) {
    if (current && current[part] !== undefined) {
      current = current[part];
    } else {
      return fallback;
    }
  }
  return typeof current === 'string' ? current : fallback;
};

export default function BottomSheet({ 
  selectedFlight, 
  selectedAirport, 
  flights, 
  bookmarks, 
  onToggleBookmark, 
  onOpen3D, 
  onClose,
  sheetHeight,
  setSheetHeight,
  units,
  timeFormat,
  tier
}) {
  const [activeTab, setActiveTab] = useState('flight-info'); // flight-info, aircraft-info, arrivals, departures, weather, delays
  const [aircraftPhoto, setAircraftPhoto] = useState(null); // { src, link, photographer } | null

  // Reset tabs when the *selection itself* changes — not on every data
  // refresh. Live flights get a brand new object reference every ~30s poll
  // (App.jsx re-syncs selectedFlight from the freshly fetched array), even
  // when it's the same aircraft. Depending on the whole object here meant
  // this effect re-fired on every refresh and silently snapped the user back
  // to the Flight Info tab if they'd switched to Aircraft Specs.
  useEffect(() => {
    if (selectedFlight) {
      setActiveTab('flight-info');
    } else if (selectedAirport) {
      setActiveTab('arrivals');
    }
  }, [selectedFlight?.id, selectedAirport?.iata]);

  // Look up a real photo of the selected aircraft by its ICAO24 hex address.
  // Mock/simulated flights don't have a real icao24, so this only resolves
  // for live (FlightRadar24-sourced) flights.
  useEffect(() => {
    setAircraftPhoto(null);
    if (!selectedFlight?.icao24) return;
    let cancelled = false;
    fetchAircraftPhoto(selectedFlight.icao24).then((photo) => {
      if (!cancelled) setAircraftPhoto(photo);
    });
    return () => { cancelled = true; };
  }, [selectedFlight?.icao24]);

  if (!selectedFlight && !selectedAirport) return null;

  // Handle drag handle cycle clicks
  const cycleHeight = () => {
    if (sheetHeight === 'collapsed') {
      setSheetHeight('half');
    } else if (sheetHeight === 'half') {
      setSheetHeight('full');
    } else {
      setSheetHeight('collapsed');
    }
  };

  const isBookmarked = selectedFlight 
    ? bookmarks.includes(selectedFlight.id) 
    : bookmarks.includes(selectedAirport?.iata);

  // Helper conversions
  const displayAlt = (feet) => {
    if (units === 'Metric') {
      return `${Math.round(feet * 0.3048).toLocaleString()} m`;
    }
    return `${feet.toLocaleString()} ft`;
  };

  const displaySpeed = (kts) => {
    if (units === 'Metric') {
      return `${Math.round(kts * 1.852)} km/h`;
    }
    return `${kts} kts`;
  };

  return (
    <div className={`bottom-sheet-drawer ${sheetHeight}`}>
      
      {/* Drag Handle */}
      <div className="bottom-sheet-drag-handle" onClick={cycleHeight}>
        <div className="bottom-sheet-drag-bar" />
      </div>

      {/* Close button */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          right: '16px',
          top: '12px',
          background: 'rgba(0,0,0,0.06)',
          border: 'none',
          color: 'var(--text-primary)',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100
        }}
      >
        ✕
      </button>

      {/* Drawer Content */}
      <div className="bottom-sheet-content">
        
        {/* FLIGHT DRAWER DETAILS */}
        {selectedFlight && (
          <>
            {/* Header: Callsign & Basic Info */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="data-font" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--amber)' }}>
                  {selectedFlight.callsign}
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(255,179,71,0.15)', border: '1px solid var(--amber-muted)', color: 'var(--amber)', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  {selectedFlight.category}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginTop: '2px' }}>
                <span>{selectedFlight.airline}</span>
                <span>•</span>
                <span>{selectedFlight.type}</span>
              </div>
            </div>

            {/* Real aircraft photo (Planespotters), when available — only
                worth the space once the sheet is opened up */}
            {sheetHeight !== 'collapsed' && aircraftPhoto && (
              <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden', position: 'relative', background: '#0c1620', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={aircraftPhoto.src}
                  alt={`${selectedFlight.registration || selectedFlight.callsign} (${selectedFlight.type})`}
                  // contain (not cover) so the whole aircraft is visible —
                  // cover was cropping wingtips/nose depending on the source
                  // photo's aspect ratio. The dark backdrop above fills any
                  // letterboxing instead of leaving a hard white edge.
                  style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                  onError={() => setAircraftPhoto(null)}
                />
                <a
                  href={aircraftPhoto.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'absolute', right: '6px', bottom: '6px',
                    fontSize: '9px', color: '#fff', background: 'rgba(0,0,0,0.55)',
                    padding: '2px 6px', borderRadius: '4px', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Camera size={10} /> {aircraftPhoto.photographer || 'Planespotters'}
                </a>
              </div>
            )}

            {/* Route Progress section (only visible in half/full views) */}
            {sheetHeight !== 'collapsed' && (
              <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Route codes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div className="data-font" style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--cyan)' }}>{selectedFlight.origin}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{AIRPORTS[selectedFlight.origin]?.city || 'Origin'}</div>
                  </div>
                  
                  {/* Progress Line */}
                  <div style={{ flex: 1, margin: '0 16px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: '2px', background: 'rgba(0, 212, 255, 0.15)' }} />
                    <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--cyan)', left: `calc(${selectedFlight.progress * 100}% - 4px)` }} />
                    <Plane size={12} style={{ position: 'absolute', color: 'var(--cyan)', left: `calc(${selectedFlight.progress * 100}% - 6px)`, transform: 'rotate(90deg) translateY(-8px)' }} />
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="data-font" style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--cyan)' }}>{selectedFlight.dest}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{AIRPORTS[selectedFlight.dest]?.city || 'Destination'}</div>
                  </div>
                </div>
                
                {/* Times */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-primary)' }} className="data-font">
                  <span>DEP: 11:20 {timeFormat}</span>
                  <span>ARR: 17:45 {timeFormat} (Estimated)</span>
                </div>
              </div>
            )}

            {/* TAB SELECTORS (only visible in full view) */}
            {sheetHeight === 'full' && (
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,212,255,0.08)', marginBottom: '16px' }}>
                <button 
                  onClick={() => setActiveTab('flight-info')}
                  style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', color: activeTab === 'flight-info' ? 'var(--cyan)' : 'var(--text-muted)', fontSize: '13px', borderBottom: activeTab === 'flight-info' ? '2.5px solid var(--cyan)' : 'none', cursor: 'pointer', fontWeight: activeTab === 'flight-info' ? 'bold' : 'normal' }}
                >
                  {t('aircraft.tabs.route', 'Flight Info')}
                </button>
                <button 
                  onClick={() => setActiveTab('aircraft-info')}
                  style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', color: activeTab === 'aircraft-info' ? 'var(--cyan)' : 'var(--text-muted)', fontSize: '13px', borderBottom: activeTab === 'aircraft-info' ? '2.5px solid var(--cyan)' : 'none', cursor: 'pointer', fontWeight: activeTab === 'aircraft-info' ? 'bold' : 'normal' }}
                >
                  {t('aircraft.title', 'Aircraft Specs')}
                </button>
              </div>
            )}

            {/* TAB 1: FLIGHT INFORMATION GRID */}
            {(activeTab === 'flight-info' || sheetHeight === 'half') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                
                {/* Altitude visual slider bar (only in half/full) */}
                {sheetHeight !== 'collapsed' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>ALTITUDE PROFILE</span>
                      <span className="data-font">{displayAlt(selectedFlight.altitude)} (FL{Math.round(selectedFlight.altitude / 100)})</span>
                    </div>
                    {/* Visual gradient 0 to 45,000ft */}
                    <div style={{ width: '100%', height: '8px', background: 'linear-gradient(to right, #00d4ff, #ffb347)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: `${(selectedFlight.altitude / 45000) * 100}%`, 
                          width: '4px', 
                          backgroundColor: '#fff', 
                          boxShadow: '0 0 6px rgba(255,255,255,0.8)' 
                        }} 
                      />
                    </div>
                  </div>
                )}

                {/* 2-Column ADS-B readouts */}
                {sheetHeight !== 'collapsed' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    
                    <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.altitude', 'ALTITUDE').toUpperCase()}</span>
                      <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold' }}>{displayAlt(selectedFlight.altitude)}</span>
                    </div>
                    
                    <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.ground_speed', 'GROUND SPEED').toUpperCase()}</span>
                      <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold' }}>{displaySpeed(selectedFlight.speed)}</span>
                    </div>

                    <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.track', 'HEADING / TRACK').toUpperCase()}</span>
                      <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold' }}>{Math.round(selectedFlight.heading)}°</span>
                    </div>

                    <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.vertical_speed', 'VERTICAL SPEED').toUpperCase()}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <ArrowRight size={12} style={{ color: selectedFlight.verticalSpeed > 0 ? 'var(--green)' : selectedFlight.verticalSpeed < 0 ? 'var(--red)' : 'var(--text-muted)', transform: selectedFlight.verticalSpeed > 0 ? 'rotate(-90deg)' : selectedFlight.verticalSpeed < 0 ? 'rotate(90deg)' : 'none' }} />
                        <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold', color: selectedFlight.verticalSpeed > 0 ? 'var(--green)' : selectedFlight.verticalSpeed < 0 ? 'var(--red)' : 'var(--text-primary)' }}>
                          {selectedFlight.verticalSpeed > 0 ? `▲ +${selectedFlight.verticalSpeed}` : selectedFlight.verticalSpeed < 0 ? `▼ ${selectedFlight.verticalSpeed}` : '0'} fpm
                        </span>
                      </div>
                    </div>

                    {/* Premium Gold Tier fields */}
                    {sheetHeight === 'full' && (
                      <>
                        <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.squawk', 'SQUAWK CODE').toUpperCase()}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold', color: selectedFlight.squawkState !== 'Normal' ? 'var(--red)' : 'var(--text-primary)' }}>{selectedFlight.squawk}</span>
                            {selectedFlight.squawkState !== 'Normal' && (
                              <span style={{ fontSize: '8px', color: 'var(--red)', fontWeight: 'bold', textTransform: 'uppercase' }}>{selectedFlight.squawkState}</span>
                            )}
                          </div>
                        </div>

                        <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.mach', 'MACH SPEED').toUpperCase()}</span>
                          <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold' }}>{selectedFlight.mach} M</span>
                        </div>

                        <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.wind', 'WIND ENVIRONMENT').toUpperCase()}</span>
                          <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Wind size={10} /> {selectedFlight.windSpeed} kts @ {selectedFlight.windDir}°
                          </span>
                        </div>

                        <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.temperature', 'OUTSIDE TEMPERATURE').toUpperCase()}</span>
                          <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Thermometer size={10} /> {selectedFlight.temp}°C
                          </span>
                        </div>
                      </>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AIRCRAFT DETAILS (photo and specs, only in full view) */}
            {activeTab === 'aircraft-info' && sheetHeight === 'full' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                
                {/* Real aircraft photo (same Planespotters lookup as the
                    header) — contain-fit on a dark backdrop, not cover, so
                    the whole airframe is visible regardless of the source
                    photo's aspect ratio. */}
                <div style={{ position: 'relative', width: '100%', height: '140px', background: '#0c1620', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {aircraftPhoto ? (
                    <>
                      <img
                        src={aircraftPhoto.src}
                        alt={`${selectedFlight.registration || selectedFlight.callsign} (${selectedFlight.type})`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <a
                        href={aircraftPhoto.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '11px', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Camera size={11} /> {aircraftPhoto.photographer || 'Planespotters'}
                      </a>
                    </>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No photo available for this aircraft</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.reg_number', 'TAIL REGISTRATION').toUpperCase()}</span>
                    <span className="data-font" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--cyan)' }}>{selectedFlight.registration}</span>
                  </div>

                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.age', 'AIRCRAFT AGE').toUpperCase()}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{tier !== 'Free' ? selectedFlight.age : '🔒 Silver Required'}</span>
                  </div>

                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('aircraft.info.msn_serial_number', 'SERIAL NUMBER (MSN)').toUpperCase()}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{tier !== 'Free' ? selectedFlight.msn : '🔒 Silver Required'}</span>
                  </div>

                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SEATING CAPACITY</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{selectedFlight.seatConfig}</span>
                  </div>

                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>POWERPLANT ENGINES</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{selectedFlight.engine}</span>
                  </div>

                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>LIVERY STYLE</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{selectedFlight.livery}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Flight actions sticky bar (only visible in half/full views) */}
            {sheetHeight !== 'collapsed' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(0, 212, 255, 0.08)', paddingTop: '12px', marginTop: '16px' }}>
                <button 
                  onClick={() => onToggleBookmark(selectedFlight.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: isBookmarked ? 'rgba(255, 179, 71, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isBookmarked ? 'var(--amber)' : 'rgba(255,255,255,0.1)'}`, padding: '8px 12px', borderRadius: '6px', color: isBookmarked ? 'var(--amber)' : 'var(--text-primary)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ★ {isBookmarked ? t('aircraft.bookmarks.remove_aircraft', 'Bookmarked') : t('aircraft.bookmarks.add_bookmark', 'Bookmark')}
                </button>

                <button 
                  onClick={() => onOpen3D(selectedFlight)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(0, 212, 255, 0.15)', border: '1px solid var(--border-cyan)', padding: '8px 12px', borderRadius: '6px', color: 'var(--cyan)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ▶ {t('aircraft.tabs.3d', 'Watch in 3D')}
                </button>
              </div>
            )}
          </>
        )}

        {/* AIRPORT DRAWER DETAILS */}
        {selectedAirport && (
          <>
            {/* Header: Name, codes, and location */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="data-font" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--cyan)' }}>
                  {selectedAirport.iata}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({selectedAirport.icao})</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginTop: '2px' }}>
                <span>{selectedAirport.name}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {[selectedAirport.city, selectedAirport.country].filter(Boolean).join(', ')}
                {selectedAirport.isWorld && selectedAirport.type && (
                  <span style={{ marginLeft: '6px', textTransform: 'capitalize', opacity: 0.8 }}>
                    • {String(selectedAirport.type).replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* TAB SELECTORS (only visible in full view) */}
            {sheetHeight === 'full' && (
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,212,255,0.08)', marginBottom: '16px', overflowX: 'auto' }}>
                {['arrivals', 'departures', 'weather', 'delays'].map(tab => {
                  let tabLabelKey = `airport.tabs.${tab}`;
                  if (tab === 'weather') tabLabelKey = 'airport.weather.conditions';
                  if (tab === 'delays') tabLabelKey = 'airport.tabs.more'; // Fallback mapping
                  
                  return (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{ flex: 1, padding: '10px 8px', background: 'none', border: 'none', color: activeTab === tab ? 'var(--cyan)' : 'var(--text-muted)', fontSize: '12px', borderBottom: activeTab === tab ? '2.5px solid var(--cyan)' : 'none', cursor: 'pointer', fontWeight: activeTab === tab ? 'bold' : 'normal', textTransform: 'capitalize', whiteSpace: 'nowrap' }}
                    >
                      {t(tabLabelKey, tab)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 1: ARRIVALS BOARD */}
            {(activeTab === 'arrivals' || sheetHeight === 'half') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                
                {/* Stats block (only half/full) */}
                {sheetHeight !== 'collapsed' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px', marginBottom: '8px' }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>ON-TIME RATIO</span>
                      <span className="data-font" style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--green)' }}>{selectedAirport.onTime != null ? `${selectedAirport.onTime}%` : '—'}</span>
                    </div>

                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>DAILY FLIGHT COUNT</span>
                      <span className="data-font" style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedAirport.flightsToday != null ? `${selectedAirport.flightsToday} flights today` : 'No live stats'}</span>
                    </div>
                  </div>
                )}

                {/* List of arriving flights */}
                {sheetHeight !== 'collapsed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('airport.common.arrival_information', 'LIVE ARRIVALS').toUpperCase()}</div>
                    
                    {flights.filter(f => f.dest === selectedAirport.iata).slice(0, 3).map(f => (
                      <div key={f.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px' }}>
                        <div>
                          <div className="data-font" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--amber)' }}>{f.callsign}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>From {f.origin} • {f.airline}</div>
                        </div>
                        
                        <div style={{ fontSize: '10px', textAlign: 'right' }}>
                          <div className="data-font" style={{ color: 'var(--cyan)' }}>ETA: 13:45</div>
                          <div style={{ color: 'var(--green)', fontSize: '9px' }}>On Time</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: DEPARTURES BOARD */}
            {activeTab === 'departures' && sheetHeight === 'full' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('airport.common.departure_information', 'LIVE DEPARTURES').toUpperCase()}</div>
                
                {flights.filter(f => f.origin === selectedAirport.iata).slice(0, 3).map(f => (
                  <div key={f.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px' }}>
                    <div>
                      <div className="data-font" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--amber)' }}>{f.callsign}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>To {f.dest} • {f.airline}</div>
                    </div>
                    
                    <div style={{ fontSize: '10px', textAlign: 'right' }}>
                      <div className="data-font" style={{ color: 'var(--cyan)' }}>STD: 12:10</div>
                      <div style={{ color: 'var(--green)', fontSize: '9px' }}>Airborne</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: AIRPORT WEATHER (METAR decode) */}
            {activeTab === 'weather' && sheetHeight === 'full' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                
                {/* METAR Raw readouts */}
                <div className="glass-card" style={{ borderLeft: '3px solid var(--cyan)' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('airport.general.latest_metar', 'RAW METAR').toUpperCase()}</div>
                  <div className="data-font" style={{ fontSize: '11px', color: 'var(--text-primary)', marginTop: '3px', lineHeight: '1.4' }}>
                    {getMETAR(selectedAirport.iata)}
                  </div>
                </div>

                {/* Decoded properties */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  
                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('airport.weather.wind', 'WIND CONDITIONS').toUpperCase()}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>120° @ 14 KTS</span>
                  </div>

                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>VISIBILITY</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>10 KM + (9999)</span>
                  </div>

                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>CLOUDS / CEILING</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Few 2,500ft, Broken 8,000ft</span>
                  </div>

                  <div className="glass-card" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('airport.weather.temperature', 'TEMPERATURE').toUpperCase()}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>18°C / 14°C</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DELAYS & DISRUPTIONS */}
            {activeTab === 'delays' && sheetHeight === 'full' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                
                {/* Delay count specs */}
                {selectedAirport.delayCount != null ? (
                  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: selectedAirport.delayCount > 15 ? 'var(--red)' : 'var(--amber)' }}>
                        {selectedAirport.delayCount > 15 ? 'Severe Disruptions' : 'Moderate delays'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Average delay today: {selectedAirport.avgDelay} mins
                      </div>
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3.5px solid ${selectedAirport.delayCount > 15 ? 'var(--red)' : 'var(--amber)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="data-font">
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{selectedAirport.delayCount}</span>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    No live delay data for this airport.
                  </div>
                )}

                {/* Disruptions mock heatmap text info */}
                <div style={{ fontSize: '10px', color: 'var(--text-primary)', lineHeight: '1.4' }} className="glass-card">
                  <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--cyan)' }}>Disruption Heatmap Analysis</div>
                  <span>High delays detected across incoming European air spaces. Custom flight routing (FIR slots) active to optimize delays.</span>
                </div>
              </div>
            )}

            {/* Airport actions sticky bar (only visible in half/full views) */}
            {sheetHeight !== 'collapsed' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', borderTop: '1px solid rgba(0, 212, 255, 0.08)', paddingTop: '12px', marginTop: '16px' }}>
                <button 
                  onClick={() => onToggleBookmark(selectedAirport.iata)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: isBookmarked ? 'rgba(255, 179, 71, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isBookmarked ? 'var(--amber)' : 'rgba(255,255,255,0.1)'}`, padding: '8px 12px', borderRadius: '6px', color: isBookmarked ? 'var(--amber)' : 'var(--text-primary)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ★ {isBookmarked ? t('airport.bookmarks.remove_airport', 'Bookmarked Airport') : t('airport.bookmarks.add_airport', 'Bookmark Airport')}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
