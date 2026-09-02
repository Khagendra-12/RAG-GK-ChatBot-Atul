'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';

interface GlowBorderProps {
  children: ReactNode;
  className?: string;
  /** HSL triplet, e.g. "280 85% 65%" (violet) or "225 80% 60%" (royal blue) */
  glowColor?: string;
  /** px, should match the border-radius of the element you're wrapping */
  radius?: number;
  /** px, how far the glow spreads from the cursor */
  spread?: number;
  /** play a one-time rotating sweep when it first mounts */
  sweepOnMount?: boolean;
  /** render the wrapper inline (for buttons sitting in a flex row) */
  inline?: boolean;
}

export function GlowBorder({
  children,
  className = '',
  glowColor = '280 85% 65%',
  radius = 8,
  spread = 160,
  sweepOnMount = true,
  inline = true,
}: GlowBorderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [sweeping, setSweeping] = useState(sweepOnMount);

  useEffect(() => {
    if (!sweepOnMount) return;
    const t = setTimeout(() => setSweeping(false), 1100);
    return () => clearTimeout(t);
  }, [sweepOnMount]);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--glow-x', `${x}%`);
    el.style.setProperty('--glow-y', `${y}%`);
  };

  const ringMaskStyle = {
    WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
    WebkitMaskComposite: 'xor' as const,
    maskComposite: 'exclude' as const,
    padding: 1,
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative isolate ${inline ? 'inline-block' : 'block'} ${className}`}
      style={{ borderRadius: radius, ['--glow-hsl' as string]: glowColor }}
    >
      {children}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          borderRadius: radius,
          background: `radial-gradient(${spread}px circle at var(--glow-x, 50%) var(--glow-y, 50%), hsl(var(--glow-hsl) / 0.9), transparent 70%)`,
          ...ringMaskStyle,
        }}
      />

      {sweeping && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-glow-sweep"
          style={{
            borderRadius: radius,
            background: `conic-gradient(from 0deg, transparent 0%, hsl(var(--glow-hsl) / 0.9) 12%, transparent 28%)`,
            ...ringMaskStyle,
          }}
        />
      )}
    </div>
  );
}