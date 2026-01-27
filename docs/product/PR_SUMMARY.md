# Mobile Header and Currency Display Improvements

## Summary
- Improved mobile header by removing hamburger menu and optimizing for smaller screens
- Fixed duplicate currency symbols across the application
- Made avatar more prominent on mobile for better usability

## Changes
1. **Mobile Header Optimization**:
   - Removed hamburger menu in favor of a cleaner UI
   - Simplified mobile layout to show logo, balance, and avatar
   - Optimized spacing for mobile devices

2. **Currency Display Fixes**:
   - Fixed duplicate currency symbols in profile dropdown
   - Updated CoinBalance component to show only one currency indicator
   - Simplified balance display in the header

3. **Code Structure**:
   - Updated imports to use the correct components
   - Fixed routes in app.tsx to reference the proper components
   - Improved module organization

## Test Plan
1. Test on mobile browser to verify header display
2. Verify currency values only show one currency symbol/label
3. Check that the circular avatar is visible and functional on mobile devices
4. Confirm that currency values appear correctly in dropdown menus