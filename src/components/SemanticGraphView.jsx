import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { GitFork, Search, Plus, Filter, Trash2, Edit3, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import { getNodes, getEdges, addNodeToGraph, updateNodeCategory, deleteNodeFromGraph, editNodeInGraph } from '../services/storage.js';

export default function SemanticGraphView() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  const [nodesData, setNodesData] = useState(getNodes());
  const [edgesData, setEdgesData] = useState(getEdges());

  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDef, setEditDef] = useState('');
  const [editCollocation, setEditCollocation] = useState('');

  // Add Node Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newDef, setNewDef] = useState('');
  const [newCollocation, setNewCollocation] = useState('');

  // Mount Vis.js Network Canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const filteredNodes = nodesData.filter(n => {
      const matchesCat = filterCategory === 'all' || n.category === filterCategory;
      const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edgesData.filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to));

    const visNodes = new DataSet(
      filteredNodes.map(n => ({
        id: n.id,
        label: `${n.label}\n(${n.category})`,
        shape: 'dot',
        size: n.category === 'active' ? 26 : (n.category === 'passive' ? 22 : 18),
        color: {
          background: n.color || (n.category === 'active' ? '#10b981' : (n.category === 'passive' ? '#f97316' : '#3b82f6')),
          border: '#ffffff',
          highlight: { background: '#c084fc', border: '#ffffff' }
        },
        font: { color: '#ffffff', face: 'Inter', size: 13, strokeWidth: 3, strokeColor: '#0f172a' }
      }))
    );

    const visEdges = new DataSet(
      filteredEdges.map(e => ({
        from: e.from,
        to: e.to,
        label: e.label || '',
        color: { color: 'rgba(255, 255, 255, 0.25)', highlight: '#c084fc' },
        font: { color: '#94a3b8', size: 10 }
      }))
    );

    const options = {
      nodes: { borderWidth: 2, shadow: true },
      edges: { width: 1.5, smooth: { type: 'continuous' } },
      physics: { barnesHut: { gravitationalConstant: -3000, centralGravity: 0.3, springLength: 120 } },
      interaction: { hover: true, zoomView: true, dragView: true }
    };

    networkRef.current = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, options);

    networkRef.current.on('selectNode', (params) => {
      const clickedId = params.nodes[0];
      const clicked = nodesData.find(n => n.id === clickedId);
      setSelectedNode(clicked || null);
      if (clicked) {
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
      if (networkRef.current) networkRef.current.destroy();
    };
  }, [nodesData, edgesData, filterCategory, searchQuery]);

  // Handle Category Toggle (Active <-> Passive Deep)
  const handleToggleCategory = (newCat) => {
    if (!selectedNode) return;
    updateNodeCategory(selectedNode.id, newCat);
    const updatedNodes = getNodes();
    setNodesData(updatedNodes);
    setSelectedNode({ ...selectedNode, category: newCat, color: newCat === 'active' ? '#10b981' : (newCat === 'passive' ? '#f97316' : '#3b82f6') });
  };

  // Handle Delete Node
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    deleteNodeFromGraph(selectedNode.id);
    setNodesData(getNodes());
    setEdgesData(getEdges());
    setSelectedNode(null);
  };

  // Handle Edit Node Save
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
    addNodeToGraph(newWord, newDef, 'passive', newCollocation, '');
    setNodesData(getNodes());
    setEdgesData(getEdges());
    setNewWord('');
    setNewDef('');
    setNewCollocation('');
    setShowAddForm(false);
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.25rem 1rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitFork color="var(--accent-purple)" size={22} /> Semantic Web Graph
          </h2>
        </div>

        <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
          <Plus size={15} /> Add Deep Lexicon Word
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          <Filter size={15} color="var(--text-muted)" />
          <button onClick={() => setFilterCategory('all')} className={`btn ${filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.3rem 0.65rem', minHeight: '34px', fontSize: '0.78rem' }}>
            All ({nodesData.length})
          </button>
          <button onClick={() => setFilterCategory('active')} className={`btn ${filterCategory === 'active' ? 'btn-emerald' : 'btn-secondary'}`} style={{ padding: '0.3rem 0.65rem', minHeight: '34px', fontSize: '0.78rem' }}>
            ● Active ({nodesData.filter(n => n.category === 'active').length})
          </button>
          <button onClick={() => setFilterCategory('passive')} className={`btn ${filterCategory === 'passive' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.3rem 0.65rem', minHeight: '34px', fontSize: '0.78rem', background: filterCategory === 'passive' ? 'var(--accent-amber)' : '' }}>
            ● Deep Lexicon ({nodesData.filter(n => n.category === 'passive').length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '200px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search word..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.4rem 0.5rem 0.4rem 1.8rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Main Canvas & Inspector View */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 340px' : '1fr', gap: '1.25rem' }}>
        
        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', minHeight: '480px' }}>
          <div ref={containerRef} style={{ width: '100%', height: '480px', background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.95) 0%, rgba(9, 13, 22, 1) 100%)' }} />
        </div>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderColor: 'var(--accent-purple)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span className={`badge ${selectedNode.category === 'active' ? 'badge-emerald' : 'badge-amber'}`}>
                {selectedNode.category.toUpperCase()}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer' }} title="Edit Node">
                  <Edit3 size={16} />
                </button>
                <button onClick={handleDeleteNode} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }} title="Delete Node">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
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

                <div className="glass-card" style={{ marginBottom: '1rem', padding: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 700 }}>Native Collocation</span>
                  <p style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, margin: '0.2rem 0' }}>"{selectedNode.collocation || `native use of ${selectedNode.label}`}"</p>
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
                
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Collocation</label>
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
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.85rem', color: '#ffffff' }}>Add Word to Graph</h3>
            
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
