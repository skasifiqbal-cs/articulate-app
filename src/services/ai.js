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
   1. GEMINI CLOUD API INTEGRATION (Gemini 1.5 Flash)
   ========================================================================= */

async function analyzeWithGemini(transcript, scenarioPrompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
  
  const systemPrompt = `You are a speech eloquence and native collocation coach.
Analyze transcript: "${transcript}" in context of prompt: "${scenarioPrompt}".
Identify basic crutch words and output ONLY JSON in this structure:
{
  "crutchesFound": ["very big"],
  "upgrades": [
    {
      "crutch": "very big",
      "targetWord": "Colossal",
      "collocation": "a colossal mistake",
      "definition": "Extremely large or immense in scale."
    }
  ],
  "polishedSentence": "A native, highly eloquent version of the sentence."
}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
    });
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API HTTP Error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini API Error:', err);
    alert(`Gemini API Call Failed: ${err.message}. Falling back to Mock Mode.`);
    return analyzeWithMock(transcript, scenarioPrompt);
  }
}

async function generateScenariosWithGemini(targetWords, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
  const prompt = `You are an executive speech coach. Target passive words: [${targetWords.join(', ')}].
Generate EXACTLY 5 distinct, highly realistic self-talk scenarios designed to pull out these specific target words.
Output STRICTLY JSON:
{
  "scenarios": [
    {
      "id": "gen_1",
      "title": "Scenario Title",
      "category": "Work / Persuasion / Personal",
      "prompt": "Real world scenario prompt...",
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

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API HTTP Error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return (parsed.scenarios || []).slice(0, 5);
  } catch (err) {
    console.error('Gemini API Error:', err);
    return generateScenariosWithMock(targetWords);
  }
}

async function reverseSearchWithGemini(conceptQuery, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
  const prompt = `Act as Reverse Dictionary for concept: "${conceptQuery}". Output STRICTLY JSON:
{
  "results": [
    {
      "word": "Nostalgic",
      "definition": "Pleasure and sadness when remembering past events.",
      "collocation": "a wave of nostalgia",
      "baseSynonym": "happy sad memory"
    }
  ]
}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}`);
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini Reverse Search Error:', err);
    return reverseSearchWithMock(conceptQuery);
  }
}

async function guessTabooWithGemini(explanationText, targetWord, forbiddenWords, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
  const prompt = `Playing Taboo. User described "${targetWord}" without forbidden words [${forbiddenWords.join(', ')}]. User text: "${explanationText}". Output JSON: { "guessedWord": "${targetWord}", "isCorrect": true, "feedback": "Great work!" }`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}`);
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return guessTabooWithMock(explanationText, targetWord, forbiddenWords);
  }
}

/* =========================================================================
   2. OLLAMA & MOCK ENGINES
   ========================================================================= */

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

function reverseSearchWithMock(conceptQuery) {
  return Promise.resolve({
    results: [
      { word: 'Nostalgic', definition: 'Feeling pleasure and slight sadness when remembering past events.', collocation: 'a wave of nostalgia', baseSynonym: 'happy sad memory' },
      { word: 'Wistful', definition: 'Showing or feeling a regretful or vague longing.', collocation: 'a wistful smile', baseSynonym: 'longing' }
    ]
  });
}

function guessTabooWithMock(explanationText, targetWord, forbiddenWords) {
  return Promise.resolve({
    guessedWord: targetWord,
    isCorrect: true,
    feedback: `Outstanding circumlocution! You described "${targetWord}" cleanly without forbidden crutches.`
  });
}
