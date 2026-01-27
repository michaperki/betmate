import React, { useState } from 'react';

const BetMateEmptyStates = () => {
  const [activeState, setActiveState] = useState('no-bets');

  const emptyStates = [
    { id: 'no-bets', label: 'No Active Bets' },
    { id: 'no-history', label: 'No History' },
    { id: 'no-stats', label: 'No Stats' },
    { id: 'no-markets', label: 'No Markets' },
    { id: 'no-results', label: 'No Search Results' },
    { id: 'offline', label: 'Offline' },
    { id: 'error', label: 'Error' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8',
      padding: '40px 20px'
    }}>
      {/* State Selector */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 40px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
          Empty States
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.5, textAlign: 'center', marginBottom: '24px' }}>
          Click to preview different empty states
        </p>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center'
        }}>
          {emptyStates.map(state => (
            <button
              key={state.id}
              onClick={() => setActiveState(state.id)}
              style={{
                padding: '10px 16px',
                background: activeState === state.id ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.03)',
                border: activeState === state.id ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: activeState === state.id ? '#22c55e' : 'rgba(255,255,255,0.6)',
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              {state.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State Display */}
      <div style={{
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          
          {/* No Active Bets */}
          {activeState === 'no-bets' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 24px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <span style={{ fontSize: '48px' }}>🎯</span>
                <div style={{
                  position: 'absolute',
                  inset: '-4px',
                  border: '2px dashed rgba(34, 197, 94, 0.3)',
                  borderRadius: '50%',
                  animation: 'spin 20s linear infinite'
                }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                No Active Bets
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '32px', lineHeight: '1.6' }}>
                You don't have any bets in play right now.<br />
                Find a game and make your first prediction!
              </p>
              <button style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🔥</span> Browse Live Games
              </button>
            </>
          )}

          {/* No History */}
          {activeState === 'no-history' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 24px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '48px' }}>📜</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                No Betting History
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '32px', lineHeight: '1.6' }}>
                Your completed bets will appear here.<br />
                Place your first bet to start building your history!
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button style={{
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}>
                  Start Betting
                </button>
                <button style={{
                  padding: '14px 24px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}>
                  How It Works
                </button>
              </div>
            </>
          )}

          {/* No Stats */}
          {activeState === 'no-stats' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 24px',
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '48px' }}>📊</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                No Stats Yet
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '24px', lineHeight: '1.6' }}>
                Complete at least 5 bets to unlock your<br />
                personal analytics and insights.
              </p>
              
              {/* Progress indicator */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '13px'
                }}>
                  <span style={{ opacity: 0.6 }}>Progress</span>
                  <span style={{ color: '#fbbf24', fontWeight: '600' }}>0 / 5 bets</span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '0%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              <button style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}>
                Place Your First Bet
              </button>
            </>
          )}

          {/* No Markets */}
          {activeState === 'no-markets' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 24px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '48px' }}>♟️</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                No Live Games Right Now
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '32px', lineHeight: '1.6' }}>
                There are no games available at the moment.<br />
                Check back soon or enable notifications!
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'center'
              }}>
                <button style={{
                  padding: '14px 28px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔔</span> Notify Me When Games Start
                </button>
                <span style={{ fontSize: '12px', opacity: 0.4 }}>
                  Usually more games between 3PM - 11PM UTC
                </span>
              </div>
            </>
          )}

          {/* No Search Results */}
          {activeState === 'no-results' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 24px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '48px' }}>🔍</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                No Results Found
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '24px', lineHeight: '1.6' }}>
                We couldn't find any matches for<br />
                <span style={{ color: '#22c55e', fontWeight: '500' }}>"Magnus Carlsen"</span>
              </p>
              
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '10px' }}>Suggestions:</div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '13px',
                  opacity: 0.7,
                  lineHeight: '1.8'
                }}>
                  <li>Check the spelling of player names</li>
                  <li>Try searching for a different player</li>
                  <li>Remove filters to see more results</li>
                </ul>
              </div>

              <button style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}>
                Clear Search
              </button>
            </>
          )}

          {/* Offline */}
          {activeState === 'offline' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 24px',
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <span style={{ fontSize: '48px' }}>📡</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                You're Offline
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '32px', lineHeight: '1.6' }}>
                It looks like you've lost your internet connection.<br />
                Please check your network and try again.
              </p>
              
              <button style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🔄</span> Try Again
              </button>
              
              <div style={{
                marginTop: '24px',
                padding: '12px 16px',
                background: 'rgba(251, 191, 36, 0.08)',
                borderRadius: '8px',
                fontSize: '12px',
                opacity: 0.7
              }}>
                ⚠️ Live bets require an active connection
              </div>
            </>
          )}

          {/* Error */}
          {activeState === 'error' && (
            <>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 24px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '48px' }}>😵</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                Something Went Wrong
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '24px', lineHeight: '1.6' }}>
                We encountered an unexpected error.<br />
                Our team has been notified.
              </p>
              
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#ef4444',
                textAlign: 'left'
              }}>
                Error: CONNECTION_TIMEOUT<br />
                Code: 504
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button style={{
                  padding: '14px 24px',
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
                  gap: '8px'
                }}>
                  <span>🔄</span> Retry
                </button>
                <button style={{
                  padding: '14px 24px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}>
                  Contact Support
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BetMateEmptyStates;
