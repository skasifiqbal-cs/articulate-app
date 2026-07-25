import React, { useState } from 'react';
import { X, Key, Cpu, Zap, Check, Globe, RefreshCw, Cloud, Lock } from 'lucide-react';
import { getSettings, saveSettings, getProfile, saveProfile, fetchAutoCloudSync, triggerAutoCloudSync } from '../services/storage.js';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  if (!isOpen) return null;

  const [settings, setSettings] = useState(getSettings());
  const [profile, setProfile] = useState(getProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const handleSave = async () => {
    saveSettings(settings);
    saveProfile(profile);
    setSavedSuccess(true);
    
    if (settings.syncCode) {
      setIsSyncingCloud(true);
      await triggerAutoCloudSync();
      setIsSyncingCloud(false);
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onSettingsUpdated();
      onClose();
    }, 600);
  };

  const handlePullCloud = async () => {
    if (!settings.syncCode) {
      setSyncStatus('Enter a personal sync PIN code first.');
      return;
    }
    setIsSyncingCloud(true);
    const success = await fetchAutoCloudSync();
    setIsSyncingCloud(false);
    if (success) {
      setSyncStatus('✅ Lexicon graph auto-synced from cloud!');
      setTimeout(() => {
        setSyncStatus('');
        onSettingsUpdated();
      }, 1200);
    } else {
      setSyncStatus('❌ Sync PIN not found on cloud vault yet.');
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
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>AI Engine & Cloud Sync</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* ☁️ AUTOMATIC CLOUD SYNC PIN BOX */}
        <div className="glass-card" style={{ marginBottom: '1.25rem', borderColor: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.12)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: '#ffffff', marginBottom: '0.35rem' }}>
            <Cloud size={16} color="var(--accent-purple)" /> Automatic PC ↔ Phone Cloud Sync PIN
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem 0' }}>
            Type any secret PIN (e.g. <code>my-lexicon</code>). PC & Phone using this PIN will auto-sync words automatically with zero copy-pasting!
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Enter secret PIN (e.g. my-lexicon)"
                value={settings.syncCode}
                onChange={(e) => setSettings({ ...settings, syncCode: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.5rem 0.55rem 2.2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>

            <button type="button" onClick={handlePullCloud} disabled={isSyncingCloud} className="btn btn-emerald" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}>
              {isSyncingCloud ? <RefreshCw size={14} className="animate-spin" /> : <><Cloud size={14} /> Sync Now</>}
            </button>
          </div>
          {syncStatus && <p style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600, margin: '0.2rem 0 0 0' }}>{syncStatus}</p>}
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
            style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '0.85rem' }}
          >
            {languageProfiles.map(p => (
              <option key={p.code} value={p.code}>{p.name} — {p.level}</option>
            ))}
          </select>
        </div>

        {/* AI Provider Toggle */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            AI Engine Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
            <button type="button" onClick={() => setSettings({ ...settings, provider: 'gemini' })} className={`btn ${settings.provider === 'gemini' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.55rem 0.3rem', fontSize: '0.78rem' }}>
              Gemini Cloud
            </button>
            <button type="button" onClick={() => setSettings({ ...settings, provider: 'ollama' })} className={`btn ${settings.provider === 'ollama' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.55rem 0.3rem', fontSize: '0.78rem' }}>
              Local Ollama
            </button>
            <button type="button" onClick={() => setSettings({ ...settings, provider: 'mock' })} className={`btn ${settings.provider === 'mock' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.55rem 0.3rem', fontSize: '0.78rem' }}>
              Offline Mock
            </button>
          </div>
        </div>

        {/* Gemini Key Input */}
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

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="button" onClick={handleSave} className="btn btn-primary">
            {savedSuccess ? <><Check size={16} /> Saved & Synced!</> : 'Save Settings'}
          </button>
        </div>

      </div>
    </div>
  );
}
