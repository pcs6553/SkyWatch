import React from 'react';
import { Bookmark, Plane, Building, Star, ExternalLink, ArrowRight, ShieldAlert, Wifi } from 'lucide-react';
import { AIRPORTS } from '../mock/flightData';

export default function BookmarksPanel({ flights, bookmarks, onRemoveBookmark, onSelectFlight, onSelectAirport }) {
  
  // Categorize bookmarks
  const bookmarkedFlights = flights.filter(f => bookmarks.includes(f.id));
  
  // Hardcoded bookmarked airports for the demo
  const bookmarkedAirports = Object.values(AIRPORTS).filter(a => bookmarks.includes(a.iata));

  const totalBookmarks = bookmarkedFlights.length + bookmarkedAirports.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-cyan)', background: 'var(--panel-bg)' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bookmark size={18} style={{ color: 'var(--cyan)' }} />
          <span>My Bookmarks</span>
        </div>
        
        {/* Tier Limit notification */}
        <div style={{ marginTop: '8px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(0, 212, 255, 0.05)', borderRadius: '6px', border: '1px solid var(--border-cyan)' }}>
          <span style={{ color: 'var(--text-primary)' }}>
            {totalBookmarks} of 3 bookmarks used
          </span>
          <span style={{ color: 'var(--amber)', fontWeight: 'bold', fontSize: '9px', textTransform: 'uppercase' }}>
            Free Tier Limit
          </span>
        </div>
      </div>

      {/* Bookmarks List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Flights Section */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plane size={12} />
            <span>Bookmarked Flights ({bookmarkedFlights.length})</span>
          </div>

          {bookmarkedFlights.length === 0 ? (
            <div style={{ border: '1px dashed var(--border-cyan)', borderRadius: '8px', padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              No bookmarked flights. Tap ★ on a flight to save it.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bookmarkedFlights.map(f => (
                <div 
                  key={f.id}
                  onClick={() => onSelectFlight(f)}
                  className="glass-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,179,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={14} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
                    </div>
                    <div>
                      <div className="data-font" style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--amber)' }}>
                        {f.callsign}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="data-font">{f.origin}</span>
                        <ArrowRight size={10} style={{ color: 'var(--text-muted)' }} />
                        <span className="data-font">{f.dest}</span>
                        <span style={{ color: 'var(--text-muted)' }}>• {f.airline}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="data-font" style={{ fontSize: '10px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      <div>{f.altitude.toLocaleString()} FT</div>
                      <div>{f.speed} KTS</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(f.id);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Airports Section */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building size={12} />
            <span>Bookmarked Airports ({bookmarkedAirports.length})</span>
          </div>

          {bookmarkedAirports.length === 0 ? (
            <div style={{ border: '1px dashed var(--border-cyan)', borderRadius: '8px', padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              No bookmarked airports. Tap ★ on an airport to save it.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bookmarkedAirports.map(a => (
                <div 
                  key={a.iata}
                  onClick={() => onSelectAirport(a)}
                  className="glass-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building size={14} style={{ color: 'var(--cyan)' }} />
                    </div>
                    <div>
                      <div className="data-font" style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--cyan)' }}>
                        {a.iata} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-primary)' }}>({a.icao})</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {a.city}, {a.country}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '10px', textAlign: 'right' }}>
                      <div style={{ color: a.delayCount > 15 ? 'var(--red)' : 'var(--green)' }}>
                        {a.delayCount > 15 ? 'Severe Delays' : 'On Time'}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>{a.flightsToday} flights</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(a.iata);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live iOS/Android Home Widget Preview Simulator */}
        <div style={{ borderTop: '1px solid rgba(0, 212, 255, 0.08)', paddingTop: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            Live Widget Preview (Mobile Home Screen)
          </div>
          
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            
            {/* Widget 1: Most Tracked Flight */}
            <div style={{ minWidth: '150px', maxWidth: '150px', height: '140px', background: 'linear-gradient(135deg, #0d162d 0%, #050812 100%)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>SKYWATCH LIVE</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--green)', boxShadow: '0 0 4px var(--green)' }} />
                </div>
                
                {bookmarkedFlights.length > 0 ? (
                  <div style={{ marginTop: '12px' }}>
                    <div className="data-font" style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--amber)' }}>{bookmarkedFlights[0].callsign}</div>
                    <div style={{ fontSize: '9px', color: '#fff', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                      <span className="data-font">{bookmarkedFlights[0].origin}</span>
                      <ArrowRight size={8} style={{ color: 'var(--text-muted)' }} />
                      <span className="data-font">{bookmarkedFlights[0].dest}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px' }}>
                    No watched flights.
                  </div>
                )}
              </div>
              
              <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                {bookmarkedFlights.length > 0 ? `${bookmarkedFlights[0].altitude.toLocaleString()} ft • Active` : 'No data'}
              </div>
            </div>

            {/* Widget 2: Nearby Flights counts */}
            <div style={{ minWidth: '150px', maxWidth: '150px', height: '140px', background: 'linear-gradient(135deg, #0f2027 0%, #050812 100%)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>NEARBY FLIGHTS</span>
                  <Wifi size={9} style={{ color: 'var(--cyan)' }} />
                </div>
                
                <div style={{ marginTop: '12px' }}>
                  <div className="data-font" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--cyan)' }}>12</div>
                  <div style={{ fontSize: '9px', color: '#fff', marginTop: '2px' }}>Aircraft overhead now</div>
                </div>
              </div>
              
              <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                150km Radius • Heathrow
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Inline X SVG icon fallback since X isn't imported from lucide-react in typical lists
function X({ size = 16, ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
