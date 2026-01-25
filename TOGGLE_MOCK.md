import React, { useState } from 'react';

const BetMateDashboard = () => {
  const [activeTab, setActiveTab] = useState('featured');
  const [currency, setCurrency] = useState('cash'); // 'cash' or 'kbits'

  // Currency formatting helper
  const formatCurrency = (amount, showSymbol = true) => {
    if (currency === 'kbits') {
      const kAmount = amount * 100; // 1 USD = 100 K-Bits for demo
      return showSymbol ? `${kAmount.toFixed(0)}K` : kAmount.toFixed(0);
    }
    return showSymbol ? `$${amount.toFixed(2)}` : amount.toFixed(2);
  };

  const getCurrencyLabel = () => currency === 'kbits' ? 'K-Bits' : 'BetMate Cash';

  const recentBets = [
    { type: 'White Win', odds: 1.69, amount: 2.00, result: 'won', profit: 1.38 },
    { type: 'Move dxe5', odds: 3.20, amount: 2.00, result: 'lost', profit: -2.00 },
    { type: 'Move Kh7', odds: 2.10, amount: 2.00, result: 'won', profit: 2.20 },
    { type: 'Black Win', odds: 1.85, amount: 5.00, result: 'won', profit: 4.25 },
  ];

  const leaderboard = [
    { rank: 1, name: 'Book W.', net: 847.50, winRate: 68, avatar: '🎯' },
    { rank: 2, name: 'Michael P.', net: 623.20, winRate: 62, avatar: '🔥' },
    { rank: 3, name: 'ChessPro99', net: 441.80, winRate: 58, avatar: '♟️' },
    { rank: 4, name: 'abc124', net: 156.40, winRate: 54, avatar: '⭐', isYou: true },
    { rank: 5, name: 'GambitKing', net: 98.60, winRate: 51, avatar: '👑' },
  ];

  const liveMatches = [
    { 
      id: 1,
      white: { name: 'dudalodudalo', rating: 2466 },
      black: { name: 'Mahlermaniaco', rating: 2563 },
      timeWhite: '8:16',
      timeBlack: '8:19',
      move: 22,
      phase: 'Midgame',
      format: '10+0 • Rapid',
      source: 'Lichess',
      viewers: 128,
      totalPool: 342.50,
      featured: true
    },
    { 
      id: 2,
      white: { name: 'DrNykterstein', rating: 2839 },
      black: { name: 'Firouzja2003', rating: 2785 },
      timeWhite: '3:42',
      timeBlack: '2:58',
      move: 31,
      phase: 'Endgame',
      format: '5+3 • Blitz',
      source: 'Chess.com',
      viewers: 2341,
      totalPool: 1247.80,
      featured: false
    },
    { 
      id: 3,
      white: { name: 'PawnStorm', rating: 1856 },
      black: { name: 'KnightRider', rating: 1902 },
      timeWhite: '12:30',
      timeBlack: '11:45',
      move: 8,
      phase: 'Opening',
      format: '15+10 • Rapid',
      source: 'Lichess',
      viewers: 23,
      totalPool: 45.00,
      featured: false
    }
  ];

  // Balances
  const balances = {
    cash: 279.50,
    kbits: 27950
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'fixed',
        top: '10%',
        left: '20%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '20%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)'
      }} />

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', letterSpacing: '1px' }}>BetMate</span>
        </div>

        <nav style={{ display: 'flex', gap: '32px' }}>
          {['Dashboard', 'Markets', 'My Bets', 'Stats'].map((item, i) => (
            <a key={item} href="#" style={{
              color: i === 0 ? '#22c55e' : 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              transition: 'color 0.2s ease',
              borderBottom: i === 0 ? '2px solid #22c55e' : '2px solid transparent',
              paddingBottom: '4px'
            }}>{item}</a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Currency Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            padding: '4px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setCurrency('cash')}
              style={{
                background: currency === 'cash' 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                  : 'transparent',
                border: 'none',
                color: currency === 'cash' ? '#000' : 'rgba(255,255,255,0.5)',
                padding: '8px 14px',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '700',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '14px' }}>$</span>
              Cash
            </button>
            <button
              onClick={() => setCurrency('kbits')}
              style={{
                background: currency === 'kbits' 
                  ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                  : 'transparent',
                border: 'none',
                color: currency === 'kbits' ? '#000' : 'rgba(255,255,255,0.5)',
                padding: '8px 14px',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '700',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '14px' }}>K</span>
              K-Bits
            </button>
          </div>

          <button style={{
            background: currency === 'kbits' 
              ? 'rgba(251, 191, 36, 0.1)' 
              : 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${currency === 'kbits' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
            color: currency === 'kbits' ? '#fbbf24' : '#22c55e',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}>
            <span style={{ fontSize: '16px' }}>+</span>
            {currency === 'kbits' ? 'Get K-Bits' : 'Deposit'}
          </button>

          {/* Balance Display */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: '120px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              opacity: currency === 'cash' ? 1 : 0.4,
              transition: 'opacity 0.2s ease'
            }}>
              <span style={{ 
                color: '#22c55e', 
                fontWeight: '700',
                fontSize: currency === 'cash' ? '15px' : '11px',
                transition: 'font-size 0.2s ease'
              }}>
                ${balances.cash.toFixed(2)}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              opacity: currency === 'kbits' ? 1 : 0.4,
              transition: 'opacity 0.2s ease'
            }}>
              <span style={{ 
                color: '#fbbf24', 
                fontWeight: '700',
                fontSize: currency === 'kbits' ? '15px' : '11px',
                transition: 'font-size 0.2s ease'
              }}>
                {balances.kbits.toLocaleString()}K
              </span>
            </div>
          </div>

          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#000',
            cursor: 'pointer'
          }}>
            A
          </div>
        </div>
      </header>

      <main style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Currency Mode Banner */}
        <div style={{
          background: currency === 'kbits' 
            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)',
          border: `1px solid ${currency === 'kbits' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(34, 197, 94, 0.15)'}`,
          borderRadius: '12px',
          padding: '12px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: currency === 'kbits' 
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '800',
              color: '#000'
            }}>
              {currency === 'kbits' ? 'K' : '$'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                Playing with {getCurrencyLabel()}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>
                {currency === 'kbits' 
                  ? 'Free to play • No purchase necessary • For entertainment only'
                  : 'Real money mode • Redeemable for prizes'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setCurrency(currency === 'kbits' ? 'cash' : 'kbits')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}
          >
            Switch to {currency === 'kbits' ? 'Cash' : 'K-Bits'}
          </button>
        </div>

        {/* Welcome & Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Welcome Card */}
          <div style={{
            background: currency === 'kbits'
              ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 100%)',
            border: `1px solid ${currency === 'kbits' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '80px',
              opacity: 0.1
            }}>♟</div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '8px' }}>
              Welcome back
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>abc124</div>
            <div style={{ fontSize: '12px', opacity: 0.5 }}>Member since Jan 2025</div>
          </div>

          {/* Balance Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5, marginBottom: '12px' }}>
              Net P&L ({getCurrencyLabel()})
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: currency === 'kbits' ? '#fbbf24' : '#22c55e',
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              transition: 'color 0.2s ease'
            }}>
              +{formatCurrency(156.40, false)}
              <span style={{ fontSize: '14px', opacity: 0.7 }}>{currency === 'kbits' ? 'K' : 'USD'}</span>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: currency === 'kbits' ? '#fbbf24' : '#22c55e', 
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.2s ease'
            }}>
              <span>↑ 12.4%</span>
              <span style={{ opacity: 0.5, color: '#e8e8e8' }}>this week</span>
            </div>
          </div>

          {/* Win Rate Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5, marginBottom: '12px' }}>
              Win Rate
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: '700' }}>54</span>
              <span style={{ fontSize: '18px', opacity: 0.5 }}>%</span>
            </div>
            <div style={{ 
              marginTop: '12px',
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: '54%', 
                height: '100%', 
                background: currency === 'kbits'
                  ? 'linear-gradient(90deg, #fbbf24 0%, #fcd34d 100%)'
                  : 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
                borderRadius: '2px',
                transition: 'background 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>47 of 87 bets won</div>
          </div>

          {/* Streak Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontSize: '24px'
            }}>🔥</div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5, marginBottom: '12px' }}>
              Current Streak
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700' }}>3</div>
            <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>wins in a row</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '24px'
        }}>
          {/* Left Column - Matches */}
          <div>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              background: 'rgba(255,255,255,0.03)',
              padding: '6px',
              borderRadius: '12px',
              width: 'fit-content'
            }}>
              {[
                { id: 'featured', label: 'Live Matches', count: 3 },
                { id: 'active', label: 'My Active Bets', count: 2 },
                { id: 'history', label: 'History' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id 
                      ? currency === 'kbits' 
                        ? 'rgba(251, 191, 36, 0.15)' 
                        : 'rgba(34, 197, 94, 0.15)' 
                      : 'transparent',
                    border: activeTab === tab.id 
                      ? `1px solid ${currency === 'kbits' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(34, 197, 94, 0.3)'}` 
                      : '1px solid transparent',
                    color: activeTab === tab.id 
                      ? currency === 'kbits' ? '#fbbf24' : '#22c55e' 
                      : 'rgba(255,255,255,0.5)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                  {tab.count && (
                    <span style={{
                      background: activeTab === tab.id 
                        ? currency === 'kbits' ? '#fbbf24' : '#22c55e' 
                        : 'rgba(255,255,255,0.2)',
                      color: activeTab === tab.id ? '#000' : '#fff',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Match Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {liveMatches.map((match, i) => (
                <div 
                  key={match.id}
                  style={{
                    background: match.featured 
                      ? currency === 'kbits'
                        ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%)'
                        : 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${match.featured 
                      ? currency === 'kbits' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(34, 197, 94, 0.2)' 
                      : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {match.featured && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: currency === 'kbits' ? '#fbbf24' : '#22c55e',
                      color: '#000',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>Featured</div>
                  )}

                  {/* Match Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'pulse 2s infinite'
                    }} />
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>{match.format}</span>
                    <span style={{ fontSize: '12px', opacity: 0.4 }}>•</span>
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>{match.source}</span>
                    <span style={{ fontSize: '12px', opacity: 0.4 }}>•</span>
                    <span style={{ fontSize: '12px', opacity: 0.6 }}>Move {match.move} • {match.phase}</span>
                  </div>

                  {/* Players */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    gap: '24px'
                  }}>
                    {/* White Player */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: '#e8e8e8',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#1a1a24'
                      }}>♔</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>{match.white.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.5 }}>{match.white.rating}</div>
                      </div>
                    </div>

                    {/* Center - Time */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '12px 20px',
                      borderRadius: '10px'
                    }}>
                      <span style={{ 
                        fontSize: '18px', 
                        fontWeight: '600',
                        fontVariantNumeric: 'tabular-nums',
                        color: parseFloat(match.timeWhite) < 1 ? '#ef4444' : '#fff'
                      }}>{match.timeWhite}</span>
                      <span style={{ 
                        color: currency === 'kbits' ? '#fbbf24' : '#22c55e', 
                        fontWeight: '700', 
                        fontSize: '12px' 
                      }}>VS</span>
                      <span style={{ 
                        fontSize: '18px', 
                        fontWeight: '600',
                        fontVariantNumeric: 'tabular-nums',
                        color: parseFloat(match.timeBlack) < 1 ? '#ef4444' : '#fff'
                      }}>{match.timeBlack}</span>
                    </div>

                    {/* Black Player */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>{match.black.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.5 }}>{match.black.rating}</div>
                      </div>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: '#1a1a24',
                        border: '1px solid #333',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>♚</div>
                    </div>
                  </div>

                  {/* Match Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ opacity: 0.5 }}>Pool: </span>
                        <span style={{ 
                          color: currency === 'kbits' ? '#fbbf24' : '#22c55e', 
                          fontWeight: '600' 
                        }}>
                          {formatCurrency(match.totalPool)}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ opacity: 0.5 }}>Watching: </span>
                        <span style={{ fontWeight: '600' }}>{match.viewers}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: 'inherit'
                      }}>View Market</button>
                      <button style={{
                        background: currency === 'kbits'
                          ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        border: 'none',
                        color: '#000',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '700',
                        fontFamily: 'inherit',
                        transition: 'background 0.3s ease'
                      }}>Join Game</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Activity & Leaderboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Recent Activity */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px', 
                  opacity: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '14px' }}>📊</span>
                  Recent Activity
                </div>
                <a href="#" style={{ 
                  fontSize: '12px', 
                  color: currency === 'kbits' ? '#fbbf24' : '#22c55e', 
                  textDecoration: 'none' 
                }}>View all</a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentBets.map((bet, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: bet.result === 'won' 
                      ? currency === 'kbits' 
                        ? 'rgba(251, 191, 36, 0.06)' 
                        : 'rgba(34, 197, 94, 0.06)' 
                      : 'rgba(239, 68, 68, 0.04)',
                    borderRadius: '10px',
                    border: `1px solid ${bet.result === 'won' 
                      ? currency === 'kbits' 
                        ? 'rgba(251, 191, 36, 0.15)' 
                        : 'rgba(34, 197, 94, 0.15)' 
                      : 'rgba(239, 68, 68, 0.1)'}`
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{bet.type}</div>
                      <div style={{ fontSize: '11px', opacity: 0.5 }}>
                        @ {bet.odds}x • {formatCurrency(bet.amount)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: bet.result === 'won' 
                        ? currency === 'kbits' ? '#fbbf24' : '#22c55e' 
                        : '#ef4444'
                    }}>
                      {bet.profit >= 0 ? '+' : ''}{formatCurrency(Math.abs(bet.profit), false)}{currency === 'kbits' ? 'K' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px', 
                  opacity: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '14px' }}>🏆</span>
                  Leaderboard
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  opacity: 0.5,
                  background: 'rgba(255,255,255,0.05)',
                  padding: '4px 10px',
                  borderRadius: '4px'
                }}>This Week</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaderboard.map((user, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    background: user.isYou 
                      ? currency === 'kbits' 
                        ? 'rgba(251, 191, 36, 0.08)' 
                        : 'rgba(34, 197, 94, 0.08)' 
                      : 'transparent',
                    borderRadius: '10px',
                    border: user.isYou 
                      ? `1px solid ${currency === 'kbits' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(34, 197, 94, 0.2)'}` 
                      : '1px solid transparent'
                  }}>
                    <div style={{
                      width: '24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: user.rank <= 3 ? ['#fbbf24', '#94a3b8', '#cd7f32'][user.rank - 1] : 'rgba(255,255,255,0.4)'
                    }}>
                      {user.rank}
                    </div>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}>
                      {user.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {user.name}
                        {user.isYou && (
                          <span style={{
                            fontSize: '9px',
                            background: currency === 'kbits' ? '#fbbf24' : '#22c55e',
                            color: '#000',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontWeight: '700'
                          }}>YOU</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.5 }}>{user.winRate}% win rate</div>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: currency === 'kbits' ? '#fbbf24' : '#22c55e'
                    }}>
                      +{currency === 'kbits' ? `${(user.net * 100).toFixed(0)}K` : `$${user.net.toFixed(0)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Mini */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Total Wagered</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{formatCurrency(1247.80)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Avg Bet Size</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{formatCurrency(14.34)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Best Win</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: currency === 'kbits' ? '#fbbf24' : '#22c55e' 
                }}>
                  +{formatCurrency(87.50)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Favorite Bet</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>Move</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default BetMateDashboard;
