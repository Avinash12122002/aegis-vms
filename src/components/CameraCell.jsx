import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  Maximize2, 
  Minimize2, 
  Compass, 
  Volume2, 
  VolumeX, 
  Mic,
  Scaling
} from 'lucide-react';
import Hls from 'hls.js';
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
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
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
  const [fitMode, setFitMode] = useState('fill'); // 'fill' = 100% full width widescreen, 'contain' = original aspect ratio
  const [streamResolution, setStreamResolution] = useState(camera.resolution);

  // Initialize and run HLS native stream for real cameras
  useEffect(() => {
    if (!camera.liveStreamUrl) return;

    let baseUrl = camera.liveStreamUrl.replace(':8889/', ':8888/').split('?')[0];
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    const m3u8Url = `${baseUrl}index.m3u8`;

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxLiveSyncPlaybackRate: 1.5,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(m3u8Url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8Url;
      video.play().catch(() => {});
    }
  }, [camera.liveStreamUrl]);

  // Update OSD timecode (clean HH:MM:SS that fits perfectly on small cells)
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      setTimecode(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    }, 250);

    return () => clearInterval(timer);
  }, []);

  // Initialize simulation canvas if no real stream
  useEffect(() => {
    if (camera.liveStreamUrl) return;

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

    return () => {
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
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const v = videoRef.current;
      const c = document.createElement('canvas');
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `SNAPSHOT_${camera.name.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
      a.click();
    } else if (simulatorRef.current) {
      const dataUrl = simulatorRef.current.captureSnapshot();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `SNAPSHOT_${camera.name.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
      a.click();
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
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
          <video
            ref={videoRef}
            className="camera-canvas"
            muted={isMuted}
            playsInline
            autoPlay
            onLoadedMetadata={(e) => {
              if (e.target.videoWidth && e.target.videoHeight) {
                setStreamResolution(`${e.target.videoWidth}x${e.target.videoHeight}`);
              }
            }}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: fitMode, 
              background: '#000',
              pointerEvents: 'none',
              imageRendering: '-webkit-optimize-contrast'
            }}
          />
        ) : (
          <canvas ref={canvasRef} className="camera-canvas" />
        )}

        {/* On-Screen Display (OSD) Overlay */}
        <div className="osd-overlay">
          {/* Top Bar: Camera Name & Badges grouped on left (keeps camera native timestamp visible) */}
          <div className="osd-top">
            <div className="osd-top-left">
              <div className="osd-cam-name" title={camera.name}>
                <span>{camera.name.replace(/\s*\([^)]*\)/g, '').trim()}</span>
              </div>

              <div className="osd-badges">
                {camera.hasAiAnalytics && (
                  <span className="osd-badge-ai">
                    AI
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
          </div>

          {/* Bottom Bar: Telemetry & Live Timestamp (Single Line, Never Wraps) */}
          <div className="osd-bottom">
            <div className="osd-telemetry">
              <span>{camera.fps || 25} FPS</span>
              <span className="osd-sep">•</span>
              <span>{camera.bitrate || '4Mbps'}</span>
              <span className="osd-sep">•</span>
              <span className="osd-quality-tag">{streamQuality.toUpperCase()}</span>
            </div>

            <div className="osd-time">
              {timecode || '17:00:00'}
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
            <Camera size={12} />
          </button>

          {/* PTZ Joystick Launcher (if PTZ capable) */}
          {camera.ptzCapable && (
            <button 
              className="cam-icon-btn" 
              onClick={(e) => { e.stopPropagation(); onOpenPTZ(camera); }}
              title="Open PTZ Joystick & Presets"
            >
              <Compass size={12} />
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
              <Mic size={12} />
            </button>
          )}

          {/* Aspect Ratio Stretch / Fit Toggle */}
          <button 
            className="cam-icon-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setFitMode(fitMode === 'fill' ? 'contain' : 'fill');
            }}
            title={fitMode === 'fill' ? "Full Width (Active) - Click for Original 4:3 Ratio" : "Original Ratio - Click for Full Width Stretch"}
            style={{ color: fitMode === 'fill' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
          >
            <Scaling size={12} />
          </button>

          {/* Audio Mute/Unmute */}
          <button 
            className="cam-icon-btn" 
            onClick={handleToggleMute}
            title={isMuted ? "Unmute Camera Audio" : "Mute Camera Audio"}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>

          {/* Maximize 1x1 Toggle */}
          <button 
            className="cam-icon-btn" 
            onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}
            title={isMaximized ? "Restore Grid View" : "Maximize Fullscreen"}
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
