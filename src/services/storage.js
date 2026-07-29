import { INITIAL_VOCABULARY_NODES, INITIAL_VOCABULARY_EDGES } from './mockData.js';

const STORAGE_KEYS = {
  NODES: 'articulate_nodes_v2',
  EDGES: 'articulate_edges_v2'
};

export const getNodes = () => {
  const data = localStorage.getItem(STORAGE_KEYS.NODES);
  if (!data) return INITIAL_VOCABULARY_NODES;
  try {
    const parsed = JSON.parse(data);
    return (Array.isArray(parsed) && parsed.length > 0) ? parsed : INITIAL_VOCABULARY_NODES;
  } catch (err) {
    return INITIAL_VOCABULARY_NODES;
  }
};

export const getEdges = () => {
  const data = localStorage.getItem(STORAGE_KEYS.EDGES);
  if (!data) return INITIAL_VOCABULARY_EDGES;
  try {
    const parsed = JSON.parse(data);
    return (Array.isArray(parsed) && parsed.length > 0) ? parsed : INITIAL_VOCABULARY_EDGES;
  } catch (err) {
    return INITIAL_VOCABULARY_EDGES;
  }
};

export const addNodeToGraph = (label, definition, category, collocation, connectToLabel) => {
  const nodes = getNodes();
  const edges = getEdges();
  
  const newNode = {
    id: `node_${Date.now()}`,
    label,
    definition,
    category,
    collocation,
    usageCount: 0,
    createdAt: Date.now() // For the history log
  };
  
  nodes.push(newNode);
  localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));

  // Fix: Loose matching to ensure connection always happens
  let target = null;
  if (connectToLabel) {
    const term = connectToLabel.toLowerCase().trim();
    target = nodes.find(n => n.label.toLowerCase().includes(term) || term.includes(n.label.toLowerCase()));
  }
  
  // If no target found, default to the first anchor available
  if (!target) {
    target = nodes.find(n => n.category === 'anchor');
  }

  if (target) {
    edges.push({
      from: target.id,
      to: newNode.id,
      label: 'user added'
    });
    localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
  }

  return newNode;
};

export const updateNodeCategory = (id, newCategory) => {
  const nodes = getNodes();
  const idx = nodes.findIndex(n => n.id === id);
  if (idx !== -1) {
    nodes[idx].category = newCategory;
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
  }
};

export const deleteNodeFromGraph = (id) => {
  const nodes = getNodes().filter(n => n.id !== id);
  const edges = getEdges().filter(e => e.from !== id && e.to !== id);
  localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
  localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
};

export const editNodeInGraph = (id, updates) => {
  const nodes = getNodes();
  const idx = nodes.findIndex(n => n.id === id);
  if (idx !== -1) {
    nodes[idx] = { ...nodes[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
  }
};

export const exportBackupData = () => {
  const payload = {
    nodes: getNodes(),
    edges: getEdges(),
    timestamp: Date.now()
  };
  return JSON.stringify(payload);
};

export const importBackupData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.nodes && Array.isArray(data.nodes) && data.edges && Array.isArray(data.edges)) {
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(data.nodes));
      localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(data.edges));
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};
