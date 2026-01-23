import React, { useState } from 'react';

const BetMateOnboarding = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    ageVerified: false,
    walletConnected: false,
    walletAddress: '',
    defaultStake: 2,
    oddsFormat: 'decimal',
    notifications: true,
    depositAmount: 50
  });
  const [showPassword, setShowPassword] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [depositProcessing, setDepositProcessing] = useState(false);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const simulateWalletConnect = () => {
    setWalletConnecting(true);
    setTimeout(() => {
      setWalletConnecting(false);
      updateForm('walletConnected', true);
      updateForm('walletAddress', '0x7a3d...8f2e');
    }, 1500);
  };

  const simulateDeposit = () => {
    setDepositProcessing(true);
    setTimeout(() => {
      setDepositProcessing(false);
      setStep(5);
    }, 2000);
  };

  const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'account', title: 'Create Account' },
    { id: 'wallet', title: 'Connect Wallet' },
    { id: 'preferences', title: 'Preferences' },
    { id: 'deposit', title: 'First Deposit' },
    { id: 'complete', title: 'Ready!' }
  ];

  const canProceed = () => {
    switch(step) {
      case 0: return true;
      case 1: return formData.username && formData.email && formData.password && 
                     formData.password === formData.confirmPassword && 
                     formData.agreeTerms && formData.ageVerified;
      case 2: return formData.walletConnected;
      case 3: return true;
      case 4: return formData.depositAmount >= 10;
      default: return true;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'fixed',
        top: '10%',
        left: '20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)'
      }} />

      {/* Chess pieces floating decoration */}
      <div style={{
        position: 'fixed',
        top: '15%',
        left: '8%',
        fontSize: '120px',
        opacity: 0.03,
        transform: 'rotate(-15deg)'
      }}>♞</div>
      <div style={{
        position: 'fixed',
        bottom: '20%',
        right: '5%',
        fontSize: '100px',
        opacity: 0.03,
        transform: 'rotate(10deg)'
      }}>♛</div>
      <div style={{
        position: 'fixed',
        top: '60%',
        left: '5%',
        fontSize: '80px',
        opacity: 0.02,
        transform: 'rotate(5deg)'
      }}>♜</div>

      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#f87171' }} />
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#22c55e' }} />
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#60a5fa' }} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e', letterSpacing: '1px' }}>BetMate</span>
        </div>

        {/* Progress Steps */}
        {step > 0 && step < 5 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px'
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: i <= step ? '32px' : '12px',
                height: '4px',
                borderRadius: '2px',
                background: i <= step ? '#22c55e' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px',
          backdropFilter: 'blur(10px)'
        }}>
          
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '40px'
              }}>
                ♟️
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 12px' }}>
                Bet on Chess, Live
              </h1>
              <p style={{ fontSize: '15px', opacity: 0.6, margin: '0 0 32px', lineHeight: '1.6' }}>
                Predict moves, bet on outcomes, and win while watching the world's best players compete.
              </p>

              {/* Features */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '32px',
                textAlign: 'left'
              }}>
                {[
                  { icon: '⚡', title: 'Live Betting', desc: 'Bet on moves as they happen' },
                  { icon: '🎯', title: 'Move Predictions', desc: 'Predict the next move for big odds' },
                  { icon: '💰', title: 'Instant Payouts', desc: 'Withdraw winnings anytime' }
                ].map((feature, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>{feature.icon}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{feature.title}</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                Get Started
              </button>
              <p style={{ fontSize: '13px', opacity: 0.5, margin: 0 }}>
                Already have an account? <a href="#" style={{ color: '#22c55e', textDecoration: 'none' }}>Sign in</a>
              </p>
            </div>
          )}

          {/* Step 1: Create Account */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, margin: '0 0 32px', textAlign: 'center' }}>
                Enter your details to get started
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => updateForm('username', e.target.value)}
                    placeholder="Choose a username"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      placeholder="Create a strong password"
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
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: formData.confirmPassword && formData.confirmPassword !== formData.password 
                        ? '1px solid #ef4444' 
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                    <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>
                      Passwords don't match
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.ageVerified}
                      onChange={(e) => updateForm('ageVerified', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginTop: '2px',
                        accentColor: '#22c55e'
                      }}
                    />
                    <span style={{ opacity: 0.8 }}>
                      I confirm I am at least 18 years old
                    </span>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => updateForm('agreeTerms', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginTop: '2px',
                        accentColor: '#22c55e'
                      }}
                    />
                    <span style={{ opacity: 0.8 }}>
                      I agree to the <a href="#" style={{ color: '#22c55e', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: '#22c55e', textDecoration: 'none' }}>Privacy Policy</a>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Connect Wallet */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>
                Connect Your Wallet
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, margin: '0 0 32px', textAlign: 'center' }}>
                Link a crypto wallet to deposit and withdraw funds
              </p>

              {!formData.walletConnected ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'MetaMask', icon: '🦊', popular: true },
                    { name: 'Coinbase Wallet', icon: '🔵', popular: false },
                    { name: 'WalletConnect', icon: '🔗', popular: false }
                  ].map((wallet, i) => (
                    <button
                      key={wallet.name}
                      onClick={simulateWalletConnect}
                      disabled={walletConnecting}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '18px 20px',
                        background: wallet.popular ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255,255,255,0.03)',
                        border: wallet.popular ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: '500',
                        fontFamily: 'inherit',
                        cursor: walletConnecting ? 'wait' : 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        opacity: walletConnecting ? 0.6 : 1
                      }}
                    >
                      <span style={{ fontSize: '28px' }}>{wallet.icon}</span>
                      <span style={{ flex: 1 }}>{wallet.name}</span>
                      {wallet.popular && (
                        <span style={{
                          fontSize: '10px',
                          background: '#22c55e',
                          color: '#000',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>POPULAR</span>
                      )}
                      {walletConnecting && i === 0 && (
                        <span style={{ fontSize: '14px' }}>⏳</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '32px'
                  }}>
                    ✓
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#22c55e' }}>
                    Wallet Connected!
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.7, fontFamily: 'monospace' }}>
                    {formData.walletAddress}
                  </div>
                </div>
              )}

              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '10px',
                fontSize: '13px',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '16px' }}>🔒</span>
                <span>Your wallet is never given access to move funds without your approval. We only use it for deposits and withdrawals you initiate.</span>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>
                Set Your Preferences
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, margin: '0 0 32px', textAlign: 'center' }}>
                Customize your betting experience
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Default Stake */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>
                    Default Bet Amount
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[1, 2, 5, 10, 25].map(amount => (
                      <button
                        key={amount}
                        onClick={() => updateForm('defaultStake', amount)}
                        style={{
                          flex: 1,
                          padding: '14px 8px',
                          background: formData.defaultStake === amount ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                          border: formData.defaultStake === amount ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          color: formData.defaultStake === amount ? '#22c55e' : '#fff',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>
                    This will be pre-filled when placing bets
                  </div>
                </div>

                {/* Odds Format */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>
                    Odds Format
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                      { id: 'decimal', label: 'Decimal', example: '2.50' },
                      { id: 'fractional', label: 'Fractional', example: '3/2' },
                      { id: 'american', label: 'American', example: '+150' }
                    ].map(format => (
                      <button
                        key={format.id}
                        onClick={() => updateForm('oddsFormat', format.id)}
                        style={{
                          flex: 1,
                          padding: '14px 8px',
                          background: formData.oddsFormat === format.id ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                          border: formData.oddsFormat === format.id ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          color: formData.oddsFormat === format.id ? '#22c55e' : '#fff',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>{format.label}</span>
                        <span style={{ fontSize: '11px', opacity: 0.5 }}>{format.example}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Enable Notifications</div>
                    <div style={{ fontSize: '12px', opacity: 0.5 }}>Get alerts for bet results and live games</div>
                  </div>
                  <button
                    onClick={() => updateForm('notifications', !formData.notifications)}
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '14px',
                      border: 'none',
                      background: formData.notifications ? '#22c55e' : 'rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '3px',
                      left: formData.notifications ? '27px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: First Deposit */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>
                Make Your First Deposit
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.5, margin: '0 0 32px', textAlign: 'center' }}>
                Add funds to start betting
              </p>

              {/* Bonus Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>🎁</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>
                    100% Welcome Bonus
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    Deposit $50+ and get matched up to $100
                  </div>
                </div>
              </div>

              {/* Amount Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>
                  Select Amount
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[25, 50, 100, 250].map(amount => (
                    <button
                      key={amount}
                      onClick={() => updateForm('depositAmount', amount)}
                      style={{
                        padding: '16px 8px',
                        background: formData.depositAmount === amount ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                        border: formData.depositAmount === amount ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: formData.depositAmount === amount ? '#22c55e' : '#fff',
                        fontSize: '16px',
                        fontWeight: '700',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.5,
                    fontSize: '16px'
                  }}>$</span>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) => updateForm('depositAmount', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 36px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '18px',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>
                  Minimum deposit: $10
                </div>
              </div>

              {/* Summary */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ opacity: 0.6 }}>Deposit</span>
                  <span style={{ fontWeight: '600' }}>${formData.depositAmount}</span>
                </div>
                {formData.depositAmount >= 50 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ opacity: 0.6 }}>Bonus (100%)</span>
                    <span style={{ fontWeight: '600', color: '#fbbf24' }}>
                      +${Math.min(formData.depositAmount, 100)}
                    </span>
                  </div>
                )}
                <div style={{ 
                  borderTop: '1px solid rgba(255,255,255,0.1)', 
                  paddingTop: '12px',
                  display: 'flex', 
                  justifyContent: 'space-between' 
                }}>
                  <span style={{ fontWeight: '600' }}>Total Balance</span>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: '#22c55e' }}>
                    ${formData.depositAmount + (formData.depositAmount >= 50 ? Math.min(formData.depositAmount, 100) : 0)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '24px' }}>🦊</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>MetaMask</div>
                  <div style={{ fontSize: '11px', opacity: 0.5 }}>{formData.walletAddress}</div>
                </div>
                <span style={{ fontSize: '12px', color: '#22c55e' }}>Connected</span>
              </div>

              <button
                onClick={simulateDeposit}
                disabled={formData.depositAmount < 10 || depositProcessing}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: formData.depositAmount >= 10 
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  color: formData.depositAmount >= 10 ? '#000' : 'rgba(255,255,255,0.3)',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  cursor: formData.depositAmount >= 10 && !depositProcessing ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {depositProcessing ? (
                  <>Processing... ⏳</>
                ) : (
                  <>Deposit ${formData.depositAmount}</>
                )}
              </button>

              <button
                onClick={() => setStep(5)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  marginTop: '12px'
                }}
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '48px'
              }}>
                🎉
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 12px' }}>
                You're All Set!
              </h2>
              <p style={{ fontSize: '15px', opacity: 0.6, margin: '0 0 32px', lineHeight: '1.6' }}>
                Welcome to BetMate, {formData.username}! Your account is ready and funded.
              </p>

              {/* Balance Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Your Balance</div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e' }}>
                  ${formData.depositAmount + (formData.depositAmount >= 50 ? Math.min(formData.depositAmount, 100) : 0)}
                  <span style={{ fontSize: '16px', opacity: 0.7 }}> USDT</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '15px',
                    fontWeight: '700',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🎯 Browse Live Games
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  📖 How Betting Works
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons (for steps 1-4) */}
          {step >= 1 && step <= 4 && (
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px'
            }}>
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              {step < 4 && (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  style={{
                    flex: 2,
                    padding: '14px',
                    background: canProceed() 
                      ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                      : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    color: canProceed() ? '#000' : 'rgba(255,255,255,0.3)',
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: 'inherit',
                    cursor: canProceed() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 0 && (
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '12px',
            opacity: 0.4
          }}>
            By signing up, you agree to bet responsibly. 18+ only.
          </div>
        )}
      </div>

      <style>{`
        input:focus {
          outline: none;
          border-color: rgba(34, 197, 94, 0.5);
        }
        input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default BetMateOnboarding;
