import React, { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language, className }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = value.split('\n');

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [value, onChange]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Line numbers */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-10 border-r border-white/5 select-none z-10 overflow-hidden"
        style={{ background: 'hsl(240 12% 6%)' }}
      >
        <div className="pt-3 pb-3">
          {lines.map((_, i) => (
            <div
              key={i}
              className="text-[11px] leading-[1.6] text-right pr-2 font-mono"
              style={{ color: 'hsl(220 10% 35%)' }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Code textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-full pl-12 pr-4 pt-3 pb-3 bg-transparent text-transparent caret-white font-mono text-[12px] leading-[1.6] outline-none resize-none sv-scrollbar relative z-20"
        style={{ background: 'hsl(240 15% 5%)' }}
        spellCheck={false}
      />

      {/* Syntax highlighted overlay */}
      <div className="absolute inset-0 pl-12 pr-4 pt-3 pb-3 pointer-events-none z-10 overflow-hidden">
        <pre className="font-mono text-[12px] leading-[1.6] whitespace-pre-wrap break-words">
          <code dangerouslySetInnerHTML={{ __html: highlightSyntax(value, language) }} />
        </pre>
      </div>
    </div>
  );
};

const highlightSyntax = (code: string, language: string): string => {
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (language === 'ruby') {
    result = result
      // Comments first
      .replace(/(\/\/.*$|#.*$)/gm, '<span style="color:#565f89;font-style:italic">$1</span>')
      // Keywords
      .replace(/\b(play|sleep|with_synth|with_fx|set_tempo|set_key|in_thread|loop|modulate|filter|envelope|synth|compress|do|end|if|then|else|while|for|in|times)\b/g, '<span style="color:#bb9af7">$1</span>')
      // Synth types
      .replace(/:(saw|sine|square|fm|lpf|hpf|reverb|delay|distortion|chorus|lfo|Dm|Bb|Am|C|F|G|D|E|A|B)\b/g, ':<span style="color:#7dcfff">$1</span>')
      // Params
      .replace(/\b(amp|sustain|release|attack|decay|cutoff|resonance|room|damp|time|feedback|rate|depth|carrier_freq|modulator|carrier)\b(?=:)/g, '<span style="color:#e0af68">$1</span>')
      // Chord types
      .replace(/\b(chord|major|minor|minor7|seventh|ninth|sus4|sus2|dim|aug)\b/g, '<span style="color:#9ece6a">$1</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#ff9e64">$1</span>');
  } else {
    result = result
      // Comments first
      .replace(/(\/\/.*$)/gm, '<span style="color:#565f89;font-style:italic">$1</span>')
      // Keywords
      .replace(/\b(bg|circle|rect|polygon|particles|spectrum|group|translate|rotate|scale|push|pop|for|let|if|else|const|var|return)\b/g, '<span style="color:#bb9af7">$1</span>')
      // Properties
      .replace(/\b(radius|width|height|color|glow|blur|trail|blend|opacity|stroke|fill|spawn_rate|velocity|life|gravity|intensity|position|bar_style|shape|fade|length|count|sides|bands)\b(?=[\s:(])/g, '<span style="color:#e0af68">$1</span>')
      // Audio reactive
      .replace(/\b(audio\.(amp|freq|beat|phase)|time)\b/g, '<span style="color:#7dcfff">$1</span>')
      // Math
      .replace(/\b(random|sin|cos|tan|abs|min|max|floor|ceil|round|Math)\b/g, '<span style="color:#9ece6a">$1</span>')
      // Strings
      .replace(/"([^"]*)"/g, '<span style="color:#9ece6a">"$1"</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#ff9e64">$1</span>')
      // Functions
      .replace(/(\w+)\s*\(/g, '<span style="color:#7aa2f7">$1</span>(');
  }

  return result;
};

export default CodeEditor;
