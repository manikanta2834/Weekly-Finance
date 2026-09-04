import React, { useEffect, useRef, useState } from 'react';

interface LiquidMetalLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
}

export const LiquidMetalLogo: React.FC<LiquidMetalLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  glow = true,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const animFrameId = useRef<number>(0);

  // Dimension mapping
  const sizeMap = {
    sm: { canvas: 36, px: 'w-9 h-9', text: 'text-base', sub: 'text-[9px]' },
    md: { canvas: 48, px: 'w-12 h-12', text: 'text-xl', sub: 'text-[10px]' },
    lg: { canvas: 72, px: 'w-18 h-18', text: 'text-2xl', sub: 'text-xs' },
    xl: { canvas: 110, px: 'w-28 h-28', text: 'text-3xl', sub: 'text-sm' },
    hero: { canvas: 160, px: 'w-40 h-40', text: 'text-4xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const dpr = window.devicePixelRatio || 1;
    const dim = currentSize.canvas;
    canvas.width = dim * dpr;
    canvas.height = dim * dpr;

    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let smoothMouseX = 0.5;
    let smoothMouseY = 0.5;

    const render = () => {
      time += 0.025;
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.08;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.08;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, dim, dim);

      const cx = dim / 2;
      const cy = dim / 2;
      const radius = (dim / 2) - 4;

      // 1. Draw outer glowing aura
      if (glow) {
        const auraGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius + 4);
        auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)'); // warm gold
        auraGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)'); // emerald
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Liquid Chrome Metallic Base Coin
      const chromeGrad = ctx.createLinearGradient(
        cx - radius + Math.sin(time) * (radius * 0.3) + (smoothMouseX - 0.5) * 20,
        cy - radius + Math.cos(time * 0.8) * (radius * 0.3) + (smoothMouseY - 0.5) * 20,
        cx + radius,
        cy + radius
      );
      // Warm chrome with cream-and-orange gradient reflections
      chromeGrad.addColorStop(0.0, '#f8fafc'); // platinum highlight
      chromeGrad.addColorStop(0.2, '#fed7aa'); // warm cream/apricot
      chromeGrad.addColorStop(0.4, '#fb923c'); // vibrant warm orange reflex
      chromeGrad.addColorStop(0.6, '#334155'); // deep slate chrome shadow
      chromeGrad.addColorStop(0.75, '#fef08a'); // gold gleam
      chromeGrad.addColorStop(0.9, '#10b981'); // subtle emerald tint
      chromeGrad.addColorStop(1.0, '#f8fafc'); // edge specular

      ctx.fillStyle = chromeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Inner Bevel / Ring
      ctx.lineWidth = Math.max(1.5, dim * 0.04);
      const strokeGrad = ctx.createLinearGradient(0, 0, dim, dim);
      strokeGrad.addColorStop(0, '#ffffff');
      strokeGrad.addColorStop(0.3, '#f59e0b');
      strokeGrad.addColorStop(0.7, '#047857');
      strokeGrad.addColorStop(1, '#ffffff');
      ctx.strokeStyle = strokeGrad;
      ctx.stroke();

      // 4. 21 Radial Notches around the rim (representing the 21-week collection cycle)
      const notchCount = 21;
      ctx.save();
      for (let i = 0; i < notchCount; i++) {
        const angle = (i * (Math.PI * 2)) / notchCount + (time * 0.05);
        const innerR = radius - (dim * 0.09);
        const outerR = radius - (dim * 0.02);
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR;
        const y2 = cy + Math.sin(angle) * outerR;

        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(251, 146, 60, 0.75)';
        ctx.lineWidth = Math.max(1, dim * 0.02);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Central Liquid Metal Core Circle
      const coreR = radius * 0.68;
      const coreGrad = ctx.createRadialGradient(
        cx + (smoothMouseX - 0.5) * 10,
        cy + (smoothMouseY - 0.5) * 10,
        coreR * 0.1,
        cx,
        cy,
        coreR
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#ffedd5');
      coreGrad.addColorStop(0.6, '#0f172a');
      coreGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // 6. Engraved Indian Rupee Symbol (₹) in liquid gold/chrome
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.round(dim * 0.44);
      ctx.font = `800 ${fontSize}px "Plus Jakarta Sans", sans-serif`;

      // Shadow depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillText('₹', cx + 1.5, cy + (dim * 0.02) + 1.5);

      // Liquid reflection on the glyph
      const textGrad = ctx.createLinearGradient(
        cx - coreR,
        cy - coreR + Math.sin(time * 1.5) * 10,
        cx + coreR,
        cy + coreR
      );
      textGrad.addColorStop(0, '#ffffff');
      textGrad.addColorStop(0.35, '#fef08a');
      textGrad.addColorStop(0.7, '#fb923c');
      textGrad.addColorStop(1, '#fef9c3');

      ctx.fillStyle = textGrad;
      ctx.fillText('₹', cx, cy + (dim * 0.02));
      ctx.restore();

      // 7. Dynamic Liquid Specular Gleam Sweep
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
      ctx.clip();

      const gleamX = cx + Math.cos(time * 0.8) * (radius * 1.4);
      const gleamY = cy + Math.sin(time * 0.8) * (radius * 1.4);
      const gleamGrad = ctx.createRadialGradient(gleamX, gleamY, 2, gleamX, gleamY, radius * 0.9);
      gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      gleamGrad.addColorStop(0.5, 'rgba(254, 215, 170, 0.15)');
      gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gleamGrad;
      ctx.beginPath();
      ctx.arc(gleamX, gleamY, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId.current);
    };
  }, [currentSize, glow]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className={`inline-flex items-center gap-3 select-none ${className}`}
      id="vaddi-vault-logo"
    >
      <div className={`relative ${currentSize.px} flex items-center justify-center`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)] transition-transform duration-300 hover:scale-105"
          style={{
            transform: interactive && isHovered
              ? `perspective(400px) rotateY(${(mousePos.x - 0.5) * 18}deg) rotateX(${-(mousePos.y - 0.5) * 18}deg)`
              : 'none',
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight whitespace-nowrap">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={`whitespace-nowrap font-extrabold tracking-tight bg-gradient-to-r from-amber-100 via-emerald-200 to-amber-400 bg-clip-text text-transparent font-['Plus_Jakarta_Sans'] ${currentSize.text}`}>
              Vaddi Vault
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 shrink-0">
              వడ్డీ
            </span>
          </div>
          <span className={`text-[#8ba39e] font-medium whitespace-nowrap ${currentSize.sub}`}>
            21-Week Collection Ledger
          </span>
        </div>
      )}
    </div>
  );
};
