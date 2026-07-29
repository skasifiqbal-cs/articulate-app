import React, { useState, useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Search, Zap, Trash2, Edit3, CheckCircle2, RotateCcw, Save, Download, Upload, Clock, Network as NetworkIcon } from 'lucide-react';
import { getNodes, getEdges, addNodeToGraph, updateNodeCategory, deleteNodeFromGraph, editNodeInGraph, exportBackupData, importBackupData } from '../services/storage.js';

export default function SemanticGraphView() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  const [nodesData, setNodesData] = useState(getNodes());
  const [edgesData, setEdgesData] = useState(getEdges());

  const [searchWord, setSearchWord] = useState('');
  const [quickDumpInput, setQuickDumpInput] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // View Toggle State
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' or 'history'

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDef, setEditDef] = useState('');
  const [editCollocation, setEditCollocation] = useState('');

  // Backup / Sync Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [syncNotice, setSyncNotice] = useState('');

  // Graph Rendering Effect
  useEffect(() => {
    if (activeTab !== 'graph') return;
    if (!containerRef.current) return;

    const term = searchWord.toLowerCase().trim();
    let root = null;
    
    if (term) {
      root = nodesData.find(n => n.label.toLowerCase().includes(term) || term.includes(n.label.toLowerCase()));
    }

    let displayNodes = nodesData;
    let displayEdges = edgesData;

    if (root) {
      const connectedNodeIds = new Set([root.id]);
      edgesData.forEach(e => {
        if (e.from === root.id) connectedNodeIds.add(e.to);
        if (e.to === root.id) connectedNodeIds.add(e.from);
      });
      displayNodes = nodesData.filter(n => connectedNodeIds.has(n.id) || n.label.toLowerCase().includes(term));
      const visibleIds = new Set(displayNodes.map(n => n.id));
      displayEdges = edgesData.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));
    }

    const visNodes = new DataSet(
      displayNodes.map(n => {
        const isAnchor = n.category === 'anchor';
        const isCollocation = n.category === 'collocation';
        const isActive = n.category === 'active';
        const isPassive = n.category === 'passive';
        const isSelected = selectedNode?.id === n.id;

        let textColor = '#60a5fa'; 
        let bgColor = 'rgba(30, 58, 138, 0.35)';
        let borderColor = '#60a5fa';
        let fontSize = 14;

        if (isAnchor) {
          textColor = '#ffffff';
          bgColor = 'rgba(139, 92, 246, 0.7)'; 
          borderColor = '#c084fc';
          fontSize = 17;
        } else if (isActive) {
          textColor = '#ffffff';
          bgColor = 'rgba(16, 185, 129, 0.5)'; 
          borderColor = '#10b981';
          fontSize = 15;
        } else if (isPassive) {
          textColor = '#fed7aa';
          bgColor = 'rgba(249, 115, 22, 0.4)'; 
          borderColor = '#f97316';
          fontSize = 14;
        }

        if (isSelected) {
          borderColor = '#d946ef';
          bgColor = 'rgba(217, 70, 239, 0.5)';
        }

        return {
          id: n.id,
          label: isCollocation ? `"${n.label}"` : n.label,
          shape: 'box',
          margin: 10,
          color: {
            background: bgColor,
            border: borderColor,
            highlight: { background: 'rgba(217, 70, 239, 0.8)', border: '#d946ef' }
          },
          font: {
            color: textColor,
            face: 'Inter',
            size: fontSize,
            bold: isAnchor || isActive || isSelected
          }
        };
      })
    );

    const visEdges = new DataSet(
      displayEdges.map(e => ({
        from: e.from,
        to: e.to,
        label: e.label || '',
        color: { color: 'rgba(255, 255, 255, 0.15)', highlight: '#d946ef' },
        font: { color: '#94a3b8', size: 11, strokeWidth: 3, strokeColor: '#090d16' }
      }))
    );

    const options = {
      nodes: { borderWidth: 1.5, shadow: true },
      edges: { width: 1.5, smooth: { type: 'continuous' } },
      physics: { 
        barnesHut: { gravitationalConstant: -3000, centralGravity: 0.3, springLength: 150 },
        stabilization: { iterations: 150 }
      },
      interaction: { hover: true, zoomView: true, dragView: true }
    };

    networkRef.current = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, options);

    setTimeout(() => {
      if (networkRef.current) {
        networkRef.current.redraw();
        networkRef.current.fit();
      }
    }, 200);

    networkRef.current.on('selectNode', (params) => {
      const clickedId = params.nodes[0];
      const clicked = nodesData.find(n => n.id === clickedId);
      if (clicked) {
        setSelectedNode(clicked);
        setEditLabel(clicked.label);
        setEditDef(clicked.definition || '');
        setEditCollocation(clicked.collocation || '');
        setIsEditing(false);
      }
    });

    networkRef.current.on('deselectNode', () => {
      setSelectedNode(null);
      setIsEditing(false);
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [nodesData, edgesData, searchWord, selectedNode, activeTab]);

  // Quick Word Dump Handler
  const handleQuickDump = (e) => {
    e.preventDefault();
    if (!quickDumpInput.trim()) return;

    const raw = quickDumpInput.trim();
    // Default to the first anchor if nothing searched
    const anchorBase = searchWord || 'Solid';
    const created = addNodeToGraph(
      raw,
      `Added via Quick Dump`,
      'passive',
      `native use of ${raw}`,
      anchorBase
    );

    const updatedNodes = getNodes();
    const updatedEdges = getEdges();
    setNodesData(updatedNodes);
    setEdgesData(updatedEdges);
    setSearchWord(raw);
    setSelectedNode(created);
    setQuickDumpInput('');
    setActiveTab('graph'); // Switch to graph to see it
  };

  const handleToggleCategory = (newCat) => {
    if (!selectedNode) return;
    updateNodeCategory(selectedNode.id, newCat);
    const updatedNodes = getNodes();
    setNodesData(updatedNodes);
    setSelectedNode({ ...selectedNode, category: newCat });
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    deleteNodeFromGraph(selectedNode.id);
    const updatedNodes = getNodes();
    setNodesData(updatedNodes);
    setEdgesData(getEdges());
    setSelectedNode(null);
  };

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

  const handleExportBackup = () => {
    const data = exportBackupData();
    setBackupText(data);
    navigator.clipboard.writeText(data);
    setSyncNotice('Backup copied to clipboard!');
    setTimeout(() => setSyncNotice(''), 3000);
  };

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

  // Helper to get relative time
  const timeAgo = (timestamp) => {
    if (!timestamp) return 'Sometime in the past';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const historyNodes = [...nodesData]
    .filter(n => n.createdAt) // Only show ones with a timestamp (recently added)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #090d16 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Top Controls Bar */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '300px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search word..."
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
            style={{ width: '100px', padding: '0.5rem 0.65rem', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '34px', height: '34px', padding: 0 }} title="Dump Word">
            <Zap size={16} />
          </button>
        </form>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '2px', marginLeft: 'auto' }}>
          <button 
            onClick={() => setActiveTab('graph')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.75rem', borderRadius: '18px', background: activeTab === 'graph' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'graph' ? '#fff' : 'var(--text-muted)', border: 'none', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <NetworkIcon size={14} /> Graph
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.75rem', borderRadius: '18px', background: activeTab === 'history' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'history' ? '#fff' : 'var(--text-muted)', border: 'none', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Clock size={14} /> History
          </button>
        </div>

        {/* Backup Button */}
        <button onClick={() => setShowSyncModal(true)} className="btn btn-secondary" style={{ borderRadius: '50%', width: '34px', height: '34px', padding: 0 }} title="Backup">
          <Download size={16} />
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        
        {/* GRAPH TAB */}
        <div style={{ display: activeTab === 'graph' ? 'block' : 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
          
          {/* Floating Legend */}
          <div style={{ position: 'fixed', bottom: selectedNode ? '220px' : '16px', left: '16px', transition: 'bottom 0.3s ease', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '0.65rem', fontSize: '0.72rem', zIndex: 50 }}>
            <span style={{ color: '#c084fc', fontWeight: 600 }}>🟣 Anchor</span>
            <span style={{ color: '#f97316', fontWeight: 600 }}>🟠 Passive</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>🟢 Active</span>
          </div>
        </div>

        {/* HISTORY LOG TAB */}
        <div style={{ display: activeTab === 'history' ? 'flex' : 'none', flexDirection: 'column', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', padding: '2rem 1.5rem', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Activity Log</h2>
            
            {historyNodes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Clock size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p>No new words added yet.</p>
                <p style={{ fontSize: '0.85rem' }}>Use the Quick Dump to add words to your lexicon.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {historyNodes.map(node => (
                  <div key={node.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '1rem 1.25rem', borderRadius: '12px', borderLeft: `4px solid ${node.category === 'active' ? '#10b981' : '#f97316'}` }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{node.label}</h4>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>{node.definition}</p>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                      {timeAgo(node.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Inspector Drawer (Only visible on Graph Tab) */}
      {selectedNode && activeTab === 'graph' && (
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
