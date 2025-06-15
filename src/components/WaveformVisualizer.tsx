
import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  audioData: {
    amplitude: number;
    frequency: number;
    beat: boolean;
    phase: number;
  };
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying, audioData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      if (!canvas || !ctx) return;
      
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas with audio-reactive fade
      const fadeAmount = isPlaying ? 0.05 + audioData.amplitude * 0.05 : 0.1;
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
      ctx.fillRect(0, 0, width, height);

      if (isPlaying && audioData.amplitude > 0.01) {
        // Real-time waveform based on audio data
        ctx.strokeStyle = `hsla(${(audioData.frequency / 10) % 360}, 80%, 60%, ${0.8 + audioData.amplitude})`;
        ctx.lineWidth = 1 + audioData.amplitude * 2;
        ctx.beginPath();

        for (let x = 0; x < width; x += 2) {
          const frequency = 0.02 + audioData.frequency / 100000;
          const amplitude = height * 0.2 * (audioData.amplitude + 0.1);
          const y = height / 2 + Math.sin(x * frequency + time) * amplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Real-time frequency bars
        const barCount = 24;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          // Simulate frequency spectrum based on audio data
          const barHeight = (audioData.amplitude * (1 + Math.sin(time * 0.1 + i)) * 0.5 + 0.1) * height * 0.7;
          const x = i * barWidth;
          
          const hue = (audioData.frequency / 20 + i * 15) % 360;
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.8)`);
          gradient.addColorStop(1, `hsla(${hue}, 80%, 70%, 0.9)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
          
          // Beat visualization
          if (audioData.beat) {
            ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.6)`;
            ctx.fillRect(x, height - barHeight - 5, barWidth - 1, 3);
          }
        }

        time += 0.1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioData]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
    />
  );
};

export default WaveformVisualizer;
