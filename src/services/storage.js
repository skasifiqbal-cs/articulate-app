import { INITIAL_VOCABULARY_NODES, INITIAL_VOCABULARY_EDGES } from './mockData.js';

const STORAGE_KEYS = {
  SETTINGS: 'articulate_settings_v1',
  PROFILE: 'articulate_profile_v1',
  NODES: 'articulate_nodes_v1',
  EDGES: 'articulate_edges_v1'
};

export const getSettings = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    provider: 'mock',
    apiKey: '',
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'gemma2:2b',
    ttsRate: 1.0,
    ttsPitch: 1.0
  };
};

export const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getProfile = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : {
    code: 'en-US',
    name: 'English (Mastery Target)',
    level: 'Advanced C1/C2'
  };
};

export const saveProfile = (profile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getNodes = () => {
  const data = localStorage.getItem(STORAGE_KEYS.NODES);
  return data ? JSON.parse(data) : INITIAL_VOCABULARY_NODES;
};

export const saveNodes = (nodes) => {
  localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
};

export const getEdges = () => {
  const data = localStorage.getItem(STORAGE_KEYS.EDGES);
  return data ? JSON.parse(data) : INITIAL_VOCABULARY_EDGES;
};

export const saveEdges = (edges) => {
  localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
};

export const addNodeToGraph = (word, definition = '', category = 'passive', collocation = '', baseSynonym = '') => {
  const nodes = getNodes();
  const edges = getEdges();

  const existingNode = nodes.find(n => n.label.toLowerCase() === word.toLowerCase());
  if (existingNode) {
    existingNode.usageCount = (existingNode.usageCount || 0) + 1;
    saveNodes(nodes);
    return existingNode;
  }

  const newNodeId = 'user_node_' + Date.now();
  const newNode = {
    id: newNodeId,
    label: word,
    category: category,
    usageCount: 1,
    definition: definition || 'Personal Deep Lexicon entry',
    collocation: collocation || `native use of ${word}`,
    color: category === 'active' ? '#10b981' : (category === 'passive' ? '#f97316' : '#3b82f6')
  };

  nodes.push(newNode);
  saveNodes(nodes);

  if (baseSynonym) {
    const anchor = nodes.find(n => n.label.toLowerCase().includes(baseSynonym.toLowerCase()));
    if (anchor) {
      edges.push({ from: anchor.id, to: newNodeId, label: 'upgrade' });
      saveEdges(edges);
    }
  }

  return newNode;
};

// Node Modification Functions
export const markNodeAsActive = (wordLabel) => {
  updateNodeCategory(wordLabel, 'active');
};

export const updateNodeCategory = (wordLabel, newCategory) => {
  const nodes = getNodes();
  const node = nodes.find(n => n.label.toLowerCase() === wordLabel.toLowerCase() || n.id === wordLabel);
  if (node) {
    node.category = newCategory; // 'active' | 'passive' | 'anchor'
    node.color = newCategory === 'active' ? '#10b981' : (newCategory === 'passive' ? '#f97316' : '#3b82f6');
    saveNodes(nodes);
  }
};

export const deleteNodeFromGraph = (nodeId) => {
  const nodes = getNodes().filter(n => n.id !== nodeId && n.label !== nodeId);
  const edges = getEdges().filter(e => e.from !== nodeId && e.to !== nodeId);
  saveNodes(nodes);
  saveEdges(edges);
};

export const editNodeInGraph = (nodeId, updatedFields) => {
  const nodes = getNodes();
  const node = nodes.find(n => n.id === nodeId || n.label === nodeId);
  if (node) {
    Object.assign(node, updatedFields);
    if (updatedFields.category) {
      node.color = updatedFields.category === 'active' ? '#10b981' : (updatedFields.category === 'passive' ? '#f97316' : '#3b82f6');
    }
    saveNodes(nodes);
  }
};

/* =========================================================================
   CROSS-DEVICE SYNC
   ========================================================================= */

export const exportBackupData = () => {
  const payload = {
    settings: getSettings(),
    profile: getProfile(),
    nodes: getNodes(),
    edges: getEdges(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(payload, null, 2);
};

export const importBackupData = (jsonString) => {
  try {
    const payload = JSON.parse(jsonString);
    if (payload.nodes && Array.isArray(payload.nodes)) saveNodes(payload.nodes);
    if (payload.edges && Array.isArray(payload.edges)) saveEdges(payload.edges);
    if (payload.profile) saveProfile(payload.profile);
    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
};
