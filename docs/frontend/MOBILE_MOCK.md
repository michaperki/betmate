import React, { useState, useRef, useEffect } from 'react';

const BetMateMobileGame = () => {
  const [activeTab, setActiveTab] = useState('moves'); // 'moves', 'outcome', 'chat'
  const [selectedMove, setSelectedMove] = useState(null);
  const [holdingMove, setHoldingMove] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [lockedBets, setLockedBets] = useState([]);
  const [showBetConfirm, setShowBetConfirm] = useState(false);
  const [pendingBet, setPendingBet] = useState(null);
  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(null);

  const gameState = {
    white: { name: 'dudalodudalo', rating: 2466, time: '8:16' },
    black: { name: 'Mahlermaniaco', rating: 2563, time: '8:19' },
    move: 22,
    phase: 'Midgame',
    evaluation: 52, // black winning %
    format: '10+0 Rapid'
  };

  const movePredictions = [
    { move: 'Nc5', score: 100, odds: 3.80, arrow: { from: 'e4', to: 'c5' } },
    { move: 'N4c3', score: 92, odds: 1.90, arrow: { from: 'e4', to: 'c3' } },
    { move: 'N2c3', score: 84, odds: 1.90, arrow: { from: 'e2', to: 'c3' } },
    { move: 'Nd2', score: 76, odds: 1.90, arrow: { from: 'e4', to: 'd2' } },
    { move: 'Bf4', score: 68, odds: 2.40, arrow: { from: 'c1', to: 'f4' } },
    { move: 'Qd3', score: 54, odds: 4.20, arrow: { from: 'd1', to: 'd3' } },
  ];

  const pendingBets = [
    { type: 'Black Win', odds: 2.02, stake: 2.00, status: 'pending' },
    { type: 'Nd2', odds: 1.90, stake: 2.00, status: 'pending' },
  ];

  // Board squares mapping for arrow visualization
  const squareToCoord = (square) => {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc
    const rank = parseInt(square[1]) - 1;
    return { x: file * 12.5 + 6.25, y: (7 - rank) * 12.5 + 6.25 };
  };

  const handleMovePress = (move) => {
    setSelectedMove(move);
  };

  const handleMoveHoldStart = (move) => {
    setHoldingMove(move);
    holdStartRef.current = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(elapsed / 800, 1); // 800ms to complete
      setHoldProgress(progress);
      
      if (progress < 1) {
        holdTimerRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Hold complete - show bet confirmation
        setPendingBet(move);
        setShowBetConfirm(true);
        setHoldingMove(null);
        setHoldProgress(0);
      }
    };
    
    holdTimerRef.current = requestAnimationFrame(updateProgress);
  };

  const handleMoveHoldEnd = () => {
    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
    }
    setHoldingMove(null);
    setHoldProgress(0);
  };

  const confirmBet = () => {
    if (pendingBet) {
      setLockedBets([...lockedBets, pendingBet.move]);
    }
    setShowBetConfirm(false);
    setPendingBet(null);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        cancelAnimationFrame(holdTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#e8e8e8',
      position: 'relative',
      maxWidth: '430px',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* Status Bar Spacer */}
      <div style={{ height: '44px', background: 'rgba(0,0,0,0.3)' }} />

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '24px',
          padding: '4px',
          cursor: 'pointer'
        }}>
          ←
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>Move {gameState.move}</div>
          <div style={{ fontSize: '11px', opacity: 0.5 }}>{gameState.format} • {gameState.phase}</div>
        </div>
        <div style={{
          background: 'rgba(34, 197, 94, 0.15)',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#22c55e'
        }}>
          $279.50
        </div>
      </header>

      {/* Players Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.02)'
      }}>
        {/* White Player */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#e8e8e8',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#1a1a24'
          }}>♔</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>{gameState.white.name}</div>
            <div style={{ fontSize: '11px', opacity: 0.5 }}>{gameState.white.rating}</div>
          </div>
        </div>

        {/* Clocks */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {gameState.white.time}
          </div>
          <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>VS</div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {gameState.black.time}
          </div>
        </div>

        {/* Black Player */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>{gameState.black.name}</div>
            <div style={{ fontSize: '11px', opacity: 0.5 }}>{gameState.black.rating}</div>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#1a1a24',
            border: '1px solid #333',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>♚</div>
        </div>
      </div>

      {/* Chess Board */}
      <div style={{
        padding: '8px',
        position: 'relative'
      }}>
        <div style={{
          aspectRatio: '1',
          background: 'linear-gradient(135deg, #2a2a3a 0%, #1e1e28 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {Array(64).fill(0).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isLight = (row + col) % 2 === 0;
            return (
              <div key={i} style={{
                background: isLight ? '#b8c0a8' : '#6b8a5c',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'min(6vw, 28px)'
              }}>
                {/* Simplified piece placement */}
                {i === 3 && '♛'}
                {i === 4 && '♚'}
                {i === 0 && '♜'}
                {i === 7 && '♚'}
                {i === 56 && '♖'}
                {i === 59 && '♕'}
                {i === 63 && '♖'}
                {i === 28 && '♞'}
                {i === 36 && '♞'}
                {i === 51 && '♙'}
                {i === 52 && '♙'}
                {i === 11 && '♟'}
                {i === 12 && '♟'}
              </div>
            );
          })}

          {/* Move Arrow Overlay */}
          {selectedMove && (
            <svg style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
                </marker>
              </defs>
              {(() => {
                const move = movePredictions.find(m => m.move === selectedMove);
                if (!move) return null;
                const from = squareToCoord(move.arrow.from);
                const to = squareToCoord(move.arrow.to);
                return (
                  <line
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke="#22c55e"
                    strokeWidth="4"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.5))'
                    }}
                  />
                );
              })()}
            </svg>
          )}
        </div>

        {/* Evaluation Bar */}
        <div style={{
          marginTop: '8px',
          height: '6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div style={{
            width: `${100 - gameState.evaluation}%`,
            background: '#e8e8e8',
            transition: 'width 0.5s ease'
          }} />
          <div style={{
            width: `${gameState.evaluation}%`,
            background: '#1a1a24',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '10px',
          opacity: 0.5
        }}>
          <span>White {100 - gameState.evaluation}%</span>
          <span>Black {gameState.evaluation}%</span>
        </div>
      </div>

      {/* Betting Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '0 8px',
        marginTop: '8px'
      }}>
        {[
          { id: 'moves', label: 'Moves', icon: '♟' },
          { id: 'outcome', label: 'Outcome', icon: '🎯' },
          { id: 'bets', label: 'My Bets', icon: '📋', count: pendingBets.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: activeTab === tab.id ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)',
              border: activeTab === tab.id ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              color: activeTab === tab.id ? '#22c55e' : 'rgba(255,255,255,0.6)',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count && (
              <span style={{
                background: '#22c55e',
                color: '#000',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '700'
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Move Predictions Panel */}
      {activeTab === 'moves' && (
        <div style={{ padding: '12px 8px' }}>
          {/* Instructions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '11px'
          }}>
            <span>💡</span>
            <span style={{ opacity: 0.8 }}>Tap to preview • Hold to bet</span>
          </div>

          {/* Move Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {movePredictions.map((move, i) => {
              const isSelected = selectedMove === move.move;
              const isHolding = holdingMove === move.move;
              const isLocked = lockedBets.includes(move.move);

              return (
                <button
                  key={move.move}
                  onTouchStart={() => {
                    handleMovePress(move.move);
                    handleMoveHoldStart(move);
                  }}
                  onTouchEnd={handleMoveHoldEnd}
                  onMouseDown={() => {
                    handleMovePress(move.move);
                    handleMoveHoldStart(move);
                  }}
                  onMouseUp={handleMoveHoldEnd}
                  onMouseLeave={handleMoveHoldEnd}
                  disabled={isLocked}
                  style={{
                    padding: '16px 12px',
                    background: isLocked
                      ? 'rgba(34, 197, 94, 0.2)'
                      : isSelected
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(255,255,255,0.03)',
                    border: isLocked
                      ? '2px solid #22c55e'
                      : isSelected
                        ? '1px solid rgba(34, 197, 94, 0.4)'
                        : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    cursor: isLocked ? 'default' : 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                    transform: isHolding ? 'scale(0.97)' : 'scale(1)',
                    opacity: isLocked ? 0.7 : 1
                  }}
                >
                  {/* Hold Progress Overlay */}
                  {isHolding && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: `${holdProgress * 100}%`,
                      height: '100%',
                      background: 'rgba(34, 197, 94, 0.2)',
                      transition: 'width 0.05s linear',
                      pointerEvents: 'none'
                    }} />
                  )}

                  {/* Locked Badge */}
                  {isLocked && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '12px'
                    }}>✓</div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: isSelected || isLocked ? '#22c55e' : '#fff'
                    }}>
                      {move.move}
                    </div>
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#22c55e'
                    }}>
                      {move.odds}x
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div style={{
                    height: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '6px',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: `${move.score}%`,
                      height: '100%',
                      background: isSelected || isLocked ? '#22c55e' : 'rgba(34, 197, 94, 0.5)'
                    }} />
                  </div>

                  <div style={{
                    fontSize: '11px',
                    opacity: 0.5,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {move.score}% engine score
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Outcome Panel */}
      {activeTab === 'outcome' && (
        <div style={{ padding: '12px 8px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {[
              { type: 'White Win', odds: 2.25, color: '#e8e8e8', icon: '♔' },
              { type: 'Draw', odds: 3.60, color: '#6b7280', icon: '½' },
              { type: 'Black Win', odds: 1.78, color: '#1a1a24', icon: '♚', border: true }
            ].map((outcome) => (
              <button
                key={outcome.type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: outcome.color,
                    border: outcome.border ? '1px solid #444' : 'none',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    color: outcome.color === '#e8e8e8' ? '#1a1a24' : '#e8e8e8'
                  }}>
                    {outcome.icon}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{outcome.type}</div>
                    <div style={{ fontSize: '12px', opacity: 0.5 }}>Tap to place bet</div>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#22c55e'
                }}>
                  {outcome.odds}x
                </div>
              </button>
            ))}
          </div>

          {/* Draw Odds */}
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(251, 191, 36, 0.1)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🎁</span>
              <span style={{ fontSize: '13px', color: '#fbbf24' }}>Draw pays 6x in this match!</span>
            </div>
          </div>
        </div>
      )}

      {/* My Bets Panel */}
      {activeTab === 'bets' && (
        <div style={{ padding: '12px 8px' }}>
          {pendingBets.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              opacity: 0.5
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <div style={{ fontSize: '14px' }}>No active bets</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Place a bet to see it here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingBets.map((bet, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{bet.type}</div>
                    <div style={{ fontSize: '11px', opacity: 0.5 }}>
                      ${bet.stake.toFixed(2)} @ {bet.odds}x
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>
                      ${(bet.stake * bet.odds).toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#fbbf24',
                      textTransform: 'uppercase'
                    }}>
                      {bet.status}
                    </div>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '12px',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '13px', opacity: 0.8 }}>Potential Return</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#22c55e' }}>
                  ${pendingBets.reduce((sum, b) => sum + b.stake * b.odds, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bet Confirmation Modal */}
      {showBetConfirm && pendingBet && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: 'linear-gradient(180deg, #1a1a24 0%, #12121a 100%)',
            borderRadius: '24px 24px 0 0',
            padding: '24px',
            paddingBottom: '40px'
          }}>
            {/* Handle */}
            <div style={{
              width: '40px',
              height: '4px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              margin: '0 auto 20px'
            }} />

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>♟</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>Bet on {pendingBet.move}?</div>
              <div style={{ fontSize: '14px', opacity: 0.5, marginTop: '4px' }}>
                {pendingBet.odds}x odds
              </div>
            </div>

            {/* Stake Selector */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '10px' }}>Select stake</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 5, 10].map(amount => (
                  <button
                    key={amount}
                    style={{
                      flex: 1,
                      padding: '14px 8px',
                      background: amount === 2 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: amount === 2 ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: amount === 2 ? '#22c55e' : '#fff',
                      fontSize: '16px',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Win */}
            <div style={{
              padding: '16px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ opacity: 0.7 }}>To win</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
                ${(2 * pendingBet.odds).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowBetConfirm(false);
                  setPendingBet(null);
                }}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmBet}
                style={{
                  flex: 2,
                  padding: '16px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                Place Bet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Safe Area */}
      <div style={{ height: '34px' }} />

      <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default BetMateMobileGame;
