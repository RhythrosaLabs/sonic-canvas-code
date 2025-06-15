
import { useState, useEffect, useCallback } from 'react';

interface AudioParams {
  tempo: number;
  volume: number;
  key: string;
  scale: string;
}

interface VisualParams {
  colorPalette: string[];
  intensity: number;
  particleCount: number;
  backgroundStyle: string;
}

interface SyncState {
  audioParams: AudioParams;
  visualParams: VisualParams;
  isPlaying: boolean;
  currentTime: number;
  audioData: {
    amplitude: number;
    frequency: number;
    beat: boolean;
    phase: number;
  };
}

export const useAudioVisualSync = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    audioParams: {
      tempo: 120,
      volume: 75,
      key: 'C',
      scale: 'major'
    },
    visualParams: {
      colorPalette: ['#ff0080', '#00ffff', '#ff8000'],
      intensity: 0.5,
      particleCount: 50,
      backgroundStyle: 'gradient'
    },
    isPlaying: false,
    currentTime: 0,
    audioData: {
      amplitude: 0,
      frequency: 440,
      beat: false,
      phase: 0
    }
  });

  const updateAudioParams = useCallback((params: Partial<AudioParams>) => {
    setSyncState(prev => ({
      ...prev,
      audioParams: { ...prev.audioParams, ...params }
    }));
  }, []);

  const updateVisualParams = useCallback((params: Partial<VisualParams>) => {
    setSyncState(prev => ({
      ...prev,
      visualParams: { ...prev.visualParams, ...params }
    }));
  }, []);

  const setPlayState = useCallback((isPlaying: boolean) => {
    setSyncState(prev => ({ ...prev, isPlaying }));
  }, []);

  const updateAudioData = useCallback((data: Partial<SyncState['audioData']>) => {
    setSyncState(prev => ({
      ...prev,
      audioData: { ...prev.audioData, ...data }
    }));
  }, []);

  const updateTime = useCallback((time: number) => {
    setSyncState(prev => ({ ...prev, currentTime: time }));
  }, []);

  return {
    syncState,
    updateAudioParams,
    updateVisualParams,
    setPlayState,
    updateAudioData,
    updateTime
  };
};
