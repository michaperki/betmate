# Custom Animated Arrow Implementation

## Current Implementation Analysis

The current implementation uses Chessground's built-in arrow drawing system:

1. `ChessgroundWrapper` component wraps the Chessground chess board
2. The `MoveBubbles` component handles user interactions for placing bets
3. When a user taps on a move bubble, it calls `handleTap` which triggers `onMoveHover` with arrow coordinates
4. For tap-and-hold betting, the arrow appears only after release (tap event), not during the hold
5. The tap-and-hold mechanic uses a timer system to track progress (600ms duration)

## Custom Animated Arrow Implementation Plan

### 1. Create a Custom Arrow Overlay Component

```tsx
// /frontend/src/components/AnimatedArrow/component.tsx
import React, { useState, useEffect, useRef } from 'react';
import './style.scss';

interface AnimatedArrowProps {
  originSquare: string; // e.g., "e2"
  destinationSquare: string; // e.g., "e4"
  progress: number; // 0-100
  color?: string; // CSS color
  isHolding: boolean;
  onComplete?: () => void;
}

const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
  originSquare,
  destinationSquare,
  progress,
  color = '#22c55e', // Default green color
  isHolding,
  onComplete
}) => {
  const [arrowCoords, setArrowCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showCompletionEffect, setShowCompletionEffect] = useState(false);
  
  // Calculate square coordinates based on board dimensions and square names
  useEffect(() => {
    if (!overlayRef.current) return;
    
    const boardRect = overlayRef.current.parentElement?.getBoundingClientRect();
    if (!boardRect) return;
    
    const width = boardRect.width;
    const height = boardRect.height;
    setBoardDimensions({ width, height });
    
    const squareSize = width / 8; // Assumes square board
    
    // Convert square name to coordinates (e.g., "e4" -> [4, 4])
    const getSquareCoords = (square: string) => {
      const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
      const rank = 8 - parseInt(square[1]);
      return { x: file * squareSize + squareSize / 2, y: rank * squareSize + squareSize / 2 };
    };
    
    const origin = getSquareCoords(originSquare);
    const destination = getSquareCoords(destinationSquare);
    
    setArrowCoords({
      x1: origin.x,
      y1: origin.y,
      x2: destination.x,
      y2: destination.y
    });
  }, [originSquare, destinationSquare, overlayRef.current]);
  
  // Show completion effect when progress reaches 100
  useEffect(() => {
    if (progress >= 100 && isHolding) {
      setShowCompletionEffect(true);
      setTimeout(() => {
        setShowCompletionEffect(false);
        if (onComplete) onComplete();
      }, 600); // Duration of explosion animation
    }
  }, [progress, isHolding]);
  
  // Calculate angle for arrow head rotation
  const angle = Math.atan2(arrowCoords.y2 - arrowCoords.y1, arrowCoords.x2 - arrowCoords.x1) * 180 / Math.PI;
  
  // Calculate length for progress animation
  const fullLength = Math.sqrt(
    Math.pow(arrowCoords.x2 - arrowCoords.x1, 2) + 
    Math.pow(arrowCoords.y2 - arrowCoords.y1, 2)
  );
  const currentLength = (progress / 100) * fullLength;
  
  // Calculate current endpoint based on progress
  const currentX = arrowCoords.x1 + (arrowCoords.x2 - arrowCoords.x1) * (progress / 100);
  const currentY = arrowCoords.y1 + (arrowCoords.y2 - arrowCoords.y1) * (progress / 100);
  
  return (
    <div 
      ref={overlayRef}
      className="animated-arrow-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Main arrow line with glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Arrow shaft with growing animation */}
        <line 
          x1={arrowCoords.x1} 
          y1={arrowCoords.y1} 
          x2={currentX} 
          y2={currentY}
          stroke={color}
          strokeWidth={isHolding ? 8 : 6}
          strokeLinecap="round"
          filter="url(#glow)"
          style={{
            transition: isHolding ? 'none' : 'all 0.3s ease-out',
            opacity: isHolding ? 1 : 0.8
          }}
        />
        
        {/* Arrow head - appears when progress > 70% */}
        {progress > 70 && (
          <polygon
            points="0,-8 16,0 0,8"
            fill={color}
            style={{
              transformOrigin: 'center',
              transform: `translate(${currentX}px, ${currentY}px) rotate(${angle}deg)`,
              opacity: isHolding ? 1 : 0.8,
              filter: "url(#glow)"
            }}
          />
        )}
        
        {/* Pulsing origin dot */}
        <circle
          cx={arrowCoords.x1}
          cy={arrowCoords.y1}
          r={isHolding ? 8 : 5}
          fill={color}
          className={isHolding ? "pulsing-origin" : ""}
          style={{
            transition: isHolding ? 'none' : 'all 0.3s ease-out',
            opacity: isHolding ? 1 : 0.8,
            filter: "url(#glow)"
          }}
        />
        
        {/* Completion effect animation */}
        {showCompletionEffect && (
          <g className="completion-effect" style={{ 
            transformOrigin: 'center',
            transform: `translate(${arrowCoords.x2}px, ${arrowCoords.y2}px)`
          }}>
            {/* Circular explosion animation */}
            <circle className="explosion-ring" r="10" fill="none" stroke={color} strokeWidth="3" />
            <circle className="explosion-ring" r="20" fill="none" stroke={color} strokeWidth="2" />
            <circle className="explosion-ring" r="30" fill="none" stroke={color} strokeWidth="1" />
            
            {/* Star burst elements */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={`burst-${i}`}
                x1="0"
                y1="0"
                x2={Math.cos(angle * Math.PI / 180) * 40}
                y2={Math.sin(angle * Math.PI / 180) * 40}
                stroke={color}
                strokeWidth="2"
                className="burst-line"
                style={{ 
                  transformOrigin: 'center',
                  animationDelay: `${i * 50}ms` 
                }}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

export default AnimatedArrow;
```

