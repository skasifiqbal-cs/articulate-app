export const INITIAL_VOCABULARY_NODES = [
  // Cluster 1: Real & Specific (Anchor: Solid / Grounded)
  { id: 'anchor_solid', label: 'Solid / Grounded', category: 'anchor', usageCount: 42, color: '#c084fc' },
  { id: 'deep_tangible', label: 'Tangible', category: 'passive', usageCount: 2, definition: 'Perceptible by touch; having physical substance or real-world application.', collocation: 'tangible results / tangible examples', color: '#f97316' },
  { id: 'deep_concrete', label: 'Concrete', category: 'passive', usageCount: 5, definition: 'Existing in a material or physical form; not abstract.', collocation: 'concrete evidence / concrete steps', color: '#f97316' },
  { id: 'deep_pragmatic', label: 'Pragmatic', category: 'passive', usageCount: 1, definition: 'Dealing with things sensibly and realistically based on practical rather than theoretical considerations.', collocation: 'a pragmatic approach', color: '#f97316' },

  // Cluster 2: Habits & Tendencies (Anchor: Default leaning / Tend to)
  { id: 'anchor_tendency', label: 'Default Leaning / Tend to', category: 'anchor', usageCount: 35, color: '#c084fc' },
  { id: 'deep_inclination', label: 'Inclination', category: 'passive', usageCount: 2, definition: 'A person\'s natural tendency or urge to act or feel in a particular way.', collocation: 'my natural inclination is to...', color: '#f97316' },
  { id: 'deep_propensity', label: 'Propensity', category: 'passive', usageCount: 0, definition: 'An inclination or natural tendency to behave in a particular way.', collocation: 'a propensity for reverting to...', color: '#f97316' },
  { id: 'deep_predisposition', label: 'Predisposition', category: 'passive', usageCount: 0, definition: 'A liability or tendency to suffer from a particular condition or hold a particular attitude.', collocation: 'a genetic predisposition', color: '#f97316' },

  // Cluster 3: Unhelpful & Vague (Anchor: Generic)
  { id: 'anchor_generic', label: 'Generic', category: 'anchor', usageCount: 20, color: '#c084fc' },
  { id: 'deep_vague', label: 'Vague', category: 'passive', usageCount: 4, definition: 'Of uncertain, indefinite, or unclear character or meaning.', collocation: 'vague instructions / vague memories', color: '#f97316' },
  { id: 'deep_platitude', label: 'Platitude', category: 'passive', usageCount: 0, definition: 'A remark or statement, especially one with a moral content, that has been used too often to be interesting or thoughtful.', collocation: 'empty platitudes', color: '#f97316' },
  { id: 'deep_pedestrian', label: 'Pedestrian', category: 'passive', usageCount: 1, definition: 'Lacking inspiration or excitement; dull.', collocation: 'a pedestrian performance / pedestrian advice', color: '#f97316' },

  // Cluster 4: Expressing Thoughts (Anchor: Get message across)
  { id: 'anchor_express', label: 'Get message across', category: 'anchor', usageCount: 50, color: '#c084fc' },
  { id: 'deep_convey', label: 'Convey', category: 'passive', usageCount: 4, definition: 'Make an idea, impression, or feeling known or understandable to someone.', collocation: 'convey a message / convey my thoughts', color: '#f97316' },
  { id: 'deep_elucidate', label: 'Elucidate', category: 'passive', usageCount: 0, definition: 'Make something clear; explain.', collocation: 'elucidate the problem', color: '#f97316' },
  { id: 'active_articulate', label: 'Articulate', category: 'active', usageCount: 12, definition: 'Express an idea or feeling fluently and coherently.', collocation: 'articulate my vision', color: '#10b981' },

  // Cluster 5: Fake & Untrue (Anchor: Hoax)
  { id: 'anchor_hoax', label: 'Hoax', category: 'anchor', usageCount: 10, color: '#c084fc' },
  { id: 'deep_fallacy', label: 'Fallacy', category: 'passive', usageCount: 2, definition: 'A mistaken belief, especially one based on unsound argument.', collocation: 'the gambler\'s fallacy', color: '#f97316' },
  { id: 'deep_gimmick', label: 'Gimmick', category: 'passive', usageCount: 3, definition: 'A trick or device intended to attract attention, publicity, or business.', collocation: 'a marketing gimmick', color: '#f97316' },
  { id: 'deep_charade', label: 'Charade', category: 'passive', usageCount: 1, definition: 'An absurd pretense intended to create a pleasant or respectable appearance.', collocation: 'an elaborate charade', color: '#f97316' }
];

export const INITIAL_VOCABULARY_EDGES = [
  // Cluster 1 Edges
  { from: 'anchor_solid', to: 'deep_tangible', label: 'upgrade' },
  { from: 'anchor_solid', to: 'deep_concrete', label: 'upgrade' },
  { from: 'anchor_solid', to: 'deep_pragmatic', label: 'nuance' },
  { from: 'deep_tangible', to: 'deep_concrete', label: 'synonym' },

  // Cluster 2 Edges
  { from: 'anchor_tendency', to: 'deep_inclination', label: 'upgrade' },
  { from: 'anchor_tendency', to: 'deep_propensity', label: 'upgrade' },
  { from: 'anchor_tendency', to: 'deep_predisposition', label: 'nuance' },
  { from: 'deep_propensity', to: 'deep_inclination', label: 'synonym' },

  // Cluster 3 Edges
  { from: 'anchor_generic', to: 'deep_vague', label: 'upgrade' },
  { from: 'anchor_generic', to: 'deep_platitude', label: 'nuance' },
  { from: 'anchor_generic', to: 'deep_pedestrian', label: 'advanced' },
  { from: 'deep_platitude', to: 'deep_pedestrian', label: 'related' },

  // Cluster 4 Edges
  { from: 'anchor_express', to: 'deep_convey', label: 'upgrade' },
  { from: 'anchor_express', to: 'deep_elucidate', label: 'advanced' },
  { from: 'anchor_express', to: 'active_articulate', label: 'upgrade' },
  { from: 'deep_elucidate', to: 'active_articulate', label: 'related' },

  // Cluster 5 Edges
  { from: 'anchor_hoax', to: 'deep_fallacy', label: 'upgrade' },
  { from: 'anchor_hoax', to: 'deep_gimmick', label: 'nuance' },
  { from: 'anchor_hoax', to: 'deep_charade', label: 'advanced' },
  { from: 'deep_gimmick', to: 'deep_charade', label: 'related' }
];
