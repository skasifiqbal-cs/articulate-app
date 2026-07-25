import React from 'react';
import { Mic, GitFork, Search, Headphones, Zap, Settings, BookOpen } from 'lucide-react';
import { getSettings } from '../services/storage.js';

export default function Header({ activeTab, setActiveTab, onOpenSettings }) {
  const settings = getSettings();

  const getProviderBadge = () => {
    if (settings.provider === 'gemini' && settings.apiKey) {
      return <span className="badge badge-emerald"><Zap size={11} /> Gemini Cloud</span>;
    } else if (settings.provider === 'ollama') {
      return <span className="badge badge-purple"><Zap size={11} /> Ollama</span>;
    } else {
      return <span className="badge badge-amber"><Zap size={11} /> Mock Mode</span>;
    }
  };

  const navItems = [
    { id: 'sandbox', label: 'Self-Talk', icon: Mic },
    { id: 'graph', label: 'Graph Web', icon: GitFork },
    { id: 'finder', label: 'Finder', icon: Search },
    { id: 'shadowing', label: 'Shadowing', icon: Headphones },
    { id: 'taboo', label: 'Taboo', icon: Zap },
    { id: 'import', label: 'Import', icon: BookOpen }
  ];

  return (
    <>
      {/* Top Header */}
      <header style={{
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
            }}>
              <Mic size={20} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', margin: 0, lineHeight: 1.1 }}>
                Articulate <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-purple)', textTransform: 'uppercase' }}>Gym</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={15} color={isActive ? '#c084fc' : 'var(--text-muted)'} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Settings & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getProviderBadge()}
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.65rem', minHeight: '36px', fontSize: '0.8rem' }}
            >
              <Settings size={15} />
              <span className="mobile-hide">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="bottom-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
