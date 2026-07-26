import React, { useState, useEffect } from 'react';
import { Search, Zap, Trash2, Edit3, CheckCircle2, RotateCcw, Save, Download, Upload, RefreshCw } from 'lucide-react';
import { getNodes, getEdges, addNodeToGraph, updateNodeCategory, deleteNodeFromGraph, editNodeInGraph, exportBackupData, importBackupData, resetGraphToDefaults } from '../services/storage.js';

export default function SemanticGraphView() {
  const [nodesData, setNodesData] = useState(getNodes());
  const [edgesData, setEdgesData] = useState(getEdges());

  const [searchWord, setSearchWord] = useState('');
  const [quickDumpInput, setQuickDumpInput] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDef, setEditDef] = useState('');
  const [editCollocation, setEditCollocation] = useState('');

  // Backup / Sync Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [syncNotice, setSyncNotice] = useState('');

  // Reset Graph
  const handleResetDefaults = () => {
    const res = resetGraphToDefaults();
    setNodesData(res.nodes);
    setEdgesData(res.edges);
    setSelectedNode(res.nodes[0] || null);
  };

  // Quick Word Dump Handler
  const handleQuickDump = (e) => {
    e.preventDefault();
    if (!quickDumpInput.trim()) return;

    const raw = quickDumpInput.trim();
    const created = addNodeToGraph(
      raw,
      `Word dumped: ${raw}`,
      'passive',
      `native use of ${raw}`,
      searchWord || 'Vocabulary'
    );

    const updatedNodes = getNodes();
    const updatedEdges = getEdges();
    setNodesData(updatedNodes);
    setEdgesData(updatedEdges);
    setSearchWord(raw);
    setSelectedNode(created);
    setQuickDumpInput('');
  };

  // Toggle Category (Active <-> Passive Deep)
  const handleToggleCategory = (newCat) => {
    if (!selectedNode) return;
    updateNodeCategory(selectedNode.id, newCat);
    const updatedNodes = getNodes();
    setNodesData(updatedNodes);
    setSelectedNode({ ...selectedNode, category: newCat });
  };

  // Delete Node
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    deleteNodeFromGraph(selectedNode.id);
    const updatedNodes = getNodes();
    setNodesData(updatedNodes);
    setEdgesData(getEdges());
    setSelectedNode(null);
  };

  // Save Node Edit
  const handleSaveEdit = () => {
    if (!selectedNode) return;
    editNodeInGraph(selectedNode.id, {
      label: editLabel,
      definition: editDef,
      collocation: editCollocation
    });
    const updatedNodes = getNodes();
    setNodesData(updatedNodes);
    setSelectedNode({ ...selectedNode, label: editLabel, definition: editDef, collocation: editCollocation });
    setIsEditing(false);
  };

  // Export Backup
  const handleExportBackup = () => {
    const data = exportBackupData();
    setBackupText(data);
    navigator.clipboard.writeText(data);
    setSyncNotice('Backup copied to clipboard!');
    setTimeout(() => setSyncNotice(''), 3000);
  };

  // Import Backup
  const handleImportBackup = () => {
    if (!backupText.trim()) return;
    const ok = importBackupData(backupText);
    if (ok) {
      setNodesData(getNodes());
      setEdgesData(getEdges());
      setSyncNotice('✅ Graph backup restored!');
      setTimeout(() => {
        setSyncNotice('');
        setShowSyncModal(false);
      }, 1200);
    } else {
      setSyncNotice('❌ Invalid backup JSON.');
    }
  };

  const presetTerms = ['Boring', 'Big', 'Risky', 'Important', 'Happy', 'Delay'];

  // Filtered nodes
  const term = searchWord.toLowerCase().trim();
  let rootNode = null;
  if (term) {
    rootNode = nodesData.find(n => n.label.toLowerCase().includes(term) || term.includes(n.label.toLowerCase()));
  }

  let displayNodes = nodesData;
  if (rootNode) {
    const connectedIds = new Set([rootNode.id]);
    edgesData.forEach(e => {
      if (e.from === rootNode.id) connectedIds.add(e.to);
      if (e.to === rootNode.id) connectedIds.add(e.from);
    });
    displayNodes = nodesData.filter(n => connectedIds.has(n.id) || n.label.toLowerCase().includes(term));
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #090d16 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Top Controls Bar */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search word/concept (e.g. Boring)..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.1rem', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Quick Dump */}
          <form onSubmit={handleQuickDump} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <input
              type="text"
              placeholder="Dump word..."
              value={quickDumpInput}
              onChange={(e) => setQuickDumpInput(e.target.value)}
              style={{ width: '110px', padding: '0.5rem 0.65rem', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '34px', height: '34px', padding: 0 }} title="Dump Word">
              <Zap size={16} />
            </button>
          </form>

          {/* Backup Button */}
          <button onClick={() => setShowSyncModal(true)} className="btn btn-secondary" style={{ borderRadius: '50%', width: '34px', height: '34px', padding: 0 }} title="Backup">
            <Download size={16} />
          </button>
        </div>

        {/* Concept Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, whitespace: 'nowrap' }}>Concepts:</span>
          <button onClick={() => setSearchWord('')} className={`btn ${!searchWord ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.15rem 0.5rem', minHeight: '26px', fontSize: '0.72rem', borderRadius: '12px' }}>
            All Words ({nodesData.length})
          </button>
          {presetTerms.map(t => (
            <button
              key={t}
              onClick={() => setSearchWord(t)}
              className={`btn ${searchWord.toLowerCase() === t.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.15rem 0.5rem', minHeight: '26px', fontSize: '0.72rem', borderRadius: '12px' }}
            >
              {t}
            </button>
          ))}
          <button onClick={handleResetDefaults} className="btn btn-secondary" style={{ padding: '0.15rem 0.5rem', minHeight: '26px', fontSize: '0.72rem', borderRadius: '12px', color: 'var(--accent-amber)' }}>
            Reset Graph
          </button>
        </div>

      </div>

      {/* FLOATING WORD 2D SPATIAL CANVAS */}
      <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '1rem', paddingBottom: selectedNode ? '240px' : '60px' }}>
        {displayNodes.map(n => {
          const isRoot = rootNode && n.id === rootNode.id;
          const isActive = n.category === 'active';
          const isPassive = n.category === 'passive';
          const isCollocation = n.category === 'collocation';
          const isSelected = selectedNode?.id === n.id;

          let badgeColor = 'rgba(96, 165, 250, 0.2)';
          let borderColor = '#60a5fa';
          let textColor = '#60a5fa';
          let fontSize = '0.9rem';
          let fontWeight = '500';

          if (isRoot) {
            badgeColor = 'rgba(139, 92, 246, 0.35)';
            borderColor = '#c084fc';
            textColor = '#ffffff';
            fontSize = '1.15rem';
            fontWeight = '700';
          } else if (isActive) {
            badgeColor = 'rgba(16, 185, 129, 0.25)';
            borderColor = '#10b981';
            textColor = '#ffffff';
            fontSize = '1rem';
            fontWeight = '700';
          } else if (isPassive) {
            badgeColor = 'rgba(249, 115, 22, 0.25)';
            borderColor = '#f97316';
            textColor = '#fed7aa';
            fontSize = '0.92rem';
            fontWeight = '600';
          } else if (isCollocation) {
            badgeColor = 'rgba(6, 182, 212, 0.15)';
            borderColor = '#22d3ee';
            textColor = '#a5f3fc';
            fontSize = '0.82rem';
            fontWeight = '500';
          }

          return (
            <div
              key={n.id}
              onClick={() => { setSelectedNode(n); setEditLabel(n.label); setEditDef(n.definition || ''); setEditCollocation(n.collocation || ''); }}
              style={{
                cursor: 'pointer',
                padding: isRoot ? '0.65rem 1.25rem' : '0.45rem 0.9rem',
                borderRadius: '25px',
                background: isSelected ? 'rgba(217, 70, 239, 0.3)' : badgeColor,
                border: `1.5px solid ${isSelected ? '#d946ef' : borderColor}`,
                color: textColor,
                fontSize: fontSize,
                fontWeight: fontWeight,
                boxShadow: isRoot || isSelected ? `0 0 20px ${borderColor}` : '0 4px 12px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backdropFilter: 'blur(8px)',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)'
              }}
            >
              <span>{isCollocation ? `"${n.label}"` : n.label}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', padding: '0.1rem 0.35rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }}>
                {n.category}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Legend */}
      <div style={{ position: 'fixed', bottom: selectedNode ? '220px' : '16px', left: '16px', transition: 'bottom 0.3s ease', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '0.65rem', fontSize: '0.72rem', zIndex: 50 }}>
        <span style={{ color: '#c084fc', fontWeight: 600 }}>🟣 Concept Root</span>
        <span style={{ color: '#f97316', fontWeight: 600 }}>🟠 Deep Lexicon</span>
        <span style={{ color: '#10b981', fontWeight: 600 }}>🟢 Active Spoken</span>
        <span style={{ color: '#22d3ee', fontWeight: 600 }}>🌿 Collocation</span>
      </div>

      {/* Bottom Inspector Drawer */}
      {selectedNode && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          maxHeight: '220px',
          padding: '1rem 1.25rem',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid rgba(139, 92, 246, 0.4)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          zIndex: 100
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge ${selectedNode.category === 'active' ? 'badge-emerald' : 'badge-amber'}`}>
                {selectedNode.category.toUpperCase()}
              </span>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>{selectedNode.label}</h3>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer' }}>
                <Edit3 size={16} />
              </button>
              <button onClick={handleDeleteNode} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
          </div>

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                {selectedNode.definition || 'Deep lexicon word node.'}
              </p>
              
              {selectedNode.collocation && (
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, margin: 0 }}>
                  Pairing: "{selectedNode.collocation}"
                </p>
              )}

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                {selectedNode.category !== 'active' ? (
                  <button onClick={() => handleToggleCategory('active')} className="btn btn-emerald" style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem' }}>
                    <CheckCircle2 size={14} /> Move to Active Spoken
                  </button>
                ) : (
                  <button onClick={() => handleToggleCategory('passive')} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem', color: 'var(--accent-amber)' }}>
                    <RotateCcw size={14} /> Move back to Deep Lexicon
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Word" style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.78rem' }} />
              <input type="text" value={editDef} onChange={(e) => setEditDef(e.target.value)} placeholder="Definition" style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.78rem' }} />
              <input type="text" value={editCollocation} onChange={(e) => setEditCollocation(e.target.value)} placeholder="Collocation" style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.78rem' }} />
              <button onClick={handleSaveEdit} className="btn btn-primary" style={{ padding: '0.35rem', fontSize: '0.78rem' }}>
                <Save size={14} /> Save Edit
              </button>
            </div>
          )}

        </div>
      )}

      {/* Backup Modal */}
      {showSyncModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Backup & Restore Lexicon Graph</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <button onClick={handleExportBackup} className="btn btn-emerald" style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}>
                <Download size={14} /> Export Backup
              </button>
              <button onClick={handleImportBackup} className="btn btn-secondary" style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}>
                <Upload size={14} /> Import Backup
              </button>
            </div>

            <textarea
              rows={4}
              value={backupText}
              onChange={(e) => setBackupText(e.target.value)}
              placeholder="Paste exported backup JSON string here..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace', resize: 'none' }}
            />
            {syncNotice && <p style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>{syncNotice}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button onClick={() => setShowSyncModal(false)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
