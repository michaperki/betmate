# Tabbed Game Interface Design

## Overview
This document outlines the design for a tabbed interface in the game view, focusing on optimizing the mobile experience by organizing notation and bet receipts into a tabbed layout. The design aims to maximize screen real estate while providing a seamless user experience.

## Current State Analysis

The current game interface faces several challenges on mobile:

1. **Vertical Space Constraints**
   - Notation panel and bet receipts compete for limited vertical space
   - Users must scroll between them, losing context of one while viewing the other

2. **Limited Visibility**
   - Users can't easily switch between viewing game information and betting history
   - No visual indicators for new activity in non-visible areas

3. **Navigation Friction**
   - No clear way to switch between different information panels
   - Poor information hierarchy makes it difficult to find relevant data

## Proposed Tabbed Interface

### Core Components

1. **Tab Container**
   - Will use the existing `TabPanel` component with enhanced mobile-specific functionality
   - Lightweight wrapper that manages tab state and renders active content

2. **Tab Navigation**
   - Prominent, thumb-friendly tab buttons at the top
   - Visual indicators for active tab
   - Badge indicators for new activity in non-visible tabs

3. **Content Panels**
   - Each panel will be optimized for its specific content type
   - Consistent sizing and styling across tabs
   - Smooth transitions between tabs

### Tab Structure

The tabbed interface will consist of three main tabs:

#### 1. Game Tab
- **Content**: Chess board and move options
- **Priority**: High (primary tab)
- **Features**:
  - Full-size chess board
  - Move bubbles (limited to 4-5 most promising options)
  - Win/Draw/Loss buttons
  - Current game status

#### 2. Notation Tab
- **Content**: Move history with interactive notation
- **Priority**: Medium
- **Features**:
  - Chronological move list
  - Hover/tap to highlight moves on board (arrow visualization)
  - Auto-scroll to latest move
  - Opening information (when available)

#### 3. Receipts Tab
- **Content**: Bet history and active wagers
- **Priority**: Medium
  - List of placed wagers with status
  - Grouped by move/outcome
  - Settlement status indicators
  - "Place a bet" prompt for new users

### Technical Implementation

#### Enhanced TabPanel Component
We'll enhance the existing `TabPanel` component to support:

```typescript
interface EnhancedTabPanelProps {
  tabs: {
    id: string;
    label: string;
    icon?: React.ReactNode; // Optional icon for mobile
    content: React.ReactNode;
    badgeCount?: number;
    priority?: 'high' | 'medium' | 'low';
  }[];
  defaultTabId?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
  swipeable?: boolean; // Enable swipe gestures
}
```

#### Swipe Navigation
Add horizontal swipe navigation between tabs:

```typescript
// Add to TabPanel component
const handleSwipe = useSwipeable({
  onSwipedLeft: () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      setActiveTabId(nextTab.id);
      if (onTabChange) onTabChange(nextTab.id);
    }
  },
  onSwipedRight: () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      setActiveTabId(prevTab.id);
      if (onTabChange) onTabChange(prevTab.id);
    }
  },
  preventDefaultTouchmoveEvent: true,
  trackMouse: false
});
```

#### Activity Badges
Implement a notification system for activity in non-active tabs:

```typescript
// Update badge count in parent component
const updateNotationBadge = (newMoves: number) => {
  setTabs(prev => prev.map(tab => 
    tab.id === 'notation' ? { ...tab, badgeCount: newMoves } : tab
  ));
};

// Update receipt badge in parent component
const updateReceiptBadge = (newReceipts: number) => {
  setTabs(prev => prev.map(tab => 
    tab.id === 'receipts' ? { ...tab, badgeCount: newReceipts } : tab
  ));
};
```

### Integration with Game Container

The `ChessMatch` container will be updated to use the enhanced TabPanel:

```typescript
// In ChessMatch component
return (
  <div className="match-page mobile-layout">
    <NavBar compact={true} />
    <main className="match-page__content">
      <EnhancedTabPanel
        tabs={[
          {
            id: 'game',
            label: 'Game',
            icon: <GameIcon />,
            content: <GameView board={boardConfig} moves={simMoves} onMoveBet={handlePlaceMoveBet} />,
            priority: 'high'
          },
          {
            id: 'notation',
            label: 'Notation',
            icon: <NotationIcon />,
            content: <NotationPanel sanList={sanList} notationCursor={notationCursor} setNotationCursor={setNotationCursor} />,
            badgeCount: newMoveCount,
            priority: 'medium'
          },
          {
            id: 'receipts',
            label: 'Receipts',
            icon: <ReceiptsIcon />,
            content: <WagerReceipts wagers={displayReceipts} enteringIds={enteringIds} updatedIds={updatedIds} />,
            badgeCount: newReceiptCount,
            priority: 'medium'
          }
        ]}
        defaultTabId="game"
        swipeable={true}
        onTabChange={handleTabChange}
        className="game-tabs"
      />
    </main>
    <BottomToolbar stake={stake} setStake={setStake} presets={presets} isGameInProgress={isGameInProgress} />
  </div>
);
```

### Responsive Adaptations

The interface will adapt based on screen size:

1. **Mobile (< 480px)**
   - Single tab visible at a time
   - Full-width tabs with icons
   - Bottom toolbar fixed to screen

2. **Tablet (480px - 768px)**
   - Single tab visible at a time
   - Tab headers can show more text
   - More move options visible

3. **Desktop (> 768px)**
   - Multi-panel layout (no tabs needed)
   - Sidebar for receipts and notation
   - Full game board with all betting options

## Visual Design

### Tab Headers
- High contrast between active and inactive tabs
- Consistent with existing dark theme
- Subtle animation for tab transitions
- Active tab indicator (underline or pill style)

### Content Transitions
- Smooth sliding transitions between tabs
- Maintain board visibility across tab changes when possible
- Content height consistency to prevent layout shifts

### Activity Indicators
- Subtle pulse animation for new activity in inactive tabs
- Color-coded badges based on tab content type
- Automatic badge clearing when tab is viewed

## Implementation Plan

### Phase 1: Component Creation
1. Enhance existing `TabPanel` component with mobile optimizations
2. Create tab-specific content components
3. Implement tab navigation logic

### Phase 2: Integration
1. Update `ChessMatch` container to use tabbed layout
2. Implement responsive breakpoints
3. Add notification system for tab badges

### Phase 3: Testing & Refinement
1. Test on various mobile devices and screen sizes
2. Gather user feedback on tab organization
3. Optimize performance for transitions and animations

## Mockups

Include visual mockups showing:
1. Tab headers with active/inactive states
2. Content panel layouts for each tab
3. Badge notifications
4. Swipe transitions

## Success Metrics
- Reduced user frustration when navigating between game info and betting history
- Increased engagement with notation and betting features on mobile
- Improved screen utilization
- Positive user feedback on mobile experience