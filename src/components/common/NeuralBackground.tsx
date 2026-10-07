import React, { useEffect, useRef } from 'react';

interface NeuralBackgroundProps {
  className?: string;
  mousePos?: { x: number; y: number };
}

export const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ 
  className = '',
  mousePos
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const nodeCount = 55; // Calibrated for elegance and subtle density
    const connectionDistance = 145;
    const pulseSpeed = 0.015;

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class NeuralNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseOpacity: number;
      pulsePhase: number;

      constructor() {
        this.x = Math.random() * (width || window.innerWidth);
        this.y = Math.random() * (height || window.innerHeight);
        // Slower, calmer movement for subtlety
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2 + 1.2;
        // Subtle base opacity between 0.15 and 0.35
        this.baseOpacity = Math.random() * 0.2 + 0.15;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Smooth boundary bounce
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        this.pulsePhase += pulseSpeed;
      }

      draw(context: CanvasRenderingContext2D) {
        const pulse = Math.sin(this.pulsePhase) * 0.25 + 0.75;
        const opacity = this.baseOpacity * pulse;

        // Subtle outer glow
        context.beginPath();
        context.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        context.fillStyle = `rgba(59, 130, 246, ${opacity * 0.12})`;
        context.fill();

        // Main node circle
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(37, 99, 235, ${opacity * 0.7})`;
        context.fill();

        // Gentle central core
        context.beginPath();
        context.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        context.fillStyle = `rgba(147, 197, 253, ${opacity * 0.9})`;
        context.fill();
      }
    }

    const nodes: NeuralNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new NeuralNode());
    }

    const drawConnections = () => {
      const now = Date.now();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            // Very subtle connection opacity (max ~0.15)
            const opacity = (1 - distance / connectionDistance) * 0.16;

            // Synaptic connection line
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();

            // Synaptic pulse packet travelling along link
            const pulsePos = (now * 0.0006 + i * 0.13) % 1;
            const pulseX = nodes[i].x + (nodes[j].x - nodes[i].x) * pulsePos;
            const pulseY = nodes[i].y + (nodes[j].y - nodes[i].y) * pulsePos;

            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 1.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(37, 99, 235, ${opacity * 1.8})`;
            ctx.fill();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      drawConnections();

      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].draw(ctx);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Neural Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: mousePos 
            ? `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)` 
            : undefined,
          transition: 'transform 0.4s ease-out'
        }}
      />

      {/* Gentle Bottom Ambient Wave */}
      <div className="absolute bottom-0 left-0 w-full h-[140px] pointer-events-none overflow-hidden opacity-40">
        <div 
          className="absolute bottom-0 left-0 w-[200%] h-full animate-[waveMove_24s_linear_infinite]"
          style={{ willChange: 'transform' }}
        >
          <svg viewBox="0 0 2400 150" preserveAspectRatio="none" className="w-full h-full">
            <path 
              d="M0,75 C200,100 400,50 600,75 C800,100 1000,50 1200,75 C1400,100 1600,50 1800,75 C2000,100 2200,50 2400,75 L2400,150 L0,150 Z" 
              fill="rgba(59, 130, 246, 0.05)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
