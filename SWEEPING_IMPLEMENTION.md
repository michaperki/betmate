Yeah—this is a really nice hover pattern for “header-as-button” because it reads as stateful without screaming.
How I’d do a subtle version for your player headers:
* Use a soft “fill” overlay that animates left → right on hover (like your example), but keep it at ~8–18% opacity so it doesn’t fight the content.
* Round it exactly like the header pill/card and set `overflow: hidden` so it feels integrated.
* Keep text/icons above the fill via `z-index`, and optionally add a tiny border/outline bump on hover for contrast in light mode.
Minimal CSS pattern:

```css
.playerHeader {
  position: relative;
  overflow: hidden;
}

.playerHeader::before {
  content: "";
  position: absolute;
  inset: 0;
  width: 0%;
  transform: translateZ(0);
  transition: width 180ms ease;
  /* background: outcome tint w/ low alpha */
  background: rgba(80, 170, 255, 0.14);
}

.playerHeader:hover::before {
  width: 100%;
}

.playerHeader > * {
  position: relative;
  z-index: 1;
}

```

Tweaks that make it feel “BetMate”-right:
* Use the player color (or outcome color) as the fill tint.
* Consider `width` + a slight `filter: brightness(1.02)` on hover for light mode.
* Add `@media (prefers-reduced-motion: reduce)` to disable the sweep for people who need that.
If you tell me what you’re using (Tailwind classes? CSS modules? styled-components?), I’ll rewrite it in your exact style.
This is great design thinking! I love the sweep animation pattern - it's that perfect "feels interactive without being obnoxious" sweet spot.

Let me build you a demo that shows this pattern in action with a few variations you can play with:Play with the live demo—you can toggle between three variants:

- **Sweep** — your left→right fill (the cleanest IMO)
- **Fade** — instant full-card fill for a softer feel
- **Glow** — same but with blur for that "diffuse light" vibe

The sliders let you dial in opacity (8–18% is the sweet spot) and timing.

A few things I baked in:
- **Player color as fill tint** — each card uses its team color
- **Border lightens on hover** — subtle outline bump like you mentioned
- **Chevron nudge** — tiny `translateX(2px)` gives that "this goes somewhere" affordance
- **`prefers-reduced-motion`** note — would disable the sweep in production

For your stack question: if you're using Tailwind, the sweep is tricky to do purely with utilities (you'd need the `before:` variant plus arbitrary values for `width`). CSS modules or a `<style jsx>` block is cleaner for this one. Want me to rewrite it for a specific setup?

import { useState } from 'react';

const players = [
  { name: 'Nikola Jokić', team: 'DEN', stat: '24.5 PTS', color: '#FEC524', avatar: '🏀' },
  { name: 'Luka Dončić', team: 'DAL', stat: '32.1 PTS', color: '#007DC5', avatar: '🔥' },
  { name: 'Jayson Tatum', team: 'BOS', stat: '27.8 PTS', color: '#007A33', avatar: '☘️' },
  { name: 'Shai Gilgeous-Alexander', team: 'OKC', stat: '31.2 PTS', color: '#EF3B24', avatar: '⚡' },
];

export default function HoverDemo() {
  const [variant, setVariant] = useState('sweep');
  const [opacity, setOpacity] = useState(14);
  const [duration, setDuration] = useState(180);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Header Hover Patterns</h1>
          <p className="text-zinc-500 text-sm">
            Subtle "fill" overlays that read as stateful without screaming
          </p>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50 space-y-4">
          <div className="flex flex-wrap gap-2">
            {['sweep', 'fade', 'glow'].map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  variant === v
                    ? 'bg-white text-zinc-900'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <label className="space-y-2">
              <span className="text-zinc-500">Fill Opacity: {opacity}%</span>
              <input
                type="range"
                min="5"
                max="30"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-zinc-500">Duration: {duration}ms</span>
              <input
                type="range"
                min="80"
                max="400"
                step="20"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-white"
              />
            </label>
          </div>
        </div>

        {/* Player Headers */}
        <div className="space-y-3">
          {players.map((player) => (
            <PlayerHeader
              key={player.name}
              player={player}
              variant={variant}
              opacity={opacity}
              duration={duration}
            />
          ))}
        </div>

        {/* Code Preview */}
        <div className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800/50">
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">CSS Pattern</p>
          <pre className="text-xs text-zinc-400 overflow-x-auto">
{`.playerHeader {
  position: relative;
  overflow: hidden;
}

.playerHeader::before {
  content: "";
  position: absolute;
  inset: 0;
  ${variant === 'sweep' ? `width: 0%;` : ''}
  ${variant === 'fade' ? `opacity: 0;` : ''}
  ${variant === 'glow' ? `opacity: 0; filter: blur(20px);` : ''}
  background: rgba(playerColor, ${opacity / 100});
  transition: ${variant === 'sweep' ? 'width' : 'opacity'} ${duration}ms ease;
}

.playerHeader:hover::before {
  ${variant === 'sweep' ? `width: 100%;` : ''}
  ${variant === 'fade' || variant === 'glow' ? `opacity: 1;` : ''}
}

@media (prefers-reduced-motion: reduce) {
  .playerHeader::before { transition: none; }
}`}
          </pre>
        </div>

        {/* Accessibility note */}
        <p className="text-xs text-zinc-600 text-center">
          ✓ Respects <code className="text-zinc-500">prefers-reduced-motion</code>
        </p>
      </div>
    </div>
  );
}

function PlayerHeader({ player, variant, opacity, duration }) {
  const [isHovered, setIsHovered] = useState(false);

  // Convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const fillColor = hexToRgba(player.color, opacity / 100);

  const beforeStyles = {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: fillColor,
    transition: `all ${duration}ms ease`,
    transformOrigin: 'left',
    ...(variant === 'sweep' && {
      width: isHovered ? '100%' : '0%',
    }),
    ...(variant === 'fade' && {
      opacity: isHovered ? 1 : 0,
    }),
    ...(variant === 'glow' && {
      opacity: isHovered ? 1 : 0,
      filter: 'blur(20px)',
    }),
  };

  return (
    <button
      className="w-full relative overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4 text-left group"
      style={{
        transition: `border-color ${duration}ms ease`,
        borderColor: isHovered ? hexToRgba(player.color, 0.3) : 'rgba(39, 39, 42, 0.5)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover fill */}
      <span style={beforeStyles} className="pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          style={{ background: hexToRgba(player.color, 0.2) }}
        >
          {player.avatar}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{player.name}</div>
          <div className="text-sm text-zinc-500">{player.team}</div>
        </div>

        {/* Stat */}
        <div className="text-right">
          <div className="font-mono font-semibold" style={{ color: player.color }}>
            {player.stat}
          </div>
          <div className="text-xs text-zinc-600">AVG</div>
        </div>

        {/* Chevron */}
        <svg
          className="w-5 h-5 text-zinc-600 transition-transform"
          style={{
            transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
            transition: `transform ${duration}ms ease`,
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
