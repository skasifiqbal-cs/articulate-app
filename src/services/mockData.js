export const INITIAL_VOCABULARY_NODES = [
  // Anchors (Basic words user already knows)
  { id: 'anchor_1', label: 'Big / Large', category: 'anchor', usageCount: 42, color: '#3b82f6' },
  { id: 'anchor_2', label: 'Boring / Slow', category: 'anchor', usageCount: 35, color: '#3b82f6' },
  { id: 'anchor_3', label: 'Bad / Dangerous', category: 'anchor', usageCount: 28, color: '#3b82f6' },
  { id: 'anchor_4', label: 'Important / Key', category: 'anchor', usageCount: 50, color: '#3b82f6' },
  { id: 'anchor_5', label: 'Happy / Relieved', category: 'anchor', usageCount: 19, color: '#3b82f6' },
  { id: 'anchor_6', label: 'Problem / Delay', category: 'anchor', usageCount: 30, color: '#3b82f6' },

  // Passive Deep Lexicon Words (Sitting in user's mind, target for activation)
  { id: 'deep_1', label: 'Colossal', category: 'passive', usageCount: 2, definition: 'Extremely large or immense in scale.', collocation: 'a colossal mistake / colossal scale', color: '#f97316' },
  { id: 'deep_2', label: 'Tedious', category: 'passive', usageCount: 1, definition: 'Too long, slow, or dull; tiresome or monotonous.', collocation: 'a tedious task / tedious process', color: '#f97316' },
  { id: 'deep_3', label: 'Precarious', category: 'passive', usageCount: 3, definition: 'Not securely held or in position; dangerously likely to fall.', collocation: 'a precarious position / precarious balance', color: '#f97316' },
  { id: 'deep_4', label: 'Paramount', category: 'passive', usageCount: 4, definition: 'More important than anything else; supreme.', collocation: 'of paramount importance', color: '#f97316' },
  { id: 'deep_5', label: 'Nostalgic', category: 'passive', usageCount: 2, definition: 'A feeling of pleasure and slight sadness when thinking about the past.', collocation: 'a nostalgic feeling / wave of nostalgia', color: '#f97316' },
  { id: 'deep_6', label: 'Immaculate', category: 'passive', usageCount: 0, definition: 'Perfectly clean, neat, or tidy; free from flaws.', collocation: 'immaculate record / immaculate timing', color: '#f97316' },
  { id: 'deep_7', label: 'Spinning our wheels', category: 'passive', usageCount: 1, definition: 'Wasting energy and time without making progress.', collocation: 'spinning our wheels in committee', color: '#f97316' },
  { id: 'deep_8', label: 'Deplorable', category: 'passive', usageCount: 0, definition: 'Deserving strong condemnation; shockingly bad.', collocation: 'deplorable conditions / deplorable choice', color: '#f97316' },
  { id: 'deep_9', label: 'Fastidious', category: 'passive', usageCount: 1, definition: 'Very attentive to and concerned about accuracy and detail.', collocation: 'fastidious attention to detail', color: '#f97316' },
  { id: 'deep_10', label: 'Wistful', category: 'passive', usageCount: 0, definition: 'Having or showing a feeling of vague or regretful longing.', collocation: 'a wistful gaze / wistful smile', color: '#f97316' },

  // Active Words (Successfully activated into user's speech)
  { id: 'active_1', label: 'Impassioned', category: 'active', usageCount: 14, definition: 'Filled with or showing great emotion or passion.', collocation: 'an impassioned plea', color: '#10b981' },
  { id: 'active_2', label: 'Setback', category: 'active', usageCount: 18, definition: 'A reversal or check in progress.', collocation: 'a minor setback / temporary setback', color: '#10b981' },
  { id: 'active_3', label: 'Belaboring', category: 'active', usageCount: 11, definition: 'Discussing or emphasizing something in excessive detail.', collocation: 'without belaboring the point', color: '#10b981' },
  { id: 'active_4', label: 'Ambiguity', category: 'active', usageCount: 15, definition: 'The quality of being open to more than one interpretation.', collocation: 'resolve ambiguity / eliminate ambiguity', color: '#10b981' }
];

