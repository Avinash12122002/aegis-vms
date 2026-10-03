import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Check, 
  Zap, 
  Sliders, 
  ShieldAlert, 
  Eye, 
  ArrowRightLeft,
  UserCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { CameraStreamSimulator } from '../services/videoSimulator';
import { sounds } from '../services/soundEffects';

export default function AiAnalyticsView({ 
  cameras, 
  selectedCameraId, 
  setSelectedCameraId,
  tripwires,
  setTripwires,
  events,
  onAcknowledgeEvent
}) {
  const currentCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0];
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState([]);
  const [newRuleName, setNewRuleName] = useState('New Boundary Tripwire');
  const [targetClass, setTargetClass] = useState('both'); // 'person', 'vehicle', 'both'
  const [direction, setDirection] = useState('BOTH');
  const [sensitivity, setSensitivity] = useState(85);

  const canvasRef = useRef(null);
  const drawOverlayRef = useRef(null);
  const simulatorRef = useRef(null);

  // Initialize canvas stream
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentCamera) return;

    canvas.width = 960;
    canvas.height = 540;

    const sim = new CameraStreamSimulator(canvas, currentCamera, {
      tripwires,
      onTripwireCross: (ev) => {
        sounds.playAlarm();
      }
    });

    simulatorRef.current = sim;
    sim.start();

    return () => sim.stop();
  }, [currentCamera.id]);

  // Update tripwires dynamically without tearing down canvas loop
  useEffect(() => {
    if (simulatorRef.current) {
      simulatorRef.current.setTripwires(tripwires);
    }
  }, [tripwires]);

  // Handle drawing tripwire on the overlay
  const handleCanvasClick = (e) => {
    if (!isDrawing) return;
    const rect = drawOverlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    sounds.playClick();
    const updated = [...drawPoints, { x, y }];
    setDrawPoints(updated);

    if (updated.length === 2) {
      // Finished drawing 2-point tripwire line
      const newTw = {
        id: `tw-${Date.now()}`,
        cameraId: currentCamera.id,
        name: newRuleName || 'Custom Perimeter Line',
        type: 'line',
        points: updated,
        direction: direction,
        targetClasses: targetClass === 'both' ? ['person', 'vehicle'] : [targetClass],
        sensitivity: sensitivity,
        enabled: true,
        color: '#ef4444',
      };

      setTripwires(prev => [...prev, newTw]);
      setIsDrawing(false);
      setDrawPoints([]);
      setNewRuleName('New Boundary Tripwire');
    }
  };

  const handleDeleteTripwire = (id) => {
    sounds.playClick();
    setTripwires(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleTripwire = (id) => {
    sounds.playClick();
    setTripwires(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const cameraTripwires = tripwires.filter(t => t.cameraId === currentCamera.id);

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Left Canvas & Interactive Drawing Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)' }}>
        {/* Subheader Toolbar */}
        <div className="control-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              <Cpu size={15} color="var(--accent-cyan)" />
              <span>AI Vision Rules:</span>
            </div>

            <select 
              className="input-field" 
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-primary)' }}
              value={currentCamera.id}
              onChange={(e) => setSelectedCameraId(e.target.value)}
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>📷 {c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDrawing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', animation: 'pulse-red 1.5s infinite' }}>
                  Click 2 points on video to place Tripwire ({drawPoints.length}/2)
                </span>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                  onClick={() => { setIsDrawing(false); setDrawPoints([]); }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary"
                style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                onClick={() => setIsDrawing(true)}
              >
                <Plus size={14} />
                <span>Draw New Virtual Tripwire</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Canvas with Clickable Drawing Overlay */}
        <div style={{ flex: 1, position: 'relative', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />

          {/* Interactive Draw Overlay */}
          <div 
            ref={drawOverlayRef}
            onClick={handleCanvasClick}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              cursor: isDrawing ? 'crosshair' : 'default',
              pointerEvents: isDrawing ? 'auto' : 'none'
            }}
          >
            {/* Temporary Draw Line */}
            {isDrawing && drawPoints.length === 1 && (
              <div style={{
                position: 'absolute',
                left: `${drawPoints[0].x * 100}%`,
                top: `${drawPoints[0].y * 100}%`,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ef4444',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 10px #ef4444'
              }} />
            )}
          </div>

          {/* Helper badge when drawing */}
          {isDrawing && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              background: 'rgba(0,0,0,0.8)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--accent-amber)',
              fontSize: '0.75rem',
              color: '#ffffff'
            }}>
              🎯 <b>Step 1:</b> Click on the video to set Line Start. <b>Step 2:</b> Click to set Line End.
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Rules Config & Live Event Feed */}
      <div style={{ width: '360px', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', overflowY: 'auto' }}>
        {/* Rules Config Section */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={15} color="var(--accent-cyan)" />
            <span>Configured Tripwires ({cameraTripwires.length})</span>
          </div>

          {cameraTripwires.length === 0 ? (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
              No tripwire rules on this camera. Click <b>"Draw New Virtual Tripwire"</b> to create one.
            </div>
          ) : (
            cameraTripwires.map(tw => (
              <div 
                key={tw.id}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tw.enabled ? 'var(--accent-green)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tw.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                      onClick={() => handleToggleTripwire(tw.id)}
                    >
                      {tw.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '2px 6px', fontSize: '0.65rem', color: 'var(--accent-red)' }}
                      onClick={() => handleDeleteTripwire(tw.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span>Targets: <b>{tw.targetClasses?.join(', ')}</b></span>
                  <span>Sensitivity: <b>{tw.sensitivity}%</b></span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Real-time AI Event Trigger Log */}
        <div style={{ flex: 1, padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} color="var(--accent-amber)" />
            <span>Live AI Detection Logs</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {events.map(ev => (
              <div 
                key={ev.id}
                style={{ 
                  background: ev.acknowledged ? 'rgba(255,255,255,0.02)' : 'rgba(239, 68, 68, 0.08)',
                  border: ev.acknowledged ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  fontSize: '0.72rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, color: ev.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                    {ev.type}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{ev.timestamp}</span>
                </div>

                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ev.cameraName}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Detected: {ev.target} ({ev.confidence})</div>

                {!ev.acknowledged && (
                  <button 
                    className="btn btn-secondary"
                    style={{ marginTop: '6px', padding: '2px 8px', fontSize: '0.65rem' }}
                    onClick={() => onAcknowledgeEvent(ev.id)}
                  >
                    <Check size={11} /> Mark Acknowledged
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
