export const INITIAL_VOCABULARY_NODES = [
  // Cluster 1: Difficulty & Effort (Anchor)
  { id: 'anchor_hard', label: 'Hard / Difficult', category: 'anchor', usageCount: 42, color: '#c084fc' },
  { id: 'deep_arduous', label: 'Arduous', category: 'passive', usageCount: 2, definition: 'Involving or requiring strenuous effort; difficult and tiring.', collocation: 'an arduous journey / arduous task', color: '#f97316' },
  { id: 'deep_formidable', label: 'Formidable', category: 'passive', usageCount: 3, definition: 'Inspiring fear or respect through being impressively large, powerful, intense, or capable.', collocation: 'a formidable opponent / formidable challenge', color: '#f97316' },
  { id: 'deep_onerous', label: 'Onerous', category: 'passive', usageCount: 1, definition: 'Involving an amount of effort and difficulty that is oppressively burdensome.', collocation: 'onerous duties / onerous taxes', color: '#f97316' },
  { id: 'active_uphill', label: 'Uphill battle', category: 'active', usageCount: 14, definition: 'A very difficult struggle.', collocation: 'facing an uphill battle', color: '#10b981' },

  // Cluster 2: Communication & Speech (Anchor)
  { id: 'anchor_speak', label: 'Speak / Talk', category: 'anchor', usageCount: 50, color: '#c084fc' },
  { id: 'deep_articulate', label: 'Articulate', category: 'passive', usageCount: 4, definition: 'Having or showing the ability to speak fluently and coherently.', collocation: 'an articulate speaker / articulate your thoughts', color: '#f97316' },
  { id: 'deep_eloquence', label: 'Eloquence', category: 'passive', usageCount: 2, definition: 'Fluent or persuasive speaking or writing.', collocation: 'speak with eloquence', color: '#f97316' },
  { id: 'deep_rhetoric', label: 'Rhetoric', category: 'passive', usageCount: 1, definition: 'The art of effective or persuasive speaking or writing.', collocation: 'empty rhetoric / brilliant rhetoric', color: '#f97316' },
  { id: 'active_mince', label: 'Mince words', category: 'active', usageCount: 11, definition: 'To speak indirectly and with careful deliberation.', collocation: 'not one to mince words', color: '#10b981' },

  // Cluster 3: Sadness & Reflection (Anchor)
  { id: 'anchor_sad', label: 'Sad / Past', category: 'anchor', usageCount: 30, color: '#c084fc' },
  { id: 'deep_melancholy', label: 'Melancholy', category: 'passive', usageCount: 2, definition: 'A feeling of pensive sadness, typically with no obvious cause.', collocation: 'a melancholy mood / air of melancholy', color: '#f97316' },
  { id: 'deep_despondent', label: 'Despondent', category: 'passive', usageCount: 0, definition: 'In low spirits from loss of hope or courage.', collocation: 'growing despondent', color: '#f97316' },
  { id: 'deep_wistful', label: 'Wistful', category: 'passive', usageCount: 0, definition: 'Having or showing a feeling of vague or regretful longing.', collocation: 'a wistful smile / wistful glance', color: '#f97316' },
  { id: 'deep_nostalgic', label: 'Nostalgic', category: 'passive', usageCount: 5, definition: 'A sentimental longing or wistful affection for the past.', collocation: 'feeling nostalgic', color: '#f97316' },

  // Cluster 4: Important & Essential (Anchor)
  { id: 'anchor_important', label: 'Important / Key', category: 'anchor', usageCount: 40, color: '#c084fc' },
  { id: 'deep_paramount', label: 'Paramount', category: 'passive', usageCount: 4, definition: 'More important than anything else; supreme.', collocation: 'of paramount importance', color: '#f97316' },
  { id: 'deep_imperative', label: 'Imperative', category: 'passive', usageCount: 3, definition: 'Of vital importance; crucial.', collocation: 'it is imperative that', color: '#f97316' },
  { id: 'deep_indispensable', label: 'Indispensable', category: 'passive', usageCount: 2, definition: 'Absolutely necessary.', collocation: 'an indispensable tool', color: '#f97316' },
  { id: 'active_crucial', label: 'Crucial', category: 'active', usageCount: 18, definition: 'Decisive or critical, especially in the success or failure of something.', collocation: 'a crucial decision', color: '#10b981' }
];

export const INITIAL_VOCABULARY_EDGES = [
  // Cluster 1 Edges
  { from: 'anchor_hard', to: 'deep_arduous', label: 'upgrade' },
  { from: 'anchor_hard', to: 'deep_formidable', label: 'upgrade' },
  { from: 'anchor_hard', to: 'deep_onerous', label: 'upgrade' },
  { from: 'anchor_hard', to: 'active_uphill', label: 'idiom' },
  { from: 'deep_arduous', to: 'deep_onerous', label: 'synonym' },

  // Cluster 2 Edges
  { from: 'anchor_speak', to: 'deep_articulate', label: 'upgrade' },
  { from: 'anchor_speak', to: 'deep_eloquence', label: 'upgrade' },
  { from: 'anchor_speak', to: 'deep_rhetoric', label: 'upgrade' },
  { from: 'anchor_speak', to: 'active_mince', label: 'idiom' },
  { from: 'deep_articulate', to: 'deep_eloquence', label: 'related' },

  // Cluster 3 Edges
  { from: 'anchor_sad', to: 'deep_melancholy', label: 'upgrade' },
  { from: 'anchor_sad', to: 'deep_despondent', label: 'upgrade' },
  { from: 'anchor_sad', to: 'deep_wistful', label: 'nuance' },
  { from: 'anchor_sad', to: 'deep_nostalgic', label: 'nuance' },
  { from: 'deep_wistful', to: 'deep_nostalgic', label: 'related' },
  { from: 'deep_melancholy', to: 'deep_despondent', label: 'intensity' },

  // Cluster 4 Edges
  { from: 'anchor_important', to: 'deep_paramount', label: 'upgrade' },
  { from: 'anchor_important', to: 'deep_imperative', label: 'upgrade' },
  { from: 'anchor_important', to: 'deep_indispensable', label: 'upgrade' },
  { from: 'anchor_important', to: 'active_crucial', label: 'synonym' },
  { from: 'deep_imperative', to: 'active_crucial', label: 'synonym' }
];