### 2. Create Styles for the Arrow Animation

```scss
/* /frontend/src/components/AnimatedArrow/style.scss */
.animated-arrow-overlay {
  pointer-events: none;
  z-index: 150; /* Ensure it's above the chess board */
}

/* Pulsing origin animation */
.pulsing-origin {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    r: 8;
  }
  50% {
    opacity: 0.7;
    r: 10;
  }
  100% {
    opacity: 1;
    r: 8;
  }
}

/* Explosion animation */
.explosion-ring {
  opacity: 0;
  transform-origin: center;
  animation: expand 0.6s ease-out forwards;
}

.explosion-ring:nth-child(1) { animation-delay: 0s; }
.explosion-ring:nth-child(2) { animation-delay: 0.1s; }
.explosion-ring:nth-child(3) { animation-delay: 0.2s; }

@keyframes expand {
  0% {
    opacity: 0.8;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(3);
  }
}

/* Star burst animation */
.burst-line {
  opacity: 0;
  animation: burst 0.4s ease-out forwards;
}

@keyframes burst {
  0% {
    opacity: 0.9;
    stroke-dasharray: 0;
    stroke-dashoffset: 0;
  }
  100% {
    opacity: 0;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
}
```

### 3. Integrate with MoveBubbles Component

Modify the MoveBubbles component to use our custom arrow system:

```tsx
// Modified handleBetStart function in MoveBubbles
const handleBetStart = (move: string) => (e: React.MouseEvent | React.TouchEvent) => {
  if (!isAuthenticated || !selectedStake) return;

  e.preventDefault();
  e.stopPropagation();

  // Prevent context menu on mobile
  if ('ontouchstart' in window) {
    document.addEventListener('contextmenu', preventContextMenu, { once: true });
  }

  // 1. Get origin and destination squares from move
  const { originSquare, destinationSquare } = getMoveSquares(move, gameState);
  
  // 2. Show the arrow immediately when touch/click starts
  props.showCustomArrow(originSquare, destinationSquare, true);
  
  setIsHolding(move);
  setHoldProgress(0);
  holdStartRef.current = Date.now();

  // Progress animation
  progressTimerRef.current = window.setInterval(() => {
    const elapsed = Date.now() - holdStartRef.current;
    const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
    setHoldProgress(progress);
    
    // 3. Update arrow progress
    props.updateArrowProgress(progress);
  }, 16); // ~60fps

  // Complete bet on hold duration
  holdTimerRef.current = window.setTimeout(() => {
    onMoveBet(move, selectedStake);
    handleBetEnd();
  }, HOLD_DURATION);
};

// Add helper function to convert chess moves to square coordinates
const getMoveSquares = (move: string, fen: string): { originSquare: string, destinationSquare: string } => {
  try {
    const chess = new Chess(fen);
    
    // Handle SAN notation (like "Nf3", "e4", "Qxd5")
    let moveObj;
    try {
      moveObj = chess.move(move, { sloppy: true });
      if (moveObj) {
        return {
          originSquare: moveObj.from,
          destinationSquare: moveObj.to
        };
      }
    } catch (e) {
      // If SAN parsing fails, try other methods
    }
    
    // Handle JSON format from chessground {orig: 'e2', dest: 'e4'}
    const origDestMatch = move.match(/^\{orig:\s*['"]([a-h][1-8])['"],\s*dest:\s*['"]([a-h][1-8])['"].*\}$/);
    if (origDestMatch) {
      return {
        originSquare: origDestMatch[1],
        destinationSquare: origDestMatch[2]
      };
    }
    
    // Handle UCI format (e2e4)
    const uciMatch = move.match(/^([a-h][1-8])([a-h][1-8])$/);
    if (uciMatch) {
      return {
        originSquare: uciMatch[1],
        destinationSquare: uciMatch[2]
      };
    }
    
    // Fallback to approximate squares for pawn moves like "e4"
    if (/^[a-h][2-7]$/.test(move)) {
      const file = move.charAt(0);
      const rank = move.charAt(1);
      const fromRank = chess.turn() === 'w' ? 
        (rank === '4' ? '2' : (parseInt(rank) - 1).toString()) : 
        (rank === '5' ? '7' : (parseInt(rank) + 1).toString());
      
      return {
        originSquare: `${file}${fromRank}`,
        destinationSquare: move
      };
    }
    
    // Default fallback
    return {
      originSquare: 'e2', // Default values if we can't determine
      destinationSquare: 'e4'
    };
  } catch (e) {
    console.error('Error parsing move squares:', e);
    return {
      originSquare: 'e2',
      destinationSquare: 'e4'
    };
  }
};
```

