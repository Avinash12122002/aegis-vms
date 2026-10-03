import React, { useState } from 'react';
import { 
  Activity, 
  WifiOff, 
  RotateCcw
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function CameraHealthDiagnostics({ cameras, onToggleCameraStatus }) {
  const [filter, setFilter] = useState('all');

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const offlineCount = cameras.length - onlineCount;

  const handleSimulateCut = (cam) => {
    sounds.playAlarm();
    onToggleCameraStatus(cam.id);
  };

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Header Toolbar */}
      <div className="control-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--accent-green)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Hardware & Network Diagnostics</span>
        </div>

        {/* Quick Filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '3px 8px', fontSize: '0.72rem', background: filter === 'all' ? 'var(--accent-blue)' : 'var(--bg-tertiary)' }}
            onClick={() => setFilter('all')}
          >
            All Cameras ({cameras.length})
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '3px 8px', fontSize: '0.72rem', background: filter === 'offline' ? 'var(--accent-red)' : 'var(--bg-tertiary)' }}
            onClick={() => setFilter('offline')}
          >
            Offline ({offlineCount})
          </button>
        </div>
      </div>

      {/* Metric Cards Top Row */}
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CAMERA UPTIME STATUS</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: onlineCount === cameras.length ? 'var(--accent-green)' : 'var(--accent-amber)', marginTop: '4px' }}>
            {onlineCount} / {cameras.length} Online
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            99.98% System Availability
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AVERAGE STREAM LATENCY</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
            16.2 ms
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Low Jitter (1.2ms) • Sub-Second WebRTC
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NETWORK PACKET INTEGRITY</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)', marginTop: '4px' }}>
            99.98%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Average Packet Loss: 0.02%
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AVG SENSOR TEMPERATURE</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
            39.8 °C
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Thermal Range Normal (Safe &lt; 65°C)
          </div>
        </div>
      </div>

      {/* Detailed Camera Health Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 14px' }}>Device</th>
              <th style={{ padding: '10px 14px' }}>Status</th>
              <th style={{ padding: '10px 14px' }}>Ping / Latency</th>
              <th style={{ padding: '10px 14px' }}>Packet Loss</th>
              <th style={{ padding: '10px 14px' }}>Temp</th>
              <th style={{ padding: '10px 14px' }}>Uptime</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Fault Injection / Cable Test</th>
            </tr>
          </thead>
          <tbody>
            {cameras
              .filter(c => filter === 'all' || (filter === 'offline' && c.status === 'offline'))
              .map(cam => {
                const isOnline = cam.status === 'online';
                return (
                  <tr key={cam.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cam.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {cam.ip}:{cam.onvifPort} • {cam.location}
                      </div>
                    </td>

                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isOnline ? 'var(--accent-green)' : 'var(--accent-red)',
                        fontWeight: 700,
                        fontSize: '0.68rem'
                      }}>
                        <span className={`status-dot ${!isOnline ? 'red' : ''}`} style={{ width: '6px', height: '6px' }} />
                        {isOnline ? 'HEALTHY' : 'CABLE DISCONNECT'}
                      </span>
                    </td>

                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                      {isOnline ? `${cam.latencyMs || 15} ms` : 'TIMEOUT (0ms)'}
                    </td>

                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                      {isOnline ? `${cam.packetLossPercent || 0.01}%` : '100%'}
                    </td>

                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: (cam.temperatureC || 40) > 55 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                        {cam.temperatureC || 40} °C
                      </span>
                    </td>

                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                      {isOnline ? `${cam.uptimeDays || 14} days` : '0 days'}
                    </td>

                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <button 
                        className={`btn ${isOnline ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '3px 10px', fontSize: '0.68rem' }}
                        onClick={() => handleSimulateCut(cam)}
                        title="Simulate hardware cable severance or recovery"
                      >
                        {isOnline ? <WifiOff size={12} /> : <RotateCcw size={12} />}
                        <span>{isOnline ? 'Simulate Cable Cut' : 'Reconnect Camera'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
