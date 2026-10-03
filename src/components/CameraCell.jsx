import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  Maximize2, 
  Minimize2, 
  Compass, 
  Volume2, 
  VolumeX, 
  Mic
} from 'lucide-react';
import { CameraStreamSimulator } from '../services/videoSimulator';
import { sounds } from '../services/soundEffects';

export default function CameraCell({ 
  camera, 
  isSelected, 
  onSelect, 
  onToggleMaximize, 
  isMaximized,
  onOpenPTZ,
  onOpenIntercom,
  streamQuality = 'sub',
  tripwires = [],
  onAlarmTrigger,
  isAlarming = false
}) {
  const canvasRef = useRef(null);
  const simulatorRef = useRef(null);
  const onAlarmTriggerRef = useRef(onAlarmTrigger);
  const tripwiresRef = useRef(tripwires);
  const cameraRef = useRef(camera);

  useEffect(() => {
    onAlarmTriggerRef.current = onAlarmTrigger;
    tripwiresRef.current = tripwires;
    cameraRef.current = camera;
  });
  const [timecode, setTimecode] = useState('');
  const [isMuted, setIsMuted] = useState(true);

  // Initialize and run stream simulator
  useEffect(() => {
    if (camera.liveStreamUrl) {
      // Real Camera Feed - update OSD timecode only
      const timer = setInterval(() => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const ms = String(d.getMilliseconds()).padStart(3, '0');
        setTimecode(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`);
      }, 100);
      return () => clearInterval(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const targetW = isMaximized || streamQuality === 'main' ? 960 : 480;
    const targetH = isMaximized || streamQuality === 'main' ? 540 : 270;
    canvas.width = targetW;
    canvas.height = targetH;

    const sim = new CameraStreamSimulator(canvas, cameraRef.current, {
      tripwires: tripwiresRef.current,
      onTripwireCross: (event) => {
        sounds.playAlarm();
        if (onAlarmTriggerRef.current) {
          onAlarmTriggerRef.current(event);
        }
      }
    });

    simulatorRef.current = sim;
    sim.start();

    // Timecode OSD updater
    const timer = setInterval(() => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const ms = String(d.getMilliseconds()).padStart(3, '0');
      setTimecode(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`);
    }, 100);

    return () => {
      clearInterval(timer);
      sim.stop();
    };
  }, [camera.id, camera.liveStreamUrl, streamQuality, isMaximized]);

  // Update tripwires dynamically
  useEffect(() => {
    if (simulatorRef.current) {
      simulatorRef.current.setTripwires(tripwires);
    }
  }, [tripwires]);

  // Update PTZ transforms and status dynamically
  useEffect(() => {
    if (simulatorRef.current) {
      simulatorRef.current.updateCamera(camera);
    }
  }, [camera]);

  // Snapshot capture handler
  const handleSnapshot = (e) => {
    e.stopPropagation();
    sounds.playShutter();
    if (simulatorRef.current) {
      const dataUrl = simulatorRef.current.captureSnapshot();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `SNAPSHOT_${camera.name.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
      a.click();
    }
  };

  return (
    <div 
      className={`camera-cell ${isSelected ? 'active-focus' : ''} ${isAlarming ? 'alarm-active' : ''}`}
      onClick={onSelect}
      onDoubleClick={onToggleMaximize}
    >
      <div className="camera-video-wrapper">
        {camera.liveStreamUrl ? (
          <iframe 
            src={camera.liveStreamUrl} 
            className="camera-canvas"
            style={{ 
              border: 'none', 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              background: '#000',
              pointerEvents: 'none' 
            }}
            title={camera.name}
            allow="autoplay; encrypted-media"
          />
        ) : (
          <canvas ref={canvasRef} className="camera-canvas" />
        )}

        {/* On-Screen Display (OSD) Overlay */}
        <div className="osd-overlay">
          {/* Top Bar: Camera Name & REC badge */}
          <div className="osd-top">
            <div className="osd-cam-name">
              <span>{camera.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {camera.hasAiAnalytics && (
                <span style={{ 
                  background: 'rgba(6, 182, 212, 0.85)', 
                  padding: '2px 5px', 
                  borderRadius: '3px', 
                  fontSize: '0.62rem', 
                  fontWeight: 700 
                }}>
                  AI ACTIVE
                </span>
              )}
              {camera.isRecording && (
                <div className="osd-rec-badge">
                  <span className="osd-rec-dot" />
                  <span>REC</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Telemetry & Live Timestamp */}
          <div className="osd-bottom">
            <div className="osd-telemetry">
              <span>{streamQuality === 'main' ? camera.resolution : '640x360'}</span>
              <span>•</span>
              <span>{camera.fps} FPS</span>
              <span>•</span>
              <span>{camera.bitrate}</span>
              <span>•</span>
              <span style={{ textTransform: 'uppercase' }}>{streamQuality} STREAM</span>
            </div>

            <div className="osd-time">
              {timecode || '2026-10-03 17:00:00.000'}
            </div>
          </div>
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="camera-action-overlay">
          {/* Snapshot Button */}
          <button 
            className="cam-icon-btn" 
            onClick={handleSnapshot}
            title="Take Instant HD Snapshot"
          >
            <Camera size={14} />
          </button>

          {/* PTZ Joystick Launcher (if PTZ capable) */}
          {camera.ptzCapable && (
            <button 
              className="cam-icon-btn" 
              onClick={(e) => { e.stopPropagation(); onOpenPTZ(camera); }}
              title="Open PTZ Joystick & Presets"
            >
              <Compass size={14} />
            </button>
          )}

          {/* Two-Way Audio Intercom (if audio capable) */}
          {camera.twoWayAudioCapable && (
            <button 
              className="cam-icon-btn" 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onOpenIntercom) onOpenIntercom(camera); 
              }}
              title="Push-to-Talk Intercom (Speak through camera speaker)"
              style={{ color: 'var(--accent-cyan)' }}
            >
              <Mic size={14} />
            </button>
          )}

          {/* Audio Mute/Unmute */}
          <button 
            className="cam-icon-btn" 
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            title={isMuted ? "Unmute Camera Audio" : "Mute Camera Audio"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Maximize 1x1 Toggle */}
          <button 
            className="cam-icon-btn" 
            onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}
            title={isMaximized ? "Restore Grid View" : "Maximize Fullscreen"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
