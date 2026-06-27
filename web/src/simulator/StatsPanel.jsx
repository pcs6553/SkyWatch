import React from 'react';
import { BarChart3, TrendingUp, Flame, Award, Map, Navigation, ArrowUpRight } from 'lucide-react';
import { AIRPORTS } from '../mock/flightData';

export default function StatsPanel({ flights, onSelectFlight, onToggleHeatmap, heatmapActive }) {
  // Compute flight statistics
  const totalAirborne = flights.length;
  const categories = flights.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  // Find most tracked flights (sorted by mock bookmarks count)
  const mostTracked = [...flights]
    .sort((a, b) => b.bookmarksCount - a.bookmarksCount)
    .slice(0, 4);

  // Highest flight
  const highestFlight = [...flights]
    .sort((a, b) => b.altitude - a.altitude)[0];

  // Fastest flight
  const fastestFlight = [...flights]
    .sort((a, b) => b.speed - a.speed)[0];

  // Airline leaderboards (count occurrences)
  const airlineCounts = flights.reduce((acc, f) => {
    acc[f.airline] = (acc[f.airline] || 0) + 1;
    return acc;
  }, {});

  const airlineLeaderboard = Object.entries(airlineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-dark)' }}>
      
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-cyan)', background: 'var(--panel-bg)', flexShrink: 0 }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} style={{ color: 'var(--cyan)' }} />
          <span>Global Insights</span>
        </div>
      </div>

      {/* Stats Body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
        
        {/* Live Counters */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Airborne Statistics</span>
            <span className="data-font" style={{ fontSize: '10px', color: 'var(--green)' }}>● REAL-TIME DATA</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Airborne Globally</span>
              <span className="data-font" style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--cyan)' }}>
                {totalAirborne * 420 + 8249}
              </span>
            </div>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Simulated in View</span>
              <span className="data-font" style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--amber)' }}>
                {totalAirborne}
              </span>
            </div>
          </div>
        </div>

        {/* Heatmap Toggle Control */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Map size={16} style={{ color: 'var(--cyan)' }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Flight Density Heatmap</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Overlay traffic density grids on map</div>
            </div>
          </div>
          <button
            onClick={onToggleHeatmap}
            style={{
              background: heatmapActive ? 'var(--cyan)' : 'transparent',
              border: '1px solid var(--cyan)',
              color: heatmapActive ? '#000' : 'var(--cyan)',
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {heatmapActive ? 'ACTIVE' : 'TOGGLE'}
          </button>
        </div>

        {/* Busiest Category Distribution */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Traffic by Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(categories).map(([cat, count]) => {
              const percentage = Math.round((count / totalAirborne) * 100);
              return (
                <div key={cat} style={{ fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{cat}</span>
                    <span className="data-font" style={{ color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        backgroundColor: cat === 'Cargo' ? 'var(--amber)' : cat === 'Military' ? 'var(--red)' : cat === 'Private' ? 'var(--green)' : cat === 'Helicopter' ? 'var(--purple)' : 'var(--blue)' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Tracked Community List */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={12} style={{ color: 'var(--amber)' }} />
            <span>Trending / Most Tracked</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mostTracked.map((f, idx) => (
              <div 
                key={f.id}
                onClick={() => onSelectFlight(f)}
                className="glass-card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
                    <span className="data-font" style={{ color: 'var(--amber)' }}>{f.callsign}</span>
                    <span style={{ fontSize: '9px', fontWeight: 'normal', color: 'var(--text-muted)' }}>({f.airline})</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {f.origin} → {f.dest} ({f.type})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--amber)', fontSize: '11px' }} className="data-font">
                  <span>{f.bookmarksCount * 142 + 84}</span>
                  <Award size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Airline Leaderboard */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Active Fleet Leaders</div>
          <div className="glass-card" style={{ padding: '0 12px' }}>
            {airlineLeaderboard.map(([airline, count], idx) => (
              <div 
                key={airline} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 0', 
                  borderBottom: idx === airlineLeaderboard.length - 1 ? 'none' : '1px solid rgba(0, 212, 255, 0.06)',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>#{idx + 1}</span>
                  <span>{airline}</span>
                </div>
                <span className="data-font" style={{ color: 'var(--cyan)', fontWeight: 'bold' }}>{count} flights</span>
              </div>
            ))}
          </div>
        </div>

        {/* Speed / Altitude Records */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Aviation Records Today</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            
            {highestFlight && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>HIGHEST ALTITUDE</span>
                <span className="data-font" style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--cyan)' }}>
                  {highestFlight.altitude.toLocaleString()} FT
                </span>
                <span className="data-font" style={{ fontSize: '9px', color: 'var(--amber)' }}>
                  {highestFlight.callsign} ({highestFlight.type})
                </span>
              </div>
            )}

            {fastestFlight && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAX GROUND SPEED</span>
                <span className="data-font" style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--cyan)' }}>
                  {fastestFlight.speed} KTS
                </span>
                <span className="data-font" style={{ fontSize: '9px', color: 'var(--amber)' }}>
                  {fastestFlight.callsign} ({fastestFlight.type})
                </span>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
