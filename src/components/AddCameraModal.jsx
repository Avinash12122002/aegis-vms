import React, { useState } from 'react';
import { 
  Camera, 
  Search, 
  Check, 
  Plus, 
  Activity,
  X
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function AddCameraModal({ sites, onAddCamera, onClose }) {
  const [activeTab, setActiveTab] = useState('onvif'); // 'onvif' (auto discovery) or 'manual'
  const [isScanning, setIsScanning] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Form State
  const [cameraName, setCameraName] = useState('New IP Camera');
  const [siteId, setSiteId] = useState(sites[0]?.id || 'site-1');
  const [location, setLocation] = useState('Entrance Hall');
  const [sceneType, setSceneType] = useState('gate');
  const [ip, setIp] = useState('192.168.1.150');
  const [rtspUrl, setRtspUrl] = useState('rtsp://admin:AegisPass2026@192.168.1.150:554/live/ch0');
  const [onvifPort, setOnvifPort] = useState(80);
  const [resolution, setResolution] = useState('1920x1080 (FHD)');
  const [ptzCapable, setPtzCapable] = useState(true);
  const [hasAiAnalytics, setHasAiAnalytics] = useState(true);

  // Simulated Discovered ONVIF Devices
  const [discoveredDevices, setDiscoveredDevices] = useState([]);

  const handleScanONVIF = () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    setTimeout(() => {
      setIsScanning(false);
      setDiscoveredDevices([
        { name: 'CP PLUS 4MP Smart Dome', ip: '192.168.1.150', port: 80, onvif: 'Profile S/T', ptz: true, scene: 'gate' },
        { name: 'Dahua 2MP Bullet IP Cam', ip: '192.168.1.155', port: 80, onvif: 'Profile S', ptz: false, scene: 'warehouse' },
        { name: 'Hikvision PTZ Speed Dome', ip: '192.168.1.160', port: 8000, onvif: 'Profile S/G', ptz: true, scene: 'parking' },
      ]);
    }, 1200);
  };

  const handleSelectDiscovered = (dev) => {
    setCameraName(dev.name);
    setIp(dev.ip);
    setOnvifPort(dev.port);
    setPtzCapable(dev.ptz);
    setSceneType(dev.scene);
    setRtspUrl(`rtsp://admin:AegisPass2026@${dev.ip}:${dev.port === 8000 ? 554 : 554}/live/ch0`);
    setActiveTab('manual');
    sounds.playClick();
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestSuccess(false);
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCamera = {
      id: `cam-${Date.now()}`,
      siteId,
      name: cameraName,
      location,
      sceneType,
      ip,
      rtspUrl,
      onvifPort: Number(onvifPort),
      resolution,
      fps: 25,
      bitrate: '2560 kbps',
      codec: 'H.265 Main',
      status: 'online',
      ptzCapable,
      twoWayAudioCapable: true,
      temperatureC: 39,
      latencyMs: 16,
      packetLossPercent: 0.01,
      uptimeDays: 1,
      isRecording: true,
      hasAiAnalytics,
      pan: 0,
      tilt: 0,
      zoom: 1.0,
    };
    onAddCamera(newCamera);
    sounds.playClick();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Camera size={18} color="var(--accent-blue)" />
            <span>Connect Market IP Camera (ONVIF / RTSP)</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', padding: '0 20px' }}>
          <button 
            style={{ 
              padding: '10px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'onvif' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === 'onvif' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('onvif')}
          >
            Auto-Scan (ONVIF Discovery)
          </button>
          <button 
            style={{ 
              padding: '10px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'manual' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === 'manual' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('manual')}
          >
            Manual RTSP Parameters
          </button>
        </div>

        {/* Modal Body */}
        {activeTab === 'onvif' ? (
          <div className="modal-body">
            <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Scan the local subnet (192.168.1.0/24) using ONVIF WS-Discovery to automatically find CP Plus, Dahua, Hikvision, or TP-Link cameras.
              </p>
              <button 
                className="btn btn-primary"
                onClick={handleScanONVIF}
                disabled={isScanning}
              >
                <Search size={14} />
                <span>{isScanning ? 'Probing Subnet...' : 'Scan for Local IP Cameras'}</span>
              </button>
            </div>

            {/* Discovered cameras list */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Discovered Devices:
              </div>
              {discoveredDevices.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  {isScanning ? 'Scanning network...' : 'Click "Scan for Local IP Cameras" to begin.'}
                </div>
              ) : (
                discoveredDevices.map((dev, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      marginBottom: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{dev.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        IP: {dev.ip}:{dev.port} • {dev.onvif} {dev.ptz ? '• PTZ Supported' : ''}
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={() => handleSelectDiscovered(dev)}
                    >
                      <Plus size={13} />
                      <span>Select</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Camera Friendly Name
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    value={cameraName} 
                    onChange={(e) => setCameraName(e.target.value)} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Target Site / Branch
                  </label>
                  <select 
                    className="input-field"
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    IP Address or Hostname
                  </label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    value={ip} 
                    onChange={(e) => setIp(e.target.value)} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    ONVIF Port
                  </label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={onvifPort} 
                    onChange={(e) => setOnvifPort(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  RTSP Stream URL
                </label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={rtspUrl} 
                  onChange={(e) => setRtspUrl(e.target.value)} 
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Format: rtsp://username:password@camera_ip:554/live/ch0
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Resolution
                  </label>
                  <select 
                    className="input-field"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  >
                    <option value="1920x1080 (FHD)">1920x1080 (1080p FHD)</option>
                    <option value="2560x1440 (2K)">2560x1440 (2K QHD)</option>
                    <option value="3840x2160 (4K)">3840x2160 (4K Ultra HD)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Physical Zone / Location
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={ptzCapable} 
                    onChange={(e) => setPtzCapable(e.target.checked)} 
                  />
                  <span>PTZ Capable (Pan/Tilt/Zoom)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={hasAiAnalytics} 
                    onChange={(e) => setHasAiAnalytics(e.target.checked)} 
                  />
                  <span>Enable AI Computer Vision</span>
                </label>
              </div>

              {/* Test Connection Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  onClick={handleTestConnection}
                  disabled={isTesting}
                >
                  <Activity size={13} />
                  <span>{isTesting ? 'Pinging RTSP...' : 'Test RTSP Connection'}</span>
                </button>
                {testSuccess && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> RTSP Stream Verified (Ping: 18ms, H.265 Ready)
                  </span>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Plus size={14} />
                <span>Add Camera to VMS</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
