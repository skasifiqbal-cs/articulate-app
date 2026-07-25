import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Search, Plus, Trash2, Edit3, CheckCircle2, RotateCcw, Save, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { getNodes, getEdges, addNodeToGraph, updateNodeCategory, deleteNodeFromGraph, editNodeInGraph } from '../services/storage.js';

export default function SemanticGraphView() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  const [nodesData, setNodesData] = useState(getNodes());
  const [edgesData, setEdgesData] = useState(getEdges());

  const [searchWord, setSearchWord] = useState('Boring');
  const [selectedNode, setSelectedNode] = useState(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDef, setEditDef] = useState('');
  const [editCollocation, setEditCollocation] = useState('');

  // Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newDef, setNewDef] = useState('');
  const [newCollocation, setNewCollocation] = useState('');

  // Calculate Neighborhood for searchWord
  useEffect(() => {
    if (!containerRef.current) return;

    const term = searchWord.toLowerCase().trim();
    
    // Find matching root node or fallback to first node
    let root = nodesData.find(n => n.label.toLowerCase().includes(term) || term.includes(n.label.toLowerCase()));
    if (!root && nodesData.length > 0) root = nodesData[0];
    if (!root) return;

    // Find all directly connected nodes via edges
    const connectedNodeIds = new Set([root.id]);
    edgesData.forEach(e => {
      if (e.from === root.id) connectedNodeIds.add(e.to);
      if (e.to === root.id) connectedNodeIds.add(e.from);
    });

    // Filter nodes in neighborhood
    const neighborhoodNodes = nodesData.filter(n => connectedNodeIds.has(n.id) || n.label.toLowerCase().includes(term));
    const neighborhoodNodeIds = new Set(neighborhoodNodes.map(n => n.id));
    const neighborhoodEdges = edgesData.filter(e => neighborhoodNodeIds.has(e.from) && neighborhoodNodeIds.has(e.to));

    // Vis.js Dataset
    const visNodes = new DataSet(
      neighborhoodNodes.map(n => {
        const isRoot = n.id === root.id;
        return {
          id: n.id,
          label: `${n.label}\n(${n.category.toUpperCase()})`,
          shape: 'dot',
          size: isRoot ? 34 : (n.category === 'active' ? 26 : 22),
          color: {
            background: isRoot ? '#c084fc' : (n.category === 'active' ? '#10b981' : (n.category === 'passive' ? '#f97316' : '#3b82f6')),
            border: '#ffffff',
            highlight: { background: '#d946ef', border: '#ffffff' }
          },
          font: { color: '#ffffff', face: 'Inter', size: isRoot ? 15 : 13, strokeWidth: 3, strokeColor: '#0f172a' }
        };
      })
    );

    const visEdges = new DataSet(
      neighborhoodEdges.map(e => ({
        from: e.from,
        to: e.to,
        label: e.label || '',
        color: { color: 'rgba(255, 255, 255, 0.4)', highlight: '#d946ef' },
        font: { color: '#94a3b8', size: 11 }
      }))
    );

    const options = {
      nodes: { borderWidth: 2, shadow: true },
      edges: { width: 2, smooth: { type: 'continuous' } },
      physics: { barnesHut: { gravitationalConstant: -2500, centralGravity: 0.3, springLength: 140 } },
      interaction: { hover: true, zoomView: true, dragView: true }
    };

    networkRef.current = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, options);

    setSelectedNode(root);

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

    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, [nodesData, edgesData, searchWord]);

  // Handle Category Toggle (Active <-> Passive Deep)
  const handleToggleCategory = (newCat) => {
    if (!selectedNode) return;
    updateNodeCategory(selectedNode.id, newCat);
    const updatedNodes = getNodes();
    setNodesData(updatedNodes);
    setSelectedNode({ ...selectedNode, category: newCat, color: newCat === 'active' ? '#10b981' : (newCat === 'passive' ? '#f97316' : '#3b82f6') });
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    deleteNodeFromGraph(selectedNode.id);
    const updatedNodes = getNodes();
    setNodesData(updatedNodes);
    setEdgesData(getEdges());
    setSelectedNode(updatedNodes[0] || null);
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

  const handleCreateNode = (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    addNodeToGraph(newWord, newDef, 'passive', newCollocation, searchWord);
    setNodesData(getNodes());
    setEdgesData(getEdges());
    setNewWord('');
    setNewDef('');
    setNewCollocation('');
    setShowAddForm(false);
  };

  // Quick Search Preset Terms
  const presetTerms = ['Boring', 'Big', 'Bad', 'Important', 'Happy', 'Delay'];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.25rem 1rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles color="var(--accent-purple)" size={22} /> Lexicon Neighborhood Explorer
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Search any concept to explore its connected Surface Lexicon crutches, Deep Lexicon upgrades, and Native Collocations.
          </p>
        </div>

        <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
          <Plus size={15} /> Add Deep Lexicon Word
        </button>
      </div>

      {/* Concept Search & Preset Chips */}
      <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Type any word or concept (e.g. Boring, Big, Important)..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              style={{ width: '100%', padding: '0.55rem 0.5rem 0.55rem 2.2rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* Preset Quick Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Concepts:</span>
          {presetTerms.map(term => (
            <button
              key={term}
              onClick={() => setSearchWord(term)}
              className={`btn ${searchWord.toLowerCase() === term.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.65rem', minHeight: '30px', fontSize: '0.75rem' }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Neighborhood Canvas & Interactive Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 360px' : '1fr', gap: '1.25rem' }}>
        
        {/* Force Directed Centered Canvas */}
        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', minHeight: '460px' }}>
          <div ref={containerRef} style={{ width: '100%', height: '460px', background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.95) 0%, rgba(9, 13, 22, 1) 100%)' }} />
          
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#c084fc' }}>🟣 Searched Concept</span>
            <span style={{ color: '#3b82f6' }}>🔵 Surface Crutch</span>
            <span style={{ color: '#f97316' }}>🟠 Deep Lexicon</span>
            <span style={{ color: '#10b981' }}>🟢 Active Spoken</span>
          </div>
        </div>

        {/* Selected Word Neighborhood Details */}
        {selectedNode && (
          <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderColor: 'var(--accent-purple)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span className={`badge ${selectedNode.category === 'active' ? 'badge-emerald' : (selectedNode.category === 'passive' ? 'badge-amber' : 'badge-purple')}`}>
                {selectedNode.category.toUpperCase()} LEXICON
              </span>
              
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer' }} title="Edit Word">
                  <Edit3 size={16} />
                </button>
                <button onClick={handleDeleteNode} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }} title="Delete Word">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {!isEditing ? (
              <>
                <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.2rem' }}>{selectedNode.label}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  Spoken {selectedNode.usageCount || 0} times in Sandbox
                </p>

                <div className="glass-card" style={{ marginBottom: '0.85rem', padding: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Definition</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>{selectedNode.definition || 'No definition logged.'}</p>
                </div>

                <div className="glass-card" style={{ marginBottom: '1rem', padding: '0.75rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 700 }}>Native Collocation Pairing</span>
                  <p style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600, margin: '0.2rem 0' }}>"{selectedNode.collocation || `native use of ${selectedNode.label}`}"</p>
                </div>

                {/* Category Switcher Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedNode.category !== 'active' ? (
                    <button onClick={() => handleToggleCategory('active')} className="btn btn-emerald" style={{ padding: '0.5rem', fontSize: '0.82rem' }}>
                      <CheckCircle2 size={15} /> Move to Active Spoken
                    </button>
                  ) : (
                    <button onClick={() => handleToggleCategory('passive')} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.82rem', color: 'var(--accent-amber)' }}>
                      <RotateCcw size={15} /> Move back to Deep Lexicon
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Node Edit Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Word Label</label>
                <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.82rem' }} />
                
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Definition</label>
                <input type="text" value={editDef} onChange={(e) => setEditDef(e.target.value)} style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.82rem' }} />
                
                <label style={{ fontSize: '0.78rem', fontWeight 600 }}>Collocation</label>
                <input type="text" value={editCollocation} onChange={(e) => setEditCollocation(e.target.value)} style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.82rem' }} />

                <button onClick={handleSaveEdit} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.45rem', fontSize: '0.82rem' }}>
                  <Save size={15} /> Save Changes
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.85rem', color: '#ffffff' }}>Add Deep Lexicon Word to Neighborhood</h3>
            
            <form onSubmit={handleCreateNode}>
              <div style={{ marginBottom: '0.75rem' }}>
                <input type="text" required placeholder="Word / Idiom" value={newWord} onChange={(e) => setNewWord(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }} />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <input type="text" placeholder="Definition" value={newDef} onChange={(e) => setNewDef(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <input type="text" placeholder="Native Collocation" value={newCollocation} onChange={(e) => setNewCollocation(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Word</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
