import React, { useState, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  Compass, 
  Play, 
  Pause,
  Sliders
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function PTZController({ camera, onUpdatePTZ, onClose }) {
  const [speed, setSpeed] = useState(15);
  const [isPatrolling, setIsPatrolling] = useState(false);

  // Auto-patrol simulation
  useEffect(() => {
    let patrolTimer = null;
    if (isPatrolling) {
      let step = 0;
      const presets = [
        { pan: -40, tilt: 15, zoom: 1.2 },
        { pan: 0, tilt: 0, zoom: 1.0 },
        { pan: 40, tilt: -10, zoom: 1.5 },
      ];
      patrolTimer = setInterval(() => {
        const next = presets[step % presets.length];
        onUpdatePTZ(camera.id, next.pan, next.tilt, next.zoom);
        step++;
      }, 2500);
    }
    return () => {
      if (patrolTimer) clearInterval(patrolTimer);
    };
  }, [isPatrolling, camera.id, onUpdatePTZ]);

  const handlePanTilt = (dPan, dTilt) => {
    sounds.playClick();
    const currentPan = camera.pan || 0;
    const currentTilt = camera.tilt || 0;
    const currentZoom = camera.zoom || 1.0;
    onUpdatePTZ(camera.id, currentPan + dPan * (speed / 10), currentTilt + dTilt * (speed / 10), currentZoom);
  };

  const handleZoom = (dZoom) => {
    sounds.playClick();
    const currentPan = camera.pan || 0;
    const currentTilt = camera.tilt || 0;
    const currentZoom = camera.zoom || 1.0;
    onUpdatePTZ(camera.id, currentPan, currentTilt, Math.max(1.0, Math.min(4.0, currentZoom + dZoom)));
  };

  const handleHome = () => {
    sounds.playClick();
    setIsPatrolling(false);
    onUpdatePTZ(camera.id, 0, 0, 1.0);
  };

  const handlePreset = (presetName) => {
    sounds.playClick();
    setIsPatrolling(false);
    if (presetName === 'gate') onUpdatePTZ(camera.id, -35, 10, 1.4);
    if (presetName === 'dock') onUpdatePTZ(camera.id, 25, -15, 1.8);
    if (presetName === 'vault') onUpdatePTZ(camera.id, 0, 20, 2.2);
  };

  return (
    <div className="ptz-panel">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
          <Compass size={15} color="var(--accent-cyan)" />
          <span>PTZ Control: {camera.name}</span>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* 3x3 Joystick Grid */}
      <div className="ptz-joystick-grid">
        <button className="ptz-btn" onClick={() => handlePanTilt(-1, 1)} title="Pan Up-Left">↖</button>
        <button className="ptz-btn" onClick={() => handlePanTilt(0, 1)} title="Tilt Up"><ChevronUp size={16} /></button>
        <button className="ptz-btn" onClick={() => handlePanTilt(1, 1)} title="Pan Up-Right">↗</button>

        <button className="ptz-btn" onClick={() => handlePanTilt(-1, 0)} title="Pan Left"><ChevronLeft size={16} /></button>
        <button className="ptz-btn" onClick={handleHome} title="Return to Center Home" style={{ color: 'var(--accent-cyan)' }}>
          <RotateCcw size={15} />
        </button>
        <button className="ptz-btn" onClick={() => handlePanTilt(1, 0)} title="Pan Right"><ChevronRight size={16} /></button>

        <button className="ptz-btn" onClick={() => handlePanTilt(-1, -1)} title="Pan Down-Left">↙</button>
        <button className="ptz-btn" onClick={() => handlePanTilt(0, -1)} title="Tilt Down"><ChevronDown size={16} /></button>
        <button className="ptz-btn" onClick={() => handlePanTilt(1, -1)} title="Pan Down-Right">↘</button>
      </div>

      {/* Zoom Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <button 
          className="btn btn-secondary" 
          style={{ flex: 1, padding: '5px', fontSize: '0.72rem' }}
          onClick={() => handleZoom(0.25)}
        >
          <ZoomIn size={14} />
          <span>Zoom +</span>
        </button>
        <button 
          className="btn btn-secondary" 
          style={{ flex: 1, padding: '5px', fontSize: '0.72rem' }}
          onClick={() => handleZoom(-0.25)}
        >
          <ZoomOut size={14} />
          <span>Zoom -</span>
        </button>
      </div>

      {/* Speed Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        <Sliders size={12} />
        <span>Pan Speed: {speed}</span>
        <input 
          type="range" 
          min="5" 
          max="30" 
          value={speed} 
          onChange={(e) => setSpeed(Number(e.target.value))} 
          style={{ flex: 1, accentColor: 'var(--accent-cyan)' }}
        />
      </div>

      {/* Current Position Telemetry */}
      <div style={{ 
        fontFamily: 'var(--font-mono)', 
        fontSize: '0.65rem', 
        color: 'var(--text-muted)', 
        background: 'var(--bg-primary)', 
        padding: '4px 6px', 
        borderRadius: '4px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Pan: {Math.round(camera.pan || 0)}°</span>
        <span>Tilt: {Math.round(camera.tilt || 0)}°</span>
        <span>Zoom: {(camera.zoom || 1.0).toFixed(1)}x</span>
      </div>

      {/* Presets and Patrol Tour */}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Preset Positions:</div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <button className="btn btn-secondary" style={{ padding: '3px 6px', fontSize: '0.65rem', flex: 1 }} onClick={() => handlePreset('gate')}>Gate</button>
        <button className="btn btn-secondary" style={{ padding: '3px 6px', fontSize: '0.65rem', flex: 1 }} onClick={() => handlePreset('dock')}>Dock</button>
        <button className="btn btn-secondary" style={{ padding: '3px 6px', fontSize: '0.65rem', flex: 1 }} onClick={() => handlePreset('vault')}>Vault</button>
      </div>

      <button 
        className={`btn ${isPatrolling ? 'btn-danger' : 'btn-primary'}`}
        style={{ width: '100%', padding: '5px', fontSize: '0.72rem' }}
        onClick={() => setIsPatrolling(!isPatrolling)}
      >
        {isPatrolling ? <Pause size={13} /> : <Play size={13} />}
        <span>{isPatrolling ? 'Stop Auto-Patrol' : 'Start Auto-Patrol Tour'}</span>
      </button>
    </div>
  );
}
