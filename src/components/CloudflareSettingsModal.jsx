import React, { useState } from 'react';
import { 
  Cloud, 
  ShieldCheck, 
  Terminal, 
  Save, 
  X
} from 'lucide-react';

export default function CloudflareSettingsModal({ config, onSaveConfig, onClose }) {
  const [formData, setFormData] = useState({ ...config });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const usedPercent = Math.round((formData.usedStorageTB / formData.quotaStorageTB) * 100);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Cloud size={18} color="var(--accent-cyan)" />
            <span>Cloudflare R2 Storage & Zero-Trust Tunnel</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Storage Gauge & Zero-Egress Status */}
            <div style={{ 
              background: 'rgba(6, 182, 212, 0.08)', 
              border: '1px solid rgba(6, 182, 212, 0.25)', 
              borderRadius: 'var(--radius-md)', 
              padding: '14px', 
              marginBottom: '16px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cloudflare R2 Object Storage Metrics
                </span>
                <span style={{ 
                  background: 'var(--accent-green)', 
                  color: '#000', 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  padding: '2px 6px', 
                  borderRadius: '3px' 
                }}>
                  $0 FREE EGRESS ACTIVE
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                <span>Used: {formData.usedStorageTB} TB</span>
                <span>Quota: {formData.quotaStorageTB} TB ({usedPercent}%)</span>
              </div>

              <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${usedPercent}%`, background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                <span>Estimated Cost: <b>${formData.monthlyCostUSD.toFixed(2)} / month</b> ($15/TB)</span>
                <span>Bandwidth Stream Surcharge: <b>$0.00</b></span>
              </div>
            </div>

            {/* Cloudflare Tunnel Status */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Cloudflare Zero-Trust Tunnel Status (NAT Traversal)
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'var(--bg-primary)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                  <ShieldCheck size={16} color="var(--accent-green)" />
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{formData.zeroTrustTunnelId}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 600 }}>HEALTHY</span>
              </div>
            </div>

            {/* Bucket & Credentials Configuration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Cloudflare Account ID
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  R2 Bucket Name
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.bucketName}
                  onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                S3-Compatible R2 Endpoint
              </label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Access Key ID
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.accessKeyId}
                  onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Secret Access Key
                </label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={formData.secretAccessKey}
                  onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                />
              </div>
            </div>

            {/* Retention Policy */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Video Retention Lifecycle (Auto-Purge Policy)
              </label>
              <select 
                className="input-field"
                value={formData.retentionDays}
                onChange={(e) => setFormData({ ...formData, retentionDays: Number(e.target.value) })}
              >
                <option value={15}>15 Days Rolling Loop (Economical)</option>
                <option value={30}>30 Days Rolling Loop (Standard Enterprise)</option>
                <option value={60}>60 Days Compliance Archive</option>
                <option value={90}>90 Days Statutory Bank / High-Security Retention</option>
              </select>
            </div>

            {/* Terminal Command Snippet */}
            <div style={{ background: '#05070a', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Terminal size={12} />
                <span>Edge Hub Cloudflare Tunnel Run Command:</span>
              </div>
              <code style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                cloudflared tunnel run --token eyJhIjoiOGY5YjJj...
              </code>
            </div>

            {isSaved && (
              <div style={{ marginTop: '10px', color: 'var(--accent-green)', fontSize: '0.75rem', textAlign: 'center' }}>
                ✓ Cloudflare credentials and retention policy saved successfully!
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={14} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
