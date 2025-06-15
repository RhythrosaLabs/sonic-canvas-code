
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
        placeholder={language === 'ruby' ? 'Enter your audio code here...' : 'Enter your visual code here...'}
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
      
      {/* Syntax highlighting simulation */}
      <div className="absolute inset-0 pointer-events-none p-4 pl-12">
        <pre className="text-transparent font-mono text-sm leading-[1.5] whitespace-pre-wrap">
          <code dangerouslySetInnerHTML={{ 
            __html: highlightSyntax(value, language) 
          }} />
        </pre>
      </div>
    </div>
  );
};

const highlightSyntax = (code: string, language: string): string => {
  if (language === 'ruby') {
    return code
      .replace(/\b(play|sleep|with_fx|times|do|end|chord)\b/g, '<span style="color: #ff79c6;">$1</span>')
      .replace(/:[A-Za-z0-9_]+/g, '<span style="color: #50fa7b;">$&</span>')
      .replace(/\b\d+\.?\d*\b/g, '<span style="color: #bd93f9;">$&</span>')
      .replace(/#.*$/gm, '<span style="color: #6272a4;">$&</span>');
  } else {
    return code
      .replace(/\b(bg|circle|scale|color|blend|particles|velocity|trail|audio|add)\b/g, '<span style="color: #ff79c6;">$1</span>')
      .replace(/\b\d+\.?\d*\b/g, '<span style="color: #bd93f9;">$&</span>')
      .replace(/\/\/.*$/gm, '<span style="color: #6272a4;">$&</span>')
      .replace(/\(\)/g, '<span style="color: #f1fa8c;">$&</span>');
  }
};

export default CodeEditor;
