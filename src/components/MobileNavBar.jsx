import React from 'react';
import { Video, Film, Cpu, Cloud, Users, Map, Activity } from 'lucide-react';

export default function MobileNavBar({ activeTab, setActiveTab, onOpenCloudflare, unreadAlerts }) {
  return (
    <nav className="mobile-nav-bar">
      <button 
        className={`mobile-nav-item ${activeTab === 'live' ? 'active' : ''}`}
        onClick={() => setActiveTab('live')}
      >
        <Video size={18} />
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
