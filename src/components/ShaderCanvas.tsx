import React, { useEffect, useRef } from 'react';

interface ShaderCanvasProps {
  code: string;
  isPlaying: boolean;
  time: number;
  audioData: { amplitude: number; frequency: number; beat: boolean; phase: number };
  visualParams: { colorPalette: string[]; intensity: number; particleCount: number; backgroundStyle: string };
}

const ShaderCanvas: React.FC<ShaderCanvasProps> = ({ code, isPlaying, time, audioData, visualParams }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const trailRef = useRef<{ x: number; y: number; r: number; hue: number; alpha: number }[]>([]);

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
      if (W <= 0 || H <= 0) { animationRef.current = requestAnimationFrame(animate); return; }

      const cx = W / 2, cy = H / 2;
      const amp = audioData.amplitude;
      const freq = audioData.frequency;
      const beat = audioData.beat;

      // Background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      if (visualParams.backgroundStyle === 'ethereal') {
        bg.addColorStop(0, `hsla(270, 40%, ${8 + amp * 6}%, 1)`);
        bg.addColorStop(0.5, `hsla(300, 30%, ${5 + amp * 4}%, 1)`);
        bg.addColorStop(1, `hsla(240, 20%, ${3 + amp * 2}%, 1)`);
      } else {
        bg.addColorStop(0, `hsla(250, 30%, ${6 + amp * 5}%, 1)`);
        bg.addColorStop(1, `hsla(230, 20%, ${3 + amp * 2}%, 1)`);
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (!isPlaying) {
        // Idle state — subtle grid
        ctx.strokeStyle = 'hsla(260, 30%, 20%, 0.15)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        
        ctx.fillStyle = 'hsla(260, 30%, 40%, 0.3)';
        ctx.font = '11px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press play to start visualization', cx, cy);
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Central glow
      const glowR = 60 + amp * 80 + (beat ? 30 : 0);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, glowR));
      const hue = (freq / 8) % 360;
      glow.addColorStop(0, `hsla(${hue}, 80%, 70%, ${0.4 + amp * 0.4})`);
      glow.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 60%, 50%, ${0.15 + amp * 0.15})`);
      glow.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Mandala rings
      ctx.save();
      ctx.translate(cx, cy);
      const rings = 3;
      for (let r = 0; r < rings; r++) {
        const count = 8 + r * 4;
        const baseRadius = 40 + r * 35 + amp * 20;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + time * (0.5 + r * 0.3) * (r % 2 === 0 ? 1 : -1);
          const x = Math.cos(angle) * baseRadius;
          const y = Math.sin(angle) * baseRadius;
          let size = 2 + amp * 4 + (beat ? 3 : 0);
          size = Math.max(0.5, Math.min(size, 12));

          const dotHue = (hue + i * (360 / count) + r * 60) % 360;
          ctx.fillStyle = `hsla(${dotHue}, 75%, 65%, ${0.6 + amp * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Connection lines
          if (i > 0 && r < 2) {
            const prevAngle = ((i - 1) / count) * Math.PI * 2 + time * (0.5 + r * 0.3) * (r % 2 === 0 ? 1 : -1);
            ctx.strokeStyle = `hsla(${dotHue}, 50%, 50%, ${0.1 + amp * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(Math.cos(prevAngle) * baseRadius, Math.sin(prevAngle) * baseRadius);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }
      }

      // Center polygon
      const polyRadius = 20 + amp * 15 + (beat ? 10 : 0);
      const polySides = 6;
      ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 70%, 60%, ${0.5 + amp * 0.3})`;
      ctx.lineWidth = 1.5 + amp * 2;
      ctx.beginPath();
      for (let i = 0; i <= polySides; i++) {
        const angle = (i / polySides) * Math.PI * 2 + time * 0.8;
        const method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](Math.cos(angle) * polyRadius, Math.sin(angle) * polyRadius);
      }
      ctx.stroke();
      ctx.restore();

      // Spectrum bars at bottom
      const barCount = 32;
      const barW = W / barCount;
      const maxBarH = H * 0.25;
      for (let i = 0; i < barCount; i++) {
        const barH = (Math.sin(time * 2 + i * 0.5) * 0.3 + 0.5) * amp * maxBarH + 2;
        const barHue = (i * (360 / barCount) + freq / 10) % 360;
        const grad = ctx.createLinearGradient(0, H, 0, H - barH);
        grad.addColorStop(0, `hsla(${barHue}, 70%, 50%, 0.6)`);
        grad.addColorStop(1, `hsla(${barHue}, 70%, 70%, 0.1)`);
        ctx.fillStyle = grad;
        ctx.fillRect(i * barW, H - barH, barW - 1, barH);
      }

      // Particle trails
      const trails = trailRef.current;
      if (beat || Math.random() < 0.1 + amp * 0.3) {
        trails.push({
          x: cx + (Math.random() - 0.5) * W * 0.6,
          y: cy + (Math.random() - 0.5) * H * 0.6,
          r: 1 + Math.random() * 3 + amp * 3,
          hue: (hue + Math.random() * 60) % 360,
          alpha: 0.8,
        });
      }
      for (let i = trails.length - 1; i >= 0; i--) {
        const p = trails[i];
        p.alpha -= 0.015;
        p.y -= 0.3 + amp;
        p.r *= 0.99;
        if (p.alpha <= 0) { trails.splice(i, 1); continue; }
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2);
        ctx.fill();
      }
      if (trails.length > 200) trails.splice(0, trails.length - 200);

      // Waveform line
      ctx.strokeStyle = `hsla(${hue}, 60%, 55%, ${0.3 + amp * 0.3})`;
      ctx.lineWidth = 1 + amp * 1.5;
      ctx.beginPath();
      for (let x = 0; x < W; x += 2) {
        const y = H * 0.7 + Math.sin(x * 0.01 + time * 2) * (15 + amp * 25);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, time, audioData, visualParams]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default ShaderCanvas;
