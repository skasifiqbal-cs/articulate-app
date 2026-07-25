import React, { useState, useEffect, useRef } from 'react';
import { Zap, Timer, AlertTriangle, CheckCircle2, RotateCcw, Mic, MicOff, Trophy } from 'lucide-react';
import { TABOO_CARDS } from '../services/mockData.js';
import { guessTabooWord } from '../services/ai.js';
import confetti from 'canvas-confetti';

export default function TabooGame() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const currentCard = TABOO_CARDS[currentCardIndex];

  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  // Timer Countdown logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      stopGame();
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft]);

  const startGame = () => {
    setSpeechText('');
    setGameResult(null);
    setTimeLeft(30);
    setIsTimerRunning(true);

    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setSpeechText(text.trim());
      };
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopGame = async () => {
    setIsTimerRunning(false);
    clearInterval(timerRef.current);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (speechText.trim()) {
      setIsEvaluating(true);
      try {
        const result = await guessTabooWord(speechText, currentCard.targetWord, currentCard.forbiddenWords);
        setGameResult(result);
        if (result.isCorrect) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % TABOO_CARDS.length);
    setSpeechText('');
    setGameResult(null);
    setTimeLeft(30);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.1) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap color="var(--accent-amber)" size={24} /> Circumlocution Speed Run (Word Taboo)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Train your prefrontal cognitive flexibility! Describe the target concept out loud without using the forbidden crutch words before time runs out.
        </p>
      </div>

      {/* Main Taboo Game Card */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(245, 158, 11, 0.3)', position: 'relative' }}>
        
        {/* Card Header & Timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <span className="badge badge-amber">Card {currentCardIndex + 1} of {TABOO_CARDS.length}</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: timeLeft <= 5 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', color: timeLeft <= 5 ? 'var(--accent-rose)' : '#ffffff', fontWeight: 700 }}>
            <Timer size={16} /> {timeLeft}s Left
          </div>
        </div>

        {/* Target Word Display */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Target Concept</span>
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', letterSpacing: '0.05em', margin: '0.2rem 0' }}>
            {currentCard.targetWord}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>"{currentCard.definition}"</p>
        </div>

        {/* Forbidden Words Box */}
        <div className="glass-card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.05)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-rose)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={14} /> FORBIDDEN CRUTCH WORDS (DO NOT SAY)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
            {currentCard.forbiddenWords.map((word, i) => (
              <span key={i} className="badge badge-rose" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                🚫 {word}
              </span>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          {!isTimerRunning ? (
            <button onClick={startGame} className="btn btn-primary" style={{ background: 'var(--gradient-primary)', padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
              <Mic size={20} /> Start 30s Challenge
            </button>
          ) : (
            <button onClick={stopGame} className="btn btn-pulse" style={{ background: 'var(--accent-rose)', color: '#fff', padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
              <MicOff size={20} /> Finish & Evaluate
            </button>
          )}

          <button onClick={nextCard} className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
            Next Card <RotateCcw size={16} />
          </button>
        </div>

        {/* User Explanation Stream */}
        {speechText && (
          <div className="glass-card" style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Live Explanation Transcript</span>
            <p style={{ fontSize: '0.92rem', color: '#ffffff', marginTop: '0.3rem', margin: 0 }}>"{speechText}"</p>
          </div>
        )}

        {/* AI Result Card */}
        {gameResult && (
          <div className="glass-card animate-fade-in" style={{ borderColor: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <Trophy size={22} color="var(--accent-emerald)" />
              <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem' }}>AI Guessed: "{gameResult.guessedWord}"</h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{gameResult.feedback}</p>
          </div>
        )}

      </div>

    </div>
  );
}