export const INITIAL_VOCABULARY_EDGES = [
  { from: 'anchor_1', to: 'deep_1', label: 'upgrade' },
  { from: 'anchor_2', to: 'deep_2', label: 'upgrade' },
  { from: 'anchor_2', to: 'deep_7', label: 'idiom' },
  { from: 'anchor_3', to: 'deep_3', label: 'upgrade' },
  { from: 'anchor_3', to: 'deep_8', label: 'upgrade' },
  { from: 'anchor_4', to: 'deep_4', label: 'upgrade' },
  { from: 'anchor_5', to: 'deep_5', label: 'nuance' },
  { from: 'anchor_5', to: 'deep_10', label: 'nuance' },
  { from: 'anchor_6', to: 'active_2', label: 'synonym' },
  { from: 'anchor_2', to: 'active_3', label: 'idiom' },
  { from: 'deep_9', to: 'deep_6', label: 'related' }
];

export const SCENARIOS = [
  {
    id: 's1',
    title: 'Project Delay Explanation',
    category: 'Work & Professional',
    prompt: 'You are explaining to a senior stakeholder why a key project deliverable has been delayed by two weeks, without sounding defensive.',
    suggestedCues: ['setback', 'precarious', 'spinning our wheels', 'paramount']
  },
  {
    id: 's2',
    title: 'Debating a Strategic Direction',
    category: 'Debate & Persuasion',
    prompt: 'A colleague proposes a risky shortcut to save budget. Explain politely why this proposal could be dangerous and counterproductive in the long run.',
    suggestedCues: ['precarious', 'deplorable', 'belaboring', 'fastidious']
  },
  {
    id: 's3',
    title: 'Describing a Childhood Memory',
    category: 'Personal & Reflective',
    prompt: 'Describe an old rainy afternoon from your school days when you sat near the window thinking about your future.',
    suggestedCues: ['wistful', 'nostalgic', 'immaculate', 'colossal']
  },
  {
    id: 's4',
    title: 'Giving Critical Product Feedback',
    category: 'Technical & Design',
    prompt: 'Review a software tool that has great potential but suffers from slow load times and confusing user workflows.',
    suggestedCues: ['tedious', 'ambiguity', 'fastidious', 'setback']
  }
];

export const TABOO_CARDS = [
  {
    id: 't1',
    targetWord: 'PRECARIOUS',
    forbiddenWords: ['DANGEROUS', 'RISKY', 'SAFE', 'FALL', 'UNSTABLE'],
    definition: 'Not securely held or positioned; dangerously uncertain.'
  },
  {
    id: 't2',
    targetWord: 'TEDIOUS',
    forbiddenWords: ['BORING', 'SLOW', 'DULL', 'LONG', 'TIRED'],
    definition: 'Monotonous, repetitive, or dull work or task.'
  },
  {
    id: 't3',
    targetWord: 'PARAMOUNT',
    forbiddenWords: ['IMPORTANT', 'KEY', 'MAIN', 'FIRST', 'BIG'],
    definition: 'More important than anything else; supreme authority or status.'
  },
  {
    id: 't4',
    targetWord: 'FASTIDIOUS',
    forbiddenWords: ['PICKY', 'CLEAN', 'DETAIL', 'NEAT', 'PERFECT'],
    definition: 'Very attentive to and concerned about accuracy and detail.'
  },
  {
    id: 't5',
    targetWord: 'WISTFUL',
    forbiddenWords: ['SAD', 'HAPPY', 'PAST', 'MISS', 'MEMORY'],
    definition: 'Feeling a vague or regretful longing for something in the past.'
  }
];

export const SHADOWING_QUOTES = [
  {
    id: 'q1',
    quote: 'Eloquence is not the mere display of rare vocabulary, but the art of conveying complex truths with effortless precision.',
    speaker: 'Native Eloquence Master',
    difficulty: 'Intermediate'
  },
  {
    id: 'q2',
    quote: 'Instead of spinning our wheels in endless debate, we ought to focus our attention on the paramount objective before us.',
    speaker: 'Executive Leadership',
    difficulty: 'Advanced'
  },
  {
    id: 'q3',
    quote: 'Her fastidious attention to detail ensured that even under precarious circumstances, the execution remained immaculate.',
    speaker: 'Literary Prose',
    difficulty: 'Mastery'
  }
];
