import React, { useState } from 'react';

const BetMateThemeToggle = () => {
  const [theme, setTheme] = useState('dark');

  const themes = {
    dark: {
      bg: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      cardBg: 'rgba(255,255,255,0.03)',
      cardBorder: 'rgba(255,255,255,0.08)',
      text: '#e8e8e8',
      textMuted: 'rgba(255,255,255,0.5)',
      accent: '#22c55e',
      accentBg: 'rgba(34, 197, 94, 0.15)',
      accentBorder: 'rgba(34, 197, 94, 0.3)',
      inputBg: 'rgba(255,255,255,0.05)',
      inputBorder: 'rgba(255,255,255,0.1)',
      headerBg: 'rgba(10, 10, 15, 0.8)',
      shadow: 'rgba(0,0,0,0.4)',
      win: '#22c55e',
      winBg: 'rgba(34, 197, 94, 0.1)',
      loss: '#ef4444',
      lossBg: 'rgba(239, 68, 68, 0.1)',
      white: '#e8e8e8',
      black: '#1a1a24'
    },
    light: {
      bg: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
      cardBg: 'rgba(255,255,255,0.8)',
      cardBorder: 'rgba(0,0,0,0.08)',
      text: '#1a1a24',
      textMuted: 'rgba(0,0,0,0.5)',
      accent: '#16a34a',
      accentBg: 'rgba(22, 163, 74, 0.1)',
      accentBorder: 'rgba(22, 163, 74, 0.3)',
      inputBg: 'rgba(0,0,0,0.03)',
      inputBorder: 'rgba(0,0,0,0.1)',
      headerBg: 'rgba(255, 255, 255, 0.9)',
      shadow: 'rgba(0,0,0,0.1)',
      win: '#16a34a',
      winBg: 'rgba(22, 163, 74, 0.1)',
      loss: '#dc2626',
      lossBg: 'rgba(220, 38, 38, 0.1)',
      white: '#ffffff',
      black: '#1a1a24'
    }
  };

  const t = themes[theme];

  const stats = [
    { label: 'Balance', value: '$279.50', color: t.accent },
    { label: 'Win Rate', value: '54%', color: t.text },
    { label: 'Streak', value: '3🔥', color: t.text }
  ];

  const bets = [
    { type: 'White Win', odds: 2.25, result: 'won', profit: 6.25 },
    { type: 'Move Nc5', odds: 3.80, result: 'lost', profit: -2.00 },
    { type: 'Black Win', odds: 1.78, result: 'won', profit: 3.90 }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: t.text,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: `1px solid ${t.cardBorder}`,
        backdropFilter: 'blur(10px)',
        background: t.headerBg,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s ease'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: t.accent, letterSpacing: '1px' }}>BetMate</span>
        </div>

        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', opacity: 0.6 }}>Theme</span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              width: '64px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease',
              boxShadow: `0 2px 8px ${t.shadow}`
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '3px',
              left: theme === 'dark' ? '3px' : '35px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: '32px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          marginBottom: '8px',
          transition: 'color 0.3s ease'
        }}>
          Theme Preview
        </h1>
        <p style={{ 
          fontSize: '14px', 
          color: t.textMuted, 
          marginBottom: '32px',
          transition: 'color 0.3s ease'
        }}>
          Toggle between dark and light mode to preview both themes
        </p>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: '16px',
              padding: '24px',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 12px ${t.shadow}`
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: t.textMuted, 
                marginBottom: '8px',
                transition: 'color 0.3s ease'
              }}>
                {stat.label}
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: stat.color,
                transition: 'color 0.3s ease'
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Sample Match Card */}
        <div style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          transition: 'all 0.3s ease',
          boxShadow: `0 4px 12px ${t.shadow}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444'
            }} />
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>LIVE</span>
            <span style={{ color: t.textMuted }}>•</span>
            <span style={{ fontSize: '12px', color: t.textMuted }}>5+3 Blitz • Move 28</span>
          </div>

          {/* Players */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: t.white,
                border: theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : 'none',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: t.black
              }}>♔</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Magnus Carlsen</div>
                <div style={{ fontSize: '12px', color: t.textMuted }}>2830</div>
              </div>
            </div>

            <div style={{
              padding: '12px 20px',
              background: t.inputBg,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>4:32</span>
              <span style={{ color: t.accent, fontWeight: '700', fontSize: '12px' }}>VS</span>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>3:18</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Hikaru Nakamura</div>
                <div style={{ fontSize: '12px', color: t.textMuted }}>2802</div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: t.black,
                border: theme === 'dark' ? '1px solid #333' : 'none',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: t.white
              }}>♚</div>
            </div>
          </div>

          {/* Odds Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            {[
              { label: 'White', odds: 1.85 },
              { label: 'Draw', odds: 3.40 },
              { label: 'Black', odds: 2.10 }
            ].map((option) => (
              <button
                key={option.label}
                style={{
                  padding: '16px',
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '12px', color: t.textMuted, marginBottom: '4px' }}>
                  {option.label}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: t.accent }}>
                  {option.odds}x
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bet History */}
        <div style={{
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: `0 4px 12px ${t.shadow}`
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${t.cardBorder}`
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Recent Bets</h3>
          </div>
          
          {bets.map((bet, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: i < bets.length - 1 ? `1px solid ${t.cardBorder}` : 'none',
                background: bet.result === 'won' ? t.winBg : t.lossBg,
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: bet.result === 'won' ? t.win : t.loss,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700'
                }}>
                  {bet.result === 'won' ? '✓' : '✗'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{bet.type}</div>
                  <div style={{ fontSize: '12px', color: t.textMuted }}>@ {bet.odds}x</div>
                </div>
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: bet.profit >= 0 ? t.win : t.loss
              }}>
                {bet.profit >= 0 ? '+' : ''}${bet.profit.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Form Elements */}
        <div style={{
          marginTop: '32px',
          background: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          borderRadius: '20px',
          padding: '24px',
          transition: 'all 0.3s ease',
          boxShadow: `0 4px 12px ${t.shadow}`
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Form Elements</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                color: t.textMuted, 
                marginBottom: '8px' 
              }}>
                Input Field
              </label>
              <input
                type="text"
                placeholder="Enter amount..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  borderRadius: '10px',
                  color: t.text,
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                flex: 1,
                padding: '14px',
                background: `linear-gradient(135deg, ${t.accent} 0%, ${theme === 'dark' ? '#16a34a' : '#15803d'} 100%)`,
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}>
                Primary Button
              </button>
              <button style={{
                flex: 1,
                padding: '14px',
                background: t.inputBg,
                border: `1px solid ${t.inputBorder}`,
                borderRadius: '12px',
                color: t.text,
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        {/* Theme Values */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: t.inputBg,
          borderRadius: '12px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: t.textMuted,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: '600', color: t.text }}>
            Current Theme: {theme.toUpperCase()}
          </div>
          <div>accent: {t.accent}</div>
          <div>text: {t.text}</div>
          <div>cardBg: {t.cardBg}</div>
        </div>
      </main>

      <style>{`
        input::placeholder {
          color: ${t.textMuted};
        }
        input:focus {
          outline: none;
          border-color: ${t.accent};
        }
      `}</style>
    </div>
  );
};

export default BetMateThemeToggle;
