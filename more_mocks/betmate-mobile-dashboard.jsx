import React, { useState } from 'react';

const BetMateMobileDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');

  const user = {
    username: 'abc124',
    avatar: 'A',
    balance: 279.50,
    profit: 156.40,
    profitPercent: 12.4
  };

  const stats = {
    winRate: 54,
    totalBets: 87,
    streak: 3
  };

  const liveMatches = [
    {
      id: 1,
      white: { name: 'Magnus Carlsen', rating: 2830 },
      black: { name: 'Hikaru Nakamura', rating: 2802 },
      timeWhite: '4:32',
      timeBlack: '3:18',
      move: 28,
      format: '5+3 Blitz',
      viewers: 4521,
      pool: 2847.50,
      hot: true
    },
    {
      id: 2,
      white: { name: 'Fabiano Caruana', rating: 2786 },
      black: { name: 'Ding Liren', rating: 2780 },
      timeWhite: '12:45',
      timeBlack: '14:02',
      move: 19,
      format: '15+10 Rapid',
      viewers: 1893,
      pool: 1456.20,
      hot: false
    },
    {
      id: 3,
      white: { name: 'DrNykterstein', rating: 2839 },
      black: { name: 'Firouzja2003', rating: 2785 },
      timeWhite: '1:42',
      timeBlack: '0:58',
      move: 41,
      format: '3+0 Bullet',
      viewers: 8234,
      pool: 5621.80,
      hot: true
    }
  ];

  const activeBets = [
    { type: 'Black Win', match: 'Carlsen vs Nakamura', odds: 2.10, stake: 5.00, status: 'winning' },
    { type: 'Move Nd2', match: 'Caruana vs Ding', odds: 1.90, stake: 2.00, status: 'pending' }
  ];

  const recentActivity = [
    { type: 'White Win', result: 'won', profit: 6.75 },
    { type: 'Move e4', result: 'lost', profit: -2.00 },
    { type: 'Black Win', result: 'won', profit: 5.50 }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#e8e8e8',
      paddingBottom: '100px',
      maxWidth: '430px',
      margin: '0 auto'
    }}>
      {/* Status Bar */}
      <div style={{ height: '44px', background: 'rgba(0,0,0,0.3)' }} />

      {/* Header */}
      <header style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '13px', opacity: 0.5, marginBottom: '2px' }}>Welcome back</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{user.username} 👋</div>
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '700',
          color: '#000'
        }}>
          {user.avatar}
        </div>
      </header>

      {/* Balance Card */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Total Balance</div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>${user.balance.toFixed(2)}</div>
            </div>
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#22c55e',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ↑ {user.profitPercent}%
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontSize: '14px',
              fontWeight: '700',
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span>+</span> Deposit
            </button>
            <button style={{
              flex: 1,
              padding: '14px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}>
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '0 16px',
        marginBottom: '24px'
      }}>
        {[
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: '🎯' },
          { label: 'Total Bets', value: stats.totalBets, icon: '📊' },
          { label: 'Streak', value: `${stats.streak}🔥`, icon: '' }
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            padding: '16px 12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Active Bets */}
      {activeBets.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Active Bets</h2>
            <a href="#" style={{ fontSize: '13px', color: '#22c55e', textDecoration: 'none' }}>See All</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeBets.map((bet, i) => (
              <div key={i} style={{
                background: bet.status === 'winning' 
                  ? 'rgba(34, 197, 94, 0.08)' 
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${bet.status === 'winning' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{bet.type}</div>
                  <div style={{ fontSize: '11px', opacity: 0.5 }}>{bet.match} • {bet.odds}x</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>
                    ${(bet.stake * bet.odds).toFixed(2)}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: bet.status === 'winning' ? '#22c55e' : '#fbbf24',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {bet.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Games */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          marginBottom: '12px'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            Live Games
          </h2>
          <a href="#" style={{ fontSize: '13px', color: '#22c55e', textDecoration: 'none' }}>View All</a>
        </div>

        {/* Horizontal scroll */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          padding: '0 16px 8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {liveMatches.map((match) => (
            <div key={match.id} style={{
              minWidth: '280px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '16px',
              position: 'relative'
            }}>
              {match.hot && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '9px',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  🔥 HOT
                </div>
              )}

              <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '12px' }}>
                {match.format} • Move {match.move}
              </div>

              {/* Players */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#e8e8e8',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#1a1a24'
                    }}>♔</div>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{match.white.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                    {match.timeWhite}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: '#1a1a24',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>♚</div>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{match.black.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                    {match.timeBlack}
                  </span>
                </div>
              </div>

              {/* Stats & CTA */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ fontSize: '11px', opacity: 0.5 }}>
                  👁 {match.viewers.toLocaleString()} • 💰 ${match.pool.toLocaleString()}
                </div>
                <button style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}>
                  Bet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Recent Activity</h2>
          <a href="#" style={{ fontSize: '13px', color: '#22c55e', textDecoration: 'none' }}>History</a>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {recentActivity.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: item.result === 'won' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  {item.result === 'won' ? '✓' : '✗'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{item.type}</div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: item.result === 'won' ? '#22c55e' : '#ef4444',
                    textTransform: 'capitalize'
                  }}>
                    {item.result}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: item.profit >= 0 ? '#22c55e' : '#ef4444'
              }}>
                {item.profit >= 0 ? '+' : ''}${item.profit.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        background: 'rgba(18, 18, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '8px 16px',
        paddingBottom: '28px',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'markets', icon: '📊', label: 'Markets' },
          { id: 'bets', icon: '🎯', label: 'My Bets' },
          { id: 'stats', icon: '📈', label: 'Stats' },
          { id: 'more', icon: '☰', label: 'More' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              opacity: activeTab === tab.id ? 1 : 0.5
            }}
          >
            <span style={{ 
              fontSize: '22px',
              filter: activeTab === tab.id ? 'none' : 'grayscale(100%)'
            }}>{tab.icon}</span>
            <span style={{ 
              fontSize: '10px', 
              color: activeTab === tab.id ? '#22c55e' : '#fff',
              fontWeight: activeTab === tab.id ? '600' : '400'
            }}>{tab.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BetMateMobileDashboard;
