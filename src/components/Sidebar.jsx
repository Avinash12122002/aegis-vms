import React, { useState } from 'react';
import { 
  Camera, 
  Search, 
  PlusCircle, 
  HardDrive, 
  Layers, 
  Compass, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  X
} from 'lucide-react';

export default function Sidebar({ 
  sites, 
  cameras, 
  selectedCameraId, 
  setSelectedCameraId,
  selectedSiteId,
  onAddCameraClick,
  isOpen,
  onClose,
  cloudflareConfig
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSites, setExpandedSites] = useState({
    'site-1': true,
    'site-2': true,
    'site-3': true,
  });

  const toggleSiteExpand = (siteId) => {
    setExpandedSites(prev => ({ ...prev, [siteId]: !prev[siteId] }));
  };

  // Filter cameras
  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = cam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cam.ip.includes(searchTerm) ||
                          cam.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = selectedSiteId === 'all' || cam.siteId === selectedSiteId;
    return matchesSearch && matchesSite;
  });

  const usedPercent = Math.round((cloudflareConfig.usedStorageTB / cloudflareConfig.quotaStorageTB) * 100);

  return (
    <aside className={`vms-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Search & Add Camera Bar */}
      <div className="sidebar-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span className="sidebar-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Camera size={14} color="var(--accent-cyan)" /> Device Registry</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              className="btn btn-primary"
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
              onClick={onAddCameraClick}
              title="Add New IP Camera via ONVIF/RTSP"
            >
              <PlusCircle size={14} />
              <span>Add Cam</span>
            </button>
            {onClose && (
              <button 
                className="btn btn-secondary mobile-only"
                style={{ padding: '4px 8px' }}
                onClick={onClose}
                title="Close Sidebar"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search IP, name, zone..."
            className="input-field"
            style={{ paddingLeft: '30px', fontSize: '0.78rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Camera Hierarchical List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {sites
          .filter(site => selectedSiteId === 'all' || site.id === selectedSiteId)
          .map(site => {
            const siteCams = filteredCameras.filter(c => c.siteId === site.id);
            const isExpanded = expandedSites[site.id] ?? true;

            return (
              <div key={site.id} style={{ marginBottom: '14px' }}>
                {/* Branch / Site Header */}
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}
                  onClick={() => toggleSiteExpand(site.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={13} color="var(--accent-cyan)" />
                      <span>{site.name}</span>
                    </span>
                  </div>
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.68rem', 
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    {siteCams.length}
                  </span>
                </div>

                {/* Cameras under this site */}
                {isExpanded && (
                  <div style={{ paddingLeft: '8px', marginTop: '4px' }}>
                    {siteCams.length === 0 ? (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '6px 8px' }}>
                        No cameras found in this branch
                      </div>
                    ) : (
                      siteCams.map(cam => (
                        <div 
                          key={cam.id}
                          className={`camera-item ${selectedCameraId === cam.id ? 'selected' : ''}`}
                          onClick={() => setSelectedCameraId(cam.id)}
                        >
                          <div className="camera-item-info">
                            {cam.status === 'online' ? (
                              <CheckCircle2 size={12} color="var(--accent-green)" title="Online (Healthy)" />
                            ) : (
                              <span 
                                className="status-dot red" 
                                style={{ width: '6px', height: '6px' }} 
                                title="Offline (Cable Disconnect)"
                              />
                            )}
                            <div>
                              <div className="camera-item-name">{cam.name}</div>
                              <div className="camera-item-loc">
                                <span>{cam.location}</span> • <span style={{ fontFamily: 'var(--font-mono)' }}>{cam.ip}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {cam.ptzCapable && (
                              <span title="PTZ Capable Camera" style={{ color: 'var(--accent-cyan)' }}>
                                <Compass size={13} />
                              </span>
                            )}
                            <span style={{ 
                              fontSize: '0.62rem', 
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text-muted)' 
                            }}>
                              {cam.fps}fps
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
        })}
      </div>

      {/* Cloudflare Storage Gauge Section */}
      <div className="sidebar-section" style={{ background: 'rgba(10, 13, 20, 0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
            <HardDrive size={14} color="var(--accent-cyan)" />
            <span>Cloudflare R2</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 600 }}>
            ZERO EGRESS
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          <span>{cloudflareConfig.usedStorageTB} TB Used</span>
          <span>{cloudflareConfig.quotaStorageTB} TB Quota</span>
        </div>

        <div style={{ 
          height: '6px', 
          background: 'var(--bg-tertiary)', 
          borderRadius: '4px', 
          marginTop: '6px', 
          overflow: 'hidden' 
        }}>
          <div style={{ 
            height: '100%', 
            width: `${usedPercent}%`, 
            background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
            borderRadius: '4px'
          }} />
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          30-day rolling loop recording active
        </div>
      </div>
    </aside>
  );
}
