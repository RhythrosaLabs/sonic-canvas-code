import React, { useState } from 'react';
import { BookOpen, Volume2, Eye, Sparkles, Copy, Check, ChevronRight } from 'lucide-react';

type Tab = 'audio' | 'visual' | 'sync';

interface Example {
  code: string;
  label: string;
}

interface Section {
  title: string;
  desc: string;
  examples: Example[];
  advanced?: Example[];
}

const CodingGuide = () => {
  const [tab, setTab] = useState<Tab>('audio');
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggle = (id: string) => {
    const s = new Set(expandedSections);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedSections(s);
  };

  const audioSections: Section[] = [
    {
      title: 'Fundamentals',
      desc: 'Basic note playing, tempo, and timing.',
      examples: [
        { code: 'play :C4, amp: 0.8, release: 0.5', label: 'Play a note with amplitude and release' },
        { code: 'sleep 1.0', label: 'Wait 1 second before next instruction' },
        { code: 'set_tempo 140', label: 'Set global tempo to 140 BPM' },
        { code: 'set_key :Am', label: 'Set musical key to A minor' },
      ],
      advanced: [
        { code: 'with_synth :saw do\n  play chord(:Am, :seventh), sustain: 2\nend', label: 'Play Am7 chord with saw synth' },
      ]
    },
    {
      title: 'Synthesis',
      desc: 'FM synthesis, filters, envelopes, and modulation.',
      examples: [
        { code: 'synth :fm, carrier: 440, modulator: 220, depth: 0.8', label: 'FM synthesis with carrier/modulator' },
        { code: 'filter :lpf, cutoff: 800, resonance: 0.7', label: 'Low-pass filter with resonance' },
        { code: 'envelope attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.0', label: 'ADSR envelope shaping' },
      ],
      advanced: [
        { code: 'modulate :cutoff do\n  lfo :sine, rate: 2, depth: 400\nend', label: 'LFO modulation on filter cutoff' },
      ]
    },
    {
      title: 'Effects',
      desc: 'Real-time audio effects and processing chains.',
      examples: [
        { code: 'with_fx :reverb, room: 0.8, damp: 0.5 do\n  play :C4\nend', label: 'Reverb with room size control' },
        { code: 'with_fx :delay, time: 0.25, feedback: 0.6 do', label: 'Tempo-synced delay' },
        { code: 'compress threshold: -12, ratio: 4, attack: 0.01', label: 'Dynamic compression' },
      ]
    }
  ];

  const visualSections: Section[] = [
    {
      title: 'Shapes & Colors',
      desc: 'Draw shapes, set colors, and transform objects.',
      examples: [
        { code: 'bg(0.1, 0.05, 0.2, 0.8)', label: 'Set background with RGBA' },
        { code: 'circle().radius(40).color(1, 0.5, 0)', label: 'Orange circle with radius 40' },
        { code: 'rect(100, 50).rotate(45).translate(10, 20)', label: 'Rotated, translated rectangle' },
        { code: 'polygon(sides: 6).radius(60).stroke(width: 2)', label: 'Hexagon outline' },
      ],
      advanced: [
        { code: 'shape(8).radius(() =&gt; audio.amp * 100 + 50)', label: 'Audio-reactive octagon' },
      ]
    },
    {
      title: 'Animation',
      desc: 'Dynamic motion synchronized with audio data.',
      examples: [
        { code: 'rotate(() =&gt; time * 60)', label: 'Continuous time-based rotation' },
        { code: 'scale(() =&gt; 1 + audio.beat * 0.5)', label: 'Beat-reactive scaling' },
        { code: 'oscillate("x", min: -50, max: 50, speed: 2)', label: 'Oscillating X position' },
      ],
      advanced: [
        { code: 'bezier(start: [0,0], cp1: [100,0], cp2: [100,100], end: [0,100])\n  .progress(() =&gt; audio.phase)', label: 'Bezier path following audio phase' },
      ]
    },
    {
      title: 'Effects & Particles',
      desc: 'Visual effects, blending, trails, and particle systems.',
      examples: [
        { code: 'blur(intensity: 5).glow(color: [1,1,1], size: 10)', label: 'Blur + glow combo' },
        { code: 'blend("multiply").opacity(0.7)', label: 'Multiply blend mode at 70%' },
        { code: 'trail(length: 20, fade: 0.95)', label: 'Motion trail with fade' },
        { code: 'particles(count: 50) {\n  spawn_rate(audio.beat ? 5 : 1)\n  shape("circle").life(120)\n}', label: 'Beat-synced particle spawning' },
      ]
    }
  ];

  const syncSections: Section[] = [
    {
      title: 'Audio Reactive Variables',
      desc: 'Use these in visual code to react to audio in real-time.',
      examples: [
        { code: 'audio.amp', label: 'Current amplitude (0-1) — volume/loudness' },
        { code: 'audio.freq', label: 'Dominant frequency in Hz' },
        { code: 'audio.beat', label: 'Boolean — true on beat detection' },
        { code: 'audio.phase', label: 'Current position in beat cycle (0-1)' },
        { code: 'time', label: 'Elapsed time in seconds' },
      ]
    },
    {
      title: 'Sync Patterns',
      desc: 'Common patterns for connecting audio to visuals.',
      examples: [
        { code: 'circle().radius(20 + audio.amp * 80)', label: 'Size reacts to volume' },
        { code: '.color([audio.freq/1000, 0.8, 1.0])', label: 'Color shifts with pitch' },
        { code: 'audio.beat ? 5 : 1', label: 'Conditional on beat detection' },
        { code: 'rotate(audio.phase * 360)', label: 'Rotation follows beat phase' },
      ]
    }
  ];

  const sections = tab === 'audio' ? audioSections : tab === 'visual' ? visualSections : syncSections;

  return (
    <div className="bg-sv-surface-1 rounded-xl border border-white/10 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-sv-purple" />
          <h2 className="text-lg font-bold gradient-text-synthvis">SynthVis Language Guide</h2>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 p-0.5 bg-sv-surface-0 rounded-lg">
          {[
            { id: 'audio' as Tab, label: 'Audio', icon: Volume2, color: 'text-sv-cyan' },
            { id: 'visual' as Tab, label: 'Visual', icon: Eye, color: 'text-sv-purple' },
            { id: 'sync' as Tab, label: 'Sync', icon: Sparkles, color: 'text-sv-pink' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                tab === t.id
                  ? `bg-sv-surface-2 ${t.color} shadow-sm`
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto sv-scrollbar p-5 space-y-4">
        {sections.map((section, si) => {
          const id = `${tab}-${si}`;
          const isOpen = expandedSections.has(id);
          return (
            <div key={id} className="rounded-lg border border-white/5 bg-sv-surface-0 overflow-hidden">
              <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{section.desc}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {section.examples.map((ex, ei) => (
                    <div key={ei} className="group flex items-start gap-2 p-2.5 rounded-md bg-sv-surface-1 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <code className="text-[11px] font-mono text-sv-cyan block whitespace-pre-wrap break-all">{ex.code}</code>
                        <p className="text-[10px] text-muted-foreground mt-1">{ex.label}</p>
                      </div>
                      <button onClick={() => copy(ex.code)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/5">
                        {copied === ex.code ? <Check className="w-3 h-3 text-sv-green" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                      </button>
                    </div>
                  ))}

                  {section.advanced && (
                    <>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground pt-2 pb-1 font-medium">Advanced</div>
                      {section.advanced.map((ex, ei) => (
                        <div key={ei} className="group flex items-start gap-2 p-2.5 rounded-md bg-sv-surface-2 border border-sv-purple/10 hover:border-sv-purple/20 transition-colors">
                          <div className="flex-1 min-w-0">
                            <code className="text-[11px] font-mono text-sv-purple block whitespace-pre-wrap break-all">{ex.code}</code>
                            <p className="text-[10px] text-muted-foreground mt-1">{ex.label}</p>
                          </div>
                          <button onClick={() => copy(ex.code)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/5">
                            {copied === ex.code ? <Check className="w-3 h-3 text-sv-green" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="px-5 py-3 border-t border-white/5 bg-sv-surface-0">
        <p className="text-[10px] text-muted-foreground">
          <span className="text-sv-yellow">💡 Tip:</span> Use{' '}
          <code className="text-sv-cyan bg-sv-surface-2 px-1 py-0.5 rounded text-[10px]">audio.amp</code>,{' '}
          <code className="text-sv-cyan bg-sv-surface-2 px-1 py-0.5 rounded text-[10px]">audio.beat</code>,{' '}
          <code className="text-sv-cyan bg-sv-surface-2 px-1 py-0.5 rounded text-[10px]">audio.freq</code> in visual code for reactive animations.
        </p>
      </div>
    </div>
  );
};

export default CodingGuide;
