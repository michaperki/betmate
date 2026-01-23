import React, { useState } from 'react';

const BetMateSettings = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [settings, setSettings] = useState({
    // Account
    username: 'abc124',
    email: 'alex@example.com',
    avatar: 'A',
    
    // Preferences
    defaultStake: 2.00,
    currency: 'USDT',
    oddsFormat: 'decimal',
    timezone: 'UTC-5',
    theme: 'dark',
    compactMode: false,
    showEvalBar: true,
    autoRefreshOdds: true,
    confirmBets: true,
    quickBetEnabled: false,
    
    // Notifications
    emailWins: true,
    emailLosses: false,
    emailDeposits: true,
    emailPromotions: false,
    pushLiveUpdates: true,
    pushBetResults: true,
    pushPriceAlerts: true,
    pushNewMarkets: false,
    soundEffects: true,
    soundVolume: 70,
    
    // Responsible Gaming
    dailyLimit: 100,
    weeklyLimit: 500,
    monthlyLimit: null,
    sessionReminder: 60,
    lossLimitEnabled: false,
    lossLimitAmount: 50,
    cooldownEnabled: false,
    
    // Security
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'responsible', label: 'Responsible Gaming', icon: '🛡️' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'wallet', label: 'Wallet & Payments', icon: '💳' }
  ];

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '13px',
        border: 'none',
        background: enabled ? '#22c55e' : 'rgba(255,255,255,0.1)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease'
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: '3px',
        left: enabled ? '25px' : '3px',
        transition: 'left 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8',
      position: 'relative'
    }}>
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
          {['Dashboard', 'Markets', 'My Bets', 'Stats'].map((item) => (
            <a key={item} href="#" style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '0.5px'
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

      <main style={{ 
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 40px',
        gap: '32px'
      }}>
        {/* Sidebar Navigation */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 24px' }}>Settings</h1>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: activeSection === section.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  border: activeSection === section.id ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent',
                  borderRadius: '10px',
                  color: activeSection === section.id ? '#22c55e' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '18px' }}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>

          {/* Danger Zone */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', marginBottom: '12px' }}>
              Danger Zone
            </div>
            <button style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '12px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              marginBottom: '8px'
            }}>
              Self-Exclude (Temporary)
            </button>
            <button style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '12px',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}>
              Delete Account
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '32px'
        }}>
          {/* Account Section */}
          {activeSection === 'account' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Account Settings</h2>
              <p style={{ fontSize: '13px', opacity: 0.5, margin: '0 0 32px' }}>Manage your profile and account details</p>

              {/* Avatar & Username */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '24px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#000'
                }}>
                  {settings.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{settings.username}</div>
                  <div style={{ fontSize: '13px', opacity: 0.5 }}>Member since January 2025</div>
                </div>
                <button style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}>
                  Change Avatar
                </button>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Username</label>
                  <input
                    type="text"
                    value={settings.username}
                    onChange={(e) => updateSetting('username', e.target.value)}
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
                  <label style={{ display: 'block', fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
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
                  <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '6px' }}>Used for notifications and account recovery</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Password</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="password"
                      value="••••••••••••"
                      disabled
                      style={{
                        flex: 1,
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button style={{
                      padding: '14px 24px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Preferences</h2>
              <p style={{ fontSize: '13px', opacity: 0.5, margin: '0 0 32px' }}>Customize your betting experience</p>

              {/* Betting Defaults */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.8 }}>Betting Defaults</h3>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Default Stake</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>Pre-filled amount for new bets</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={settings.defaultStake}
                        onChange={(e) => updateSetting('defaultStake', parseFloat(e.target.value))}
                        style={{
                          width: '100px',
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          textAlign: 'right'
                        }}
                      />
                      <span style={{ opacity: 0.5 }}>USDT</span>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Odds Format</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>How odds are displayed</div>
                    </div>
                    <select
                      value={settings.oddsFormat}
                      onChange={(e) => updateSetting('oddsFormat', e.target.value)}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="decimal">Decimal (2.50)</option>
                      <option value="fractional">Fractional (3/2)</option>
                      <option value="american">American (+150)</option>
                    </select>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Confirm Bets</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>Show confirmation before placing bets</div>
                    </div>
                    <Toggle enabled={settings.confirmBets} onChange={(v) => updateSetting('confirmBets', v)} />
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Quick Bet Mode</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>One-click betting with default stake</div>
                    </div>
                    <Toggle enabled={settings.quickBetEnabled} onChange={(v) => updateSetting('quickBetEnabled', v)} />
                  </div>
                </div>
              </div>

              {/* Display */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.8 }}>Display</h3>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Theme</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>Choose your preferred theme</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['dark', 'light', 'system'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => updateSetting('theme', theme)}
                          style={{
                            padding: '10px 16px',
                            background: settings.theme === theme ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                            border: settings.theme === theme ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: settings.theme === theme ? '#22c55e' : '#fff',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Show Evaluation Bar</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>Display win probability on game view</div>
                    </div>
                    <Toggle enabled={settings.showEvalBar} onChange={(v) => updateSetting('showEvalBar', v)} />
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Auto-Refresh Odds</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>Automatically update odds in real-time</div>
                    </div>
                    <Toggle enabled={settings.autoRefreshOdds} onChange={(v) => updateSetting('autoRefreshOdds', v)} />
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Timezone</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>For displaying match times</div>
                    </div>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="UTC-8">Pacific (UTC-8)</option>
                      <option value="UTC-5">Eastern (UTC-5)</option>
                      <option value="UTC+0">London (UTC+0)</option>
                      <option value="UTC+1">Central Europe (UTC+1)</option>
                      <option value="UTC+8">Singapore (UTC+8)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Notifications</h2>
              <p style={{ fontSize: '13px', opacity: 0.5, margin: '0 0 32px' }}>Control how and when we contact you</p>

              {/* Email Notifications */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📧</span> Email Notifications
                </h3>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {[
                    { key: 'emailWins', label: 'Winning Bets', desc: 'Get notified when you win' },
                    { key: 'emailLosses', label: 'Losing Bets', desc: 'Get notified when you lose' },
                    { key: 'emailDeposits', label: 'Deposits & Withdrawals', desc: 'Transaction confirmations' },
                    { key: 'emailPromotions', label: 'Promotions', desc: 'Special offers and bonuses' }
                  ].map((item, i) => (
                    <React.Fragment key={item.key}>
                      {i > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', opacity: 0.5 }}>{item.desc}</div>
                        </div>
                        <Toggle enabled={settings[item.key]} onChange={(v) => updateSetting(item.key, v)} />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📱</span> Push Notifications
                </h3>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {[
                    { key: 'pushLiveUpdates', label: 'Live Game Updates', desc: 'Critical moments in games you bet on' },
                    { key: 'pushBetResults', label: 'Bet Results', desc: 'Instant notification when bets settle' },
                    { key: 'pushPriceAlerts', label: 'Odds Alerts', desc: 'When odds move significantly' },
                    { key: 'pushNewMarkets', label: 'New Markets', desc: 'When high-profile games become available' }
                  ].map((item, i) => (
                    <React.Fragment key={item.key}>
                      {i > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', opacity: 0.5 }}>{item.desc}</div>
                        </div>
                        <Toggle enabled={settings[item.key]} onChange={(v) => updateSetting(item.key, v)} />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Sound */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔊</span> Sound
                </h3>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Sound Effects</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>Play sounds for wins, losses, and alerts</div>
                    </div>
                    <Toggle enabled={settings.soundEffects} onChange={(v) => updateSetting('soundEffects', v)} />
                  </div>

                  {settings.soundEffects && (
                    <>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px' }}>Volume</span>
                          <span style={{ fontSize: '14px', opacity: 0.6 }}>{settings.soundVolume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.soundVolume}
                          onChange={(e) => updateSetting('soundVolume', parseInt(e.target.value))}
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            appearance: 'none',
                            background: `linear-gradient(to right, #22c55e 0%, #22c55e ${settings.soundVolume}%, rgba(255,255,255,0.1) ${settings.soundVolume}%, rgba(255,255,255,0.1) 100%)`,
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Responsible Gaming Section */}
          {activeSection === 'responsible' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Responsible Gaming</h2>
              <p style={{ fontSize: '13px', opacity: 0.5, margin: '0 0 32px' }}>Set limits to keep your betting fun and safe</p>

              {/* Info Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <div style={{ fontSize: '13px', lineHeight: '1.6', opacity: 0.8 }}>
                  Setting limits helps you stay in control. Once set, limits cannot be increased for 24 hours, but can be decreased immediately.
                </div>
              </div>

              {/* Deposit Limits */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.8 }}>Deposit Limits</h3>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {[
                    { key: 'dailyLimit', label: 'Daily Limit', current: settings.dailyLimit },
                    { key: 'weeklyLimit', label: 'Weekly Limit', current: settings.weeklyLimit },
                    { key: 'monthlyLimit', label: 'Monthly Limit', current: settings.monthlyLimit }
                  ].map((item, i) => (
                    <React.Fragment key={item.key}>
                      {i > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', opacity: 0.5 }}>
                            {item.current ? `Currently: $${item.current}` : 'Not set'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            placeholder="No limit"
                            value={item.current || ''}
                            onChange={(e) => updateSetting(item.key, e.target.value ? parseFloat(e.target.value) : null)}
                            style={{
                              width: '120px',
                              padding: '10px 12px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '14px',
                              fontFamily: 'inherit',
                              textAlign: 'right'
                            }}
                          />
                          <span style={{ opacity: 0.5, fontSize: '13px' }}>USDT</span>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Session Limits */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.8 }}>Session Controls</h3>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Session Time Reminder</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>Get reminded after a period of play</div>
                    </div>
                    <select
                      value={settings.sessionReminder}
                      onChange={(e) => updateSetting('sessionReminder', parseInt(e.target.value))}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={0}>Disabled</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Loss Limit</div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>Pause betting after losing a set amount in a session</div>
                    </div>
                    <Toggle enabled={settings.lossLimitEnabled} onChange={(v) => updateSetting('lossLimitEnabled', v)} />
                  </div>

                  {settings.lossLimitEnabled && (
                    <div style={{ 
                      marginLeft: '24px',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', opacity: 0.7 }}>Loss amount to trigger pause</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            value={settings.lossLimitAmount}
                            onChange={(e) => updateSetting('lossLimitAmount', parseFloat(e.target.value))}
                            style={{
                              width: '100px',
                              padding: '8px 12px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '13px',
                              fontFamily: 'inherit',
                              textAlign: 'right'
                            }}
                          />
                          <span style={{ opacity: 0.5, fontSize: '12px' }}>USDT</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Help Resources */}
              <div style={{
                background: 'rgba(251, 191, 36, 0.08)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#fbbf24' }}>Need Help?</h3>
                <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '16px', lineHeight: '1.6' }}>
                  If you're concerned about your gambling habits, support is available 24/7.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <a href="#" style={{
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    textDecoration: 'none'
                  }}>
                    GamCare
                  </a>
                  <a href="#" style={{
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    textDecoration: 'none'
                  }}>
                    Gamblers Anonymous
                  </a>
                  <a href="#" style={{
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    textDecoration: 'none'
                  }}>
                    Self-Assessment Test
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Security</h2>
              <p style={{ fontSize: '13px', opacity: 0.5, margin: '0 0 32px' }}>Protect your account and funds</p>

              {/* 2FA */}
              <div style={{
                background: settings.twoFactorEnabled 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${settings.twoFactorEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: settings.twoFactorEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      🔐
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: '13px', opacity: 0.6, marginBottom: '12px' }}>
                        Add an extra layer of security to your account
                      </div>
                      {settings.twoFactorEnabled ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          borderRadius: '6px',
                          color: '#22c55e',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          <span>✓</span> Enabled
                        </div>
                      ) : (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'rgba(251, 191, 36, 0.15)',
                          borderRadius: '6px',
                          color: '#fbbf24',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          <span>⚠</span> Not enabled
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('twoFactorEnabled', !settings.twoFactorEnabled)}
                    style={{
                      padding: '12px 20px',
                      background: settings.twoFactorEnabled ? 'rgba(239, 68, 68, 0.1)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: settings.twoFactorEnabled ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                      borderRadius: '8px',
                      color: settings.twoFactorEnabled ? '#ef4444' : '#000',
                      fontSize: '13px',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    {settings.twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
                  </button>
                </div>
              </div>

              {/* Session Settings */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Session Timeout</div>
                    <div style={{ fontSize: '12px', opacity: 0.5 }}>Auto-logout after inactivity</div>
                  </div>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Login Alerts</div>
                    <div style={{ fontSize: '12px', opacity: 0.5 }}>Email me when a new device logs in</div>
                  </div>
                  <Toggle enabled={settings.loginAlerts} onChange={(v) => updateSetting('loginAlerts', v)} />
                </div>
              </div>

              {/* Active Sessions */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>Active Sessions</div>
                  <button style={{
                    padding: '8px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}>
                    Log Out All
                  </button>
                </div>

                {[
                  { device: 'Chrome on MacOS', location: 'San Francisco, US', current: true, lastActive: 'Now' },
                  { device: 'Safari on iPhone', location: 'San Francisco, US', current: false, lastActive: '2 hours ago' }
                ].map((session, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {session.device.includes('iPhone') ? '📱' : '💻'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {session.device}
                          {session.current && (
                            <span style={{
                              fontSize: '10px',
                              background: '#22c55e',
                              color: '#000',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '700'
                            }}>THIS DEVICE</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.5 }}>{session.location} • {session.lastActive}</div>
                      </div>
                    </div>
                    {!session.current && (
                      <button style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}>
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallet Section */}
          {activeSection === 'wallet' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Wallet & Payments</h2>
              <p style={{ fontSize: '13px', opacity: 0.5, margin: '0 0 32px' }}>Manage your funds and payment methods</p>

              {/* Balance Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>Available Balance</div>
                <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px' }}>
                  279.50 <span style={{ fontSize: '20px', opacity: 0.6 }}>USDT</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>+</span> Deposit
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>↑</span> Withdraw
                  </button>
                </div>
              </div>

              {/* Connected Wallets */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', opacity: 0.8 }}>Connected Wallets</h3>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: 'linear-gradient(135deg, #f6851b 0%, #e2761b 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🦊
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>MetaMask</div>
                        <div style={{ fontSize: '12px', opacity: 0.5, fontFamily: 'monospace' }}>0x7a3d...8f2e</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '6px 12px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        borderRadius: '6px',
                        color: '#22c55e',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        PRIMARY
                      </span>
                      <button style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}>
                        Disconnect
                      </button>
                    </div>
                  </div>

                  <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#22c55e',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      padding: 0
                    }}>
                      <span style={{ fontSize: '18px' }}>+</span> Connect Another Wallet
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8, margin: 0 }}>Recent Transactions</h3>
                  <a href="#" style={{ fontSize: '12px', color: '#22c55e', textDecoration: 'none' }}>View All</a>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  {[
                    { type: 'deposit', amount: 100, date: 'Jan 20, 2025', status: 'completed', txHash: '0x8f2e...3a1c' },
                    { type: 'withdraw', amount: 50, date: 'Jan 18, 2025', status: 'completed', txHash: '0x1b4c...9e7d' },
                    { type: 'deposit', amount: 200, date: 'Jan 15, 2025', status: 'completed', txHash: '0x3d7a...2f5b' }
                  ].map((tx, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: tx.type === 'deposit' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          {tx.type === 'deposit' ? '↓' : '↑'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', textTransform: 'capitalize' }}>{tx.type}</div>
                          <div style={{ fontSize: '11px', opacity: 0.5 }}>{tx.date}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: tx.type === 'deposit' ? '#22c55e' : '#ef4444'
                        }}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.5, fontFamily: 'monospace' }}>{tx.txHash}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        input:focus, select:focus {
          outline: none;
          border-color: rgba(34, 197, 94, 0.5);
        }
        select option {
          background: #1a1a24;
          color: #fff;
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default BetMateSettings;
