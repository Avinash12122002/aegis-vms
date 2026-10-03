import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  FileText, 
  UserPlus, 
  Key, 
  Check, 
  History, 
  X
} from 'lucide-react';

export default function UserManagementModal({ users, onClose }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'matrix', 'audit'

  // Mock Audit Trail
  const auditLogs = [
    { id: 1, time: '17:02:14', user: 'Vikram Malhotra (Super Admin)', action: 'Exported MP4 Evidence (Gate 01)', ip: '10.0.4.12' },
    { id: 2, time: '16:48:35', user: 'Rajesh Kumar (Guard)', action: 'PTZ Preset Call to [Cash Vault]', ip: '192.168.1.45' },
    { id: 3, time: '16:30:10', user: 'Pooja Sharma (Manager)', action: 'Reviewed Incident at Perimeter East', ip: '10.0.2.8' },
    { id: 4, time: '15:12:00', user: 'Vikram Malhotra (Super Admin)', action: 'Updated Cloudflare R2 Retention to 30 Days', ip: '10.0.4.12' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <ShieldCheck size={18} color="var(--accent-blue)" />
            <span>Enterprise User Management & RBAC Permissions</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', padding: '0 20px' }}>
          <button 
            style={{ 
              padding: '10px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'users' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === 'users' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('users')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> Active Operators ({users.length})</span>
          </button>
          <button 
            style={{ 
              padding: '10px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'matrix' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === 'matrix' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('matrix')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14} /> RBAC Permission Matrix</span>
          </button>
          <button 
            style={{ 
              padding: '10px 16px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'audit' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === 'audit' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('audit')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><History size={14} /> Audit Trail</span>
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '280px' }}>
          {/* Tab 1: Users List */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Key size={13} color="var(--accent-cyan)" />
                  <span>Hardware FIDO2 / 2FA Enforced</span>
                </div>
                <button 
                  className="btn btn-primary"
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                  onClick={() => alert('Operator invitation link copied with time-limited token.')}
                >
                  <UserPlus size={13} />
                  <span>Invite Operator</span>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {users.map(u => (
                  <div 
                    key={u.id}
                    style={{ 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '0.68rem', 
                        fontFamily: 'var(--font-mono)', 
                        background: u.role === 'Super Admin' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)',
                        color: u.role === 'Super Admin' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Lock size={10} /> {u.role}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: RBAC Matrix */}
          {activeTab === 'matrix' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-primary)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>Role</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>Live View</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>PTZ Control</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>Playback & Export</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>Device Admin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--accent-cyan)' }}>Super Admin</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={13} /> Full Access
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>✓ High Priority</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>✓ Unlimited</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>✓ Full Control</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Branch Manager</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>✓ Own Branch</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>✓ Standard</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>✓ Own Branch</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>✗ Read Only</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Security Guard</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>✓ Assigned Cams</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-amber)' }}>⚠️ Presets Only</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>✗ No Export</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>✗ Denied</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Auditor</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>✗ No Live</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>✗ Denied</td>
                    <td style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>✓ Playback + SHA Export</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>✗ Denied</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Security Audit Log */}
          {activeTab === 'audit' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <FileText size={14} color="var(--accent-cyan)" />
                <span>Immutable Cryptographic Audit Logs (SHA-256 Signatures)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {auditLogs.map(log => (
                <div 
                  key={log.id}
                  style={{ 
                    background: 'var(--bg-primary)', 
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.action}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Operator: {log.user}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ color: 'var(--accent-cyan)' }}>{log.time}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>IP: {log.ip}</div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
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
