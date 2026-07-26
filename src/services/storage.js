import { INITIAL_VOCABULARY_NODES, INITIAL_VOCABULARY_EDGES } from './mockData.js';

const STORAGE_KEYS = {
  SETTINGS: 'articulate_settings_v1',
  PROFILE: 'articulate_profile_v1',
  NODES: 'articulate_nodes_v1',
  EDGES: 'articulate_edges_v1',
  SYNC_CODE: 'articulate_sync_code_v1'
};

export const getSettings = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    provider: 'mock',
    apiKey: '',
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'gemma2:2b',
    ttsRate: 1.0,
    ttsPitch: 1.0,
    syncCode: ''
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
  if (!data) return INITIAL_VOCABULARY_NODES;
  try {
    const parsed = JSON.parse(data);
    return (Array.isArray(parsed) && parsed.length > 0) ? parsed : INITIAL_VOCABULARY_NODES;
  } catch (err) {
    return INITIAL_VOCABULARY_NODES;
  }
};

export const saveNodes = (nodes) => {
  localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
  triggerAutoCloudSync();
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

export const saveEdges = (edges) => {
  localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
  triggerAutoCloudSync();
};

export const resetGraphToDefaults = () => {
  localStorage.removeItem(STORAGE_KEYS.NODES);
  localStorage.removeItem(STORAGE_KEYS.EDGES);
  saveNodes(INITIAL_VOCABULARY_NODES);
  saveEdges(INITIAL_VOCABULARY_EDGES);
  return { nodes: INITIAL_VOCABULARY_NODES, edges: INITIAL_VOCABULARY_EDGES };
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

export const markNodeAsActive = (wordLabel) => {
  updateNodeCategory(wordLabel, 'active');
};

export const updateNodeCategory = (wordLabel, newCategory) => {
  const nodes = getNodes();
  const node = nodes.find(n => n.label.toLowerCase() === wordLabel.toLowerCase() || n.id === wordLabel);
  if (node) {
    node.category = newCategory;
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

export const triggerAutoCloudSync = async () => {
  const settings = getSettings();
  if (!settings.syncCode) return;

  const payload = {
    nodes: getNodes(),
    edges: getEdges(),
    profile: getProfile(),
    updatedAt: new Date().toISOString()
  };

  try {
    await fetch(`https://kvdb.io/4y9UqWj5C5S8pY9N7m4q/${settings.syncCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Auto cloud sync backup skipped:', err);
  }
};

export const fetchAutoCloudSync = async () => {
  const settings = getSettings();
  if (!settings.syncCode) return false;

  try {
    const res = await fetch(`https://kvdb.io/4y9UqWj5C5S8pY9N7m4q/${settings.syncCode}`);
    if (!res.ok) return false;
    const payload = await res.json();
    if (payload.nodes && Array.isArray(payload.nodes)) saveNodes(payload.nodes);
    if (payload.edges && Array.isArray(payload.edges)) saveEdges(payload.edges);
    if (payload.profile) saveProfile(payload.profile);
    return true;
  } catch (err) {
    console.warn('Auto cloud sync fetch failed:', err);
    return false;
  }
};

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
