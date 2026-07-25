import React, { useState } from 'react';
import Header from './components/Header.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import SelfTalkSandbox from './components/SelfTalkSandbox.jsx';
import SemanticGraphView from './components/SemanticGraphView.jsx';
import ReverseDictionary from './components/ReverseDictionary.jsx';
import ShadowingEngine from './components/ShadowingEngine.jsx';
import TabooGame from './components/TabooGame.jsx';
import DeepLexiconImporter from './components/DeepLexiconImporter.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('sandbox');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'sandbox':
        return <SelfTalkSandbox key={settingsVersion} />;
      case 'graph':
        return <SemanticGraphView key={settingsVersion} />;
      case 'finder':
        return <ReverseDictionary key={settingsVersion} />;
      case 'shadowing':
        return <ShadowingEngine key={settingsVersion} />;
      case 'taboo':
        return <TabooGame key={settingsVersion} />;
      case 'import':
        return <DeepLexiconImporter onImportSuccess={() => setSettingsVersion(v => v + 1)} />;
      default:
        return <SelfTalkSandbox />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {renderActiveTab()}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.25rem',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        background: 'rgba(15, 23, 42, 0.5)'
      }}>
        Articulate Gym &copy; 2026 — Cognitive Eloquence & Deep Lexicon Gym. Built with React & Web Speech APIs.
      </footer>

      {/* AI Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={() => setSettingsVersion(v => v + 1)}
      />

    </div>
  );
}
