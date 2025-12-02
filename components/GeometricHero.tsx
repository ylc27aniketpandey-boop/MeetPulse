import React, { useEffect, useRef } from 'react';

const GeometricHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particles confined to a sphere-like structure for "sculpture" feel
    const particles: { x: number; y: number; z: number; baseR: number; speedOffset: number }[] = [];
    const particleCount = 45; // Reduced for cleaner look
    
    for (let i = 0; i < particleCount; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 250 + Math.random() * 100; // Radius variation

      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseR: r,
        speedOffset: Math.random() * 0.002
      });
    }

    let time = 0;

    const animate = () => {
      time += 0.0015; // Slower rotation
      ctx.clearRect(0, 0, width, height); // Transparent background
      
      const cx = width / 2;
      const cy = height / 2;

      // Update and Project
      const projected = particles.map(p => {
        // Rotate around Y and slightly X
        const angleY = time + p.speedOffset;
        const angleX = time * 0.3;
        
        // Rotation Matrix logic simplified
        let x1 = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
        let z1 = p.z * Math.cos(angleY) + p.x * Math.sin(angleY);
        
        let y1 = p.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = z1 * Math.cos(angleX) + p.y * Math.sin(angleX);
        
        // Perspective projection
        const scale = 800 / (800 + z2 + 600); // Increased camera distance for subtlety
        const x2d = x1 * scale + cx;
        const y2d = y1 * scale + cy;

        return { x: x2d, y: y2d, scale, z: z2 };
      });

      // Draw Lines
      ctx.lineWidth = 1;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Only connect nearby points and factor in depth
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15; // Subtle opacity
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`; // accent-500 (Violet)
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes
      projected.forEach(p => {
        const alpha = Math.max(0.1, (p.scale - 0.5));
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`; // primary-400 (Sky/Teal-ish)
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.8 }} />;
};

export default GeometricHero;