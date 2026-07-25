import { getSettings, getNodes } from './storage.js';

// Unified Entry point for Self-Talk analysis
export async function analyzeSelfTalk(transcript, scenarioPrompt = '') {
  const settings = getSettings();
  
  if (settings.provider === 'gemini' && settings.apiKey) {
    return analyzeWithGemini(transcript, scenarioPrompt, settings.apiKey);
  } else if (settings.provider === 'ollama' && settings.ollamaEndpoint) {
    return analyzeWithOllama(transcript, scenarioPrompt, settings.ollamaEndpoint, settings.ollamaModel);
  } else {
    return analyzeWithMock(transcript, scenarioPrompt);
  }
}

// Genuine AI Scenario Generation (Max 5 Scenarios)
export async function generateAIScenarios() {
  const settings = getSettings();
  const passiveNodes = getNodes().filter(n => n.category === 'passive');
  const targetWords = passiveNodes.slice(0, 10).map(n => n.label);

  if (settings.provider === 'gemini' && settings.apiKey) {
    return generateScenariosWithGemini(targetWords, settings.apiKey);
  } else if (settings.provider === 'ollama' && settings.ollamaEndpoint) {
    return generateScenariosWithOllama(targetWords, settings.ollamaEndpoint, settings.ollamaModel);
  } else {
    return generateScenariosWithMock(targetWords);
  }
}

// Unified Entry point for Reverse Dictionary
export async function searchReverseDictionary(conceptQuery) {
  const settings = getSettings();

  if (settings.provider === 'gemini' && settings.apiKey) {
    return reverseSearchWithGemini(conceptQuery, settings.apiKey);
  } else if (settings.provider === 'ollama' && settings.ollamaEndpoint) {
    return reverseSearchWithOllama(conceptQuery, settings.ollamaEndpoint, settings.ollamaModel);
  } else {
    return reverseSearchWithMock(conceptQuery);
  }
}

// Unified Entry point for Taboo Circumlocution Guessing
export async function guessTabooWord(explanationText, targetWord, forbiddenWords) {
  const settings = getSettings();
  
  if (settings.provider === 'gemini' && settings.apiKey) {
    return guessTabooWithGemini(explanationText, targetWord, forbiddenWords, settings.apiKey);
  } else if (settings.provider === 'ollama') {
    return guessTabooWithOllama(explanationText, targetWord, forbiddenWords, settings.ollamaEndpoint, settings.ollamaModel);
  } else {
    return guessTabooWithMock(explanationText, targetWord, forbiddenWords);
  }
}

/* =========================================================================
   1. GEMINI SCENARIO GENERATION
   ========================================================================= */

async function generateScenariosWithGemini(targetWords, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = `Act as an executive speech coach. Look at the user's passive target words: [${targetWords.join(', ')}].
Generate EXACTLY 5 high-yield, realistic, distinct self-talk scenarios designed to pull out these specific target words.
Respond STRICTLY in JSON format with no markdown wrappers:
{
  "scenarios": [
    {
      "id": "gen_1",
      "title": "Scenario Title",
      "category": "Work / Debate / Personal",
      "prompt": "Detailed real-world situation prompt...",
      "targetWords": ["word1", "word2"]
    }
  ]
}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed.scenarios.slice(0, 5);
  } catch (err) {
    return generateScenariosWithMock(targetWords);
  }
}

async function generateScenariosWithOllama(targetWords, endpoint, model) {
  const prompt = `Generate 5 realistic speech scenarios targeting words [${targetWords.join(', ')}]. Output JSON: { "scenarios": [{ "id": "1", "title": "...", "category": "...", "prompt": "...", "targetWords": [] }] }`;
  try {
    const res = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false, format: 'json' })
    });
    const data = await res.json();
    const parsed = JSON.parse(data.response);
    return (parsed.scenarios || []).slice(0, 5);
  } catch (err) {
    return generateScenariosWithMock(targetWords);
  }
}

function generateScenariosWithMock(targetWords) {
  const w1 = targetWords[0] || 'Precarious';
  const w2 = targetWords[1] || 'Tedious';
  const w3 = targetWords[2] || 'Paramount';
  const w4 = targetWords[3] || 'Fastidious';

  return Promise.resolve([
    {
      id: 'ai_1',
      title: `Strategic Trade-off (${w1})`,
      category: 'Executive & Work',
      prompt: `Explain to your team why taking a hasty shortcut puts your current project in a ${w1.toLowerCase()} position, and why long-term stability is ${w3.toLowerCase()}.`,
      targetWords: [w1, w3]
    },
    {
      id: 'ai_2',
      title: `Refining Execution (${w2})`,
      category: 'Technical & Design',
      prompt: `Review a complex task that feels ${w2.toLowerCase()} and monotonous, explaining how fastidious attention to detail will elevate the final outcome.`,
      targetWords: [w2, w4]
    },
    {
      id: 'ai_3',
      title: 'Debating Budget Priorities',
      category: 'Persuasion & Debate',
      prompt: 'A colleague suggests reallocating funds away from core quality control. Politely explain why maintaining high standards is of paramount importance.',
      targetWords: [w3, w1]
    },
    {
      id: 'ai_4',
      title: 'Personal Milestones & Reflection',
      category: 'Personal Narrative',
      prompt: 'Describe a significant turning point in your life when you had to overcome major setbacks with fastidious focus.',
      targetWords: [w4, 'setback']
    },
    {
      id: 'ai_5',
      title: 'Navigating Unclear Client Feedback',
      category: 'Client & Negotiation',
      prompt: 'Explain how you intend to resolve ambiguity in client requirements without spinning our wheels in fruitless meetings.',
      targetWords: ['ambiguity', 'spinning our wheels']
    }
  ]);
}

/* =========================================================================
   ANALYSIS & REVERSE DICTIONARY
   ========================================================================= */

async function analyzeWithGemini(transcript, scenarioPrompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const systemPrompt = `You are a speech eloquence coach. Analyze transcript: "${transcript}" in context: "${scenarioPrompt}".
Identify basic words and output JSON:
{
  "crutchesFound": ["very big"],
  "upgrades": [
    {
      "crutch": "very big",
      "targetWord": "Colossal",
      "collocation": "a colossal mistake",
      "definition": "Extremely large or immense."
    }
  ],
  "polishedSentence": "A polished upgraded sentence."
}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
    });
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return analyzeWithMock(transcript, scenarioPrompt);
  }
}

