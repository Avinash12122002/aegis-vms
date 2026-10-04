import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LiveVideoWall from './components/LiveVideoWall';
import PlaybackSuite from './components/PlaybackSuite';
import AiAnalyticsView from './components/AiAnalyticsView';
import FacilityEMap from './components/FacilityEMap';
import CameraHealthDiagnostics from './components/CameraHealthDiagnostics';
import CloudflareSettingsModal from './components/CloudflareSettingsModal';
import UserManagementModal from './components/UserManagementModal';
import AddCameraModal from './components/AddCameraModal';
import TwoWayAudioModal from './components/TwoWayAudioModal';
import ForensicSearchModal from './components/ForensicSearchModal';
import MobileNavBar from './components/MobileNavBar';

import { 
  initialSites, 
  initialCameras, 
  initialTripwires, 
  initialCloudflareConfig, 
  initialUsers, 
  initialEvents,
  initialForensicRecords
} from './services/mockData';
import { sounds } from './services/soundEffects';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('live'); // 'live', 'map', 'playback', 'ai', 'health'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Entities & State
  const [sites] = useState(initialSites);
  const [cameras, setCameras] = useState(() => {
    const saved = localStorage.getItem('aegis_cameras');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed.every(c => c.id.startsWith('cpplus'))) {
          return parsed.map(c => {
            let url = c.liveStreamUrl || '';
            if (url.includes(':8889/')) {
              url = url.replace(':8889/', ':8888/');
            }
            if (url && !url.includes('autoplay=')) {
              url += (url.includes('?') ? '&' : '?') + 'autoplay=true&muted=true&controls=false';
            }
            return { ...c, liveStreamUrl: url };
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('aegis_cameras');
    localStorage.removeItem('aegis_tripwires');
    return initialCameras;
  });
  const [selectedCameraId, setSelectedCameraId] = useState('cpplus-1');
  const [selectedSiteId, setSelectedSiteId] = useState('all');

  // AI & Detection Rules
  const [tripwires, setTripwires] = useState(initialTripwires);

  // Alarms & Events
  const [events, setEvents] = useState(initialEvents);

  // Settings & RBAC
  const [cloudflareConfig, setCloudflareConfig] = useState(initialCloudflareConfig);
  const [users] = useState(initialUsers);
  const [forensicRecords] = useState(initialForensicRecords);

  // Modals
  const [cloudflareModalOpen, setCloudflareModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [addCameraModalOpen, setAddCameraModalOpen] = useState(false);
  const [activeIntercomCamera, setActiveIntercomCamera] = useState(null);
  const [forensicModalOpen, setForensicModalOpen] = useState(false);
  const [playbackJumpTarget, setPlaybackJumpTarget] = useState(null);

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

  // Fault Injection / Cable Cut Simulator
  const handleToggleCameraStatus = (camId) => {
    setCameras(prev => prev.map(c => {
      if (c.id === camId) {
        const nextStatus = c.status === 'online' ? 'offline' : 'online';
        if (nextStatus === 'offline') {
          handleAlarmTrigger({
            cameraId: c.id,
            cameraName: c.name,
            target: 'Physical Link Lost (Cable Cut / Power Off)',
            confidence: '100%',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  // Trigger real-time alarm event
  const handleAlarmTrigger = (alarmEvent) => {
    const newEv = {
      id: `ev-${Date.now()}`,
      cameraId: alarmEvent.cameraId,
      cameraName: alarmEvent.cameraName,
      siteName: 'Active Branch',
      type: alarmEvent.target.includes('Cable Cut') ? 'HARDWARE FAULT' : 'Tripwire Breach',
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

  const handleJumpToPlayback = (camId, date, time) => {
    setSelectedCameraId(camId);
    setPlaybackJumpTarget({ date, time });
    setActiveTab('playback');
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
        onOpenForensicModal={() => setForensicModalOpen(true)}
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
            setSidebarOpen(false);
          }}
          selectedSiteId={selectedSiteId}
          onAddCameraClick={() => setAddCameraModalOpen(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          cloudflareConfig={cloudflareConfig}
        />

        {/* View Switcher: Live Wall / E-Map / Playback / AI Analytics / Health */}
        {activeTab === 'live' && (
          <LiveVideoWall 
            cameras={cameras}
            selectedCameraId={selectedCameraId}
            setSelectedCameraId={setSelectedCameraId}
            onUpdatePTZ={handleUpdatePTZ}
            onOpenIntercom={(cam) => setActiveIntercomCamera(cam)}
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
            playbackJumpTarget={playbackJumpTarget}
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

        {activeTab === 'health' && (
          <CameraHealthDiagnostics 
            cameras={cameras}
            onToggleCameraStatus={handleToggleCameraStatus}
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

      {/* Modals & Dialogs */}
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

      {activeIntercomCamera && (
        <TwoWayAudioModal 
          camera={activeIntercomCamera}
          onClose={() => setActiveIntercomCamera(null)}
        />
      )}

      {forensicModalOpen && (
        <ForensicSearchModal 
          forensicRecords={forensicRecords}
          onJumpToPlayback={handleJumpToPlayback}
          onClose={() => setForensicModalOpen(false)}
        />
      )}
    </div>
  );
}
