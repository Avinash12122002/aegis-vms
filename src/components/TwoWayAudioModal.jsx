import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Radio, 
  X, 
  ShieldAlert, 
  Activity,
  VolumeX
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function TwoWayAudioModal({ camera, onClose }) {
  const [isTalking, setIsTalking] = useState(false);
  const [volume, setVolume] = useState(85);
  const [vuLevel, setVuLevel] = useState(0);

  // Audio VU meter simulation while talking
  useEffect(() => {
    let anim = null;
    if (isTalking) {
      anim = setInterval(() => {
        setVuLevel(Math.floor(Math.random() * 60) + 35);
      }, 100);
    } else {
      setVuLevel(0);
    }
    return () => {
      if (anim) clearInterval(anim);
    };
  }, [isTalking]);

  const handleStartTalking = () => {
    sounds.playClick();
    setIsTalking(true);
  };

  const handleStopTalking = () => {
    sounds.playClick();
    setIsTalking(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Radio size={18} color="var(--accent-cyan)" />
            <span>Two-Way Audio Intercom (Push-to-Talk)</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          {/* Target Camera Info */}
          <div style={{ 
            background: 'var(--bg-primary)', 
            border: '1px solid var(--border-subtle)', 
            padding: '10px', 
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {camera.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Zone: {camera.location} • IP: {camera.ip} • ONVIF Audio Profile T
            </div>
          </div>

          {/* Broadcast Status Badge */}
          <div style={{ marginBottom: '18px' }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: isTalking ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: isTalking ? '1px solid var(--accent-red)' : '1px solid var(--accent-green)',
              color: isTalking ? 'var(--accent-red)' : 'var(--accent-green)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              <span className={`status-dot ${isTalking ? 'red' : ''}`} style={{ width: '7px', height: '7px' }} />
              {isTalking ? 'BROADCASTING TO CAMERA SPEAKER...' : 'READY TO TRANSMIT'}
            </span>
          </div>

          {/* VU Audio Level Waveform Meter */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '3px', 
            height: '42px', 
            background: '#05070a',
            borderRadius: 'var(--radius-sm)',
            padding: '0 20px',
            marginBottom: '20px'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((bar) => {
              const height = isTalking 
                ? Math.min(36, Math.max(6, Math.sin(bar * 0.8 + Date.now()) * (vuLevel * 0.4) + (vuLevel * 0.3)))
                : 4;
              return (
                <div 
                  key={bar}
                  style={{
                    flex: 1,
                    height: `${height}px`,
                    background: isTalking ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    transition: 'height 0.08s ease'
                  }}
                />
              );
            })}
          </div>

          {/* Big Push-To-Talk Button */}
          <button
            onMouseDown={handleStartTalking}
            onMouseUp={handleStopTalking}
            onTouchStart={handleStartTalking}
            onTouchEnd={handleStopTalking}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: isTalking ? '3px solid #ffffff' : '3px solid var(--accent-cyan)',
              background: isTalking ? 'var(--accent-red)' : 'var(--bg-tertiary)',
              color: '#ffffff',
              boxShadow: isTalking ? '0 0 25px rgba(239, 68, 68, 0.7)' : '0 0 15px rgba(6, 182, 212, 0.3)',
              cursor: 'pointer',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              userSelect: 'none'
            }}
          >
            {isTalking ? <Mic size={36} /> : <MicOff size={36} color="var(--accent-cyan)" />}
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>
              {isTalking ? 'RELEASE' : 'HOLD TO TALK'}
            </span>
          </button>

          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '14px' }}>
            Hold button down or touch-and-hold to talk through camera loudspeaker.
          </p>

          {/* Speaker Volume Slider */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <Volume2 size={16} color="var(--text-muted)" />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ width: '180px', accentColor: 'var(--accent-cyan)' }}
            />
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {volume}%
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Close Intercom
          </button>
        </div>
      </div>
    </div>
  );
}
