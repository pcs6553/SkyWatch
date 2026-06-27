import React, { useState } from 'react';
import { User, Shield, Check, MapPin, Bell, Globe, HelpCircle, HardDrive, Compass, Info, Award } from 'lucide-react';

export default function SettingsPanel({ 
  tier, 
  setTier, 
  units, 
  setUnits, 
  timeFormat, 
  setTimeFormat, 
  mapStyle, 
  setMapStyle,
  trailLength,
  setTrailLength
}) {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Squawk 7700', active: true, desc: 'Notify on global Emergency Squawk' },
    { id: 2, type: 'Flight BAW173', active: true, desc: 'Notify when BAW173 goes airborne' },
    { id: 3, type: 'JFK Delay Alert', active: false, desc: 'JFK delays exceed 30 mins' }
  ]);

  const toggleAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-dark)' }}>
      
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-cyan)', background: 'var(--panel-bg)', flexShrink: 0 }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} style={{ color: 'var(--cyan)' }} />
          <span>Profile & Settings</span>
        </div>
      </div>

      {/* Settings list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
        
        {/* User Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--cyan-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
            SW
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Aviation Observer</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>member since June 2026</div>
          </div>
        </div>

        {/* Subscription Tier selector */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={12} style={{ color: 'var(--amber)' }} />
            <span>Select Account Level</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Free', 'Silver', 'Gold'].map(t => {
              const active = tier === t;
              return (
                <div 
                  key={t}
                  onClick={() => setTier(t)}
                  style={{
                    background: active ? 'rgba(2, 132, 199, 0.08)' : 'rgba(15, 23, 42, 0.03)',
                    border: `1.5px solid ${active ? 'var(--cyan)' : 'rgba(15, 23, 42, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: active ? 'var(--cyan)' : 'var(--text-primary)' }}>
                      {t} Tier
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {t === 'Free' && 'Live tracking, basic search, 3 bookmarks limit'}
                      {t === 'Silver' && '90-day history, tail details, custom alerts, unlimited bookmarks'}
                      {t === 'Gold' && '365-day history, aeronautical maps, weather overlays, full Mode S data'}
                    </div>
                  </div>

                  {active && (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} style={{ color: '#fff' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Preferences */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Map styling</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {['flightradar', 'light', 'satellite', 'topographic', 'weather', 'aeronautical'].map(style => {
              const active = mapStyle === style;
              const displayName = style === 'flightradar' ? 'Radar View' : style;
              return (
                <button
                  key={style}
                  onClick={() => setMapStyle(style)}
                  style={{
                    background: active ? 'rgba(2, 132, 199, 0.15)' : 'rgba(15, 23, 42, 0.03)',
                    border: `1px solid ${active ? 'var(--cyan)' : 'rgba(15, 23, 42, 0.08)'}`,
                    color: active ? 'var(--cyan)' : 'var(--text-primary)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Local Units & Formats */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Display units</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {/* Units Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span>Aviation Units</span>
              <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.03)', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setUnits('Imperial')}
                  style={{ background: units === 'Imperial' ? 'var(--cyan)' : 'transparent', color: units === 'Imperial' ? '#fff' : 'var(--text-primary)', border: 'none', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  IMPERIAL (FT/KTS)
                </button>
                <button 
                  onClick={() => setUnits('Metric')}
                  style={{ background: units === 'Metric' ? 'var(--cyan)' : 'transparent', color: units === 'Metric' ? '#fff' : 'var(--text-primary)', border: 'none', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  METRIC (M/KMH)
                </button>
              </div>
            </div>

            {/* Time format Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span>Time format</span>
              <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.03)', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setTimeFormat('UTC')}
                  style={{ background: timeFormat === 'UTC' ? 'var(--cyan)' : 'transparent', color: timeFormat === 'UTC' ? '#fff' : 'var(--text-primary)', border: 'none', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  UTC
                </button>
                <button 
                  onClick={() => setTimeFormat('Local')}
                  style={{ background: timeFormat === 'Local' ? 'var(--cyan)' : 'transparent', color: timeFormat === 'Local' ? '#fff' : 'var(--text-primary)', border: 'none', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  LOCAL
                </button>
              </div>
            </div>

            {/* Trail Length Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Aircraft Trail Length</span>
                <span className="data-font" style={{ color: 'var(--cyan)' }}>{trailLength} pings</span>
              </div>
              <input 
                type="range"
                min="10"
                max="100"
                step="10"
                value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)' }}
              />
            </div>

          </div>
        </div>

        {/* Custom Alerts Manager */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bell size={12} />
            <span>Custom Notification Alerts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.map(a => (
              <div key={a.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{a.type}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{a.desc}</div>
                </div>
                
                {/* Switch Checkbox style */}
                <button
                  onClick={() => toggleAlert(a.id)}
                  style={{
                    background: a.active ? 'var(--cyan)' : 'rgba(15,23,42,0.04)',
                    border: `1px solid ${a.active ? 'var(--cyan)' : 'rgba(15,23,42,0.1)'}`,
                    width: '32px',
                    height: '18px',
                    borderRadius: '9px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div 
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: a.active ? '#fff' : 'var(--text-muted)',
                      position: 'absolute',
                      top: '2px',
                      left: a.active ? '16px' : '2px',
                      transition: 'all 0.2s'
                    }} 
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
