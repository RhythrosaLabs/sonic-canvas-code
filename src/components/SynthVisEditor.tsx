
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Eye, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import WaveformVisualizer from './WaveformVisualizer';
import ShaderCanvas from './ShaderCanvas';
import CodeEditor from './CodeEditor';

const SynthVisEditor = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
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

  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SynthVis
            </h1>
            <div className="text-sm text-gray-400">
              Live Audiovisual Coding Environment
            </div>
          </div>
          
          {/* Transport Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePlay}
              className={`w-12 h-12 rounded-full ${
                isPlaying 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600' 
                  : 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600'
              } border-0 shadow-lg shadow-purple-500/25`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={handleStop}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-0"
            >
              <Square className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2 ml-4">
              <Volume2 className="w-4 h-4" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Audio Code */}
        <div className="w-1/2 flex flex-col border-r border-purple-500/20">
          <div className="bg-black/30 backdrop-blur-sm p-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Audio Code</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <CodeEditor 
              value={audioCode}
              onChange={setAudioCode}
              language="ruby"
              className="flex-1"
            />
            
            {/* Audio Visualizer */}
            <div className="h-24 bg-black/40 border-t border-purple-500/20">
              <WaveformVisualizer isPlaying={isPlaying} />
            </div>
          </div>
        </div>

        {/* Right Panel - Visual Code & Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-black/30 backdrop-blur-sm p-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Visual Code</span>
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
            
            {/* Visual Output */}
            <div className="h-1/2 bg-black/40 relative overflow-hidden">
              <ShaderCanvas 
                code={visualCode}
                isPlaying={isPlaying}
                time={currentTime}
              />
              
              {/* Overlay Info */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-2">
                <div className="text-xs text-gray-300">
                  <div>Time: {currentTime.toFixed(1)}s</div>
                  <div>FPS: 60</div>
                  <div className={`${isPlaying ? 'text-green-400' : 'text-red-400'}`}>
                    {isPlaying ? '● LIVE' : '● STOPPED'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-black/40 backdrop-blur-md border-t border-purple-500/20 p-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>SynthVis v1.0 - Live Audiovisual Coding</div>
          <div className="flex items-center gap-4">
            <span>Audio: 44.1kHz</span>
            <span>Visual: 1920x1080@60fps</span>
            <span className={isPlaying ? 'text-green-400' : 'text-gray-400'}>
              {isPlaying ? 'RUNNING' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynthVisEditor;