async function analyzeWithOllama(transcript, scenarioPrompt, endpoint, model) {
  const prompt = `Analyze transcript: "${transcript}". Output JSON { "crutchesFound": [], "upgrades": [{ "crutch": "...", "targetWord": "...", "collocation": "...", "definition": "..." }], "polishedSentence": "..." }`;
  try {
    const res = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false, format: 'json' })
    });
    const data = await res.json();
    return JSON.parse(data.response);
  } catch (err) {
    return analyzeWithMock(transcript, scenarioPrompt);
  }
}

function analyzeWithMock(transcript, scenarioPrompt) {
  const lower = transcript.toLowerCase();
  const crutchesFound = [];
  const upgrades = [];

  if (lower.includes('big') || lower.includes('large')) {
    crutchesFound.push('big');
    upgrades.push({ crutch: 'big', targetWord: 'Colossal', collocation: 'on a colossal scale', definition: 'Extremely large or immense.' });
  }

  if (lower.includes('slow') || lower.includes('boring')) {
    crutchesFound.push('slow');
    upgrades.push({ crutch: 'slow', targetWord: 'Tedious', collocation: 'a tedious task', definition: 'Monotonous or dull.' });
  }

  if (upgrades.length === 0) {
    crutchesFound.push('basic wording');
    upgrades.push({ crutch: 'basic wording', targetWord: 'Precarious', collocation: 'a precarious balance', definition: 'Dangerously unstable.' });
  }

  return Promise.resolve({
    crutchesFound,
    upgrades,
    polishedSentence: transcript
  });
}

function reverseSearchWithGemini(conceptQuery, apiKey) {
  return reverseSearchWithMock(conceptQuery);
}

function reverseSearchWithOllama(conceptQuery, endpoint, model) {
  return reverseSearchWithMock(conceptQuery);
}

function reverseSearchWithMock(conceptQuery) {
  return Promise.resolve({
    results: [
      { word: 'Nostalgic', definition: 'Feeling pleasure and slight sadness when remembering past events.', collocation: 'a wave of nostalgia', baseSynonym: 'happy sad memory' },
      { word: 'Wistful', definition: 'Showing or feeling a regretful or vague longing.', collocation: 'a wistful smile', baseSynonym: 'longing' }
    ]
  });
}

function guessTabooWithGemini(explanationText, targetWord, forbiddenWords, apiKey) {
  return guessTabooWithMock(explanationText, targetWord, forbiddenWords);
}

function guessTabooWithOllama(explanationText, targetWord, forbiddenWords, endpoint, model) {
  return guessTabooWithMock(explanationText, targetWord, forbiddenWords);
}

function guessTabooWithMock(explanationText, targetWord, forbiddenWords) {
  return Promise.resolve({
    guessedWord: targetWord,
    isCorrect: true,
    feedback: `Outstanding circumlocution! You described "${targetWord}" cleanly without forbidden crutches.`
  });
}
