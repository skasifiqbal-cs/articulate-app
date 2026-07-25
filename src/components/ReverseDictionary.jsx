import React, { useState, useRef, useEffect } from 'react';
import { Search, Volume2, Plus, Sparkles, Check, Mic, MicOff } from 'lucide-react';
import { searchReverseDictionary } from '../services/ai.js';
import { addNodeToGraph } from '../services/storage.js';

export default function ReverseDictionary() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [addedWords, setAddedWords] = useState({});

  // Voice Input for Query
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setQuery(text);
        setIsRecording(false);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setQuery('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await searchReverseDictionary(query);
      setResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Text-To-Speech Pronunciation
  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add word to Semantic Web Graph
  const handleAddToGraph = (item) => {
    addNodeToGraph(item.word, item.definition, 'passive', item.collocation, item.baseSynonym);
    setAddedWords({ ...addedWords, [item.word]: true });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search color="var(--accent-cyan)" size={24} /> Tip-of-the-Tongue Resolver (Reverse Dictionary)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Stuck trying to find the exact word for a situation? Describe the messy concept or feeling in your own words, and get precise C1/C2 native vocabulary.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          <button
            type="button"
            onClick={toggleMic}
            className={`btn ${isRecording ? 'btn-pulse' : 'btn-secondary'}`}
            style={{ padding: '0.65rem' }}
            title="Speak your concept"
          >
            {isRecording ? <MicOff size={18} color="var(--accent-rose)" /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'feeling happy and sad at the same time when remembering home'..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="btn btn-primary"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {isSearching ? <Sparkles size={18} className="animate-spin" /> : <><Search size={18} /> Find Word</>}
          </button>
        </div>
      </form>

      {/* Results Grid */}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.2rem' }}>
            Precise Vocabulary Results ({results.length})
          </h3>

          {results.map((item, idx) => (
            <div key={idx} className="glass-panel animate-fade-in" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h4 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>{item.word}</h4>
                  <button
                    onClick={() => speakWord(item.word)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--accent-cyan)' }}
                    title="Listen to pronunciation"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                <button
                  onClick={() => handleAddToGraph(item)}
                  disabled={addedWords[item.word]}
                  className={`btn ${addedWords[item.word] ? 'btn-emerald' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                >
                  {addedWords[item.word] ? <><Check size={14} /> Added to Graph</> : <><Plus size={14} /> Add to Deep Lexicon</>}
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.3rem 0' }}>
                {item.definition}
              </p>

              <div style={{ marginTop: '0.65rem', padding: '0.5rem 0.85rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'inline-block' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Native Collocation: </span>
                <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>"{item.collocation}"</span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
