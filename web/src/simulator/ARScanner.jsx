import React, { useState, useEffect } from 'react';
import { Camera, Compass, Eye, ShieldAlert, Sliders, X } from 'lucide-react';
import { getDistance, getBearing } from '../mock/flightData';

export default function ARScanner({ flights, userCoords, onSelectFlight, onClose }) {
  const [azimuth, setAzimuth] = useState(180); // Camera pointing angle: 0-360 degrees
  const [nearbyFlights, setNearbyFlights] = useState([]);
  
  useEffect(() => {
    // Process flights within 150km, calculate relative bearing & elevation angle
    const calculated = flights.map(f => {
      const dist = getDistance(userCoords.lat, userCoords.lng, f.lat, f.lng);
      const bearing = getBearing(userCoords.lat, userCoords.lng, f.lat, f.lng);
      
      // Calculate elevation angle (climb angle) in sky
      // Altitude is in feet, convert to km (1 ft = 0.0003048 km)
      const altKm = f.altitude * 0.0003048;
      const elevationRad = Math.atan2(altKm, dist);
      const elevationDeg = elevationRad * 180 / Math.PI;

      return {
        ...f,
        distance: dist,
        bearing: bearing,
        elevation: elevationDeg,
        altKm
      };
    })
    .filter(f => f.distance <= 150) // only flights within 150km
    .sort((a, b) => a.distance - b.distance);

    setNearbyFlights(calculated);
  }, [flights, userCoords]);

  // Map bearing to compass direction
  const getDirectionLabel = (b) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(b / 45) % 8];
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', zIndex: 2000, display: 'flex', flexDirection: 'column', color: '#fff' }}>
      
      {/* AR Viewfinder Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
        
        {/* Subtle camera scan lines and grid overlay */}
        <div style={{ flex: 1, border: '1px solid rgba(0, 212, 255, 0.1)', margin: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Crosshair */}
          <div style={{ width: '40px', height: '40px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(0, 212, 255, 0.4)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(0, 212, 255, 0.4)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', borderRadius: '50%', border: '1px solid var(--cyan)' }} />
          </div>
          
          {/* Camera Scanning sweep effect */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '2px', background: 'linear-gradient(to right, transparent, var(--cyan), transparent)', opacity: 0.3, animation: 'ar-scan 4s infinite linear' }} />
        </div>
      </div>

      {/* Styles for scan line */}
      <style>{`
        @keyframes ar-scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      {/* Header bar */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(4, 8, 16, 0.85)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={18} style={{ color: 'var(--cyan)' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--cyan)', letterSpacing: '0.5px' }}>AR Sky View</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Simulated Camera Feed • Radius 150km</div>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', padding: '6px 10px', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
          className="pointer-events-auto"
        >
          <X size={16} />
        </button>
      </div>

      {/* Sky view overlay where labels float */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundImage: 'radial-gradient(circle at center, #0a1128 0%, #020408 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Floating Labels container */}
        {nearbyFlights.map(f => {
          // Calculate if flight is in front of the camera viewport
          // Viewport width is roughly 60 degrees.
          let deltaAzimuth = f.bearing - azimuth;
          if (deltaAzimuth < -180) deltaAzimuth += 360;
          if (deltaAzimuth > 180) deltaAzimuth -= 360;

          const isVisible = Math.abs(deltaAzimuth) < 30; // within 30 degrees of center
          if (!isVisible) return null;

          // Project horizontal position (-100% to 100% from center)
          const xPercent = (deltaAzimuth / 30) * 100;
          
          // Project vertical position based on distance and elevation angle
          // Elev: 0 to 45 deg map to -100px to -300px above crosshair
          const yOffset = -50 - (f.elevation * 6);

          // Scaling factor based on distance
          const scale = Math.max(0.6, 1 - (f.distance / 150));
          const opacity = Math.max(0.3, 1 - (f.distance / 150));

          const isEmergency = f.squawkState !== 'Normal';

          return (
            <div 
              key={f.id}
              onClick={() => onSelectFlight(f)}
              style={{
                position: 'absolute',
                left: `calc(50% + ${xPercent}%)`,
                top: `calc(50% + ${yOffset}px)`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity: opacity,
                cursor: 'pointer',
                pointerEvents: 'auto',
                transition: 'all 0.1s ease-out',
                zIndex: 100 - Math.round(f.distance)
              }}
            >
              {/* Floating card */}
              <div 
                style={{
                  background: isEmergency ? 'rgba(255, 77, 106, 0.9)' : 'rgba(8, 14, 28, 0.85)',
                  border: `1.5px solid ${isEmergency ? '#ff4d6a' : 'var(--cyan)'}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: isEmergency ? 'var(--shadow-red)' : 'var(--shadow-glow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '130px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {/* Header callsig */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="data-font" style={{ fontWeight: 'bold', fontSize: '13px', color: isEmergency ? '#fff' : 'var(--amber)' }}>
                    {f.callsign}
                  </span>
                  <span style={{ fontSize: '8px', padding: '1px 3px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '3px' }}>
                    {Math.round(f.distance)} km
                  </span>
                </div>
                
                {/* Details */}
                <div className="data-font" style={{ fontSize: '9px', color: isEmergency ? '#ffd0d6' : 'var(--text-primary)' }}>
                  ALT: {f.altitude.toLocaleString()} FT
                </div>
                <div className="data-font" style={{ fontSize: '9px', color: isEmergency ? '#ffd0d6' : 'var(--text-muted)' }}>
                  SPD: {f.speed} KTS • {getDirectionLabel(f.bearing)} ({Math.round(f.bearing)}°)
                </div>

                {isEmergency && (
                  <div style={{ fontSize: '8px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                    <ShieldAlert size={8} /> SQUAWK {f.squawk}
                  </div>
                )}
              </div>
              
              {/* Pointer dot */}
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isEmergency ? '#ff4d6a' : 'var(--cyan)', margin: '4px auto 0 auto', boxShadow: '0 0 6px rgba(0, 212, 255, 0.8)' }} />
            </div>
          );
        })}
      </div>

      {/* Compass Tape Control & Pan Slider */}
      <div style={{ background: 'rgba(6, 10, 20, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 20px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px' }} className="pointer-events-auto">
        
        {/* Compass direction tape */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>PAN SKY CAMERA</span>
            <span className="data-font" style={{ color: 'var(--cyan)' }}>HEADING: {Math.round(azimuth)}° {getDirectionLabel(azimuth)}</span>
          </div>
          
          {/* Compass Slider bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Sliders size={12} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
            <input 
              type="range"
              min="0"
              max="359"
              value={azimuth}
              onChange={(e) => setAzimuth(parseInt(e.target.value))}
              style={{
                flex: 1,
                appearance: 'none',
                height: '4px',
                background: 'rgba(0, 212, 255, 0.2)',
                borderRadius: '2px',
                outline: 'none',
                accentColor: 'var(--cyan)'
              }}
            />
          </div>
        </div>

        {/* Quick look shortcuts */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['N (0°)', 'E (90°)', 'S (180°)', 'W (270°)'].map((label, idx) => {
            const angles = [0, 90, 180, 270];
            const active = azimuth === angles[idx];
            return (
              <button
                key={label}
                onClick={() => setAzimuth(angles[idx])}
                style={{
                  background: active ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? 'var(--cyan)' : 'rgba(255,255,255,0.08)'}`,
                  color: active ? 'var(--cyan)' : 'var(--text-primary)',
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
