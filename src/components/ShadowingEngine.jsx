import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Volume2, Mic, MicOff, CheckCircle2, RotateCcw, Play } from 'lucide-react';
import { SHADOWING_QUOTES } from '../services/mockData.js';

export default function ShadowingEngine() {
  const [selectedQuote, setSelectedQuote] = useState(SHADOWING_QUOTES[0]);
  const [isPlayingNative, setIsPlayingNative] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [matchScore, setMatchScore] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  // Play Native Speech
  const playNativeAudio = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedQuote.quote);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsPlayingNative(true);
    utterance.onend = () => setIsPlayingNative(false);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle User Shadowing Recording
  const toggleShadowingRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);

      // Evaluate match score
      const targetWords = selectedQuote.quote.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
      const spokenWords = userTranscript.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
      
      let hits = 0;
      targetWords.forEach(w => {
        if (spokenWords.includes(w)) hits++;
      });

      const score = Math.round((hits / targetWords.length) * 100);
      setMatchScore(score);
    } else {
      setUserTranscript('');
      setMatchScore(null);

      recognitionRef.current.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setUserTranscript(text.trim());
      };

      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Headphones color="var(--accent-purple)" size={24} /> The Shadowing Engine (Prosody & Flow)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Train your speech motor memory. Listen to native rhythm and stress patterns, then speak along immediately to automate articulate sentence formulation.
        </p>
      </div>

      {/* Quote Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {SHADOWING_QUOTES.map(q => (
          <div
            key={q.id}
            onClick={() => {
              setSelectedQuote(q);
              setUserTranscript('');
              setMatchScore(null);
            }}
            className="glass-card"
            style={{
              cursor: 'pointer',
              borderColor: selectedQuote.id === q.id ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)',
              background: selectedQuote.id === q.id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(30, 41, 59, 0.4)'
            }}
          >
            <span className="badge badge-purple" style={{ fontSize: '0.68rem', marginBottom: '0.4rem' }}>{q.difficulty}</span>
            <p style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 500, margin: '0.3rem 0' }}>"{q.quote}"</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— {q.speaker}</span>
          </div>
        ))}
      </div>

      {/* Shadowing Studio Box */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase' }}>Target Native Phrase</span>
          <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginTop: '0.4rem', lineHeight: 1.5 }}>
            "{selectedQuote.quote}"
          </h3>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          
          {/* Native Audio Button */}
          <button
            onClick={playNativeAudio}
            disabled={isPlayingNative}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Volume2 size={18} color="var(--accent-cyan)" />
            {isPlayingNative ? 'Playing Native Audio...' : 'Listen to Native Audio'}
          </button>

          {/* Record Shadowing Button */}
          <button
            onClick={toggleShadowingRecording}
            className={`btn ${isRecording ? 'btn-pulse' : 'btn-emerald'}`}
            style={{ padding: '0.75rem 1.25rem' }}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            {isRecording ? 'Stop Shadowing' : 'Record Shadowing'}
          </button>
        </div>

        {/* User Transcript & Score */}
        {userTranscript && (
          <div className="glass-card animate-fade-in" style={{ textAlign: 'center', borderColor: matchScore && matchScore > 75 ? 'var(--accent-emerald)' : 'var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Shadowed Speech Transcript</span>
            <p style={{ fontSize: '1rem', color: '#ffffff', margin: '0.4rem 0' }}>"{userTranscript}"</p>
            
            {matchScore !== null && (
              <div style={{ marginTop: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: matchScore > 75 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)' }}>
                <CheckCircle2 size={16} color={matchScore > 75 ? '#34d399' : '#fbbf24'} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Flow & Accuracy Score: {matchScore}%</span>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
