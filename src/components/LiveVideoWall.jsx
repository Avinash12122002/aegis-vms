import React, { useState } from 'react';
import { 
  Grid2X2, 
  Grid3X3, 
  Square, 
  LayoutGrid, 
  Compass, 
  AlertTriangle, 
  Bell, 
  Check, 
  Eye, 
  Sparkles,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import CameraCell from './CameraCell';
import PTZController from './PTZController';

export default function LiveVideoWall({ 
  cameras, 
  selectedCameraId, 
  setSelectedCameraId,
  onUpdatePTZ,
  onOpenIntercom,
  tripwires,
  events,
  onAlarmTrigger,
  onAcknowledgeEvent,
  selectedSiteId
}) {
  const [gridMode, setGridMode] = useState(4); // 1, 4, 9, 16
  const [activePTZCamera, setActivePTZCamera] = useState(null);
  const [streamQuality, setStreamQuality] = useState('sub'); // 'sub' or 'main'
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [maximizedCamId, setMaximizedCamId] = useState(null);

  // Filter cameras by site
  const visibleCameras = cameras.filter(c => selectedSiteId === 'all' || c.siteId === selectedSiteId);

  // Slice cameras according to grid capacity
  const displayCameras = maximizedCamId 
    ? visibleCameras.filter(c => c.id === maximizedCamId)
    : visibleCameras.slice(0, gridMode);

  // Unread alarm count
  const unreadEvents = events.filter(e => !e.acknowledged);
  const latestAlert = unreadEvents[0];

  const handleToggleMaximize = (camId) => {
    if (maximizedCamId === camId) {
      setMaximizedCamId(null);
      setStreamQuality('sub');
    } else {
      setMaximizedCamId(camId);
      setSelectedCameraId(camId);
      setStreamQuality('main'); // Switch to 4K / Main stream on full view
    }
  };

  const handleOpenPTZ = (cam) => {
    setActivePTZCamera(cam);
    setSelectedCameraId(cam.id);
  };

  return (
    <div className="video-content-area">
      {/* Control Toolbar */}
      <div className="control-toolbar">
        {/* Left: Grid Selector & Stream Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="grid-selector">
            <button 
              className={`grid-btn ${gridMode === 1 && !maximizedCamId ? 'active' : ''}`}
              onClick={() => { setGridMode(1); setMaximizedCamId(null); }}
              title="1x1 Single View"
            >
              <Square size={14} />
            </button>
            <button 
              className={`grid-btn ${gridMode === 4 && !maximizedCamId ? 'active' : ''}`}
              onClick={() => { setGridMode(4); setMaximizedCamId(null); }}
              title="2x2 Quad View (4 Cameras)"
            >
              <Grid2X2 size={14} />
            </button>
            <button 
              className={`grid-btn ${gridMode === 9 && !maximizedCamId ? 'active' : ''}`}
              onClick={() => { setGridMode(9); setMaximizedCamId(null); }}
              title="3x3 View (9 Cameras)"
            >
              <Grid3X3 size={14} />
            </button>
            <button 
              className={`grid-btn ${gridMode === 16 && !maximizedCamId ? 'active' : ''}`}
              onClick={() => { setGridMode(16); setMaximizedCamId(null); }}
              title="4x4 Multi-View (16 Cameras)"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Dual-Stream Toggle (Sub / Main Stream) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Quality:</span>
            <button 
              style={{ 
                background: streamQuality === 'sub' ? 'var(--accent-blue)' : 'transparent', 
                border: 'none', 
                color: streamQuality === 'sub' ? '#fff' : 'var(--text-secondary)',
                padding: '2px 6px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
              onClick={() => setStreamQuality('sub')}
              title="Sub-Stream: Low Bandwidth, Faster Multi-Grid View"
            >
              SUB (VGA)
            </button>
            <button 
              style={{ 
                background: streamQuality === 'main' ? 'var(--accent-blue)' : 'transparent', 
                border: 'none', 
                color: streamQuality === 'main' ? '#fff' : 'var(--text-secondary)',
                padding: '2px 6px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
              onClick={() => setStreamQuality('main')}
              title="Main-Stream: 4K / Full HD High Definition Stream"
            >
              MAIN (4K/HD)
            </button>
          </div>
        </div>

        {/* Right: Alert Feed Drawer Toggle & PTZ Quick Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Active Camera PTZ trigger */}
          {selectedCameraId && (
            <button 
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.72rem', gap: '6px' }}
              onClick={() => {
                const cam = cameras.find(c => c.id === selectedCameraId);
                if (cam) setActivePTZCamera(cam);
              }}
            >
              <Compass size={14} color="var(--accent-cyan)" />
              <span>PTZ Controller</span>
            </button>
          )}

          {/* Alert Drawer Button with Pulsing Badge */}
          <button 
            className="btn btn-secondary"
            style={{ 
              padding: '4px 10px', 
              fontSize: '0.72rem', 
              gap: '6px',
              border: unreadEvents.length > 0 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
              background: unreadEvents.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)'
            }}
            onClick={() => setIsAlertDrawerOpen(!isAlertDrawerOpen)}
          >
            <Bell size={14} color={unreadEvents.length > 0 ? 'var(--accent-red)' : 'var(--text-secondary)'} />
            <span>Alarms ({unreadEvents.length})</span>
            {unreadEvents.length > 0 && (
              <span className="status-dot red" style={{ width: '6px', height: '6px' }} />
            )}
          </button>
        </div>
      </div>

      {/* Emergency Active Banner */}
      {latestAlert && (
        <div style={{ 
          background: 'linear-gradient(90deg, #991b1b, #7f1d1d)', 
          padding: '6px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#ffffff',
          borderBottom: '1px solid #dc2626'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} color="#fca5a5" />
            <span style={{ fontWeight: 700 }}>SECURITY ALARM:</span>
            <span>{latestAlert.type} on <b>{latestAlert.cameraName}</b> ({latestAlert.target} - {latestAlert.confidence})</span>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '2px 8px', fontSize: '0.68rem', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => onAcknowledgeEvent(latestAlert.id)}
          >
            <Check size={12} />
            <span>Acknowledge</span>
          </button>
        </div>
      )}

      {/* Main Grid View Wall */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className={`video-grid grid-${maximizedCamId ? '1' : gridMode}`}>
          {displayCameras.map(camera => {
            const isAlarming = unreadEvents.some(e => e.cameraId === camera.id);
            return (
              <CameraCell
                key={camera.id}
                camera={camera}
                isSelected={selectedCameraId === camera.id}
                onSelect={() => setSelectedCameraId(camera.id)}
                isMaximized={maximizedCamId === camera.id}
                onToggleMaximize={() => handleToggleMaximize(camera.id)}
                onOpenPTZ={handleOpenPTZ}
                onOpenIntercom={onOpenIntercom}
                streamQuality={streamQuality}
                tripwires={tripwires}
                onAlarmTrigger={onAlarmTrigger}
                isAlarming={isAlarming}
              />
            );
          })}
        </div>

        {/* Floating PTZ Controller */}
        {activePTZCamera && (
          <PTZController 
            camera={activePTZCamera}
            onUpdatePTZ={onUpdatePTZ}
            onClose={() => setActivePTZCamera(null)}
          />
        )}

        {/* Slide-out Alarms & Event Drawer */}
        {isAlertDrawerOpen && (
          <div className="alert-drawer">
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                <Bell size={15} color="var(--accent-red)" />
                <span>Live Security Alerts</span>
              </div>
              <button 
                onClick={() => setIsAlertDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {events.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  No security alarms recorded
                </div>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className={`alert-item ${!ev.acknowledged ? 'unread' : ''}`}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ev.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                          {ev.type}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {ev.timestamp}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {ev.cameraName}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        Target: {ev.target} ({ev.confidence})
                      </div>
                      {!ev.acknowledged && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ marginTop: '6px', padding: '2px 6px', fontSize: '0.62rem' }}
                          onClick={() => onAcknowledgeEvent(ev.id)}
                        >
                          <Check size={11} /> Mark Reviewed
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
