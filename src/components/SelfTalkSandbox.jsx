import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RefreshCw, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Play, Eye, EyeOff, Shuffle } from 'lucide-react';
import { analyzeSelfTalk, generateAIScenarios } from '../services/ai.js';
import { markNodeAsActive, addNodeToGraph, getNodes } from '../services/storage.js';
import confetti from 'canvas-confetti';

export default function SelfTalkSandbox() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Active Retry Loop State
  const [inRetryMode, setInRetryMode] = useState(false);
  const [isRetryRecording, setIsRetryRecording] = useState(false);
  const [retryTranscript, setRetryTranscript] = useState('');
  const [retrySuccess, setRetrySuccess] = useState(false);
  const [revealedOriginal, setRevealedOriginal] = useState(false);

  const recognitionRef = useRef(null);

  // Load initial AI scenarios on mount
  useEffect(() => {
    loadScenarios();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  const loadScenarios = async () => {
    setIsGeneratingScenarios(true);
    try {
      const list = await generateAIScenarios();
      const cappedList = (list || []).slice(0, 5); // At max 5 scenarios!
      setScenarios(cappedList);
      if (cappedList.length > 0) setSelectedScenario(cappedList[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingScenarios(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setAnalysisResult(null);
      setInRetryMode(false);
      
      recognitionRef.current.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    try {
      const activePrompt = customPrompt || selectedScenario?.prompt || '';
      const result = await analyzeSelfTalk(transcript, activePrompt);
      setAnalysisResult(result);
      if (result.upgrades) {
        result.upgrades.forEach(u => {
          addNodeToGraph(u.targetWord, u.definition, 'passive', u.collocation, u.crutch);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRetryRecording = () => {
    if (!recognitionRef.current) return;

    if (isRetryRecording) {
      recognitionRef.current.stop();
      setIsRetryRecording(false);

      if (analysisResult?.upgrades) {
        const spokenLower = retryTranscript.toLowerCase();
        let matched = false;
        analysisResult.upgrades.forEach(u => {
          if (spokenLower.includes(u.targetWord.toLowerCase())) {
            matched = true;
            markNodeAsActive(u.targetWord);
          }
        });
        if (matched || spokenLower.length > 10) {
          setRetrySuccess(true);
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
      }
    } else {
      setRetryTranscript('');
      setRetrySuccess(false);

      recognitionRef.current.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setRetryTranscript(currentText.trim());
      };

      recognitionRef.current.start();
      setIsRetryRecording(true);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Mobile Stacked Grid */}
      <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.25rem' }}>
        
        {/* Scenario List (Capped at 5 Scenarios) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} color="var(--accent-purple)" /> AI Daily Scenarios (Max 5)
            </h3>
            <button
              onClick={loadScenarios}
              disabled={isGeneratingScenarios}
              className="btn btn-secondary"
              style={{ padding: '0.2rem 0.5rem', minHeight: '30px', fontSize: '0.72rem', color: 'var(--accent-purple)' }}
              title="Generate 5 fresh AI scenarios"
            >
              <RefreshCw size={12} className={isGeneratingScenarios ? 'animate-spin' : ''} /> Refresh 5 Scenarios
            </button>
          </div>

          {isGeneratingScenarios ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <RefreshCw size={20} className="animate-spin" color="var(--accent-purple)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                AI is analyzing your deep lexicon graph and engineering 5 targeted scenarios...
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
              {scenarios.map((sc, idx) => (
                <div
                  key={sc.id || idx}
                  onClick={() => { setSelectedScenario(sc); setCustomPrompt(''); }}
                  className="glass-card"
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedScenario?.id === sc.id && !customPrompt ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.08)',
                    background: selectedScenario?.id === sc.id && !customPrompt ? 'rgba(139, 92, 246, 0.18)' : 'rgba(30, 41, 59, 0.45)',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#ffffff' }}>{sc.title}</h4>
                    <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>{sc.category}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{sc.prompt}</p>
                </div>
              ))}
            </div>
          )}

          {/* Custom Topic Input */}
          <div className="glass-card">
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Or enter custom topic:
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Explaining why I want to learn French..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                resize: 'none'
              }}
            />
          </div>
        </div>

        {/* Right Studio Area */}
        <div>
          
          {/* Active Prompt Box */}
          <div className="glass-card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--accent-purple)', padding: '0.85rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase' }}>Active Scenario Prompt</span>
            <p style={{ fontSize: '0.88rem', color: '#ffffff', marginTop: '0.2rem', margin: 0 }}>
              "{customPrompt || selectedScenario?.prompt}"
            </p>
          </div>

          {/* Recording & Mic Button */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <button
                onClick={toggleRecording}
                className={`btn ${isRecording ? 'btn-pulse' : 'btn-primary'}`}
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  padding: 0,
                  background: isRecording ? 'var(--accent-rose)' : 'var(--gradient-primary)',
                  boxShadow: isRecording ? '0 0 25px rgba(244, 63, 94, 0.5)' : '0 0 25px rgba(139, 92, 246, 0.4)'
                }}
              >
                {isRecording ? <MicOff size={32} color="#ffffff" /> : <Mic size={32} color="#ffffff" />}
              </button>
              
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: isRecording ? 'var(--accent-rose)' : '#ffffff' }}>
                  {isRecording ? '● Recording... Speak Naturally' : (transcript ? 'Recording Captured!' : 'Tap Mic & Start Speaking')}
                </p>
              </div>
            </div>

            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words appear here automatically..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                resize: 'none'
              }}
            />

            <div style={{ marginTop: '0.85rem' }}>
              <button
                onClick={handleAnalyze}
                disabled={!transcript.trim() || isAnalyzing}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {isAnalyzing ? <><RefreshCw size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Analyze & Upgrade Speech</>}
              </button>
            </div>
          </div>

          {/* Upgrade Cards */}
          {analysisResult && (
            <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck color="var(--accent-emerald)" size={18} /> Deep Lexicon Upgrades
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                {analysisResult.upgrades?.map((upg, idx) => (
                  <div key={idx} className="glass-card" style={{ borderLeft: '3px solid var(--accent-emerald)', padding: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', textDecoration: 'line-through' }}>{upg.crutch}</span>
                      <ArrowRight size={12} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{upg.targetWord}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, margin: '0.1rem 0' }}>
                      Pairing: <span style={{ color: 'var(--accent-cyan)' }}>"{upg.collocation}"</span>
                    </p>
                  </div>
                ))}
              </div>

              <button onClick={() => setInRetryMode(true)} className="btn btn-emerald" style={{ width: '100%' }}>
                <Play size={16} /> Launch Active Retry Loop
              </button>
            </div>
          )}

          {/* Active Reconstruction Studio */}
          {inRetryMode && (
            <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderColor: 'var(--accent-emerald)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--accent-emerald)' }}>Active Reconstruction Studio</h3>
                <button onClick={() => setRevealedOriginal(!revealedOriginal)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', minHeight: '30px', fontSize: '0.72rem' }}>
                  {revealedOriginal ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>

              <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <p className={revealedOriginal ? '' : 'text-mask-blur'} style={{ fontSize: '0.88rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.85rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                  {transcript}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                  Cue Words to Speak:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {analysisResult?.upgrades?.map((upg, i) => (
                    <span key={i} className="badge badge-emerald" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                      🔑 [{upg.targetWord}]
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={toggleRetryRecording}
                  className={`btn ${isRetryRecording ? 'btn-pulse' : 'btn-emerald'}`}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0 }}
                >
                  {isRetryRecording ? <MicOff size={28} color="#ffffff" /> : <Mic size={28} color="#ffffff" />}
                </button>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {isRetryRecording ? 'Listening...' : 'Tap Mic & re-speak using cue words!'}
                </p>
              </div>

              {retrySuccess && (
                <div className="glass-card animate-fade-in" style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--accent-emerald)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={20} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>Verified! Node logged as Active!</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
