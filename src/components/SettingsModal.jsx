import React, { useState } from 'react';
import { X, Key, Cpu, Zap, Check, ExternalLink, Globe, Download, Upload, RefreshCw } from 'lucide-react';
import { getSettings, saveSettings, getProfile, saveProfile, exportBackupData, importBackupData } from '../services/storage.js';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  if (!isOpen) return null;

  const [settings, setSettings] = useState(getSettings());
  const [profile, setProfile] = useState(getProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state
  const [syncJson, setSyncJson] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  const handleSave = () => {
    saveSettings(settings);
    saveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSettingsUpdated();
      onClose();
    }, 600);
  };

  const handleExport = () => {
    const data = exportBackupData();
    setSyncJson(data);
    navigator.clipboard.writeText(data);
    setSyncStatus('Copied backup payload to clipboard!');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleImport = () => {
    if (!syncJson.trim()) return;
    const success = importBackupData(syncJson);
    if (success) {
      setSyncStatus('✅ Lexicon graph & data synced successfully!');
      setTimeout(() => {
        setSyncStatus('');
        onSettingsUpdated();
      }, 1500);
    } else {
      setSyncStatus('❌ Invalid JSON payload format.');
    }
  };

  const languageProfiles = [
    { code: 'en-US', name: 'English (Mastery Target)', level: 'Advanced C1/C2' },
    { code: 'fr-FR', name: 'French (Stage 2 Target)', level: 'Intermediate B1/B2' },
    { code: 'de-DE', name: 'German (Stage 3 Target)', level: 'Elementary A2/B1' },
    { code: 'bn-IN', name: 'Bengali (Native Refinement)', level: 'High Eloquence' },
    { code: 'hi-IN', name: 'Hindi (Fluent Refinement)', level: 'High Eloquence' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
        border: '1px solid rgba(139, 92, 246, 0.4)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-purple)' }}>
              <Zap size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>AI Engine & Sync Settings</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Target Profile */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <Globe size={15} color="var(--accent-cyan)" /> Target Language Profile
          </label>
          <select
            value={profile.code}
            onChange={(e) => {
              const selected = languageProfiles.find(p => p.code === e.target.value);
              if (selected) setProfile(selected);
            }}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
              fontSize: '0.85rem'
            }}
          >
            {languageProfiles.map(p => (
              <option key={p.code} value={p.code}>
                {p.name} — {p.level}
              </option>
            ))}
          </select>
        </div>

        {/* AI Provider Toggle */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            AI Engine Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, provider: 'gemini' })}
              style={{
                padding: '0.65rem 0.4rem',
                borderRadius: 'var(--radius-md)',
                border: settings.provider === 'gemini' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                background: settings.provider === 'gemini' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              Gemini Cloud
            </button>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, provider: 'ollama' })}
              style={{
                padding: '0.65rem 0.4rem',
                borderRadius: 'var(--radius-md)',
                border: settings.provider === 'ollama' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: settings.provider === 'ollama' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              Local Ollama
            </button>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, provider: 'mock' })}
              style={{
                padding: '0.65rem 0.4rem',
                borderRadius: 'var(--radius-md)',
                border: settings.provider === 'mock' ? '2px solid var(--accent-amber)' : '1px solid var(--border-color)',
                background: settings.provider === 'mock' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              Offline Mock
            </button>
          </div>
        </div>

        {/* Provider Specific Inputs */}
        {settings.provider === 'gemini' && (
          <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
              <Key size={14} color="var(--accent-purple)" /> Gemini API Key
            </label>
            <input
              type="password"
              placeholder="Paste AI Studio Key..."
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.82rem' }}
            />
          </div>
        )}

        {/* Cross-Device Sync & Backup */}
        <div className="glass-card" style={{ marginBottom: '1.25rem', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-emerald)' }}>
            <RefreshCw size={15} /> PC ↔ Phone Cross-Device Sync
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem 0' }}>
            Export your PC vocabulary graph to sync onto your phone, or paste phone backups here.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <button type="button" onClick={handleExport} className="btn btn-emerald" style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}>
              <Download size={14} /> Export & Copy Backup
            </button>
            <button type="button" onClick={handleImport} className="btn btn-secondary" style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}>
              <Upload size={14} /> Import Backup
            </button>
          </div>

          <textarea
            rows={3}
            placeholder="Paste exported backup JSON here to sync..."
            value={syncJson}
            onChange={(e) => setSyncJson(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace', resize: 'none' }}
          />
          {syncStatus && <p style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 600, margin: '0.35rem 0 0 0' }}>{syncStatus}</p>}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={handleSave} className="btn btn-primary">
            {savedSuccess ? <><Check size={16} /> Saved!</> : 'Save Settings'}
          </button>
        </div>

      </div>
    </div>
  );
}
