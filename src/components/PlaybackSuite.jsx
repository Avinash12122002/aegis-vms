import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  Calendar, 
  Download, 
  Film, 
  ShieldCheck, 
  Grid2X2,
  Square
} from 'lucide-react';
import { CameraStreamSimulator } from '../services/videoSimulator';
import { sounds } from '../services/soundEffects';

export default function PlaybackSuite({ 
  cameras, 
  selectedCameraId, 
  setSelectedCameraId, 
  playbackJumpTarget 
}) {
  const [selectedDate, setSelectedDate] = useState('2026-10-03');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTimeSec, setCurrentTimeSec] = useState(14 * 3600 + 25 * 60);
  const [isQuadSync, setIsQuadSync] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStartTime, setExportStartTime] = useState('14:20:00');
  const [exportEndTime, setExportEndTime] = useState('14:30:00');
  const [exportWatermark, setExportWatermark] = useState('AegisVMS-SHA256-Verified');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Jump to specific timestamp when triggered from Forensic Search
  useEffect(() => {
    if (!playbackJumpTarget) return;
    const timer = setTimeout(() => {
      if (playbackJumpTarget.date) setSelectedDate(playbackJumpTarget.date);
      if (playbackJumpTarget.time) {
        const parts = playbackJumpTarget.time.split(':').map(Number);
        if (parts.length === 3) {
          setCurrentTimeSec(parts[0] * 3600 + parts[1] * 60 + parts[2]);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [playbackJumpTarget]);

  // Canvas refs for single and quad sync
  const canvasRef = useRef(null);
  const quad0Ref = useRef(null);
  const quad1Ref = useRef(null);
  const quad2Ref = useRef(null);
  const quad3Ref = useRef(null);
  const simulatorsRef = useRef([]);
  const timelineTrackRef = useRef(null);

  const currentCamera = cameras.find(c => c.id === selectedCameraId) || cameras[0];
  const quadCameras = cameras.slice(0, 4);

  // Initialize playback canvas (Single or Quad-Sync)
  useEffect(() => {
    simulatorsRef.current.forEach(sim => sim.stop());
    simulatorsRef.current = [];

    if (!isQuadSync) {
      const canvas = canvasRef.current;
      if (canvas && currentCamera) {
        canvas.width = 960;
        canvas.height = 540;
        const sim = new CameraStreamSimulator(canvas, currentCamera);
        simulatorsRef.current = [sim];
        sim.start();
      }
    } else {
      const refs = [quad0Ref, quad1Ref, quad2Ref, quad3Ref];
      quadCameras.forEach((cam, idx) => {
        const canvas = refs[idx]?.current;
        if (canvas) {
          canvas.width = 480;
          canvas.height = 270;
          const sim = new CameraStreamSimulator(canvas, cam);
          simulatorsRef.current.push(sim);
          sim.start();
        }
      });
    }

    return () => {
      simulatorsRef.current.forEach(sim => sim.stop());
      simulatorsRef.current = [];
    };
  }, [isQuadSync, currentCamera, quadCameras]);

  // Timeline scrubber playback animation
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= 86400) return 0;
          return prev + playbackSpeed;
        });
      }, 1000 / Math.max(1, playbackSpeed));
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed]);

  const formatSecondsToTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleTimelineClick = (e) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newSec = Math.round(percentage * 86400);
    setCurrentTimeSec(newSec);
    sounds.playClick();
  };

  const handleExportClip = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setExportModalOpen(false);
      }, 2500);
    }, 1500);
  };

  const needlePercent = (currentTimeSec / 86400) * 100;

  return (
    <div className="playback-container">
      {/* Top Filter Bar: Camera & Date Picker */}
      <div className="control-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Film size={15} color="var(--accent-blue)" />
            <span>Archive Playback</span>
          </div>

          {/* Single vs Quad Synchronized Playback Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                fontSize: '0.72rem',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                background: !isQuadSync ? 'var(--accent-blue)' : 'transparent',
                color: !isQuadSync ? '#fff' : 'var(--text-secondary)'
              }}
              onClick={() => setIsQuadSync(false)}
            >
              <Square size={12} />
              <span>Single</span>
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                fontSize: '0.72rem',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                background: isQuadSync ? 'var(--accent-blue)' : 'transparent',
                color: isQuadSync ? '#fff' : 'var(--text-secondary)'
              }}
              onClick={() => setIsQuadSync(true)}
              title="Synchronized 4-Camera Playback (Exact Timestamp Sync)"
            >
              <Grid2X2 size={12} />
              <span>Quad Sync (4 Cams)</span>
            </button>
          </div>

          {/* Camera Picker (When in single mode) */}
          {!isQuadSync && (
            <select 
              className="input-field" 
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-primary)' }}
              value={currentCamera.id}
              onChange={(e) => setSelectedCameraId(e.target.value)}
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>📷 {c.name} ({c.location})</option>
              ))}
            </select>
          )}

          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--text-muted)" />
            <input 
              type="date" 
              className="input-field"
              style={{ width: 'auto', padding: '3px 8px', fontSize: '0.75rem', background: 'var(--bg-primary)' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Export Clip Button */}
        <div>
          <button 
            className="btn btn-primary"
            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
            onClick={() => setExportModalOpen(true)}
          >
            <Download size={14} />
            <span>Export Incident Clip</span>
          </button>
        </div>
      </div>

      {/* Main Playback Video Area (Single or Quad-Sync Grid) */}
      <div style={{ flex: 1, position: 'relative', background: '#000000', overflow: 'hidden' }}>
        {!isQuadSync ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />

            {/* Watermark Overlay on Footage */}
            <div style={{ 
              position: 'absolute', 
              top: '16px', 
              left: '16px', 
              background: 'rgba(0,0,0,0.6)', 
              padding: '4px 10px', 
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{currentCamera.name}</span>
              <span>•</span>
              <span>{selectedDate} {formatSecondsToTime(currentTimeSec)}</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-green)' }}>SPEED: {playbackSpeed}x</span>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))', gap: '4px', padding: '4px', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            {quadCameras.map((cam, idx) => {
              const refs = [quad0Ref, quad1Ref, quad2Ref, quad3Ref];
              return (
                <div key={cam.id} style={{ position: 'relative', background: '#05070a', overflow: 'hidden', borderRadius: '4px', minHeight: 0, minWidth: 0, height: '100%', width: '100%' }}>
                  <canvas ref={refs[idx]} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '3px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#fff', zIndex: 2 }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{cam.name}</span>
                    <span style={{ marginLeft: '6px', color: 'var(--accent-green)' }}>SYNC</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SHA-256 Hash Proof Badge */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '3px 8px',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <ShieldCheck size={12} color="var(--accent-green)" />
          <span>SHA-256: 8f9b2c...4a10d [AUTHENTICATED EVIDENCE]</span>
        </div>
      </div>

      {/* 24-Hour Visual Timeline Scrubber */}
      <div className="timeline-scrubber">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          {/* VCR Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px', borderRadius: '50%' }}
              onClick={() => setCurrentTimeSec(prev => Math.max(0, prev - 30))}
              title="Jump 30 seconds back"
            >
              <Rewind size={14} />
            </button>

            <button 
              className="btn btn-primary" 
              style={{ padding: '6px 14px' }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px', borderRadius: '50%' }}
              onClick={() => setCurrentTimeSec(prev => Math.min(86400, prev + 30))}
              title="Jump 30 seconds forward"
            >
              <FastForward size={14} />
            </button>

            {/* Speed Selector */}
            <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
              {[0.5, 1, 2, 4, 8].map(spd => (
                <button
                  key={spd}
                  style={{
                    background: playbackSpeed === spd ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: playbackSpeed === spd ? '#fff' : 'var(--text-secondary)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPlaybackSpeed(spd)}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Current Scrubber Timestamp Display */}
          <div style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '1rem', 
            fontWeight: 700, 
            color: 'var(--accent-cyan)' 
          }}>
            {formatSecondsToTime(currentTimeSec)} / 23:59:59
          </div>

          {/* Timeline Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--accent-green)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Continuous 24/7</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--accent-red)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>AI Intrusion / Motion</span>
            </div>
          </div>
        </div>

        {/* 24-Hour Timeline Track Container */}
        <div 
          ref={timelineTrackRef}
          className="timeline-track-container" 
          onClick={handleTimelineClick}
        >
          <div className="timeline-segment continuous" style={{ left: '0%', width: '35%' }} />
          <div className="timeline-segment continuous" style={{ left: '42%', width: '45%' }} />

          <div className="timeline-segment motion" style={{ left: '18%', width: '3%' }} title="AI Intrusion at 04:19" />
          <div className="timeline-segment motion" style={{ left: '48%', width: '4%' }} title="Vehicle Line Crossing at 11:30" />
          <div className="timeline-segment motion" style={{ left: '60%', width: '2.5%' }} title="Boundary Motion at 14:24" />

          <div className="timeline-needle" style={{ left: `${needlePercent}%` }} />
        </div>

        {/* Hour Marks 00:00 - 24:00 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.62rem', 
          color: 'var(--text-muted)' 
        }}>
          <span>00:00</span>
          <span>03:00</span>
          <span>06:00</span>
          <span>09:00</span>
          <span>12:00</span>
          <span>15:00</span>
          <span>18:00</span>
          <span>21:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* Export Clip Modal */}
      {exportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <Download size={18} color="var(--accent-cyan)" />
                <span>Export Tamper-Proof Video Evidence</span>
              </div>
              <button 
                onClick={() => setExportModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Camera Source
                </label>
                <input 
                  type="text" 
                  disabled 
                  value={isQuadSync ? "Synchronized Quad-Camera Feed (4 Channels)" : `${currentCamera.name} (${currentCamera.location})`} 
                  className="input-field" 
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Start Timestamp
                  </label>
                  <input 
                    type="time" 
                    step="1"
                    className="input-field"
                    value={exportStartTime}
                    onChange={(e) => setExportStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    End Timestamp
                  </label>
                  <input 
                    type="time" 
                    step="1"
                    className="input-field"
                    value={exportEndTime}
                    onChange={(e) => setExportEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Cryptographic Watermark & Evidence Chain
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={exportWatermark}
                  onChange={(e) => setExportWatermark(e.target.value)}
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Generates an immutable SHA-256 hash certificate for court/legal evidence compliance.
                </span>
              </div>

              {exportSuccess && (
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  border: '1px solid var(--accent-green)', 
                  color: 'var(--accent-green)', 
                  padding: '10px', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldCheck size={16} />
                  <span>Clip successfully packaged and downloaded with SHA-256 digital certificate!</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setExportModalOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleExportClip}
                disabled={isExporting}
              >
                {isExporting ? 'Packaging MP4...' : 'Download MP4 Clip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
