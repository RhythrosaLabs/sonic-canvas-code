
import React from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language, className }) => {
  return (
    <div className={cn("relative", className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-black/60 text-green-300 font-mono text-sm p-4 border-0 outline-none resize-none backdrop-blur-sm"
        style={{
          lineHeight: '1.5',
          tabSize: 2,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
        }}
        spellCheck={false}
        placeholder={language === 'ruby' ? 'Enter your advanced audio code here...' : 'Enter your advanced visual code here...'}
      />
      
      {/* Line numbers overlay */}
      <div className="absolute left-0 top-0 p-4 pointer-events-none">
        <div className="text-gray-600 font-mono text-sm leading-[1.5]">
          {value.split('\n').map((_, index) => (
            <div key={index} className="text-right w-6">
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced syntax highlighting */}
      <div className="absolute inset-0 pointer-events-none p-4 pl-12">
        <pre className="text-transparent font-mono text-sm leading-[1.5] whitespace-pre-wrap">
          <code dangerouslySetInnerHTML={{ 
            __html: highlightAdvancedSyntax(value, language) 
          }} />
        </pre>
      </div>
    </div>
  );
};

const highlightAdvancedSyntax = (code: string, language: string): string => {
  if (language === 'ruby') {
    return code
      // Core audio functions
      .replace(/\b(play|sleep|with_synth|with_fx|set_tempo|set_key|in_thread|loop|modulate|filter|envelope|synth|compress)\b/g, '<span style="color: #ff79c6;">$1</span>')
      // Synthesis types and effects
      .replace(/\b(saw|sine|square|fm|lpf|hpf|reverb|delay|distortion|chorus|lfo)\b/g, '<span style="color: #8be9fd;">$1</span>')
      // Parameters
      .replace(/\b(amp|sustain|release|attack|decay|cutoff|resonance|room|damp|time|feedback|rate|depth|carrier|modulator)\b/g, '<span style="color: #ffb86c;">$1</span>')
      // Notes and chords
      .replace(/:[A-G][#b]?\d?/g, '<span style="color: #50fa7b;">$&</span>')
      .replace(/\b(chord|major|minor|seventh|ninth|sus4|sus2|dim|aug)\b/g, '<span style="color: #50fa7b;">$1</span>')
      // Numbers
      .replace(/\b\d+\.?\d*\b/g, '<span style="color: #bd93f9;">$&</span>')
      // Comments
      .replace(/#.*$/gm, '<span style="color: #6272a4;">$&</span>')
      // Control structures
      .replace(/\b(do|end|if|then|else|elsif|while|for|in|times)\b/g, '<span style="color: #ff5555;">$1</span>');
  } else {
    return code
      // Core visual functions
      .replace(/\b(bg|circle|rect|polygon|particles|spectrum|group|translate|rotate|scale|push|pop|for|let|if|else)\b/g, '<span style="color: #ff79c6;">$1</span>')
      // Visual properties
      .replace(/\b(radius|width|height|color|glow|blur|trail|blend|opacity|stroke|fill|spawn_rate|velocity|life|gravity)\b/g, '<span style="color: #ffb86c;">$1</span>')
      // Audio reactive variables
      .replace(/\b(audio\.amp|audio\.freq|audio\.beat|audio\.phase|time|width|height)\b/g, '<span style="color: #8be9fd;">$1</span>')
      // Functions and methods
      .replace(/\b(random|sin|cos|tan|abs|min|max|floor|ceil|round)\b/g, '<span style="color: #50fa7b;">$1</span>')
      // Blend modes and effects
      .replace(/\b(add|multiply|screen|overlay|soft-light|hard-light|difference|exclusion)\b/g, '<span style="color: #f1fa8c;">$1</span>')
      // Numbers
      .replace(/\b\d+\.?\d*\b/g, '<span style="color: #bd93f9;">$&</span>')
      // Comments
      .replace(/\/\/.*$/gm, '<span style="color: #6272a4;">$&</span>')
      // Strings
      .replace(/"[^"]*"/g, '<span style="color: #f1fa8c;">$&</span>')
      .replace(/'[^']*'/g, '<span style="color: #f1fa8c;">$&</span>')
      // Operators and brackets
      .replace(/[(){}[\]]/g, '<span style="color: #f8f8f2;">$&</span>')
      .replace(/[+\-*\/=<>!&|]/g, '<span style="color: #ff5555;">$&</span>');
  }
};

export default CodeEditor;
