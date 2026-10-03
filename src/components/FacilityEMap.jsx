import React, { useState } from 'react';
import { 
  Map, 
  MapPin, 
  Radio, 
  Eye, 
  AlertTriangle, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  X
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function FacilityEMap({ 
  sites, 
  cameras, 
  selectedSiteId, 
  setSelectedSiteId, 
  events,
  onSelectCamera 
}) {
  const [internalSite, setInternalSite] = useState('site-1');
  const activeSite = selectedSiteId !== 'all' ? selectedSiteId : internalSite;
  const [previewCamera, setPreviewCamera] = useState(null);
  const [mapZoom, setMapZoom] = useState(1.0);
  const [showFov, setShowFov] = useState(true);
  const [activeLayer, setActiveLayer] = useState('floor1');

  // Filter cameras belonging to the active site
  const siteCameras = cameras.filter(c => c.siteId === activeSite);
  const unreadAlerts = events.filter(e => !e.acknowledged);

  // Pre-configured coordinates & FOV angles for cameras on architectural floor plans
  const mapCoordinates = {
    'cam-1': { x: 18, y: 78, angle: -45, label: 'Gate 01 Entry' },
    'cam-2': { x: 55, y: 82, angle: -90, label: 'Dock Bay 03' },
    'cam-3': { x: 88, y: 40, angle: 180, label: 'Perimeter East' },
    'cam-4': { x: 48, y: 35, angle: 90, label: 'Assembly Line' },
    'cam-5': { x: 22, y: 65, angle: -30, label: 'Reception Lobby' },
    'cam-6': { x: 75, y: 25, angle: 135, label: 'Server Vault' },
    'cam-7': { x: 30, y: 80, angle: -60, label: 'Parking ANPR' },
    'cam-8': { x: 70, y: 50, angle: 45, label: 'High-Value Vault' },
  };

  const handleCameraPinClick = (cam) => {
    sounds.playClick();
    setPreviewCamera(cam);
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Main E-Map Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Top E-Map Controls */}
        <div className="control-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              <Map size={15} color="var(--accent-cyan)" />
              <span>Interactive Facility E-Map</span>
            </div>

            {/* Site selector */}
            <select 
              className="input-field" 
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-primary)' }}
              value={activeSite}
              onChange={(e) => { setInternalSite(e.target.value); if (setSelectedSiteId) setSelectedSiteId(e.target.value); }}
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>📍 {s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.72rem', gap: '4px' }}
              onClick={() => setShowFov(!showFov)}
              title="Toggle Camera FOV Vision Cones"
            >
              <Eye size={13} color={showFov ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
              <span>FOV Cones</span>
            </button>
            <button 
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.72rem', gap: '4px' }}
              onClick={() => setActiveLayer(activeLayer === 'floor1' ? 'security' : 'floor1')}
              title="Toggle Architectural / Security Layer"
            >
              <Layers size={13} />
              <span>{activeLayer === 'floor1' ? 'L1 Plan' : 'Security Mesh'}</span>
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
              onClick={() => setMapZoom(prev => Math.min(1.6, prev + 0.15))}
              title="Zoom Map In"
            >
              <ZoomIn size={14} />
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
              onClick={() => setMapZoom(prev => Math.max(0.8, prev - 0.15))}
              title="Zoom Map Out"
            >
              <ZoomOut size={14} />
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
              onClick={() => setMapZoom(1.0)}
              title="Reset Zoom"
            >
              100%
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--accent-red)' }}>
              <AlertTriangle size={12} />
              <span>{unreadAlerts.length} Alarms</span>
            </div>
          </div>
        </div>

        {/* Architectural Floor Plan Viewport */}
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          overflow: 'hidden', 
          background: activeLayer === 'security' ? '#040711' : '#070a12',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: activeLayer === 'security' 
            ? 'linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px)'
            : 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: activeLayer === 'security' ? '30px 30px' : '24px 24px'
        }}>
          {/* True North Orientation Compass */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              background: 'rgba(5,7,10,0.85)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: '50%', 
              width: '38px', 
              height: '38px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--accent-cyan)', 
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }} 
            title="True North Bearing (0° N)"
          >
            <Compass size={20} />
          </div>

          {/* Blueprint SVG Layout */}
          <div style={{ 
            position: 'relative', 
            width: '900px', 
            height: '560px',
            transform: `scale(${mapZoom})`,
            transition: 'transform 0.2s ease',
            border: '2px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(15, 23, 42, 0.65)',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)'
          }}>
            {/* Architectural Rooms & Corridors SVG */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Perimeter Boundary */}
              <rect x="20" y="20" width="860" height="520" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="6,4" />

              {/* Building Sections */}
              <rect x="60" y="60" width="340" height="200" fill="rgba(30, 41, 59, 0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <text x="75" y="90" fill="#94a3b8" fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">SECTOR A: ADMINISTRATION & LOBBY</text>

              <rect x="440" y="60" width="400" height="200" fill="rgba(30, 41, 59, 0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <text x="455" y="90" fill="#94a3b8" fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">SECTOR B: SECURE PRODUCTION FLOOR</text>

              <rect x="60" y="300" width="480" height="200" fill="rgba(30, 41, 59, 0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <text x="75" y="330" fill="#94a3b8" fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">SECTOR C: WAREHOUSE & LOADING BAYS</text>

              <rect x="580" y="300" width="260" height="200" fill="rgba(30, 41, 59, 0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <text x="595" y="330" fill="#94a3b8" fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">SECTOR D: HIGH-SECURITY VAULT</text>

              {/* Doors / Gates */}
              <line x1="160" y1="260" x2="200" y2="260" stroke="#38bdf8" strokeWidth="4" />
              <line x1="440" y1="400" x2="480" y2="400" stroke="#38bdf8" strokeWidth="4" />
            </svg>

            {/* Interactive Camera Pins with Field of View (FOV) Cones */}
            {siteCameras.map(cam => {
              const coords = mapCoordinates[cam.id] || { x: 50, y: 50, angle: 0, label: cam.name };
              const isAlarming = unreadAlerts.some(e => e.cameraId === cam.id);

              return (
                <div 
                  key={cam.id}
                  style={{
                    position: 'absolute',
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isAlarming ? 20 : 10
                  }}
                  onClick={() => handleCameraPinClick(cam)}
                >
                  {/* Field of View (FOV) Visual Cone */}
                  {showFov && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '90px',
                      height: '90px',
                      transform: `translate(-50%, -50%) rotate(${coords.angle}deg)`,
                      pointerEvents: 'none',
                      clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%)',
                      background: isAlarming ? 'rgba(239, 68, 68, 0.45)' : 'rgba(6, 182, 212, 0.22)',
                      borderTop: isAlarming ? '2px solid #ef4444' : '2px solid var(--accent-cyan)',
                    }} />
                  )}

                  {/* Pulsing Alarm Beacon */}
                  {isAlarming && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.5)',
                      transform: 'translate(-50%, -50%)',
                      animation: 'pulse-red 1s infinite',
                      pointerEvents: 'none'
                    }} />
                  )}

                  {/* Camera Icon Pin */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isAlarming ? 'var(--accent-red)' : 'var(--bg-tertiary)',
                    border: isAlarming ? '2px solid #ffffff' : '2px solid var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isAlarming ? '0 0 16px #ef4444' : '0 0 10px rgba(6, 182, 212, 0.4)',
                    color: '#ffffff'
                  }}>
                    <MapPin size={13} />
                  </div>

                  {/* Camera Label Tag */}
                  <div style={{
                    position: 'absolute',
                    top: '32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(10, 13, 20, 0.85)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {cam.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Camera Preview Dialog if pin clicked */}
          {previewCamera && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '320px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 30
            }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                  <Radio size={13} color="var(--accent-green)" />
                  <span>{previewCamera.name}</span>
                </div>
                <button 
                  onClick={() => setPreviewCamera(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Zone: <b>{previewCamera.location}</b><br />
                  IP: <span style={{ fontFamily: 'var(--font-mono)' }}>{previewCamera.ip}</span><br />
                  Resolution: <b>{previewCamera.resolution}</b> • {previewCamera.fps} FPS
                </div>

                <button 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '5px', fontSize: '0.75rem' }}
                  onClick={() => {
                    onSelectCamera(previewCamera.id);
                  }}
                >
                  Open Live Stream in Video Wall
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
