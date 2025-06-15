
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Eye, Code2, Settings, RefreshCw, Palette, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import WaveformVisualizer from './WaveformVisualizer';
import ShaderCanvas from './ShaderCanvas';
import CodeEditor from './CodeEditor';
import AudioEngine from './AudioEngine';
import CodingGuide from './CodingGuide';
import { useAudioVisualSync } from '@/hooks/useAudioVisualSync';

const SynthVisEditor = () => {
  const { 
    syncState, 
    updateAudioParams, 
    updateVisualParams, 
    setPlayState, 
    updateAudioData, 
    updateTime 
  } = useAudioVisualSync();

  const [showGuide, setShowGuide] = useState(false);

  const [audioCode, setAudioCode] = useState(`// SynthVis Advanced Audio Programming
set_tempo 128
set_key :Dm

// Main progression with complex synthesis
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

// Rhythmic bass line with modulation
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
  
  const [visualCode, setVisualCode] = useState(`// SynthVis Advanced Visual Programming
// Dynamic background with audio reactivity
bg(() => [
  0.1 + audio.amp * 0.2,
  0.05 + audio.beat * 0.1,
  0.2 + audio.freq/2000,
  0.9
])

// Central audio-reactive mandala
group("mandala") {
  translate(width/2, height/2)
  
  // Outer ring of particles
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
  
  // Inner geometric pattern
  polygon(sides: 6)
    .radius(50 + audio.amp * 30)
    .stroke(width: 2 + audio.beat * 3)
    .color([audio.phase, 0.7, 1.0])
    .rotate(time * 45)
    .blend("screen")
}

// Audio spectrum visualization
spectrum(bands: 32) {
  position(0, height - 100)
  width(width)
  height(100)
  
  bar_style({
    color: (freq, amp) => [
      freq/1000,
      0.8,
      0.5 + amp * 0.5
    ],
    width: width/32 - 2,
    glow: audio.beat
  })
}

// Floating reactive shapes
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

  // Sync audio code changes to visual parameters
  useEffect(() => {
    const tempo = audioCode.match(/set_tempo\s+(\d+)/)?.[1] ? parseInt(audioCode.match(/set_tempo\s+(\d+)/)![1]) : 120;
    const key = audioCode.match(/set_key\s+:([A-G][#b]?[m]?)/)?.[1] || 'C';
    const hasReverb = audioCode.includes('reverb');
    const hasFilter = audioCode.includes('lpf') || audioCode.includes('hpf');
    const hasModulation = audioCode.includes('modulate') || audioCode.includes('lfo');
    
    updateAudioParams({ tempo, key });
    
    // Enhanced visual sync based on audio features
    if (hasReverb && hasFilter) {
      updateVisualParams({ 
        particleCount: 75,
        intensity: 0.9,
        backgroundStyle: 'ethereal'
      });
    } else if (hasModulation) {
      updateVisualParams({
        particleCount: 100,
        intensity: 0.8
      });
    }
  }, [audioCode, updateAudioParams, updateVisualParams]);

  // Sync visual code changes to audio parameters  
  useEffect(() => {
    const particleCount = visualCode.match(/particles\(count:\s*(\d+)\)/)?.[1] ? parseInt(visualCode.match(/particles\(count:\s*(\d+)\)/)![1]) : 50;
    const hasSpectrum = visualCode.includes('spectrum');
    const hasGlow = visualCode.includes('glow');
    const hasTrail = visualCode.includes('trail');
    
    updateVisualParams({ particleCount });
    
    // Influence audio based on visual complexity
    if (hasSpectrum && hasGlow) {
      updateAudioParams({ tempo: Math.min(syncState.audioParams.tempo + 8, 160) });
    }
    if (hasTrail && particleCount > 75) {
      updateVisualParams({ intensity: 0.95 });
    }
  }, [visualCode, updateVisualParams, updateAudioParams, syncState.audioParams.tempo]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (syncState.isPlaying) {
      interval = setInterval(() => {
        updateTime(syncState.currentTime + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [syncState.isPlaying, syncState.currentTime, updateTime]);

  const handlePlay = () => {
    setPlayState(!syncState.isPlaying);
  };

  const handleStop = () => {
    setPlayState(false);
    updateTime(0);
  };

  const handleVolumeChange = (value: number[]) => {
    updateAudioParams({ volume: value[0] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative">
      {/* Audio Engine Component */}
      <AudioEngine
        code={audioCode}
        isPlaying={syncState.isPlaying}
        tempo={syncState.audioParams.tempo}
        volume={syncState.audioParams.volume}
        onAudioData={updateAudioData}
      />

      {/* Coding Guide Overlay */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh]">
            <Button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
            <CodingGuide />
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SynthVis Pro
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <RefreshCw className="w-4 h-4" />
              <span>Advanced Audiovisual Coding</span>
            </div>
          </div>
          
          {/* Enhanced Transport Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowGuide(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
              size="sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Guide
            </Button>
            
            <Button
              onClick={handlePlay}
              className={`w-12 h-12 rounded-full ${
                syncState.isPlaying 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600' 
                  : 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600'
              } border-0 shadow-lg shadow-purple-500/25 transition-all duration-200`}
            >
              {syncState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={handleStop}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-0 transition-all duration-200"
            >
              <Square className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2 ml-4 bg-black/30 rounded-lg px-3 py-2">
              <Volume2 className="w-4 h-4" />
              <Slider
                value={[syncState.audioParams.volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20"
              />
              <span className="text-xs text-gray-400 w-8">{syncState.audioParams.volume}%</span>
            </div>

            {/* Enhanced Sync Status */}
            <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
              <div className={`w-2 h-2 rounded-full ${syncState.audioData.beat ? 'bg-green-400' : 'bg-gray-600'} transition-all duration-100`} />
              <span className="text-xs text-gray-400">
                {syncState.audioParams.tempo} BPM | {syncState.audioParams.key}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Sync Parameters Bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-500/20">
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <div>Particles: {syncState.visualParams.particleCount}</div>
            <div>Intensity: {Math.round(syncState.visualParams.intensity * 100)}%</div>
            <div>Style: {syncState.visualParams.backgroundStyle}</div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Audio Analysis:</span>
            <span>Amp: {(syncState.audioData.amplitude * 100).toFixed(1)}%</span>
            <span>Freq: {syncState.audioData.frequency.toFixed(0)}Hz</span>
            <span>Phase: {(syncState.audioData.phase * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Audio Code */}
        <div className="w-1/2 flex flex-col border-r border-purple-500/20">
          <div className="bg-black/30 backdrop-blur-sm p-3 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Advanced Audio Code</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">
                  Functions: {(audioCode.match(/\b(play|with_synth|with_fx|modulate)\b/g) || []).length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <CodeEditor 
              value={audioCode}
              onChange={setAudioCode}
              language="ruby"
              className="flex-1"
            />
            
            <div className="h-24 bg-black/40 border-t border-purple-500/20 relative">
              <WaveformVisualizer 
                isPlaying={syncState.isPlaying} 
                audioData={syncState.audioData}
              />
              <div className="absolute top-2 right-2 text-xs text-gray-400">
                Real-time Spectrum Analysis
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Visual Code & Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-black/30 backdrop-blur-sm p-3 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Advanced Visual Code</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">
                  Objects: {(visualCode.match(/\b(circle|rect|polygon|particles|spectrum)\b/g) || []).length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="h-1/2 border-b border-purple-500/20">
              <CodeEditor 
                value={visualCode}
                onChange={setVisualCode}
                language="javascript"
                className="h-full"
              />
            </div>
            
            <div className="h-1/2 bg-black/40 relative overflow-hidden">
              <ShaderCanvas 
                code={visualCode}
                isPlaying={syncState.isPlaying}
                time={syncState.currentTime}
                audioData={syncState.audioData}
                visualParams={syncState.visualParams}
              />
              
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-2">
                <div className="text-xs text-gray-300">
                  <div>Time: {syncState.currentTime.toFixed(1)}s</div>
                  <div>FPS: 60</div>
                  <div className={`${syncState.isPlaying ? 'text-green-400' : 'text-red-400'}`}>
                    {syncState.isPlaying ? '● LIVE' : '● STOPPED'}
                  </div>
                  <div className="text-yellow-400">
                    Audio: {syncState.audioData.amplitude > 0.01 ? '🔊' : '🔇'}
                  </div>
                  <div className="text-purple-400">
                    Sync: {Math.round((syncState.audioData.amplitude + syncState.visualParams.intensity) * 50)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-black/40 backdrop-blur-md border-t border-purple-500/20 p-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>SynthVis Pro v1.0 - Advanced Synchronized Live Audiovisual Coding</div>
          <div className="flex items-center gap-4">
            <span>Audio: Web Audio API | Complex Synthesis</span>
            <span>Visual: Canvas2D | Advanced Effects</span>
            <span className={syncState.isPlaying ? 'text-green-400' : 'text-gray-400'}>
              {syncState.isPlaying ? 'RUNNING & FULLY SYNCED' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynthVisEditor;
