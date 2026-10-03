import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LiveVideoWall from './components/LiveVideoWall';
import PlaybackSuite from './components/PlaybackSuite';
import AiAnalyticsView from './components/AiAnalyticsView';
import CloudflareSettingsModal from './components/CloudflareSettingsModal';
import UserManagementModal from './components/UserManagementModal';
import AddCameraModal from './components/AddCameraModal';
import FacilityEMap from './components/FacilityEMap';
import MobileNavBar from './components/MobileNavBar';

import { 
  initialSites, 
  initialCameras, 
  initialTripwires, 
  initialCloudflareConfig, 
  initialUsers, 
  initialEvents 
} from './services/mockData';
import { sounds } from './services/soundEffects';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('live'); // 'live', 'playback', 'ai'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Entities & State
  const [sites, setSites] = useState(initialSites);
  const [cameras, setCameras] = useState(() => {
    const saved = localStorage.getItem('aegis_cameras');
    return saved ? JSON.parse(saved) : initialCameras;
  });
  const [selectedCameraId, setSelectedCameraId] = useState(cameras[0]?.id || 'cam-1');
  const [selectedSiteId, setSelectedSiteId] = useState('all');

  // AI & Detection Rules
  const [tripwires, setTripwires] = useState(() => {
    const saved = localStorage.getItem('aegis_tripwires');
    return saved ? JSON.parse(saved) : initialTripwires;
  });

  // Alarms & Events
  const [events, setEvents] = useState(initialEvents);

  // Settings & RBAC
  const [cloudflareConfig, setCloudflareConfig] = useState(initialCloudflareConfig);
  const [users, setUsers] = useState(initialUsers);

  // Modals
  const [cloudflareModalOpen, setCloudflareModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [addCameraModalOpen, setAddCameraModalOpen] = useState(false);

  // Sound State
  const [soundMuted, setSoundMuted] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('aegis_cameras', JSON.stringify(cameras));
  }, [cameras]);

  useEffect(() => {
    localStorage.setItem('aegis_tripwires', JSON.stringify(tripwires));
  }, [tripwires]);

  // PTZ Control handler
  const handleUpdatePTZ = (camId, pan, tilt, zoom) => {
    setCameras(prev => prev.map(c => {
      if (c.id === camId) {
        return { ...c, pan, tilt, zoom };
      }
      return c;
    }));
  };

  // Add camera handler
  const handleAddCamera = (newCam) => {
    setCameras(prev => [newCam, ...prev]);
    setSelectedCameraId(newCam.id);
  };

  // Trigger real-time alarm event
  const handleAlarmTrigger = (alarmEvent) => {
    const newEv = {
      id: `ev-${Date.now()}`,
      cameraId: alarmEvent.cameraId,
      cameraName: alarmEvent.cameraName,
      siteName: 'Active Branch',
      type: 'Tripwire Breach',
      target: alarmEvent.target,
      confidence: alarmEvent.confidence,
      timestamp: alarmEvent.timestamp,
      severity: 'critical',
      acknowledged: false,
    };
    setEvents(prev => [newEv, ...prev]);
  };

  const handleAcknowledgeEvent = (evId) => {
    sounds.playClick();
    setEvents(prev => prev.map(e => e.id === evId ? { ...e, acknowledged: true } : e));
  };

  const unreadAlerts = events.filter(e => !e.acknowledged).length;

  return (
    <div className="vms-app">
      {/* Top Application Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sites={sites}
        selectedSiteId={selectedSiteId}
        setSelectedSiteId={setSelectedSiteId}
        unreadAlertCount={unreadAlerts}
        onOpenCloudflareModal={() => setCloudflareModalOpen(true)}
        onOpenUserModal={() => setUserModalOpen(true)}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
      />

      {/* Main Workspace Area */}
      <div className="vms-main">
        {/* Device & Camera Tree Sidebar */}
        <Sidebar 
          sites={sites}
          cameras={cameras}
          selectedCameraId={selectedCameraId}
          setSelectedCameraId={(id) => {
            setSelectedCameraId(id);
            setSidebarOpen(false); // Close sidebar on mobile select
          }}
          selectedSiteId={selectedSiteId}
          onAddCameraClick={() => setAddCameraModalOpen(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          cloudflareConfig={cloudflareConfig}
        />

        {/* View Switcher: Live Wall / Playback / AI Analytics */}
        {activeTab === 'live' && (
          <LiveVideoWall 
            cameras={cameras}
            selectedCameraId={selectedCameraId}
            setSelectedCameraId={setSelectedCameraId}
            onUpdatePTZ={handleUpdatePTZ}
            tripwires={tripwires}
            events={events}
            onAlarmTrigger={handleAlarmTrigger}
            onAcknowledgeEvent={handleAcknowledgeEvent}
            selectedSiteId={selectedSiteId}
          />
        )}

        {activeTab === 'map' && (
          <FacilityEMap 
            sites={sites}
            cameras={cameras}
            selectedSiteId={selectedSiteId}
            setSelectedSiteId={setSelectedSiteId}
            events={events}
            onSelectCamera={(camId) => {
              setSelectedCameraId(camId);
              setActiveTab('live');
            }}
          />
        )}

        {activeTab === 'playback' && (
          <PlaybackSuite 
            cameras={cameras}
            selectedCameraId={selectedCameraId}
            setSelectedCameraId={setSelectedCameraId}
            sites={sites}
          />
        )}

        {activeTab === 'ai' && (
          <AiAnalyticsView 
            cameras={cameras}
            selectedCameraId={selectedCameraId}
            setSelectedCameraId={setSelectedCameraId}
            tripwires={tripwires}
            setTripwires={setTripwires}
            events={events}
            onAcknowledgeEvent={handleAcknowledgeEvent}
          />
        )}
      </div>

      {/* Bottom Mobile Navigation Bar for Smartphones */}
      <MobileNavBar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCloudflare={() => setCloudflareModalOpen(true)}
        unreadAlerts={unreadAlerts}
      />

      {/* Modals */}
      {cloudflareModalOpen && (
        <CloudflareSettingsModal 
          config={cloudflareConfig}
          onSaveConfig={(cfg) => setCloudflareConfig(cfg)}
          onClose={() => setCloudflareModalOpen(false)}
        />
      )}

      {userModalOpen && (
        <UserManagementModal 
          users={users}
          onClose={() => setUserModalOpen(false)}
        />
      )}

      {addCameraModalOpen && (
        <AddCameraModal 
          sites={sites}
          onAddCamera={handleAddCamera}
          onClose={() => setAddCameraModalOpen(false)}
        />
      )}
    </div>
  );
}
