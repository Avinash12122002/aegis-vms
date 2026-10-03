import React from 'react';
import { Video, Film, Cloud, Map, Activity } from 'lucide-react';

export default function MobileNavBar({ activeTab, setActiveTab, onOpenCloudflare, unreadAlerts = 0 }) {
  return (
    <nav className="mobile-nav-bar">
      <button 
        className={`mobile-nav-item ${activeTab === 'live' ? 'active' : ''}`}
        onClick={() => setActiveTab('live')}
        style={{ position: 'relative' }}
      >
        <Video size={18} />
        {unreadAlerts > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: '6px',
              right: '25%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-danger)',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)'
            }}
          />
        )}
        <span>Live</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'map' ? 'active' : ''}`}
        onClick={() => setActiveTab('map')}
      >
        <Map size={18} />
        <span>E-Map</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'playback' ? 'active' : ''}`}
        onClick={() => setActiveTab('playback')}
      >
        <Film size={18} />
        <span>Playback</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'health' ? 'active' : ''}`}
        onClick={() => setActiveTab('health')}
      >
        <Activity size={18} />
        <span>Health</span>
      </button>

      <button 
        className="mobile-nav-item"
        onClick={onOpenCloudflare}
      >
        <Cloud size={18} />
        <span>R2 Cloud</span>
      </button>
    </nav>
  );
}
