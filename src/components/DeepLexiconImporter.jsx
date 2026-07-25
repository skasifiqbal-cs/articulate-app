import React, { useState } from 'react';
import { BookOpen, Upload, CheckCircle2, Plus, FileText, Sparkles } from 'lucide-react';
import { addNodeToGraph, getNodes } from '../services/storage.js';
import confetti from 'canvas-confetti';

export default function DeepLexiconImporter({ onImportSuccess }) {
  const [importText, setImportText] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = (e) => {
    e.preventDefault();
    if (!importText.trim()) return;

    setIsProcessing(true);

    // Simple line-by-line parser for personal notes / Obsidian markdown
    const lines = importText.split('\n');
    let added = 0;

    lines.forEach(line => {
      const clean = line.replace(/^[*\-#\d.]+\s*/, '').trim();
      if (!clean) return;

      // Extract word and optional definition/collocation split by ':' or '-'
      let word = clean;
      let definition = 'Imported Deep Lexicon Note';
      let collocation = '';

      if (clean.includes(':')) {
        const parts = clean.split(':');
        word = parts[0].trim();
        definition = parts.slice(1).join(':').trim();
      } else if (clean.includes('-')) {
        const parts = clean.split('-');
        word = parts[0].trim();
        definition = parts.slice(1).join('-').trim();
      }

      if (word.length > 1 && word.length < 50) {
        addNodeToGraph(word, definition, 'passive', `native use of ${word}`, '');
        added++;
      }
    });

    setIsProcessing(false);
    setImportedCount(added);
    setImportText('');
    confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });

    if (onImportSuccess) onImportSuccess();
  };

  const sampleTemplate = `Colossal: Extremely large or immense in scale
Fastidious: Very attentive to and concerned about accuracy and detail
Precarious: Dangerously unstable or uncertain position
Belaboring: Emphasizing something in excessive detail
Wistful: Feeling a regretful longing for the past`;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen color="var(--accent-emerald)" size={24} /> Personal Deep Lexicon Importer
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Sync your personal reading lists, journal entries, or raw markdown notes from your Obsidian vault. The app auto-extracts your target vocabulary into your Semantic Web Graph!
        </p>
      </div>

      {/* Main Import Box */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        
        <form onSubmit={handleImport}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} color="var(--accent-purple)" /> Paste Vocabulary / Obsidian Markdown Notes
            </label>
            
            <button
              type="button"
              onClick={() => setImportText(sampleTemplate)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Load Sample Template
            </button>
          </div>

          <textarea
            rows={8}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`Paste line-by-line vocabulary notes here...
Example:
Word - Definition or collocation example
Fastidious - Very attentive to detail
Precarious - Dangerously unsecure position`}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontFamily: 'monospace',
              lineHeight: 1.5,
              marginBottom: '1.25rem'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Current Total Nodes in Graph: <strong>{getNodes().length}</strong>
            </span>

            <button
              type="submit"
              disabled={!importText.trim() || isProcessing}
              className="btn btn-emerald"
            >
              {isProcessing ? <Sparkles size={16} className="animate-spin" /> : <><Upload size={16} /> Batch Import to Semantic Web Graph</>}
            </button>
          </div>
        </form>

        {/* Success Confirmation Card */}
        {importedCount > 0 && (
          <div className="glass-card animate-fade-in" style={{ marginTop: '1.25rem', borderColor: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={22} color="var(--accent-emerald)" />
              <div>
                <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem' }}>{importedCount} Deep Lexicon Words Imported!</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  They are now visible in your <strong>Semantic Web Graph</strong> and ready for cueing in the <strong>Self-Talk Sandbox</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
