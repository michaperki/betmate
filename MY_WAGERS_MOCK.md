import React, { useState } from 'react';

const BetMateMyBets = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const activeBets = [
    {
      id: 1,
      match: { white: 'dudalodudalo', black: 'Mahlermaniaco', whiteRating: 2466, blackRating: 2563 },
      betType: 'Black Win',
      category: 'outcome',
      odds: 2.02,
      stake: 5.00,
      potentialWin: 10.10,
      currentOdds: 1.85,
      cashoutValue: 5.45,
      placedAt: '2 min ago',
      move: 22,
      phase: 'Midgame',
      evaluation: 52, // black's winning chances
      status: 'winning'
    },
    {
      id: 2,
      match: { white: 'dudalodudalo', black: 'Mahlermaniaco', whiteRating: 2466, blackRating: 2563 },
      betType: 'Move Nd2',
      category: 'move',
      odds: 1.90,
      stake: 2.00,
      potentialWin: 3.80,
      currentOdds: 2.40,
      cashoutValue: 1.58,
      placedAt: '5 min ago',
      move: 22,
      phase: 'Midgame',
      evaluation: null,
      status: 'pending'
    },
    {
      id: 3,
      match: { white: 'DrNykterstein', black: 'Firouzja2003', whiteRating: 2839, blackRating: 2785 },
      betType: 'White Win',
      category: 'outcome',
      odds: 1.65,
      stake: 10.00,
      potentialWin: 16.50,
      currentOdds: 1.35,
      cashoutValue: 12.22,
      placedAt: '8 min ago',
      move: 31,
      phase: 'Endgame',
      evaluation: 71,
      status: 'winning'
    },
    {
      id: 4,
      match: { white: 'DrNykterstein', black: 'Firouzja2003', whiteRating: 2839, blackRating: 2785 },
      betType: 'Draw',
      category: 'outcome',
      odds: 4.50,
      stake: 2.00,
      potentialWin: 9.00,
      currentOdds: 6.20,
      cashoutValue: 1.45,
      placedAt: '8 min ago',
      move: 31,
      phase: 'Endgame',
      evaluation: 8,
      status: 'losing'
    }
  ];

  const betHistory = [
    { id: 101, match: 'Carlsen vs Nepomniachtchi', betType: 'White Win', odds: 1.45, stake: 15.00, result: 'won', profit: 6.75, date: 'Today, 2:34 PM' },
    { id: 102, match: 'Caruana vs So', betType: 'Move e4', odds: 3.20, stake: 2.00, result: 'lost', profit: -2.00, date: 'Today, 1:15 PM' },
    { id: 103, match: 'Ding vs Gukesh', betType: 'Black Win', odds: 2.10, stake: 5.00, result: 'won', profit: 5.50, date: 'Today, 11:42 AM' },
    { id: 104, match: 'Aronian vs MVL', betType: 'Draw', odds: 3.80, stake: 3.00, result: 'lost', profit: -3.00, date: 'Yesterday' },
    { id: 105, match: 'Rapport vs Giri', betType: 'White Win', odds: 1.90, stake: 8.00, result: 'won', profit: 7.20, date: 'Yesterday' },
    { id: 106, match: 'Nakamura vs Artemiev', betType: 'Move Qxd5', odds: 2.80, stake: 2.00, result: 'won', profit: 3.60, date: 'Yesterday' },
    { id: 107, match: 'Praggnanandhaa vs Erigaisi', betType: 'Black Win', odds: 2.35, stake: 4.00, result: 'lost', profit: -4.00, date: '2 days ago' },
    { id: 108, match: 'Wei Yi vs Wang Hao', betType: 'White Win', odds: 1.72, stake: 10.00, result: 'won', profit: 7.20, date: '2 days ago' },
  ];

  const stats = {
    totalActive: 4,
    totalAtRisk: 19.00,
    potentialReturn: 39.40,
    todayPL: 10.25,
    weekPL: 156.40,
    monthPL: 423.80,
    winRate: 54,
    avgOdds: 2.14,
    roiPercent: 12.4,
    totalBets: 87,
    wonBets: 47,
    lostBets: 40
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'winning': return '#22c55e';
      case 'losing': return '#ef4444';
      default: return '#fbbf24';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'winning': return 'rgba(34, 197, 94, 0.1)';
      case 'losing': return 'rgba(239, 68, 68, 0.08)';
      default: return 'rgba(251, 191, 36, 0.08)';
    }
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
        top: '30%',
        right: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%)',
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
              color: i === 2 ? '#22c55e' : 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              borderBottom: i === 2 ? '2px solid #22c55e' : '2px solid transparent',
              paddingBottom: '4px'
            }}>{item}</a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#22c55e', fontWeight: '600' }}>279.50</span>
            <span style={{ opacity: 0.5 }}>USDT</span>
          </div>
        </div>
      </header>

      <main style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Title & Quick Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              My Bets
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: '600'
              }}>
                {stats.totalActive} Active
              </span>
            </h1>
            <p style={{ margin: '8px 0 0', opacity: 0.5, fontSize: '14px' }}>
              Track your positions and betting history
            </p>
          </div>

          {/* Quick P&L Summary */}
          <div style={{
            display: 'flex',
            gap: '24px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px 24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Today</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: stats.todayPL >= 0 ? '#22c55e' : '#ef4444' }}>
                {stats.todayPL >= 0 ? '+' : ''}{stats.todayPL.toFixed(2)}
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>This Week</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: stats.weekPL >= 0 ? '#22c55e' : '#ef4444' }}>
                {stats.weekPL >= 0 ? '+' : ''}{stats.weekPL.toFixed(2)}
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>This Month</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: stats.monthPL >= 0 ? '#22c55e' : '#ef4444' }}>
                {stats.monthPL >= 0 ? '+' : ''}{stats.monthPL.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '24px'
        }}>
          {/* Left - Bets List */}
          <div>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                background: 'rgba(255,255,255,0.03)',
                padding: '6px',
                borderRadius: '12px'
              }}>
                {[
                  { id: 'active', label: 'Active', count: stats.totalActive },
                  { id: 'history', label: 'History', count: betHistory.length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: activeTab === tab.id ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                      border: activeTab === tab.id ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                      color: activeTab === tab.id ? '#22c55e' : 'rgba(255,255,255,0.5)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {tab.label}
                    <span style={{
                      background: activeTab === tab.id ? '#22c55e' : 'rgba(255,255,255,0.2)',
                      color: activeTab === tab.id ? '#000' : '#fff',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Filters - only show for history */}
              {activeTab === 'history' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="outcome">Outcome Bets</option>
                    <option value="move">Move Bets</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="amount">Highest Stake</option>
                    <option value="profit">Highest Profit</option>
                  </select>
                </div>
              )}
            </div>

            {/* Active Bets */}
            {activeTab === 'active' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* At Risk Summary */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.02) 100%)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>⚡</span>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Total at risk</div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>${stats.totalAtRisk.toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Potential return</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>${stats.potentialReturn.toFixed(2)}</div>
                  </div>
                </div>

                {/* Active Bet Cards */}
                {activeBets.map(bet => (
                  <div 
                    key={bet.id}
                    style={{
                      background: getStatusBg(bet.status),
                      border: `1px solid ${getStatusColor(bet.status)}33`,
                      borderRadius: '16px',
                      padding: '20px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Status indicator line */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: getStatusColor(bet.status)
                    }} />

                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '11px', 
                          opacity: 0.5, 
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            animation: 'pulse 2s infinite'
                          }} />
                          LIVE • Move {bet.move} • {bet.phase}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {bet.match.white} vs {bet.match.black}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: getStatusColor(bet.status) + '20',
                        color: getStatusColor(bet.status),
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {bet.status}
                      </div>
                    </div>

                    {/* Bet Details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Your Bet</div>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>{bet.betType}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Stake</div>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>${bet.stake.toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Odds</div>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>
                          {bet.odds}x
                          {bet.currentOdds !== bet.odds && (
                            <span style={{ 
                              fontSize: '11px', 
                              marginLeft: '6px',
                              color: bet.currentOdds < bet.odds ? '#22c55e' : '#ef4444'
                            }}>
                              → {bet.currentOdds}x
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>To Win</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#22c55e' }}>
                          ${bet.potentialWin.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Evaluation bar (for outcome bets) */}
                    {bet.evaluation !== null && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          fontSize: '11px', 
                          opacity: 0.5,
                          marginBottom: '6px'
                        }}>
                          <span>Win probability</span>
                          <span>{bet.evaluation}%</span>
                        </div>
                        <div style={{
                          height: '6px',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${bet.evaluation}%`,
                            height: '100%',
                            background: bet.evaluation > 50 
                              ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
                              : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>
                        Placed {bet.placedAt}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'inherit'
                        }}>
                          Watch Game
                        </button>
                        <button style={{
                          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          color: '#fbbf24',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          Cash Out
                          <span style={{ 
                            background: 'rgba(251, 191, 36, 0.3)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            ${bet.cashoutValue.toFixed(2)}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bet History */}
            {activeTab === 'history' && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 1fr 1fr',
                  gap: '16px',
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.5
                }}>
                  <div>Match</div>
                  <div>Bet</div>
                  <div>Odds</div>
                  <div>Stake</div>
                  <div>Result</div>
                  <div style={{ textAlign: 'right' }}>P&L</div>
                </div>

                {/* Table Rows */}
                {betHistory.map((bet, i) => (
                  <div 
                    key={bet.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 0.8fr 0.8fr 1fr 1fr',
                      gap: '16px',
                      padding: '16px 20px',
                      borderBottom: i < betHistory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      alignItems: 'center',
                      transition: 'background 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{bet.match}</div>
                      <div style={{ fontSize: '11px', opacity: 0.5 }}>{bet.date}</div>
                    </div>
                    <div style={{ fontSize: '13px' }}>{bet.betType}</div>
                    <div style={{ fontSize: '13px' }}>{bet.odds}x</div>
                    <div style={{ fontSize: '13px' }}>${bet.stake.toFixed(2)}</div>
                    <div>
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: bet.result === 'won' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: bet.result === 'won' ? '#22c55e' : '#ef4444',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {bet.result}
                      </span>
                    </div>
                    <div style={{ 
                      textAlign: 'right',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: bet.profit >= 0 ? '#22c55e' : '#ef4444'
                    }}>
                      {bet.profit >= 0 ? '+' : ''}{bet.profit.toFixed(2)}
                    </div>
                  </div>
                ))}

                {/* Load More */}
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <button style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'inherit'
                  }}>
                    Load More
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Performance Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{ 
                fontSize: '11px', 
                textTransform: 'uppercase', 
                letterSpacing: '2px', 
                opacity: 0.5,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '14px' }}>📈</span>
                Performance
              </div>

              {/* Win/Loss Donut Visualization */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `conic-gradient(#22c55e 0deg ${stats.winRate * 3.6}deg, #ef4444 ${stats.winRate * 3.6}deg 360deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#12121a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '700'
                  }}>
                    {stats.winRate}%
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22c55e' }} />
                    <span style={{ fontSize: '13px' }}>{stats.wonBets} Won</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }} />
                    <span style={{ fontSize: '13px' }}>{stats.lostBets} Lost</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px'
                }}>
                  <span style={{ opacity: 0.6, fontSize: '13px' }}>Total Bets</span>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>{stats.totalBets}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px'
                }}>
                  <span style={{ opacity: 0.6, fontSize: '13px' }}>Avg Odds</span>
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>{stats.avgOdds}x</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  borderRadius: '8px',
                  border: '1px solid rgba(34, 197, 94, 0.15)'
                }}>
                  <span style={{ opacity: 0.8, fontSize: '13px' }}>ROI</span>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#22c55e' }}>+{stats.roiPercent}%</span>
                </div>
              </div>
            </div>

            {/* Bet Type Breakdown */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{ 
                fontSize: '11px', 
                textTransform: 'uppercase', 
                letterSpacing: '2px', 
                opacity: 0.5,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '14px' }}>🎯</span>
                By Bet Type
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { type: 'Outcome Bets', count: 52, winRate: 58, profit: 124.50 },
                  { type: 'Move Bets', count: 35, winRate: 48, profit: 31.90 }
                ].map(item => (
                  <div key={item.type} style={{
                    padding: '14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.type}</span>
                      <span style={{ fontSize: '12px', opacity: 0.5 }}>{item.count} bets</span>
                    </div>
                    <div style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: `${item.winRate}%`,
                        height: '100%',
                        background: item.winRate >= 50 ? '#22c55e' : '#ef4444'
                      }} />
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}>
                      <span style={{ opacity: 0.5 }}>{item.winRate}% win rate</span>
                      <span style={{ color: item.profit >= 0 ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                        {item.profit >= 0 ? '+' : ''}${item.profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export / Download */}
            <button style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              padding: '14px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>📥</span>
              Export History (CSV)
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        select option {
          background: #1a1a24;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default BetMateMyBets;
