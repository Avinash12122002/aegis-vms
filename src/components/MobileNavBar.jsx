import React from 'react';
import { Video, Film, Cpu, Cloud, Users, Map } from 'lucide-react';

export default function MobileNavBar({ activeTab, setActiveTab, onOpenCloudflare, unreadAlerts }) {
  return (
    <nav className="mobile-nav-bar">
      <button 
        className={`mobile-nav-item ${activeTab === 'live' ? 'active' : ''}`}
        onClick={() => setActiveTab('live')}
      >
        <Video size={18} />
        <span>Live Wall</span>
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
        className={`mobile-nav-item ${activeTab === 'ai' ? 'active' : ''}`}
        onClick={() => setActiveTab('ai')}
        style={{ position: 'relative' }}
      >
        <Cpu size={18} />
        <span>AI Events</span>
        {unreadAlerts > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '18px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--accent-red)'
          }} />
        )}
      </button>

      <button 
        className="mobile-nav-item"
        onClick={onOpenCloudflare}
      >
        <Cloud size={18} />
        <span>Cloud R2</span>
      </button>
    </nav>
  );
}