### 4. Add Custom Arrow Component to ChessMatch

Modify the ChessMatch component to include and manage the custom arrow overlay:

```tsx
// Add to ChessMatch component imports
import AnimatedArrow from 'components/AnimatedArrow';

// Add state in ChessMatch
const [customArrow, setCustomArrow] = useState<{
  origin: string;
  destination: string;
  isActive: boolean;
  progress: number;
} | null>(null);

// Add arrow control functions
const showCustomArrow = (origin: string, destination: string, isActive: boolean = true) => {
  setCustomArrow({
    origin,
    destination,
    isActive,
    progress: 0
  });
};

const updateArrowProgress = (progress: number) => {
  setCustomArrow(prev => prev ? { ...prev, progress } : null);
};

const hideCustomArrow = () => {
  setCustomArrow(null);
};

// Pass these functions to MoveBubbles
<MoveBubbles
  // existing props...
  showCustomArrow={showCustomArrow}
  updateArrowProgress={updateArrowProgress}
  hideCustomArrow={hideCustomArrow}
/>

// Add the custom arrow overlay in the ChessMatch JSX, right after ChessgroundWrapper
<div className="chessboard-container">
  <ChessgroundWrapper 
    config={props.config} 
    ref={groundWrapperRef} 
  />
  
  {/* Add the custom arrow overlay */}
  {customArrow && customArrow.isActive && (
    <AnimatedArrow
      originSquare={customArrow.origin}
      destinationSquare={customArrow.destination}
      progress={customArrow.progress}
      isHolding={customArrow.progress < 100}
      color={
        customArrow.progress < 30 ? '#f59e0b' : 
        customArrow.progress < 60 ? '#22c55e' : 
        customArrow.progress < 90 ? '#06b6d4' : 
        '#8b5cf6'
      }
      onComplete={() => {
        // Keep arrow visible for a short time after completion
        setTimeout(hideCustomArrow, 500);
      }}
    />
  )}
</div>
```

### 5. Modify Handle Functions to Use Custom Arrows

```tsx
// Update the handleTap function in MoveBubbles
const handleTap = (move: string) => {
  // Get origin and destination squares
  const { originSquare, destinationSquare } = getMoveSquares(move, gameState);
  
  // Show the arrow with 100% progress immediately (full arrow)
  props.showCustomArrow(originSquare, destinationSquare, true);
  props.updateArrowProgress(100);
  
  // Auto-hide after 1.5 seconds
  setTimeout(() => {
    props.hideCustomArrow();
  }, 1500);
  
  // Rest of the function remains the same
  props.onMoveHover([{ orig: originSquare, dest: destinationSquare }]);
  setIsHolding(null);
  
  // Clear any existing arrow timeout
  if (tapTimeoutRef.current) {
    clearTimeout(tapTimeoutRef.current);
  }
  
  // Set timeout to unhover the move
  tapTimeoutRef.current = window.setTimeout(() => {
    props.onMoveUnhover();
  }, 1500);
};

// Update handleBetEnd to also hide custom arrow
const handleBetEnd = () => {
  clearHoldTimers();
  setIsHolding(null);
  setHoldProgress(0);
  props.hideCustomArrow();
};
```

## Benefits of this Implementation

1. **Immediate Visual Feedback**: Arrow appears as soon as the user taps/clicks, not after release
2. **Progressive Animation**: Arrow "grows" as the user holds, providing clear visual feedback
3. **Celebratory Effect**: Explosion animation provides satisfying feedback when bet is placed
4. **Visual Quality**: Glow effects and animations create a more engaging and modern look
5. **Custom Styling**: Complete control over colors, thickness, and animation timing

## Technical Considerations

1. **Positioning**: The arrow overlay must be precisely positioned relative to the chess board
2. **Performance**: Animations should use CSS/SVG for smooth performance, minimizing JS calculations
3. **Integration**: The custom arrows can work alongside Chessground's built-in arrows for flexibility
4. **Responsiveness**: Implementation must work correctly on different screen sizes
5. **Accessibility**: Animations should respect user preferences (reduced motion settings)

## Implementation Steps

1. Create the AnimatedArrow component and styles
2. Add custom arrow state management to ChessMatch
3. Modify MoveBubbles to use the custom arrow system
4. Update handleTap and handleBetStart functions
5. Test on various devices and screen sizes
6. Add fallback to Chessground arrows if needed