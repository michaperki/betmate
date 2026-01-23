import React, { useState } from 'react';

const BetMateStats = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = {
    totalProfit: 1247.80,
    totalWagered: 8934.50,
    roi: 13.96,
    totalBets: 342,
    wonBets: 187,
    lostBets: 155,
    winRate: 54.7,
    avgOdds: 2.14,
    avgStake: 26.12,
    bestWin: 287.50,
    worstLoss: -75.00,
    currentStreak: 3,
    longestWinStreak: 8,
    longestLoseStreak: 5,
    profitTrend: 12.4,
    betsThisWeek: 23,
    profitThisWeek: 156.40
  };

  const monthlyData = [
    { month: 'Aug', profit: 89, bets: 28 },
    { month: 'Sep', profit: 234, bets: 45 },
    { month: 'Oct', profit: -67, bets: 52 },
    { month: 'Nov', profit: 445, bets: 78 },
    { month: 'Dec', profit: 312, bets: 84 },
    { month: 'Jan', profit: 234, bets: 55 }
  ];

  const weeklyProfitData = [
    { day: 'Mon', profit: 45 },
    { day: 'Tue', profit: -23 },
    { day: 'Wed', profit: 67 },
    { day: 'Thu', profit: 12 },
    { day: 'Fri', profit: 89 },
    { day: 'Sat', profit: -34 },
    { day: 'Sun', profit: 0 }
  ];

  const betTypeStats = [
    { type: 'White Win', bets: 98, won: 56, profit: 423.50, winRate: 57.1 },
    { type: 'Black Win', bets: 87, won: 49, profit: 312.80, winRate: 56.3 },
    { type: 'Draw', bets: 34, won: 12, profit: -45.20, winRate: 35.3 },
    { type: 'Move Predictions', bets: 123, won: 70, profit: 556.70, winRate: 56.9 }
  ];

  const timeControlStats = [
    { type: 'Bullet', bets: 45, winRate: 48.9, profit: -34.50, icon: '⚡' },
    { type: 'Blitz', bets: 156, winRate: 57.1, profit: 678.30, icon: '🔥' },
    { type: 'Rapid', bets: 98, winRate: 55.1, profit: 445.20, icon: '⏱️' },
    { type: 'Classical', bets: 43, winRate: 58.1, profit: 158.80, icon: '🏛️' }
  ];

  const recentPerformance = [
    { date: 'Today', bets: 5, won: 3, profit: 34.50 },
    { date: 'Yesterday', bets: 8, won: 5, profit: 67.20 },
    { date: '2 days ago', bets: 6, won: 2, profit: -23.40 },
    { date: '3 days ago', bets: 4, won: 3, profit: 45.80 },
    { date: '4 days ago', bets: 7, won: 4, profit: 32.30 }
  ];

  const topPlayers = [
    { name: 'Magnus Carlsen', bets: 23, winRate: 65.2, profit: 234.50 },
    { name: 'Hikaru Nakamura', bets: 18, winRate: 61.1, profit: 156.80 },
    { name: 'Fabiano Caruana', bets: 15, winRate: 53.3, profit: 67.20 },
    { name: 'Ding Liren', bets: 12, winRate: 58.3, profit: 89.40 },
    { name: 'Ian Nepomniachtchi', bets: 11, winRate: 45.5, profit: -23.50 }
  ];

  const hourlyActivity = [
    { hour: '6am', bets: 2 }, { hour: '9am', bets: 8 }, { hour: '12pm', bets: 15 },
    { hour: '3pm', bets: 23 }, { hour: '6pm', bets: 45 }, { hour: '9pm', bets: 38 },
    { hour: '12am', bets: 12 }
  ];

  const maxMonthlyProfit = Math.max(...monthlyData.map(d => Math.abs(d.profit)));
  const maxWeeklyProfit = Math.max(...weeklyProfitData.map(d => Math.abs(d.profit)));
  const maxHourlyBets = Math.max(...hourlyActivity.map(d => d.bets));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8',
      position: 'relative'
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'fixed',
        top: '20%',
        right: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '30%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%)',
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
              color: i === 3 ? '#22c55e' : 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              borderBottom: i === 3 ? '2px solid #22c55e' : '2px solid transparent',
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
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>Statistics</h1>
            <p style={{ fontSize: '14px', opacity: 0.5, margin: 0 }}>Deep dive into your betting performance</p>
          </div>

          {/* Time Range Selector */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(255,255,255,0.03)',
            padding: '4px',
            borderRadius: '10px'
          }}>
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'all', label: 'All' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                style={{
                  padding: '8px 16px',
                  background: timeRange === range.id ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  border: timeRange === range.id ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: timeRange === range.id ? '#22c55e' : 'rgba(255,255,255,0.5)',
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Total Profit */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '12px' }}>
              Total Profit
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', marginBottom: '8px' }}>
              +${stats.totalProfit.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>↑ {stats.profitTrend}%</span>
              <span style={{ opacity: 0.5, color: '#e8e8e8' }}>vs last period</span>
            </div>
          </div>

          {/* ROI */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '12px' }}>
              ROI
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              {stats.roi}%
            </div>
            <div style={{ fontSize: '12px', opacity: 0.5 }}>
              ${stats.totalWagered.toLocaleString()} wagered
            </div>
          </div>

          {/* Win Rate */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '12px' }}>
              Win Rate
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              {stats.winRate}%
            </div>
            <div style={{ fontSize: '12px', opacity: 0.5 }}>
              {stats.wonBets}W - {stats.lostBets}L
            </div>
          </div>

          {/* Total Bets */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '12px' }}>
              Total Bets
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              {stats.totalBets}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.5 }}>
              Avg ${stats.avgStake.toFixed(2)} / bet
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Profit Chart */}
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
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Profit Over Time</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '3px', background: '#22c55e', borderRadius: '2px' }} />
                  Profit
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
                  <span style={{ width: '12px', height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                  Bets
                </span>
              </div>
            </div>

            {/* Chart Area */}
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {monthlyData.map((data, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '160px'
                  }}>
                    {/* Profit Bar */}
                    <div style={{
                      width: '60%',
                      height: `${Math.abs(data.profit) / maxMonthlyProfit * 100}%`,
                      minHeight: '4px',
                      background: data.profit >= 0 
                        ? 'linear-gradient(180deg, #22c55e 0%, rgba(34, 197, 94, 0.3) 100%)'
                        : 'linear-gradient(180deg, #ef4444 0%, rgba(239, 68, 68, 0.3) 100%)',
                      borderRadius: '4px 4px 0 0',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: data.profit >= 0 ? '#22c55e' : '#ef4444',
                        whiteSpace: 'nowrap'
                      }}>
                        {data.profit >= 0 ? '+' : ''}{data.profit}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', opacity: 0.5 }}>{data.month}</span>
                </div>
              ))}
            </div>

            {/* Chart Summary */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Best Month</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>Nov (+$445)</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Worst Month</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>Oct (-$67)</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Avg Monthly</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>+$208</div>
              </div>
            </div>
          </div>

          {/* Win/Loss Breakdown */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>Win/Loss Breakdown</div>

            {/* Donut Chart */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: `conic-gradient(#22c55e 0deg ${stats.winRate * 3.6}deg, #ef4444 ${stats.winRate * 3.6}deg 360deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: '#12121a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.winRate}%</div>
                  <div style={{ fontSize: '10px', opacity: 0.5 }}>Win Rate</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e' }} />
                  <span style={{ fontSize: '13px' }}>Won</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{stats.wonBets}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }} />
                  <span style={{ fontSize: '13px' }}>Lost</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{stats.lostBets}</span>
              </div>
            </div>

            {/* Streaks */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', opacity: 0.6 }}>Current Streak</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#22c55e' }}>🔥 {stats.currentStreak}W</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', opacity: 0.6 }}>Best Win Streak</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{stats.longestWinStreak}W</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', opacity: 0.6 }}>Worst Lose Streak</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{stats.longestLoseStreak}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Bet Type Performance */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>By Bet Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {betTypeStats.map((item, i) => (
                <div key={i} style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.type}</span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: item.profit >= 0 ? '#22c55e' : '#ef4444'
                    }}>
                      {item.profit >= 0 ? '+' : ''}${item.profit.toFixed(2)}
                    </span>
                  </div>
                  <div style={{
                    height: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      width: `${item.winRate}%`,
                      height: '100%',
                      background: item.winRate >= 50 ? '#22c55e' : '#ef4444'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.5 }}>
                    <span>{item.bets} bets</span>
                    <span>{item.winRate}% win rate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Control Performance */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>By Time Control</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {timeControlStats.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: item.profit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{item.type}</div>
                    <div style={{ fontSize: '11px', opacity: 0.5 }}>{item.bets} bets • {item.winRate}%</div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: item.profit >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {item.profit >= 0 ? '+' : ''}${item.profit.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(34, 197, 94, 0.08)',
              borderRadius: '8px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <span>💡</span>
              <span style={{ opacity: 0.8 }}>You perform best in Blitz games. Consider focusing more on this format.</span>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>Betting Activity</div>
            
            {/* Hourly Distribution */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '12px' }}>By Hour (Most Active)</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
                {hourlyActivity.map((item, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '100%',
                      height: `${(item.bets / maxHourlyBets) * 60}px`,
                      minHeight: '4px',
                      background: item.bets === maxHourlyBets 
                        ? '#22c55e' 
                        : 'rgba(34, 197, 94, 0.3)',
                      borderRadius: '3px'
                    }} />
                    <span style={{ fontSize: '9px', opacity: 0.4 }}>{item.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Pattern */}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '12px' }}>This Week P&L</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {weeklyProfitData.map((item, i) => (
                  <div key={i} style={{
                    flex: 1,
                    padding: '10px 6px',
                    background: item.profit > 0 
                      ? 'rgba(34, 197, 94, 0.15)' 
                      : item.profit < 0 
                        ? 'rgba(239, 68, 68, 0.15)' 
                        : 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '9px', opacity: 0.5, marginBottom: '4px' }}>{item.day}</div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: item.profit > 0 ? '#22c55e' : item.profit < 0 ? '#ef4444' : 'rgba(255,255,255,0.3)'
                    }}>
                      {item.profit > 0 ? '+' : ''}{item.profit || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Time */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: '8px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ opacity: 0.7 }}>Peak betting time</span>
              <span style={{ fontWeight: '600' }}>6:00 PM</span>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          {/* Recent Performance */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>Recent Performance</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentPerformance.map((day, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  background: day.profit >= 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  borderRadius: '10px',
                  borderLeft: `3px solid ${day.profit >= 0 ? '#22c55e' : '#ef4444'}`
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{day.date}</div>
                    <div style={{ fontSize: '11px', opacity: 0.5 }}>{day.bets} bets • {day.won}W {day.bets - day.won}L</div>
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: day.profit >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {day.profit >= 0 ? '+' : ''}${day.profit.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Players */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>Your Best Players to Bet On</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topPlayers.map((player, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: i < 3 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: i < 3 ? '#22c55e' : 'rgba(255,255,255,0.4)'
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{player.name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.5 }}>{player.bets} bets • {player.winRate}% win rate</div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: player.profit >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {player.profit >= 0 ? '+' : ''}${player.profit.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(34, 197, 94, 0.08)',
              borderRadius: '8px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <span>💡</span>
              <span style={{ opacity: 0.8 }}>Betting on Magnus Carlsen has your highest ROI at 24.3%</span>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <button style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '13px',
            fontFamily: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📥</span> Export CSV
          </button>
          <button style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '13px',
            fontFamily: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📊</span> Share Stats
          </button>
        </div>
      </main>
    </div>
  );
};

export default BetMateStats;
