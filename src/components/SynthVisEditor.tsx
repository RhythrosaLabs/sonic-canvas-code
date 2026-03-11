import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Eye, Code2, BookOpen, X, Zap, Activity, Waves } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import WaveformVisualizer from './WaveformVisualizer';
import ShaderCanvas from './ShaderCanvas';
import CodeEditor from './CodeEditor';
import AudioEngine from './AudioEngine';
import CodingGuide from './CodingGuide';
import { useAudioVisualSync } from '@/hooks/useAudioVisualSync';

const SynthVisEditor = () => {
  const { syncState, updateAudioParams, updateVisualParams, setPlayState, updateAudioData, updateTime } = useAudioVisualSync();
  const [showGuide, setShowGuide] = useState(false);

  const [audioCode, setAudioCode] = useState(`// SynthVis — Audio Engine
set_tempo 128
set_key :Dm

// Layered pad with effects chain
with_synth :saw do
  with_fx :reverb, room: 0.8, damp: 0.6 do
    with_fx :lpf, cutoff: 1200, resonance: 0.7 do
      play chord(:Dm, :minor7), amp: 0.8, sustain: 1.5
      sleep 1.5
      play chord(:Bb, :major), amp: 0.7, sustain: 1
      sleep 1
      play chord(:F, :major), amp: 0.9, sustain: 1
      sleep 1
      play chord(:C, :major), amp: 0.8, sustain: 1.5
      sleep 1.5
    end
  end
end

// Modulated bass line
in_thread do
  with_synth :fm do
    modulate :carrier_freq, lfo: :sine, rate: 0.5, depth: 50
    loop do
      play :D2, amp: 1.2, release: 0.3
      sleep 0.5
      play :F2, amp: 0.9, release: 0.2
      sleep 0.25
      play :A2, amp: 1.0, release: 0.3
      sleep 0.25
    end
  end
end`);

  const [visualCode, setVisualCode] = useState(`// SynthVis — Visual Engine
bg(() => [
  0.1 + audio.amp * 0.2,
  0.05 + audio.beat * 0.1,
  0.2 + audio.freq/2000,
  0.9
])

// Audio-reactive mandala
group("mandala") {
  translate(width/2, height/2)

  for(let i = 0; i < 12; i++) {
    push()
    rotate(i * 30 + time * 30)
    translate(80 + audio.amp * 40, 0)

    circle()
      .radius(5 + audio.beat * 10)
      .color([
        (audio.freq/100 + i*0.1) % 1,
        0.8,
        0.9 + audio.amp * 0.1
      ])
      .glow(intensity: audio.amp * 20)
    pop()
  }

  polygon(sides: 6)
    .radius(50 + audio.amp * 30)
    .stroke(width: 2 + audio.beat * 3)
    .color([audio.phase, 0.7, 1.0])
    .rotate(time * 45)
    .blend("screen")
}

// Spectrum bars
spectrum(bands: 32) {
  position(0, height - 100)
  width(width)
  height(100)

  bar_style({
    color: (freq, amp) => [
      freq/1000, 0.8, 0.5 + amp * 0.5
    ],
    width: width/32 - 2,
    glow: audio.beat
  })
}

// Particle system
particles(count: 50) {
  spawn_rate(audio.beat ? 5 : 1)
  velocity(() => [
    random(-2, 2) * (1 + audio.amp),
    random(-3, -1) * (1 + audio.amp)
  ])

  shape("circle")
    .radius(() => random(2, 8) + audio.beat * 5)
    .color(() => [
      audio.phase + random(0, 0.2),
      0.7 + random(0, 0.3),
      0.9
    ])
    .life(120)
    .gravity(0, 0.1)
    .trail(length: 15, fade: 0.95)
}`);

  // Audio-visual sync effects
  useEffect(() => {
    const tempo = parseInt(audioCode.match(/set_tempo\s+(\d+)/)?.[1] || '120');
    const key = audioCode.match(/set_key\s+:([A-G][#b]?[m]?)/)?.[1] || 'C';
    const hasReverb = audioCode.includes('reverb');
    const hasFilter = audioCode.includes('lpf') || audioCode.includes('hpf');
    const hasModulation = audioCode.includes('modulate') || audioCode.includes('lfo');
    
    updateAudioParams({ tempo, key });
    
    if (hasReverb && hasFilter) {
      updateVisualParams({ particleCount: 75, intensity: 0.9, backgroundStyle: 'ethereal' });
    } else if (hasModulation) {
      updateVisualParams({ particleCount: 100, intensity: 0.8 });
    }
  }, [audioCode, updateAudioParams, updateVisualParams]);

  useEffect(() => {
    const particleCount = parseInt(visualCode.match(/particles\(count:\s*(\d+)\)/)?.[1] || '50');
    const hasSpectrum = visualCode.includes('spectrum');
    const hasGlow = visualCode.includes('glow');
    const hasTrail = visualCode.includes('trail');
    
    updateVisualParams({ particleCount });
    if (hasSpectrum && hasGlow) {
      updateAudioParams({ tempo: Math.min(syncState.audioParams.tempo + 8, 160) });
    }
    if (hasTrail && particleCount > 75) {
      updateVisualParams({ intensity: 0.95 });
    }
  }, [visualCode, updateVisualParams, updateAudioParams, syncState.audioParams.tempo]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (syncState.isPlaying) {
      interval = setInterval(() => updateTime(syncState.currentTime + 0.1), 100);
    }
    return () => clearInterval(interval);
  }, [syncState.isPlaying, syncState.currentTime, updateTime]);

  const handlePlay = () => setPlayState(!syncState.isPlaying);
  const handleStop = () => { setPlayState(false); updateTime(0); };

  const audioFnCount = (audioCode.match(/\b(play|with_synth|with_fx|modulate)\b/g) || []).length;
  const visualObjCount = (visualCode.match(/\b(circle|rect|polygon|particles|spectrum)\b/g) || []).length;

  return (
    <div className="h-screen flex flex-col bg-sv-surface-0 text-foreground overflow-hidden">
      <AudioEngine code={audioCode} isPlaying={syncState.isPlaying} tempo={syncState.audioParams.tempo} volume={syncState.audioParams.volume} onAudioData={updateAudioData} />

      {/* Guide Overlay */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="relative w-full max-w-5xl max-h-[85vh]">
            <button onClick={() => setShowGuide(false)} className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-sv-surface-2 border border-white/10 flex items-center justify-center hover:bg-sv-surface-3 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <CodingGuide />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-sv-surface-1 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-sv-cyan" />
            <h1 className="text-sm font-bold gradient-text-synthvis">SynthVis Pro</h1>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Audiovisual Engine</span>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowGuide(true)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-sv-surface-2 border border-white/5 hover:border-sv-green/30 hover:text-sv-green transition-all">
            <BookOpen className="w-3 h-3" />
            Guide
          </button>

          <div className="h-4 w-px bg-white/10" />

          <button onClick={handlePlay} className={`sv-transport-btn w-9 h-9 ${syncState.isPlaying ? 'bg-sv-pink shadow-[0_0_16px_hsl(330_85%_60%/0.4)]' : 'bg-sv-green shadow-[0_0_16px_hsl(150_80%_50%/0.3)]'}`}>
            {syncState.isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>

          <button onClick={handleStop} className="sv-transport-btn w-7 h-7 bg-sv-surface-3 border border-white/10 hover:border-destructive/50 hover:bg-destructive/20">
            <Square className="w-3 h-3" />
          </button>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-1.5 bg-sv-surface-2 rounded-md px-2 py-1 border border-white/5">
            <Volume2 className="w-3 h-3 text-muted-foreground" />
            <Slider value={[syncState.audioParams.volume]} onValueChange={(v) => updateAudioParams({ volume: v[0] })} max={100} step={1} className="w-16" />
            <span className="text-[10px] text-muted-foreground w-6 text-right">{syncState.audioParams.volume}</span>
          </div>

          <div className="flex items-center gap-2 bg-sv-surface-2 rounded-md px-2 py-1 border border-white/5">
            <div className={`sv-status-dot ${syncState.isPlaying ? 'sv-status-dot--active' : 'sv-status-dot--inactive'}`} />
            <span className="text-[10px] text-muted-foreground font-mono">{syncState.audioParams.tempo} BPM</span>
            <span className="text-[10px] text-sv-cyan font-mono">{syncState.audioParams.key}</span>
          </div>
        </div>
      </header>

      {/* Metrics bar */}
      <div className="h-7 flex items-center justify-between px-4 border-b border-white/5 bg-sv-surface-0 flex-shrink-0">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-sv-orange" />Amp: {(syncState.audioData.amplitude * 100).toFixed(0)}%</span>
          <span className="flex items-center gap-1"><Waves className="w-3 h-3 text-sv-cyan" />Freq: {syncState.audioData.frequency.toFixed(0)}Hz</span>
          <span>Phase: {(syncState.audioData.phase * 100).toFixed(0)}%</span>
          <span className={syncState.audioData.beat ? 'text-sv-pink' : ''}>Beat: {syncState.audioData.beat ? '●' : '○'}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>Particles: {syncState.visualParams.particleCount}</span>
          <span>Intensity: {Math.round(syncState.visualParams.intensity * 100)}%</span>
          <span className={syncState.isPlaying ? 'text-sv-green' : ''}>{syncState.isPlaying ? '● SYNCED' : '○ IDLE'}</span>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          {/* Audio Panel */}
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="h-full flex flex-col">
              <div className="sv-panel-header">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-sv-cyan" />
                  <span className="text-[11px] font-semibold text-sv-cyan">Audio</span>
                  <span className="sv-badge">{audioFnCount} fn</span>
                </div>
                <Code2 className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-h-0">
                <CodeEditor value={audioCode} onChange={setAudioCode} language="ruby" className="h-full" />
              </div>
              <div className="h-20 border-t border-white/5 relative flex-shrink-0">
                <WaveformVisualizer isPlaying={syncState.isPlaying} audioData={syncState.audioData} />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Visual Panel */}
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="h-full flex flex-col">
              <div className="sv-panel-header">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sv-purple" />
                  <span className="text-[11px] font-semibold text-sv-purple">Visual</span>
                  <span className="sv-badge">{visualObjCount} obj</span>
                </div>
                <Code2 className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-h-0">
                <CodeEditor value={visualCode} onChange={setVisualCode} language="javascript" className="h-full" />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="sv-panel-header">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sv-pink" />
                  <span className="text-[11px] font-semibold text-sv-pink">Preview</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                  <span>{syncState.currentTime.toFixed(1)}s</span>
                  <span>60fps</span>
                  <span className={syncState.isPlaying ? 'text-sv-green sv-glow-text' : 'text-muted-foreground'}>
                    {syncState.isPlaying ? '● LIVE' : '● OFF'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-h-0 relative bg-black">
                <ShaderCanvas code={visualCode} isPlaying={syncState.isPlaying} time={syncState.currentTime} audioData={syncState.audioData} visualParams={syncState.visualParams} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status bar */}
      <div className="h-6 flex items-center justify-between px-4 border-t border-white/5 bg-sv-surface-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground">SynthVis Pro v2.0 — Synchronized Audiovisual Coding</span>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>Web Audio API</span>
          <span>Canvas2D</span>
          <span className={syncState.isPlaying ? 'text-sv-green' : ''}>{syncState.isPlaying ? 'RUNNING' : 'IDLE'}</span>
        </div>
      </div>
    </div>
  );
};

export default SynthVisEditor;
