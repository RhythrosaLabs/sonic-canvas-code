
import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying }) => {
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

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        // Draw waveform
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < width; x += 2) {
          const frequency = 0.02;
          const amplitude = height * 0.3;
          const y = height / 2 + Math.sin(x * frequency + time) * amplitude * Math.sin(time * 0.5);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Draw frequency bars
        ctx.fillStyle = '#ff00ff';
        for (let i = 0; i < 32; i++) {
          const barWidth = width / 32;
          const barHeight = Math.random() * height * 0.6 + 10;
          const x = i * barWidth;
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#ff00ff');
          gradient.addColorStop(1, '#00ffff');
          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
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
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
    />
  );
};

export default WaveformVisualizer;
