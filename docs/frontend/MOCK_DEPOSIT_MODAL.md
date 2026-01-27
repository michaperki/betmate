import React, { useState } from 'react';

const BetMateDeposit = () => {
  const [step, setStep] = useState('amount'); // 'amount', 'confirm', 'processing', 'success'
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('usdt');
  const [showModal, setShowModal] = useState(true);

  const presetAmounts = [25, 50, 100, 250, 500];
  
  const tokens = [
    { id: 'usdt', name: 'USDT', icon: '💵', balance: 1247.50, network: 'Ethereum' },
    { id: 'usdc', name: 'USDC', icon: '🔵', balance: 523.20, network: 'Ethereum' },
    { id: 'eth', name: 'ETH', icon: '⟠', balance: 0.847, network: 'Ethereum' }
  ];

  const selectedTokenData = tokens.find(t => t.id === selectedToken);
  
  const walletAddress = '0x7a3d...8f2e';
  const currentBalance = 279.50;

  // Bonus calculation
  const getBonus = (amt) => {
    if (amt >= 500) return { percent: 150, max: 750 };
    if (amt >= 100) return { percent: 100, max: 100 };
    if (amt >= 50) return { percent: 50, max: 25 };
    return { percent: 0, max: 0 };
  };

  const bonus = getBonus(amount);
  const bonusAmount = Math.min(amount * (bonus.percent / 100), bonus.max);
  const totalAfterDeposit = currentBalance + amount + bonusAmount;

  const handleConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleNewDeposit = () => {
    setStep('amount');
    setAmount(50);
  };

  if (!showModal) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontSize: '16px',
            fontWeight: '700',
            fontFamily: "'JetBrains Mono', monospace",
            cursor: 'pointer'
          }}
        >
          Open Deposit Modal
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      color: '#e8e8e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Modal Backdrop */}
      <div 
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)'
        }} 
      />

      {/* Modal */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        background: 'linear-gradient(180deg, #1a1a24 0%, #12121a 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(34, 197, 94, 0.15)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              💰
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>Deposit Funds</div>
              <div style={{ fontSize: '12px', opacity: 0.5 }}>Add funds to your account</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          
          {/* Step: Amount Selection */}
          {step === 'amount' && (
            <>
              {/* Current Balance */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: '4px' }}>Current Balance</div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>${currentBalance.toFixed(2)}</div>
                </div>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>🦊</span>
                  {walletAddress}
                </div>
              </div>

              {/* Bonus Banner */}
              {bonus.percent > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🎁</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24' }}>
                      {bonus.percent}% Deposit Bonus!
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      Get up to ${bonus.max} extra on this deposit
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  opacity: 0.6,
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Select Amount
                </label>
                
                {/* Preset Amounts */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {presetAmounts.map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount('');
                      }}
                      style={{
                        padding: '14px 8px',
                        background: amount === preset && !customAmount
                          ? 'rgba(34, 197, 94, 0.2)'
                          : 'rgba(255,255,255,0.05)',
                        border: amount === preset && !customAmount
                          ? '2px solid #22c55e'
                          : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: amount === preset && !customAmount ? '#22c55e' : '#fff',
                        fontSize: '15px',
                        fontWeight: '700',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    opacity: 0.5
                  }}>$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) {
                        setAmount(parseFloat(e.target.value) || 0);
                      }
                    }}
                    placeholder="Custom amount"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 40px',
                      background: 'rgba(255,255,255,0.05)',
                      border: customAmount 
                        ? '2px solid #22c55e' 
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '18px',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  fontSize: '11px',
                  opacity: 0.5
                }}>
                  <span>Min: $10</span>
                  <span>Max: $10,000</span>
                </div>
              </div>

              {/* Token Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  opacity: 0.6,
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Pay With
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tokens.map(token => (
                    <button
                      key={token.id}
                      onClick={() => setSelectedToken(token.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        background: selectedToken === token.id
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(255,255,255,0.03)',
                        border: selectedToken === token.id
                          ? '2px solid #22c55e'
                          : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{token.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{token.name}</div>
                        <div style={{ fontSize: '11px', opacity: 0.5 }}>{token.network}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                          {token.id === 'eth' ? token.balance.toFixed(4) : token.balance.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.5 }}>Available</div>
                      </div>
                      {selectedToken === token.id && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          background: '#22c55e',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#000'
                        }}>✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}>
                  <span style={{ opacity: 0.6 }}>Deposit</span>
                  <span style={{ fontWeight: '600' }}>${amount.toFixed(2)}</span>
                </div>
                {bonusAmount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}>
                    <span style={{ opacity: 0.6 }}>Bonus ({bonus.percent}%)</span>
                    <span style={{ fontWeight: '600', color: '#fbbf24' }}>+${bonusAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}>
                  <span style={{ opacity: 0.6 }}>Network Fee</span>
                  <span style={{ fontWeight: '600' }}>~$0.50</span>
                </div>
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '12px',
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: '600' }}>New Balance</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e' }}>
                    ${totalAfterDeposit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setStep('confirm')}
                disabled={amount < 10}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: amount >= 10
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '14px',
                  color: amount >= 10 ? '#000' : 'rgba(255,255,255,0.3)',
                  fontSize: '16px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  cursor: amount >= 10 ? 'pointer' : 'not-allowed'
                }}
              >
                Continue to Deposit
              </button>
            </>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '32px'
                }}>
                  🔐
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                  Confirm Deposit
                </div>
                <div style={{ fontSize: '14px', opacity: 0.6 }}>
                  Please review the details below
                </div>
              </div>

              {/* Transaction Details */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <span style={{ opacity: 0.6 }}>Amount</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>${amount.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ opacity: 0.6 }}>Token</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{selectedTokenData?.icon}</span>
                      {selectedTokenData?.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ opacity: 0.6 }}>From Wallet</span>
                    <span style={{ fontFamily: 'monospace' }}>{walletAddress}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ opacity: 0.6 }}>Network</span>
                    <span>{selectedTokenData?.network}</span>
                  </div>
                  {bonusAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ opacity: 0.6 }}>Bonus</span>
                      <span style={{ color: '#fbbf24', fontWeight: '600' }}>+${bonusAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ opacity: 0.6 }}>Est. Network Fee</span>
                    <span>~$0.50</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div style={{
                background: 'rgba(251, 191, 36, 0.08)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '24px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span style={{ opacity: 0.8, lineHeight: '1.5' }}>
                  This transaction will require approval from your wallet. Make sure you're on the correct network.
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setStep('amount')}
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
                  Back
                </button>
                <button
                  onClick={handleConfirm}
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
                  Confirm & Deposit
                </button>
              </div>
            </>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                position: 'relative'
              }}>
                {/* Spinning ring */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '3px solid rgba(34, 197, 94, 0.2)',
                  borderTopColor: '#22c55e',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {/* Inner icon */}
                <div style={{
                  position: 'absolute',
                  inset: '12px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🦊
                </div>
              </div>

              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                Processing Deposit
              </div>
              <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '32px' }}>
                Please confirm in your wallet...
              </div>

              {/* Progress Steps */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left',
                maxWidth: '280px',
                margin: '0 auto'
              }}>
                {[
                  { label: 'Connecting to wallet', done: true },
                  { label: 'Awaiting approval', done: false, active: true },
                  { label: 'Confirming transaction', done: false }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: item.done || item.active ? 1 : 0.4
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: item.done 
                        ? '#22c55e' 
                        : item.active 
                          ? 'rgba(34, 197, 94, 0.2)' 
                          : 'rgba(255,255,255,0.1)',
                      border: item.active ? '2px solid #22c55e' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: item.done ? '#000' : '#22c55e'
                    }}>
                      {item.done ? '✓' : item.active ? (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: '#22c55e',
                          borderRadius: '50%',
                          animation: 'pulse 1.5s infinite'
                        }} />
                      ) : ''}
                    </div>
                    <span style={{ fontSize: '14px' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '88px',
                height: '88px',
                background: 'rgba(34, 197, 94, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '44px'
              }}>
                🎉
              </div>

              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                Deposit Successful!
              </div>
              <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '32px' }}>
                Your funds are ready to use
              </div>

              {/* Amount Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Amount Deposited</div>
                <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>
                  ${amount.toFixed(2)}
                </div>
                {bonusAmount > 0 && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'rgba(251, 191, 36, 0.15)',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#fbbf24',
                    fontWeight: '600'
                  }}>
                    <span>🎁</span> +${bonusAmount.toFixed(2)} bonus added!
                  </div>
                )}
              </div>

              {/* New Balance */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <span style={{ opacity: 0.6 }}>New Balance</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>
                  ${totalAfterDeposit.toFixed(2)}
                </span>
              </div>

              {/* Transaction Hash */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '32px',
                fontSize: '12px',
                opacity: 0.5
              }}>
                <span>Tx: 0x8f2e...3a1c</span>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#22c55e',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  View ↗
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleNewDeposit}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  Deposit More
                </button>
                <button
                  onClick={handleClose}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  Start Betting →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        input:focus {
          outline: none;
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

export default BetMateDeposit;
