# UI Light/Dark Theme Consistency Audit

This document outlines components and UI elements that need adjustments for consistent appearance in both light and dark themes. It also identifies style inconsistencies that should be addressed to improve overall UI cohesion.

## Recently Fixed Issues

1. **Dashboard Leaderboard Title**: Fixed contrast issue in light mode by adjusting text color and text shadow.
2. **Dashboard Filter Dropdowns**: Fixed black background in light mode by setting appropriate background and text colors for the `filter-select` elements.

## Priority Components for Theme Enhancement

### Game UI Components

#### Bottom Toolbar
- **Issue**: The bottom toolbar doesn't properly adapt to light theme
- **Required Changes**:
  - Add light mode styles for background, borders, and buttons
  - Adjust viewer count element colors
  - Update icon button hover states to fit light theme
  - Fix draw button styling in light mode
  - Consider consolidating styles with top navigation for consistency

#### ChessgroundWrapper
DONT FUCK WITH THE CHESSGROUND STYLING.... 

#### GameInfoPanel
- **Issue**: Game info needs better light mode adaptation
- **Required Changes**:
  - Adjust player name/rating text colors
  - Update clock styling for light theme
  - Ensure evaluation bar works well in both themes

#### WagerPanel Components
- **Issue**: Wager UI elements need complete light theme support
- **Required Changes**:
  - Update WagerPanel main container
  - Fix WagerSubPanel colors and borders
  - Ensure bet amount inputs have proper styling
  - Update chip selection UI for light theme
  - Make sure receipt cards are readable in light mode

#### MoveBubbles
- **Issue**: Move bubbles need light theme adaptation
- **Required Changes**:
  - Update bubble backgrounds and borders
  - Adjust odds text for readability
  - Ensure hover/selected states work in both themes

### Dashboard Components
WE ARE MOSTLY DONE WITH DASHBOARD... IM OKAY TO SEE A NEW VERSION OF LIGHT MODE QUICK ACTIONS BAR.
ALSO WE HAVENT LOOKED AT THE OTHER PAGES LIKE VIEW ACTIVE BETS AND BETTING HISTORY

#### QuickActionBar
- **Issue**: Action buttons need light theme styling
- **Required Changes**:
  - Update button backgrounds and hover states
  - Adjust icon colors for light theme
  - Ensure text is readable in light mode

### General UI Elements

#### Modal Components <--- MANY OF THESE ARE DEPRICATED / NOT USED... PLEASE AS YOU WORK, IF YOU NOTICE THAT A COMPONENT IS "DEAD / DEPRICATED" DELETE IT... WE DONT NEEED TO MAINTAIN STYLES OF DEAD COMPONENTS... ALL THE ONES LISTED BELOW ARE DEAD I BELIEVE (expect for maybe lichess modal, not sure that might be depricated too)
- **Issue**: Various modals need light theme support
- **Required Changes**:
  - Update PregameModal
  - Fix PostgameModal
  - Enhance BetConfirmationModal
  - Adjust LichessModal

#### Form Elements <--- THIS MAYBE APPLIES IN CERTAIN ADMIN DASHBOARD PAGES OR ON THE WALLET PAGE BUT NOT MANY FORMS... MAKE SURE YOU ARENT UPDATING DEPRICATED COMPONENETS
- **Issue**: Form controls need consistent light theme styling
- **Required Changes**:
  - Update inputs and select boxes
  - Fix button styles across all components
  - Ensure toggle switches have proper light theme appearance

#### Notifications and Alerts <--- VALID BUT I HAVEN'T BEEN VERY THOUGHTFUL ABOUT NOTICATIONS SO FAR... MOST IMPORTANT / COMMON ONES ARE BET FAILURE AND SUCCESS NOTIFICATIONS, WALLET DEPOSITS, MAYBE SOME OTHER ONES TOO BUT I DONT WANT TO HAVE A BUNCH OF TOAST NOTIFICATIONS POPPING UP ALL THE TIME, I THINK THEY ARE SPAMMY... BARELY HAVE ANY TOAST SO NOT TOO MUCH FOCUS HEREE
- **Issue**: Alert styles need to be consistent across themes
- **Required Changes**:
  - Update success/warning/error state colors
  - Adjust toast notification appearance
  - Fix inline message styling

## Style Inconsistencies to Address <--- THIS IS IMPORTANT AND I WANT YOU TO FIX

1. **Button Styling**: Different button styles exist throughout the app
   - Inconsistent border-radius values
   - Different hover/active animations
   - Varying padding and sizing

2. **Card Components**: Card styles vary between sections
   - Different border treatments
   - Inconsistent shadow styles
   - Varying corner radius values

3. **Typography**: Text styling is inconsistent
   - Varying font weights for similar UI elements
   - Different text colors for the same semantic meaning
   - Inconsistent heading styles

4. **Spacing System**: Layout spacing is not standardized
   - Different padding/margin in similar components
   - Inconsistent gap values in flex layouts
   - Varying container widths

5. **Animation & Transitions**: Effects aren't standardized
   - Different transition durations
   - Inconsistent easing functions
   - Some elements have animations while similar ones don't

## Implementation Recommendations

1. **CSS Variable Expansion**: Extend the theme system to include more specific UI component variables
2. **Shared Mixins**: Create mixins for common UI patterns to ensure consistency
3. **Dark/Light Component Files**: Consider separating theme-specific styles into dedicated files for complex components
4. **Theme Toggle Testing**: Implement rigorous testing of theme toggle across all components
5. **Responsive Testing**: Ensure theme consistency across all breakpoints (mobile, tablet, desktop)

## Action Plan

1. Address high-priority components first (bottom toolbar, game UI elements)
2. Create a theme toggle testing page to quickly check all components
3. Refactor common patterns into shared mixins
4. Systematically audit and fix each component category
5. Update E2E tests to capture light theme screenshots
