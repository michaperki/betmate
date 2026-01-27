import React, { useState } from 'react';

const BetMateLogin = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'wallet'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(null);
  const [error, setError] = useState('');

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      // Would redirect on success
    }, 1500);
  };

  const handleWalletConnect = (wallet) => {
    setWalletConnecting(wallet);
    setError('');
    
    // Simulate wallet connection
    setTimeout(() => {
      setWalletConnecting(null);
      // Would redirect on success
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Left Side - Branding (hidden on mobile) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, transparent 60%)'
      }} className="desktop-only">
        {/* Large ambient glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(80px)'
        }} />

        {/* Floating chess pieces */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          fontSize: '120px',
          opacity: 0.06,
          transform: 'rotate(-15deg)'
        }}>♞</div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          fontSize: '100px',
          opacity: 0.05,
          transform: 'rotate(10deg)'
        }}>♛</div>
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          fontSize: '80px',
          opacity: 0.04
        }}>♜</div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f87171' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#22c55e' }} />
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#60a5fa' }} />
            </div>
            <span style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', letterSpacing: '1px' }}>BetMate</span>
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            lineHeight: '1.1',
            margin: '0 0 24px'
          }}>
            Bet on Chess,<br />
            <span style={{ color: '#22c55e' }}>Live.</span>
          </h1>

          <p style={{
            fontSize: '18px',
            opacity: 0.6,
            lineHeight: '1.6',
            margin: '0 0 48px'
          }}>
            Predict moves, bet on outcomes, and win while watching the world's best players compete in real-time.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '40px'
          }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>$2.4M+</div>
              <div style={{ fontSize: '13px', opacity: 0.5 }}>Total Wagered</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>12K+</div>
              <div style={{ fontSize: '13px', opacity: 0.5 }}>Active Bettors</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>50+</div>
              <div style={{ fontSize: '13px', opacity: 0.5 }}>Live Games Daily</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative'
      }}>
        {/* Mobile Logo (shown only on mobile) */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '40px'
        }} className="mobile-only">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#f87171' }} />
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#22c55e' }} />
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#60a5fa' }} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>BetMate</span>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 8px',
            textAlign: 'center'
          }}>
            Welcome back
          </h2>
          <p style={{
            fontSize: '14px',
            opacity: 0.5,
            margin: '0 0 32px',
            textAlign: 'center'
          }}>
            Sign in to continue betting
          </p>

          {/* Login Method Toggle */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(255,255,255,0.03)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setLoginMethod('email')}
              style={{
                flex: 1,
                padding: '12px',
                background: loginMethod === 'email' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                border: loginMethod === 'email' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                borderRadius: '10px',
                color: loginMethod === 'email' ? '#22c55e' : 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>📧</span> Email
            </button>
            <button
              onClick={() => setLoginMethod('wallet')}
              style={{
                flex: 1,
                padding: '12px',
                background: loginMethod === 'wallet' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                border: loginMethod === 'wallet' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                borderRadius: '10px',
                color: loginMethod === 'wallet' ? '#22c55e' : 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🔗</span> Wallet
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    opacity: 0.6,
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    opacity: 0.6,
                    marginBottom: '8px'
                  }}>
                    <span>Password</span>
                    <a href="#" style={{
                      color: '#22c55e',
                      textDecoration: 'none',
                      fontSize: '12px'
                    }}>
                      Forgot?
                    </a>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 48px 14px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#22c55e',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ opacity: 0.8 }}>Remember me for 30 days</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: isLoading 
                      ? 'rgba(34, 197, 94, 0.5)' 
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '15px',
                    fontWeight: '700',
                    fontFamily: 'inherit',
                    cursor: isLoading ? 'wait' : 'pointer',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid rgba(0,0,0,0.2)',
                        borderTopColor: '#000',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Wallet Login */}
          {loginMethod === 'wallet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#f6851b' },
                { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', color: '#0052ff' },
                { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', color: '#3b99fc' }
              ].map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={walletConnecting !== null}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '18px 20px',
                    background: walletConnecting === wallet.id 
                      ? 'rgba(34, 197, 94, 0.1)' 
                      : 'rgba(255,255,255,0.03)',
                    border: walletConnecting === wallet.id
                      ? '1px solid rgba(34, 197, 94, 0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '500',
                    fontFamily: 'inherit',
                    cursor: walletConnecting !== null ? 'wait' : 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    opacity: walletConnecting !== null && walletConnecting !== wallet.id ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{wallet.icon}</span>
                  <span style={{ flex: 1 }}>{wallet.name}</span>
                  {walletConnecting === wallet.id && (
                    <span style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(34, 197, 94, 0.3)',
                      borderTopColor: '#22c55e',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  )}
                </button>
              ))}

              <div style={{
                marginTop: '12px',
                padding: '14px 16px',
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '10px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <span style={{ fontSize: '14px' }}>🔒</span>
                <span style={{ opacity: 0.8, lineHeight: '1.5' }}>
                  We'll never ask for your seed phrase. Only connect to apps you trust.
                </span>
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '28px 0'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '12px', opacity: 0.4 }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Social Login */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              flex: 1,
              padding: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button style={{
              flex: 1,
              padding: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </button>
          </div>

          {/* Sign Up Link */}
          <p style={{
            textAlign: 'center',
            marginTop: '28px',
            marginBottom: 0,
            fontSize: '14px',
            opacity: 0.7
          }}>
            Don't have an account?{' '}
            <a href="#" style={{
              color: '#22c55e',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Sign up free
            </a>
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '11px',
          opacity: 0.4
        }}>
          By signing in, you agree to our{' '}
          <a href="#" style={{ color: 'inherit' }}>Terms</a> and{' '}
          <a href="#" style={{ color: 'inherit' }}>Privacy Policy</a>.
          <br />
          18+ only. Please bet responsibly.
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none;
          border-color: rgba(34, 197, 94, 0.5) !important;
        }
        
        input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        
        @media (max-width: 900px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
        
        @media (min-width: 901px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BetMateLogin;
