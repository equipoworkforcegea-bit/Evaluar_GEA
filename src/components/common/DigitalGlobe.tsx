import React, { useEffect, useRef } from 'react';

interface DigitalGlobeProps {
  className?: string;
  mousePos?: { x: number; y: number };
}

export const DigitalGlobe: React.FC<DigitalGlobeProps> = ({ 
  className = '',
  mousePos = { x: 0, y: 0 } 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    // Generate fixed 3D points on sphere (Fibonacci sphere algorithm for even distribution)
    const NUM_DOTS = 420;
    const sphereRadius = 240;
    const dots: { x: number; y: number; z: number; isContinent: boolean }[] = [];

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < NUM_DOTS; i++) {
      const y = 1 - (i / (NUM_DOTS - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Group some dots into continent-like clusters
      const lat = Math.asin(y);
      const lon = Math.atan2(z, x);
      const isContinent = 
        (lat > -0.6 && lat < 0.9 && Math.sin(lon * 2.5) > -0.2) ||
        (lat > 0.1 && lat < 1.2 && Math.cos(lon * 2.0) > 0.1) ||
        (lat > -0.8 && lat < 0.2 && Math.sin(lon + 1.2) > 0.2);

      dots.push({
        x: x * sphereRadius,
        y: y * sphereRadius,
        z: z * sphereRadius,
        isContinent
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Rotation speeds + interactive tilt based on mouse position
      rotation += 0.0035;
      const tiltX = mousePos.y * 0.35 + 0.22;
      const tiltY = mousePos.x * 0.45;

      const cosRot = Math.cos(rotation + tiltY);
      const sinRot = Math.sin(rotation + tiltY);
      const cosTilt = Math.cos(tiltX);
      const sinTilt = Math.sin(tiltX);

      // 1. Draw Globe Outer Atmosphere Glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, sphereRadius * 0.6, centerX, centerY, sphereRadius * 1.25);
      glowGrad.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
      glowGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.04)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Sphere Perimeter Rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 3. Draw Longitude & Latitude Wireframe Rings
      // Latitude parallels
      [-0.65, -0.35, 0, 0.35, 0.65].forEach(latFraction => {
        const ringY = sphereRadius * latFraction;
        const ringR = Math.sqrt(sphereRadius * sphereRadius - ringY * ringY);
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + ringY * cosTilt, ringR, ringR * Math.abs(sinTilt) * 0.45 + 8, 0, 0, Math.PI * 2);
        ctx.strokeStyle = latFraction === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = latFraction === 0 ? 1.4 : 0.8;
        ctx.setLineDash(latFraction === 0 ? [4, 4] : [2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Longitude meridians
      for (let m = 0; m < 6; m++) {
        const angle = (Math.PI / 6) * m + rotation + tiltY;
        const widthFactor = Math.cos(angle);
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.abs(sphereRadius * widthFactor), sphereRadius, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Transform & Project Dots
      const projectedDots: { px: number; py: number; pz: number; alpha: number; isContinent: boolean }[] = [];

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Rotate around Y axis
        const x1 = dot.x * cosRot - dot.z * sinRot;
        const z1 = dot.x * sinRot + dot.z * cosRot;

        // Rotate around X axis (tilt)
        const y2 = dot.y * cosTilt - z1 * sinTilt;
        const z2 = dot.y * sinTilt + z1 * cosTilt;

        // Perspective projection
        const fov = 600;
        const scale = fov / (fov + z2);
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;

        // Only draw visible hemisphere dots (pz > -sphereRadius * 0.4)
        if (z2 > -sphereRadius * 0.3) {
          const depthAlpha = Math.max(0.08, (z2 + sphereRadius * 0.5) / (sphereRadius * 1.5));
          projectedDots.push({ px, py, pz: z2, alpha: depthAlpha, isContinent: dot.isContinent });
        }
      }

      // Sort dots by depth
      projectedDots.sort((a, b) => a.pz - b.pz);

      // Draw connection lines between nearby front-facing continent dots
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projectedDots.length; i += 3) {
        const d1 = projectedDots[i];
        if (d1.pz < 0 || !d1.isContinent) continue;

        for (let j = i + 1; j < Math.min(i + 7, projectedDots.length); j++) {
          const d2 = projectedDots[j];
          if (d2.pz < 0 || !d2.isContinent) continue;

          const dist = Math.hypot(d1.px - d2.px, d1.py - d2.py);
          if (dist < 42) {
            ctx.beginPath();
            ctx.moveTo(d1.px, d1.py);
            ctx.lineTo(d2.px, d2.py);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.18 * d1.alpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      projectedDots.forEach(dot => {
        ctx.beginPath();
        const dotRadius = dot.isContinent ? (dot.pz > 100 ? 2.4 : 1.8) : (dot.pz > 100 ? 1.4 : 1.0);
        ctx.arc(dot.px, dot.py, dotRadius, 0, Math.PI * 2);
        
        if (dot.isContinent) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, dot.alpha * 1.3)})`;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = dot.pz > 100 ? 6 : 2;
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${dot.alpha * 0.8})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <div className={`relative pointer-events-none select-none ${className}`}>
      <canvas 
        ref={canvasRef} 
        width={720} 
        height={720}
        className="w-[620px] h-[620px] xl:w-[740px] xl:h-[740px] max-w-none opacity-85 transition-opacity duration-700"
      />
    </div>
  );
};
