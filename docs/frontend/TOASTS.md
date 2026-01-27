import React, { useState, useEffect } from 'react';

const BetMateToasts = () => {
  const [toasts, setToasts] = useState([]);
  const [toastId, setToastId] = useState(0);

  const toastTypes = [
    {
      id: 'bet-placed',
      type: 'success',
      icon: '✓',
      title: 'Bet Placed',
      message: '$5.00 on Black Win @ 2.10x',
      action: 'View Bet'
    },
    {
      id: 'bet-won',
      type: 'win',
      icon: '🎉',
      title: 'You Won!',
      message: '+$10.50 on White Win',
      action: 'Collect'
    },
    {
      id: 'bet-lost',
      type: 'loss',
      icon: '😔',
      title: 'Bet Lost',
      message: '-$5.00 on Move Nc5',
      action: 'Try Again'
    },
    {
      id: 'deposit',
      type: 'success',
      icon: '💰',
      title: 'Deposit Confirmed',
      message: '+$100.00 added to your balance',
      action: 'Start Betting'
    },
    {
      id: 'withdraw',
      type: 'info',
      icon: '📤',
      title: 'Withdrawal Processing',
      message: '$50.00 will arrive in ~10 minutes',
      action: 'Track'
    },
    {
      id: 'game-starting',
      type: 'info',
      icon: '🔔',
      title: 'Game Starting Soon',
      message: 'Carlsen vs Nakamura in 5 minutes',
      action: 'Join'
    },
    {
      id: 'cashout',
      type: 'success',
      icon: '💵',
      title: 'Cash Out Successful',
      message: 'Secured $8.50 profit',
      action: 'View'
    },
    {
      id: 'error',
      type: 'error',
      icon: '⚠️',
      title: 'Transaction Failed',
      message: 'Please check your connection and try again',
      action: 'Retry'
    }
  ];

  const addToast = (toastType) => {
    const newToast = {
      ...toastType,
      uniqueId: toastId
    };
    setToastId(prev => prev + 1);
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(newToast.uniqueId);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.uniqueId !== id));
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          iconBg: 'rgba(34, 197, 94, 0.2)',
          iconColor: '#22c55e'
        };
      case 'win':
        return {
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          iconBg: 'linear-gradient(135deg, #22c55e 0%, #fbbf24 100%)',
          iconColor: '#000'
        };
      case 'loss':
        return {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          iconBg: 'rgba(239, 68, 68, 0.2)',
          iconColor: '#ef4444'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          iconBg: 'rgba(239, 68, 68, 0.2)',
          iconColor: '#ef4444'
        };
      case 'info':
      default:
        return {
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.04) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          iconBg: 'rgba(99, 102, 241, 0.2)',
          iconColor: '#818cf8'
        };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8',
      padding: '40px 20px'
    }}>
      {/* Toast Container - Fixed Position */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
        maxWidth: '380px',
        width: '100%'
      }}>
        {toasts.map((toast, index) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.uniqueId}
              style={{
                background: styles.background,
                border: styles.border,
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                animation: 'slideIn 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Progress bar for auto-dismiss */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                background: styles.iconColor,
                animation: 'progress 5s linear forwards',
                opacity: 0.5
              }} />

              {/* Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                background: styles.iconBg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
                color: styles.iconColor
              }}>
                {toast.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{toast.title}</div>
                  <button
                    onClick={() => removeToast(toast.uniqueId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '18px',
                      lineHeight: 1,
                      marginLeft: '8px'
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '10px' }}>
                  {toast.message}
                </div>
                {toast.action && (
                  <button style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}>
                    {toast.action}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Controls */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
          Toast Notifications
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.5, textAlign: 'center', marginBottom: '32px' }}>
          Click buttons to trigger different notification types
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {toastTypes.map((toastType) => {
            const styles = getToastStyles(toastType.type);
            return (
              <button
                key={toastType.id}
                onClick={() => addToast(toastType)}
                style={{
                  padding: '20px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: styles.iconBg,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    {toastType.icon}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                    {toastType.title}
                  </span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.5, color: '#fff' }}>
                  {toastType.message}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bulk Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => {
              toastTypes.slice(0, 3).forEach((t, i) => {
                setTimeout(() => addToast(t), i * 300);
              });
            }}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontSize: '13px',
              fontWeight: '700',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            Stack Multiple
          </button>
          <button
            onClick={() => setToasts([])}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Mobile Preview */}
      <div style={{
        maxWidth: '380px',
        margin: '60px auto 0',
        padding: '20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.6 }}>
          Mobile Preview (Bottom Position)
        </h3>
        <div style={{
          background: '#0a0a0f',
          borderRadius: '12px',
          padding: '16px',
          minHeight: '200px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Mock mobile screen */}
          <div style={{
            height: '20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '4px',
            marginBottom: '12px',
            width: '60%'
          }} />
          <div style={{
            height: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '4px',
            marginBottom: '8px'
          }} />
          <div style={{
            height: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '4px',
            width: '80%'
          }} />

          {/* Bottom toast example */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #22c55e 0%, #fbbf24 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              🎉
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>You Won!</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>+$10.50</div>
            </div>
            <button style={{
              background: 'rgba(0,0,0,0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}>
              Collect
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default BetMateToasts;
