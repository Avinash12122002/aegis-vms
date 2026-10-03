import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Truck, 
  Calendar, 
  Clock, 
  Play, 
  Tag, 
  Sparkles, 
  X,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export default function ForensicSearchModal({ forensicRecords, onJumpToPlayback, onClose }) {
  const [targetType, setTargetType] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [plateQuery, setPlateQuery] = useState('');

  // Filter records
  const filteredRecords = forensicRecords.filter(rec => {
    const matchesTarget = targetType === 'all' || rec.targetType === targetType;
    const matchesColor = colorFilter === 'all' || rec.color.toLowerCase() === colorFilter.toLowerCase();
    const matchesPlate = !plateQuery || rec.licensePlate.toLowerCase().includes(plateQuery.toLowerCase()) || rec.description.toLowerCase().includes(plateQuery.toLowerCase());
    return matchesTarget && matchesColor && matchesPlate;
  });

  const handleJump = (rec) => {
    sounds.playClick();
    onJumpToPlayback(rec.cameraId, rec.date, rec.time);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            <span>AI Smart Forensic & Attribute Search</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Filter Bar */}
          <div style={{ 
            background: 'var(--bg-primary)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-md)', 
            padding: '14px', 
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {/* Target Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Target Classification
              </label>
              <select 
                className="input-field" 
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
              >
                <option value="all">👥 All Targets (Person & Vehicle)</option>
                <option value="person">👤 Person Only</option>
                <option value="vehicle">🚗 Vehicle / Truck / Forklift</option>
              </select>
            </div>

            {/* Color Attribute */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Color Attribute Filter
              </label>
              <select 
                className="input-field" 
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
              >
                <option value="all">🎨 Any Color</option>
                <option value="white">⚪ White</option>
                <option value="black">⚫ Black</option>
                <option value="red">🔴 Red</option>
                <option value="blue">🔵 Blue</option>
                <option value="yellow">🟡 Yellow</option>
              </select>
            </div>

            {/* License Plate Search */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                License Plate / Keyword
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. MH-04 or Truck"
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Found <b>{filteredRecords.length}</b> indexed events</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Deep-Learning Neural Index v8.3</span>
          </div>

          {/* Search Results List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredRecords.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                No events match this combination of filters. Try selecting "Any Color" or "All Targets".
              </div>
            ) : (
              filteredRecords.map(rec => (
                <div 
                  key={rec.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      background: rec.targetType === 'person' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      border: rec.targetType === 'person' ? '1px solid var(--accent-blue)' : '1px solid var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: rec.targetType === 'person' ? 'var(--accent-cyan)' : 'var(--accent-amber)'
                    }}>
                      {rec.targetType === 'person' ? <User size={20} /> : <Truck size={20} />}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rec.description}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>📷 {rec.cameraName}</span> • <span>🕒 {rec.date} {rec.time}</span> • <span style={{ color: 'var(--accent-green)' }}>Conf: {rec.confidence}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.72rem', gap: '5px' }}
                    onClick={() => handleJump(rec)}
                  >
                    <Play size={12} />
                    <span>Jump to Playback</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
