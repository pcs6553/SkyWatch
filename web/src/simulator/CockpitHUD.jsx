import React, { useEffect, useRef, useState } from 'react';
import { Camera, Compass, CompassIcon, Info, ShieldAlert, X } from 'lucide-react';

export default function CockpitHUD({ flight, onClose }) {
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState('cockpit'); // cockpit, chase
  const animationRef = useRef(null);

  // Pitch and roll simulation angles
  const pitchRef = useRef(3.5); // degrees
  const rollRef = useRef(0); // degrees
  const targetRollRef = useRef(0);
  const targetPitchRef = useRef(3.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Resize handler
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dynamic HUD variables
    let frame = 0;
    
    const render = () => {
      frame++;
      
      // Update pitch/roll with smooth inertia towards targets
      if (frame % 80 === 0) {
        // Change flight attitudes randomly to simulate flight path corrections
        targetRollRef.current = (Math.random() - 0.5) * 12; // -6 to +6 deg
        targetPitchRef.current = 1 + Math.random() * 5;     // 1 to 6 deg climb
      }
      
      rollRef.current += (targetRollRef.current - rollRef.current) * 0.05;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * 0.05;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw 3D wireframe ground grid (Chase or Cockpit perspective)
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
      ctx.lineWidth = 1;
      
      const horizonOffset = cy + pitchRef.current * 8; // move horizon based on pitch
      const rollRad = (rollRef.current * Math.PI) / 180;
      
      // Ground plane grid lines
      const gridCount = 20;
      const gridSpacing = 40;
      const yawAngle = ((flight.heading || 0) * Math.PI) / 180;

      // Draw grid lines in 3D perspective
      if (viewMode === 'chase') {
        // Simple 3D ground grid rendering
        const vanishingPointY = horizonOffset;
        for (let i = -10; i <= 10; i++) {
          // Longitudinal lines projecting to vanishing point
          ctx.beginPath();
          ctx.moveTo(cx + i * 80, h);
          ctx.lineTo(cx + i * 8, vanishingPointY);
          ctx.stroke();
        }
        
        // Transverse horizontal lines
        const numHorizontals = 15;
        for (let i = 0; i < numHorizontals; i++) {
          const depth = (i + (frame * 0.05) % 1);
          const y = vanishingPointY + (h - vanishingPointY) * Math.pow(depth / numHorizontals, 2);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      } else {
        // Cockpit view grid
        const vanishingPointY = horizonOffset;
        ctx.translate(cx, vanishingPointY);
        ctx.rotate(-rollRad); // rotate grid based on aircraft roll
        
        // Longitudinal grid lines
        for (let i = -15; i <= 15; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 120, h);
          ctx.lineTo(i * 15, 0);
          ctx.stroke();
        }
        
        // Transverse grid lines
        const numHorizontals = 12;
        for (let i = 0; i < numHorizontals; i++) {
          const depth = (i + (frame * 0.07) % 1);
          const y = (h - vanishingPointY) * Math.pow(depth / numHorizontals, 2);
          ctx.beginPath();
          ctx.moveTo(-w, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Restore transform if viewMode was cockpit
      if (viewMode === 'chase') ctx.restore();

      // 2. Draw 3D wireframe aircraft (Chase Cam view only)
      if (viewMode === 'chase') {
        ctx.save();
        ctx.translate(cx, cy + 80);
        ctx.rotate(rollRad);
        
        ctx.strokeStyle = 'var(--amber)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'var(--amber)';
        ctx.shadowBlur = 4;
        
        // Wireframe plane paths
        ctx.beginPath();
        // Fuselage
        ctx.moveTo(0, -35); // nose
        ctx.lineTo(5, -20);
        ctx.lineTo(5, 20);
        ctx.lineTo(0, 30); // tail
        ctx.lineTo(-5, 20);
        ctx.lineTo(-5, -20);
        ctx.closePath();
        
        // Wings
        ctx.moveTo(-5, -10);
        ctx.lineTo(-80, 5); // left wing tip
        ctx.lineTo(-75, 12);
        ctx.lineTo(-5, 8);
        
        ctx.moveTo(5, -10);
        ctx.lineTo(80, 5); // right wing tip
        ctx.lineTo(75, 12);
        ctx.lineTo(5, 8);

        // Tail fin
        ctx.moveTo(0, 20);
        ctx.lineTo(0, 5);
        ctx.lineTo(-20, 25); // left stabilizer
        ctx.moveTo(0, 20);
        ctx.lineTo(20, 25); // right stabilizer
        
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw HUD HUD indicators (overlay)
      ctx.save();
      ctx.strokeStyle = 'var(--cyan)';
      ctx.fillStyle = 'var(--cyan)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'var(--cyan)';
      ctx.shadowBlur = 2;

      // HUD Center Reticle
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
      ctx.moveTo(cx - 30, cy);
      ctx.lineTo(cx - 10, cy);
      ctx.moveTo(cx + 10, cy);
      ctx.lineTo(cx + 30, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy - 20);
      ctx.stroke();

      // Pitch Ladder (in Cockpit View, rotates and slides; in Chase View, floats relative to flight data)
      ctx.save();
      ctx.translate(cx, cy);
      if (viewMode === 'cockpit') {
        ctx.rotate(-rollRad);
        ctx.translate(0, pitchRef.current * 6);
      }
      
      // Pitch lines
      const pitchStep = 10;
      const pitchPixels = 40; // pixels per 5 degrees
      for (let p = -30; p <= 30; p += 5) {
        if (p === 0) continue;
        const py = -p * (pitchPixels / 5);
        
        // Left bracket
        ctx.beginPath();
        ctx.moveTo(-70, py);
        ctx.lineTo(-30, py);
        ctx.lineTo(-30, py + (p > 0 ? 8 : -8));
        ctx.stroke();

        // Right bracket
        ctx.beginPath();
        ctx.moveTo(70, py);
        ctx.lineTo(30, py);
        ctx.lineTo(30, py + (p > 0 ? 8 : -8));
        ctx.stroke();

        // Pitch labels
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(Math.abs(p).toString(), -92, py + 4);
        ctx.fillText(Math.abs(p).toString(), 80, py + 4);
      }
      ctx.restore();

      // Horizon line representation
      ctx.save();
      ctx.translate(cx, cy);
      if (viewMode === 'cockpit') {
        ctx.rotate(-rollRad);
        ctx.translate(0, pitchRef.current * 6);
      }
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(-160, 0);
      ctx.lineTo(-80, 0);
      ctx.moveTo(80, 0);
      ctx.lineTo(160, 0);
      ctx.stroke();
      ctx.restore();

      // Left: Speed Tape (Indicated Speed)
      const speed = flight.speed || 480;
      ctx.beginPath();
      ctx.rect(35, cy - 130, 48, 260);
      ctx.fillStyle = 'rgba(8, 14, 28, 0.6)';
      ctx.fill();
      ctx.stroke();

      // Speed markings
      ctx.save();
      ctx.beginPath();
      ctx.rect(35, cy - 130, 48, 260);
      ctx.clip();
      ctx.fillStyle = 'var(--cyan)';
      
      const speedSpacing = 2.5; // pixels per knot
      const minVisibleSpeed = Math.floor((speed - 50) / 10) * 10;
      const maxVisibleSpeed = Math.ceil((speed + 50) / 10) * 10;
      
      for (let s = minVisibleSpeed; s <= maxVisibleSpeed; s += 10) {
        const sy = cy - (s - speed) * speedSpacing;
        
        ctx.beginPath();
        ctx.moveTo(75, sy);
        ctx.lineTo(65, sy);
        ctx.stroke();
        
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(s.toString(), 60, sy + 3);
      }
      ctx.restore();
      
      // Speed Indicator Bubble
      ctx.beginPath();
      ctx.moveTo(78, cy);
      ctx.lineTo(84, cy - 10);
      ctx.lineTo(125, cy - 10);
      ctx.lineTo(125, cy + 10);
      ctx.lineTo(84, cy + 10);
      ctx.closePath();
      ctx.fillStyle = 'var(--bg-darker)';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'var(--amber)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(speed).toString(), 105, cy + 4);
      ctx.fillStyle = 'var(--cyan)';

      // Right: Altitude Tape
      const alt = flight.altitude || 35000;
      ctx.beginPath();
      ctx.rect(w - 83, cy - 130, 48, 260);
      ctx.fillStyle = 'rgba(8, 14, 28, 0.6)';
      ctx.fill();
      ctx.stroke();

      // Altitude markings
      ctx.save();
      ctx.beginPath();
      ctx.rect(w - 83, cy - 130, 48, 260);
      ctx.clip();
      ctx.fillStyle = 'var(--cyan)';
      
      const altSpacing = 0.15; // pixels per foot
      const minVisibleAlt = Math.floor((alt - 1000) / 200) * 200;
      const maxVisibleAlt = Math.ceil((alt + 1000) / 200) * 200;
      
      for (let a = minVisibleAlt; a <= maxVisibleAlt; a += 500) {
        const ay = cy - (a - alt) * altSpacing;
        
        ctx.beginPath();
        ctx.moveTo(w - 75, ay);
        ctx.lineTo(w - 65, ay);
        ctx.stroke();
        
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText((a / 100).toString().padStart(3, '0'), w - 60, ay + 3);
      }
      ctx.restore();
      
      // Altitude Indicator Bubble
      ctx.beginPath();
      ctx.moveTo(w - 78, cy);
      ctx.lineTo(w - 84, cy - 10);
      ctx.lineTo(w - 135, cy - 10);
      ctx.lineTo(w - 135, cy + 10);
      ctx.lineTo(w - 84, cy + 10);
      ctx.closePath();
      ctx.fillStyle = 'var(--bg-darker)';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'var(--amber)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(alt).toString(), w - 110, cy + 4);
      ctx.fillStyle = 'var(--cyan)';

      // Top: Heading Tape
      const hdg = flight.heading || 0;
      ctx.beginPath();
      ctx.rect(cx - 120, 35, 240, 26);
      ctx.fillStyle = 'rgba(8, 14, 28, 0.6)';
      ctx.fill();
      ctx.stroke();

      // Heading markings
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - 120, 35, 240, 26);
      ctx.clip();
      ctx.fillStyle = 'var(--cyan)';
      
      const hdgSpacing = 2.0; // pixels per degree
      const minVisibleHdg = Math.floor((hdg - 40));
      const maxVisibleHdg = Math.ceil((hdg + 40));
      
      for (let h = minVisibleHdg; h <= maxVisibleHdg; h++) {
        const normH = (h + 360) % 360;
        const hx = cx - (hdg - h) * hdgSpacing;
        
        if (normH % 5 === 0) {
          ctx.beginPath();
          ctx.moveTo(hx, 35);
          ctx.lineTo(hx, 43);
          ctx.stroke();
          
          if (normH % 10 === 0) {
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            let label = (normH / 10).toString().padStart(2, '0');
            if (normH === 0) label = 'N';
            if (normH === 90) label = 'E';
            if (normH === 180) label = 'S';
            if (normH === 270) label = 'W';
            ctx.fillText(label, hx, 54);
          }
        }
      }
      ctx.restore();

      // Heading Indicator Pointer
      ctx.beginPath();
      ctx.moveTo(cx, 32);
      ctx.lineTo(cx - 6, 26);
      ctx.lineTo(cx + 6, 26);
      ctx.closePath();
      ctx.fillStyle = 'var(--amber)';
      ctx.fill();

      // Data readouts (HUD Corners)
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'var(--text-primary)';
      ctx.textAlign = 'left';
      
      // Upper Left
      ctx.fillText(`FLIGHT: ${flight.callsign}`, 35, 80);
      ctx.fillText(`REG:    ${flight.registration}`, 35, 96);
      ctx.fillText(`TYPE:   ${flight.type}`, 35, 112);

      // Upper Right
      ctx.textAlign = 'right';
      ctx.fillText(`GS:   ${Math.round(flight.speed)} KTS`, w - 35, 80);
      ctx.fillText(`MACH: ${flight.mach}`, w - 35, 96);
      ctx.fillText(`VS:   ${flight.verticalSpeed > 0 ? '+' : ''}${flight.verticalSpeed} FPM`, w - 35, 112);

      // Lower Left (Wind & Temperature)
      ctx.textAlign = 'left';
      ctx.fillText(`WIND: ${flight.windDir}° / ${flight.windSpeed} KTS`, 35, h - 80);
      ctx.fillText(`TEMP: ${flight.temp} °C`, 35, h - 64);
      ctx.fillText(`SQWK: ${flight.squawk}`, 35, h - 48);

      // Lower Right (GPS coordinates & altitude)
      ctx.textAlign = 'right';
      ctx.fillText(`GPS ALT: ${flight.gpsAltitude} FT`, w - 35, h - 80);
      ctx.fillText(`LAT:     ${flight.lat.toFixed(4)}°`, w - 35, h - 64);
      ctx.fillText(`LNG:     ${flight.lng.toFixed(4)}°`, w - 35, h - 48);

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [viewMode, flight]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#020408', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
      
      {/* Header HUD panel */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-cyan)', background: 'var(--panel-bg)', zIndex: 10 }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>3D Flight Visualizer</div>
          <div className="data-font" style={{ fontSize: '18px', color: 'var(--amber)', fontWeight: 'bold' }}>{flight.callsign} <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'normal' }}>- Synthetic Cockpit</span></div>
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setViewMode(viewMode === 'cockpit' ? 'chase' : 'cockpit')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--border-cyan)', padding: '6px 12px', borderRadius: '6px', color: 'var(--cyan)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}
          >
            <Camera size={14} />
            {viewMode === 'cockpit' ? 'Chase Cam' : 'Cockpit View'}
          </button>
          
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255, 77, 106, 0.1)', border: '1px solid rgba(255, 77, 106, 0.2)', padding: '6px 10px', borderRadius: '6px', color: 'var(--red)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Immersive HUD Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        
        {/* HUD Warning banner in case of emergencies */}
        {flight.squawkState !== 'Normal' && (
          <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255, 77, 106, 0.9)', border: '1px solid #ff4d6a', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-red)', animation: 'pulse 1s infinite alternate', zIndex: 100 }} className="data-font">
            <ShieldAlert size={14} />
            WARNING: AIRCRAFT BROADCASTING EMERGENCY SQUAWK {flight.squawk} ({flight.squawkState})
          </div>
        )}

        {/* HUD control layout guidance info */}
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(8, 14, 28, 0.8)', border: '1px solid var(--border-cyan)', borderRadius: '12px', padding: '6px 14px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none' }}>
          <Info size={11} style={{ color: 'var(--cyan)' }} />
          <span>Pitch/Roll update simulated dynamically based on flight progress</span>
        </div>
      </div>
    </div>
  );
}
