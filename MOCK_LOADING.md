import React, { useState, useEffect } from 'react';

const BetMateLoading = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing');
  const [showContent, setShowContent] = useState(true);

  const loadingStages = [
    { threshold: 0, text: 'Initializing' },
    { threshold: 20, text: 'Connecting to server' },
    { threshold: 40, text: 'Loading markets' },
    { threshold: 60, text: 'Fetching live games' },
    { threshold: 80, text: 'Almost ready' },
    { threshold: 95, text: 'Let\'s go!' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowContent(false), 500);
          return 100;
        }
        // Variable speed - slower at the end for realism
        const increment = prev < 80 ? Math.random() * 8 + 2 : Math.random() * 3 + 1;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stage = [...loadingStages].reverse().find(s => progress >= s.threshold);
    if (stage) setLoadingText(stage.text);
  }, [progress]);

  const restart = () => {
    setProgress(0);
    setShowContent(true);
  };

  if (!showContent) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <button
          onClick={restart}
          style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontSize: '16px',
            fontWeight: '700',
            fontFamily: 'inherit',
            cursor: 'pointer'
          }}
        >
          Replay Loading Screen
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {/* Pulsing glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 2s ease-in-out infinite'
        }} />

        {/* Floating chess pieces */}
        {[
          { piece: '♔', top: '15%', left: '10%', delay: '0s', duration: '20s' },
          { piece: '♛', top: '70%', left: '85%', delay: '2s', duration: '25s' },
          { piece: '♞', top: '20%', right: '15%', delay: '1s', duration: '22s' },
          { piece: '♜', bottom: '25%', left: '8%', delay: '3s', duration: '28s' },
          { piece: '♟', top: '60%', left: '20%', delay: '1.5s', duration: '18s' },
          { piece: '♝', top: '30%', right: '25%', delay: '2.5s', duration: '24s' }
        ].map((item, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
              fontSize: '48px',
              opacity: 0.04,
              animation: `float ${item.duration} ease-in-out infinite`,
              animationDelay: item.delay
            }}
          >
            {item.piece}
          </div>
        ))}

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.5
        }} />
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px'
      }}>
        {/* Animated Logo */}
        <div style={{
          marginBottom: '48px',
          position: 'relative'
        }}>
          {/* Outer spinning ring */}
          <div style={{
            position: 'absolute',
            inset: '-20px',
            border: '2px solid transparent',
            borderTopColor: 'rgba(34, 197, 94, 0.5)',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite'
          }} />
          
          {/* Middle pulsing ring */}
          <div style={{
            position: 'absolute',
            inset: '-10px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />

          {/* Logo container */}
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(145deg, #12121a 0%, #1a1a24 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shimmer effect */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(105deg, transparent 40%, rgba(34, 197, 94, 0.1) 50%, transparent 60%)',
              animation: 'shimmer 2s infinite'
            }} />

            {/* Logo dots */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '6px',
              position: 'relative',
              zIndex: 1
            }}>
              {[
                { color: '#fbbf24', delay: '0s' },
                { color: '#f87171', delay: '0.1s' },
                { color: '#22c55e', delay: '0.2s' },
                { color: '#60a5fa', delay: '0.3s' }
              ].map((dot, i) => (
                <div
                  key={i}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: dot.color,
                    animation: 'dotPulse 1.2s ease-in-out infinite',
                    animationDelay: dot.delay,
                    boxShadow: `0 0 20px ${dot.color}40`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#22c55e',
          letterSpacing: '2px',
          marginBottom: '8px',
          textShadow: '0 0 40px rgba(34, 197, 94, 0.3)'
        }}>
          BetMate
        </div>

        <div style={{
          fontSize: '14px',
          opacity: 0.5,
          marginBottom: '48px',
          letterSpacing: '4px',
          textTransform: 'uppercase'
        }}>
          Live Chess Betting
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '280px',
          marginBottom: '20px'
        }}>
          {/* Track */}
          <div style={{
            height: '4px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Fill */}
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
              borderRadius: '2px',
              transition: 'width 0.15s ease-out',
              position: 'relative'
            }}>
              {/* Glow effect on leading edge */}
              <div style={{
                position: 'absolute',
                right: 0,
                top: '-4px',
                width: '20px',
                height: '12px',
                background: 'radial-gradient(ellipse, rgba(34, 197, 94, 0.8) 0%, transparent 70%)',
                filter: 'blur(2px)'
              }} />
            </div>

            {/* Animated shine */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              animation: 'progressShine 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>

        {/* Loading Text */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px'
        }}>
          <span style={{ opacity: 0.6 }}>{loadingText}</span>
          <span style={{ 
            color: '#22c55e', 
            fontWeight: '600',
            minWidth: '40px',
            textAlign: 'right'
          }}>
            {Math.round(progress)}%
          </span>
        </div>

        {/* Loading dots */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginTop: '24px'
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'loadingDots 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Tip */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: '12px'
      }}>
        <span style={{ fontSize: '16px' }}>💡</span>
        <span style={{ opacity: 0.6 }}>
          Tip: You can bet on individual moves for higher odds!
        </span>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
          50% { 
            opacity: 0.7; 
            transform: translate(-50%, -50%) scale(1.1); 
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          50% { transform: translateY(-5px) rotate(-3deg); }
          75% { transform: translateY(-20px) rotate(3deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.85); opacity: 0.7; }
        }
        
        @keyframes progressShine {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
        
        @keyframes loadingDots {
          0%, 80%, 100% { 
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BetMateLoading;
