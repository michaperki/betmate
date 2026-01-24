import React, { useState, useRef, useEffect } from 'react';

const BetMateProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  const user = {
    username: 'abc124',
    email: 'alex@example.com',
    avatar: 'A',
    balance: 279.50,
    winRate: 54,
    memberSince: 'Jan 2025',
    isVerified: true
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const menuItems = [
    { 
      section: 'account',
      items: [
        { icon: '👤', label: 'Profile', href: '/profile' },
        { icon: '⚙️', label: 'Settings', href: '/settings' },
        { icon: '📊', label: 'Statistics', href: '/stats' },
      ]
    },
    {
      section: 'wallet',
      items: [
        { icon: '💰', label: 'Deposit', href: '/deposit', highlight: true },
        { icon: '💸', label: 'Withdraw', href: '/withdraw' },
        { icon: '📜', label: 'Transactions', href: '/transactions' },
      ]
    },
    {
      section: 'support',
      items: [
        { icon: '❓', label: 'Help Center', href: '/help' },
        { icon: '💬', label: 'Live Chat', href: '/chat', badge: 'Online' },
        { icon: '🛡️', label: 'Responsible Gaming', href: '/responsible' },
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8'
    }}>
      {/* Simulated Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '16px 20px' : '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.8)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', letterSpacing: '1px' }}>BetMate</span>
        </div>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: '32px' }}>
            {['Dashboard', 'Markets', 'My Bets', 'Stats'].map((item, i) => (
              <a key={item} href="#" style={{
                color: i === 0 ? '#22c55e' : 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                letterSpacing: '0.5px',
                borderBottom: i === 0 ? '2px solid #22c55e' : '2px solid transparent',
                paddingBottom: '4px'
              }}>{item}</a>
            ))}
          </nav>
        )}

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
          {/* Deposit Button - Desktop only */}
          {!isMobile && (
            <button style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>+</span>
              Deposit
            </button>
          )}

          {/* Balance */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: isMobile ? '8px 12px' : '10px 16px',
            fontSize: isMobile ? '12px' : '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: '#22c55e', fontWeight: '600' }}>{user.balance.toFixed(2)}</span>
            {!isMobile && <span style={{ opacity: 0.5 }}>USDT</span>}
          </div>

          {/* Avatar Button & Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                width: isMobile ? '40px' : '36px',
                height: isMobile ? '40px' : '36px',
                borderRadius: '50%',
                background: isOpen 
                  ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                  : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: isOpen ? '2px solid #4ade80' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: '#000',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isOpen ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {user.avatar}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <>
                {/* Mobile: Full screen overlay */}
                {isMobile && (
                  <div
                    onClick={() => setIsOpen(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      zIndex: 999
                    }}
                  />
                )}

                {/* Dropdown Content */}
                <div style={{
                  position: isMobile ? 'fixed' : 'absolute',
                  top: isMobile ? 'auto' : 'calc(100% + 12px)',
                  bottom: isMobile ? 0 : 'auto',
                  right: isMobile ? 0 : 0,
                  left: isMobile ? 0 : 'auto',
                  width: isMobile ? '100%' : '280px',
                  background: isMobile 
                    ? 'linear-gradient(180deg, #1a1a24 0%, #12121a 100%)'
                    : 'rgba(26, 26, 36, 0.98)',
                  border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: isMobile ? '24px 24px 0 0' : '16px',
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  animation: isMobile ? 'slideUp 0.25s ease' : 'fadeIn 0.15s ease'
                }}>
                  {/* Mobile Handle */}
                  {isMobile && (
                    <div style={{
                      width: '40px',
                      height: '4px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '2px',
                      margin: '12px auto 8px'
                    }} />
                  )}

                  {/* User Info Header */}
                  <div style={{
                    padding: isMobile ? '16px 24px 20px' : '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#000'
                    }}>
                      {user.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '2px'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: '600' }}>{user.username}</span>
                        {user.isVerified && (
                          <span style={{
                            background: '#22c55e',
                            color: '#000',
                            fontSize: '9px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '700'
                          }}>✓ VERIFIED</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.5 }}>{user.email}</div>
                    </div>
                  </div>

                  {/* Quick Stats - Mobile only */}
                  {isMobile && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '1px',
                      background: 'rgba(255,255,255,0.06)',
                      margin: '0 0 8px'
                    }}>
                      {[
                        { label: 'Balance', value: `$${user.balance}`, color: '#22c55e' },
                        { label: 'Win Rate', value: `${user.winRate}%`, color: '#fff' },
                        { label: 'Member', value: user.memberSince, color: '#fff' }
                      ].map((stat, i) => (
                        <div key={i} style={{
                          padding: '14px 12px',
                          background: '#12121a',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>{stat.label}</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: stat.color }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Menu Sections */}
                  <div style={{ padding: isMobile ? '8px 12px' : '8px' }}>
                    {menuItems.map((section, sectionIndex) => (
                      <div key={section.section}>
                        {sectionIndex > 0 && (
                          <div style={{
                            height: '1px',
                            background: 'rgba(255,255,255,0.06)',
                            margin: '8px 0'
                          }} />
                        )}
                        {section.items.map((item) => (
                          <a
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              padding: isMobile ? '14px 16px' : '12px 14px',
                              borderRadius: '10px',
                              textDecoration: 'none',
                              color: item.highlight ? '#22c55e' : '#e8e8e8',
                              background: item.highlight 
                                ? 'rgba(34, 197, 94, 0.1)' 
                                : 'transparent',
                              transition: 'background 0.15s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              if (!item.highlight) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!item.highlight) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <span style={{ 
                              fontSize: '18px',
                              width: '24px',
                              textAlign: 'center'
                            }}>{item.icon}</span>
                            <span style={{ 
                              flex: 1, 
                              fontSize: '14px',
                              fontWeight: item.highlight ? '600' : '500'
                            }}>{item.label}</span>
                            {item.badge && (
                              <span style={{
                                fontSize: '10px',
                                padding: '3px 8px',
                                borderRadius: '10px',
                                background: 'rgba(34, 197, 94, 0.15)',
                                color: '#22c55e',
                                fontWeight: '600'
                              }}>{item.badge}</span>
                            )}
                            {item.highlight && (
                              <span style={{ fontSize: '12px', opacity: 0.6 }}>→</span>
                            )}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Sign Out */}
                  <div style={{
                    padding: isMobile ? '12px 12px 24px' : '8px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    marginTop: '8px'
                  }}>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        // Handle sign out
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: isMobile ? '14px 16px' : '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      }}
                    >
                      <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>🚪</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500',
                        color: '#ef4444'
                      }}>Sign Out</span>
                    </button>
                  </div>

                  {/* App Version - Desktop only */}
                  {!isMobile && (
                    <div style={{
                      padding: '12px 20px',
                      textAlign: 'center',
                      fontSize: '10px',
                      opacity: 0.3
                    }}>
                      BetMate v1.2.0
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <div style={{
        padding: '60px 40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          Click the avatar to see the dropdown
        </h2>
        <p style={{ fontSize: '14px', opacity: 0.5 }}>
          Resize the window to see mobile vs desktop behavior
        </p>
        
        <div style={{
          marginTop: '40px',
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '4px' }}>Desktop</div>
            <div style={{ fontSize: '14px' }}>Dropdown positioned right</div>
          </div>
          <div style={{
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '4px' }}>Mobile</div>
            <div style={{ fontSize: '14px' }}>Bottom sheet with handle</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BetMateProfileDropdown;
