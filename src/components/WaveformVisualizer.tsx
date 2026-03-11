import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  audioData: { amplitude: number; frequency: number; beat: boolean; phase: number };
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying, audioData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      // Background
      ctx.fillStyle = 'hsl(240, 15%, 4%)';
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'hsla(260, 20%, 20%, 0.3)';
      ctx.lineWidth = 0.5;
      for (let y = H * 0.25; y < H; y += H * 0.25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      if (isPlaying && audioData.amplitude > 0.005) {
        const amp = audioData.amplitude;
        const freq = audioData.frequency;
        const t = timeRef.current;

        // Waveform
        ctx.strokeStyle = `hsla(${(freq / 8) % 360}, 75%, 60%, ${0.6 + amp * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < W; x += 1.5) {
          const y = H / 2 + Math.sin(x * (0.02 + freq / 80000) + t) * H * 0.3 * (amp + 0.05);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Mirror waveform
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = `hsla(${((freq / 8) + 180) % 360}, 60%, 50%, 0.5)`;
        ctx.beginPath();
        for (let x = 0; x < W; x += 2) {
          const y = H / 2 - Math.sin(x * 0.015 + t * 0.7) * H * 0.2 * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Frequency bars
        const barCount = 24;
        const barW = W / barCount;
        for (let i = 0; i < barCount; i++) {
          const barH = (amp * (0.5 + Math.sin(t * 0.15 + i * 0.7) * 0.5) + 0.05) * H * 0.8;
          const hue = ((freq / 15) + i * 12) % 360;
          const grad = ctx.createLinearGradient(0, H, 0, H - barH);
          grad.addColorStop(0, `hsla(${hue}, 70%, 55%, 0.7)`);
          grad.addColorStop(1, `hsla(${hue}, 70%, 70%, 0.1)`);
          ctx.fillStyle = grad;
          ctx.fillRect(i * barW + 1, H - barH, barW - 2, barH);

          if (audioData.beat) {
            ctx.fillStyle = `hsla(${hue}, 90%, 80%, 0.5)`;
            ctx.fillRect(i * barW + 1, H - barH - 3, barW - 2, 2);
          }
        }

        timeRef.current += 0.08;
      } else {
        // Idle flat line
        ctx.strokeStyle = 'hsla(260, 30%, 30%, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, audioData]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default WaveformVisualizer;
