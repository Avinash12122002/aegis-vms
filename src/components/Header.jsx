import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Video, 
  Film, 
  Cpu, 
  Cloud, 
  Users, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Bell, 
  Menu, 
  Server, 
  Map, 
  Activity, 
  Sparkles
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  sites, 
  selectedSiteId, 
  setSelectedSiteId,
  unreadAlertCount = 0,
  onOpenCloudflareModal,
  onOpenUserModal,
  onOpenForensicModal,
  toggleSidebar,
  soundMuted,
  setSoundMuted
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSoundToggle = () => {
    const newState = !soundMuted;
    setSoundMuted(newState);
    sounds.toggleSound(!newState);
  };

  return (
    <header className="vms-header">
      {/* Brand & Site Selector */}
      <div className="brand-section">
        <button 
          className="btn btn-secondary mobile-menu-btn" 
          onClick={toggleSidebar}
          style={{ padding: '6px 8px', display: 'flex' }}
          title="Toggle Camera List"
        >
          <Menu size={18} />
        </button>

        <div className="brand-logo">
          <ShieldAlert size={20} />
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">AegisVMS</span>
            <span className="brand-badge">ENTERPRISE 2.0</span>
          </div>
        </div>

        {/* Site Switcher */}
        <div style={{ marginLeft: '12px' }} className="site-select-wrapper">
          <select 
            className="input-field" 
            style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto', background: 'var(--bg-tertiary)' }}
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
          >
            <option value="all">🌐 All Locations ({sites.length} Sites)</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>📍 {s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
          style={{ position: 'relative' }}
        >
          <Video size={16} />
          <span>Live Wall</span>
          {unreadAlertCount > 0 && (
            <span style={{
              background: 'var(--accent-danger)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '10px',
              marginLeft: '4px'
            }}>
              <Bell size={10} /> {unreadAlertCount}
            </span>
          )}
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <Map size={16} />
          <span>Facility E-Map</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'playback' ? 'active' : ''}`}
          onClick={() => setActiveTab('playback')}
        >
          <Film size={16} />
          <span>Playback</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Cpu size={16} />
          <span>AI Vision & Tripwire</span>
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <Activity size={16} />
          <span>Health</span>
        </button>
      </nav>

      {/* Action Controls & System Status */}
      <div className="header-actions">
        {/* Real-time System Clock */}
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.78rem', 
          color: 'var(--text-secondary)',
          display: 'none'
        }} className="desktop-time">
          {currentTime.toLocaleTimeString()}
        </div>

        {/* AI Smart Search */}
        <button 
          className="btn btn-secondary header-action-btn" 
          onClick={onOpenForensicModal}
          title="AI Smart Attribute Search (Person, Vehicle, Color, Plates)"
        >
          <Sparkles size={14} color="var(--accent-cyan)" />
          <span className="header-btn-label">AI Search</span>
        </button>

        {/* Cloudflare Status Pill */}
        <button 
          className="btn btn-secondary header-action-btn" 
          onClick={onOpenCloudflareModal}
          title="Cloudflare R2 Storage & Zero-Trust Tunnel"
        >
          <Cloud size={14} color="var(--accent-cyan)" />
          <span className="header-btn-label" style={{ color: 'var(--accent-cyan)' }}>Cloudflare R2</span>
        </button>

        {/* User RBAC */}
        <button 
          className="btn btn-secondary header-action-btn"
          onClick={onOpenUserModal}
          title="User Management & RBAC Permissions"
        >
          <Users size={14} />
          <span className="header-btn-label">Super Admin</span>
        </button>

        {/* Sound Toggle */}
        <button 
          className="grid-btn"
          onClick={handleSoundToggle}
          title={soundMuted ? "Unmute Alarm Sounds" : "Mute Alarm Sounds"}
          style={{ color: soundMuted ? 'var(--text-muted)' : 'var(--accent-green)' }}
        >
          {soundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {/* Fullscreen Toggle */}
        <button 
          className="grid-btn"
          onClick={handleFullscreenToggle}
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
        </button>

        {/* Live System Online Pill */}
        <div className="system-status-pill" title="Edge NVR & Cloudflare Connector Synchronized">
          <Server size={12} color="var(--accent-green)" />
          <span className="status-dot"></span>
          <span>ONLINE</span>
        </div>
      </div>
    </header>
  );
}
