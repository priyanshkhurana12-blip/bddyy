import React, { useEffect, useRef } from 'react';

export const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars
    interface Star {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
      color: string;
    }

    const starColors = ['#fef08a', '#fbbf24', '#fbcfe8', '#ffffff', '#fed7aa'];
    const stars: Star[] = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      color: starColors[Math.floor(Math.random() * starColors.length)]
    }));

    // Floating subtle heart sparks
    interface FloatingHeart {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      rotation: number;
    }

    const hearts: FloatingHeart[] = Array.from({ length: 14 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedY: -(Math.random() * 0.4 + 0.15),
      speedX: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.4 + 0.1,
      rotation: (Math.random() - 0.5) * 0.5
    }));

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(x, y + topCurveHeight);
      // top left curve
      c.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
      // bottom left curve
      c.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
      // bottom right curve
      c.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
      // top right curve
      c.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
      c.closePath();
      c.fill();
    };

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      // Deep celestial radial gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.8);
      bgGrad.addColorStop(0, '#161024');
      bgGrad.addColorStop(0.5, '#0e0b17');
      bgGrad.addColorStop(1, '#07050b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Warm romantic golden/rose nebulas
      const glowGrad = ctx.createRadialGradient(width * 0.3, height * 0.25, 0, width * 0.3, height * 0.25, 400);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      const roseGrad = ctx.createRadialGradient(width * 0.75, height * 0.7, 0, width * 0.75, height * 0.7, 450);
      roseGrad.addColorStop(0, 'rgba(244, 63, 94, 0.05)');
      roseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = roseGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw twinkling stars
      stars.forEach(star => {
        const twinkle = Math.sin(time * star.speed * 20 + star.x) * 0.3 + 0.7;
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha * twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle floating hearts
      hearts.forEach(heart => {
        heart.y += heart.speedY;
        heart.x += heart.speedX;
        if (heart.y < -20) {
          heart.y = height + 20;
          heart.x = Math.random() * width;
        }
        ctx.fillStyle = '#fb7185';
        ctx.globalAlpha = heart.alpha * (0.6 + Math.sin(time + heart.x) * 0.3);
        drawHeart(ctx, heart.x, heart.y, heart.size);
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
    />
  );
};
