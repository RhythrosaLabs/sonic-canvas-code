
import React, { useEffect, useRef, useCallback } from 'react';

interface AudioEngineProps {
  code: string;
  isPlaying: boolean;
  tempo: number;
  volume: number;
  onAudioData: (data: { amplitude: number; frequency: number; beat: boolean; phase: number }) => void;
}

const AudioEngine: React.FC<AudioEngineProps> = ({ 
  code, 
  isPlaying, 
  tempo, 
  volume, 
  onAudioData 
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser for audio data
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const parseCodeAndPlay = useCallback(() => {
    if (!audioContextRef.current || !analyserRef.current) return;

    // Stop current oscillator
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }

    // Create new oscillator and gain
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    // Basic code parsing - extract notes and timing
    const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
    let frequency = 440; // Default A4

    // Simple parsing for demo
    lines.forEach(line => {
      if (line.includes(':C4')) frequency = 261.63;
      else if (line.includes(':E4')) frequency = 329.63;
      else if (line.includes(':G4')) frequency = 392.00;
      else if (line.includes('chord')) frequency = 261.63; // C major root
    });

    // Configure oscillator
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

    // Configure gain
    gainNode.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);

    // Connect audio graph
    oscillator.connect(gainNode);
    gainNode.connect(analyserRef.current);

    // Start oscillator
    oscillator.start();

    console.log(`Playing audio: ${frequency}Hz at ${volume}% volume`);
  }, [code, volume]);

  const stopAudio = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  }, []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate amplitude (volume level)
    const amplitude = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;

    // Find dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    const frequency = (maxIndex * audioContextRef.current!.sampleRate) / (2 * bufferLength);
    const beat = amplitude > 0.1 && Math.random() > 0.8; // Simulate beat detection
    const phase = (Date.now() / 1000) % (60 / tempo); // Phase based on tempo

    onAudioData({ amplitude, frequency, beat, phase });

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [isPlaying, tempo, onAudioData]);

  useEffect(() => {
    if (isPlaying) {
      initAudioContext().then(() => {
        parseCodeAndPlay();
        analyzeAudio();
      });
    } else {
      stopAudio();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      stopAudio();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, code, initAudioContext, parseCodeAndPlay, stopAudio, analyzeAudio]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume / 100,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [volume]);

  return null; // This component doesn't render anything
};

export default AudioEngine;
