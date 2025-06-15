
import React, { useEffect, useRef } from 'react';

interface ShaderCanvasProps {
  code: string;
  isPlaying: boolean;
  time: number;
  audioData: {
    amplitude: number;
    frequency: number;
    beat: boolean;
    phase: number;
  };
  visualParams: {
    colorPalette: string[];
    intensity: number;
    particleCount: number;
    backgroundStyle: string;
  };
}

const ShaderCanvas: React.FC<ShaderCanvasProps> = ({ 
  code, 
  isPlaying, 
  time, 
  audioData, 
  visualParams 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

      // Enhanced background based on audio
      const bgIntensity = isPlaying ? audioData.amplitude * 0.5 + 0.2 : 0.1;
      const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
      
      if (visualParams.backgroundStyle === 'ethereal') {
        bgGradient.addColorStop(0, `rgba(26, 20, 102, ${bgIntensity})`);
        bgGradient.addColorStop(0.5, `rgba(50, 0, 80, ${bgIntensity * 0.8})`);
        bgGradient.addColorStop(1, `rgba(15, 23, 42, ${bgIntensity * 0.6})`);
      } else {
        bgGradient.addColorStop(0, `rgba(26, 20, 102, ${bgIntensity})`);
        bgGradient.addColorStop(1, `rgba(15, 23, 42, ${bgIntensity * 0.8})`);
      }
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        // Audio-reactive circle with real audio data
        const centerX = width / 2;
        const centerY = height / 2;
        let radius = (audioData.amplitude * 3 + 0.3) * 60;
        
        // Beat enhancement
        if (audioData.beat) {
          radius *= 1.5;
        }
        
        // Ensure radius is valid for canvas operations
        radius = Math.max(1, Math.min(radius, Math.min(width, height) / 2));
        
        if (isFinite(radius) && radius > 0) {
          const circleGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          
          // Color based on frequency
          const hue = (audioData.frequency / 10) % 360;
          const saturation = 80 + audioData.amplitude * 20;
          const lightness = 70 - audioData.amplitude * 20;
          
          circleGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`);
          circleGradient.addColorStop(1, `hsla(${(hue + 180) % 360}, ${saturation * 0.6}%, ${lightness * 0.8}%, 0.2)`);
          
          ctx.fillStyle = circleGradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Enhanced particles with audio sync
        const particleCount = Math.min(visualParams.particleCount, 100);
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + time;
          const baseDistance = 100;
          const audioDistance = audioData.amplitude * 80;
          const distance = baseDistance + audioDistance + Math.sin(time + i) * 30;
          
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          let size = (audioData.amplitude * 5 + 1) + Math.sin(time * 3 + i) * 2;
          
          // Beat enhancement for particles
          if (audioData.beat) {
            size *= 1.8;
          }
          
          // Ensure size is valid
          size = Math.max(0.5, Math.min(size, 15));
          
          // Only draw if coordinates are within reasonable bounds
          if (isFinite(x) && isFinite(y) && isFinite(size) && size > 0) {
            const hue = (audioData.frequency / 20 + i * 10 + time * 50) % 360;
            const alpha = 0.7 + audioData.amplitude * 0.3;
            
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Enhanced waveform with real audio data
        ctx.strokeStyle = `hsla(${(audioData.frequency / 10) % 360}, 80%, 60%, ${0.8 + audioData.amplitude * 0.2})`;
        ctx.lineWidth = 2 + audioData.amplitude * 3;
        ctx.beginPath();
        let pathStarted = false;
        
        for (let x = 0; x < width; x += 3) {
          const frequency = 0.01 + audioData.frequency / 50000;
          const amplitude = 30 + audioData.amplitude * 40;
          const y = height * 0.8 + Math.sin(x * frequency + time * 2) * amplitude;
          
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

        // Audio spectrum visualization
        if (audioData.amplitude > 0.05) {
          const barCount = 32;
          const barWidth = width / barCount;
          
          for (let i = 0; i < barCount; i++) {
            const barHeight = (Math.random() * audioData.amplitude + 0.1) * height * 0.3;
            const x = i * barWidth;
            const hue = (i * 15 + audioData.frequency / 10) % 360;
            
            const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.6)`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 70%, 0.9)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, time, audioData, visualParams]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
};

export default ShaderCanvas;
