
import React, { useEffect, useRef } from 'react';

interface ShaderCanvasProps {
  code: string;
  isPlaying: boolean;
  time: number;
}

const ShaderCanvas: React.FC<ShaderCanvasProps> = ({ code, isPlaying, time }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationTime = 0;

    const animate = () => {
      if (!canvas || !ctx) return;
      
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Early return if canvas has no size
      if (width <= 0 || height <= 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear with gradient background
      const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
      bgGradient.addColorStop(0, 'rgba(26, 20, 102, 1)');
      bgGradient.addColorStop(1, 'rgba(15, 23, 42, 1)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        // Audio-reactive circle with bounds checking
        const centerX = width / 2;
        const centerY = height / 2;
        const audioAmp = Math.sin(animationTime * 2) * 0.5 + 0.5; // Simulated audio amplitude
        let radius = (audioAmp * 2 + 0.5) * 50;
        
        // Ensure radius is valid for canvas operations
        radius = Math.max(1, Math.min(radius, Math.min(width, height) / 2));
        
        if (isFinite(radius) && radius > 0) {
          const circleGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          circleGradient.addColorStop(0, `hsla(${(animationTime * 50) % 360}, 80%, 70%, 0.8)`);
          circleGradient.addColorStop(1, `hsla(${(animationTime * 50 + 180) % 360}, 60%, 50%, 0.2)`);
          
          ctx.fillStyle = circleGradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Particles with bounds checking
        for (let i = 0; i < 50; i++) {
          const angle = (i / 50) * Math.PI * 2 + animationTime;
          const distance = 100 + Math.sin(animationTime + i) * 50;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          let size = Math.sin(animationTime * 3 + i) * 3 + 2;
          
          // Ensure size is valid
          size = Math.max(0.5, Math.min(size, 10));
          
          // Only draw if coordinates are within reasonable bounds
          if (isFinite(x) && isFinite(y) && isFinite(size) && size > 0) {
            ctx.fillStyle = `hsla(${(animationTime * 100 + i * 10) % 360}, 70%, 60%, 0.7)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Waveform overlay with bounds checking
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let pathStarted = false;
        
        for (let x = 0; x < width; x += 4) {
          const frequency = 0.01;
          const amplitude = 30;
          const y = height * 0.8 + Math.sin(x * frequency + animationTime * 2) * amplitude;
          
          // Only add to path if coordinates are valid
          if (isFinite(y)) {
            if (!pathStarted) {
              ctx.moveTo(x, y);
              pathStarted = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        
        if (pathStarted) {
          ctx.stroke();
        }

        animationTime += 0.05;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, time]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
};

export default ShaderCanvas;
