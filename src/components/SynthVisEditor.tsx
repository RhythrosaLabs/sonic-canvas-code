
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Eye, Code2, Settings, Sync, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import WaveformVisualizer from './WaveformVisualizer';
import ShaderCanvas from './ShaderCanvas';
import CodeEditor from './CodeEditor';
import AudioEngine from './AudioEngine';
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

  const [audioCode, setAudioCode] = useState(`// SynthVis Audio Code
play :C4, sustain: 0.5
sleep 0.5
play :E4, sustain: 0.5
sleep 0.5
play :G4, sustain: 1
sleep 1

// Add some rhythm
with_fx :reverb, room: 0.8 do
  4.times do
    play chord(:C, :major), release: 0.1
    sleep 0.25
  end
end`);
  
  const [visualCode, setVisualCode] = useState(`// SynthVis Visual Code
bg(0.1, 0.05, 0.2)

// Audio-reactive circle
circle()
  .scale(() => audio.amp * 2 + 0.5)
  .color(
    () => audio.freq * 0.01,
    () => 0.8 - audio.amp,
    () => 1.0
  )
  .blend(add, 0.8)

// Particle system
particles(100)
  .velocity(() => audio.beat ? 5 : 1)
  .color(1, 0.5, () => audio.phase)
  .trail(0.9)`);

  // Sync audio code changes to visual parameters
  useEffect(() => {
    const tempo = audioCode.match(/(\d+)\s*bpm/i)?.[1] ? parseInt(audioCode.match(/(\d+)\s*bpm/i)![1]) : 120;
    const hasChord = audioCode.includes('chord');
    const hasReverb = audioCode.includes('reverb');
    
    updateAudioParams({ tempo });
    
    // Sync visual parameters based on audio code
    if (hasChord) {
      updateVisualParams({ 
        particleCount: 100,
        intensity: 0.8
      });
    }
    if (hasReverb) {
      updateVisualParams({
        backgroundStyle: 'ethereal'
      });
    }
  }, [audioCode, updateAudioParams, updateVisualParams]);

  // Sync visual code changes to audio parameters  
  useEffect(() => {
    const particleCount = visualCode.match(/particles\((\d+)\)/)?.[1] ? parseInt(visualCode.match(/particles\((\d+)\)/)![1]) : 50;
    const hasTrail = visualCode.includes('trail');
    
    updateVisualParams({ particleCount });
    
    // Influence audio based on visual complexity
    if (particleCount > 75) {
      updateAudioParams({ tempo: Math.min(syncState.audioParams.tempo + 10, 160) });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Audio Engine Component */}
      <AudioEngine
        code={audioCode}
        isPlaying={syncState.isPlaying}
        tempo={syncState.audioParams.tempo}
        volume={syncState.audioParams.volume}
        onAudioData={updateAudioData}
      />

      {/* Enhanced Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SynthVis
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Sync className="w-4 h-4" />
              <span>Synchronized Audiovisual Coding</span>
            </div>
          </div>
          
          {/* Enhanced Transport Controls */}
          <div className="flex items-center gap-3">
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

            {/* Sync Status Indicator */}
            <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
              <div className={`w-2 h-2 rounded-full ${syncState.audioData.beat ? 'bg-green-400' : 'bg-gray-600'} transition-all duration-100`} />
              <span className="text-xs text-gray-400">
                {syncState.audioParams.tempo} BPM
              </span>
            </div>
          </div>
        </div>

        {/* Sync Parameters Bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-500/20">
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <div>Particles: {syncState.visualParams.particleCount}</div>
            <div>Intensity: {Math.round(syncState.visualParams.intensity * 100)}%</div>
            <div>Key: {syncState.audioParams.key} {syncState.audioParams.scale}</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Audio Data:</span>
            <span>Amp: {(syncState.audioData.amplitude * 100).toFixed(1)}%</span>
            <span>Freq: {syncState.audioData.frequency.toFixed(0)}Hz</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Audio Code */}
        <div className="w-1/2 flex flex-col border-r border-purple-500/20">
          <div className="bg-black/30 backdrop-blur-sm p-3 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Audio Code</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">
                  Lines: {audioCode.split('\n').length}
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
            
            {/* Enhanced Audio Visualizer */}
            <div className="h-24 bg-black/40 border-t border-purple-500/20 relative">
              <WaveformVisualizer 
                isPlaying={syncState.isPlaying} 
                audioData={syncState.audioData}
              />
              <div className="absolute top-2 right-2 text-xs text-gray-400">
                Real-time Audio Analysis
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
                <span className="text-sm font-medium text-purple-400">Visual Code</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">
                  Objects: {visualCode.split('()').length - 1}
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
            
            {/* Enhanced Visual Output */}
            <div className="h-1/2 bg-black/40 relative overflow-hidden">
              <ShaderCanvas 
                code={visualCode}
                isPlaying={syncState.isPlaying}
                time={syncState.currentTime}
                audioData={syncState.audioData}
                visualParams={syncState.visualParams}
              />
              
              {/* Enhanced Overlay Info */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-black/40 backdrop-blur-md border-t border-purple-500/20 p-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>SynthVis v1.0 - Synchronized Live Audiovisual Coding</div>
          <div className="flex items-center gap-4">
            <span>Audio: 44.1kHz | WebAudio API</span>
            <span>Visual: Canvas2D | 60fps</span>
            <span className={syncState.isPlaying ? 'text-green-400' : 'text-gray-400'}>
              {syncState.isPlaying ? 'RUNNING & SYNCED' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynthVisEditor;
