# House Bots Implementation: First Attempt Learnings

This document outlines the key learnings from our first attempt to implement "house bots" for Betmate's wager placement system. These bots were intended to provide liquidity when move-bars are empty, enhancing the user experience.

## Overview of Original Approach

Our implementation strategy aimed to:

1. Create a small agent service in the backend
2. Implement various bot personas with different betting behaviors
3. Hook into the existing WebSocket system to place wagers
4. Add minimal UI indicators in the frontend

## Technical Challenges Encountered

### Backend Challenges

1. **Dependency Management**: 
   - The most significant challenge was managing imports/exports between services.
   - Renaming `microservice` to `microserviceService` required updates across multiple files.
   - TypeScript errors with imported types and declarations created a cascade of fixes.

2. **Data Validation**:
   - Needed schema updates to support new bot-specific fields.
   - Validation issues with user objects and WebSocket messages.
   - Had to update multiple validation schemas across different subsystems.

3. **User Model Extensions**:
   - Adding `is_bot` flag and `botConfig` required careful integration.
   - Authentication system needed modification to support bot users.

### Frontend Challenges

1. **ChessGround Component Issues**:
   - Critical runtime error: `Cannot read properties of undefined (reading 'rookCastle')`.
   - Required patching the underlying library (a fragile approach).
   - Created a wrapper component to ensure proper configuration.

2. **UI Integration**:
   - Adding subtle UI indicators while maintaining consistency.
   - Bot wager representation needed special handling.

## Architecture Improvements for Next Attempt

1. **Isolation of Bot Service**:
   - Create a separate microservice for bot behaviors instead of integrating into the main backend.
   - This would require minimal changes to existing code and validation.
   - Service would consume WebSocket events and respond accordingly.

2. **Simplified Bot Design**:
   - Start with a single bot persona instead of four.
   - Implement a simpler decision model based only on "is bar empty" conditions.
   - Gradually add complexity after basic functionality works.

3. **Better Library Integration**:
   - Fork/patch the chessground library properly or contribute fixes upstream.
   - Carefully evaluate dependencies before integrating them.

4. **Testing First Approach**:
   - Create test cases specifically for bot behaviors.
   - Set up a staging environment where bots can operate without affecting production.

## Implementation Sequence for Next Attempt

1. Create a standalone bot worker service that:
   - Connects to the same Redis/WebSocket feed
   - Monitors for empty move bars
   - Places minimal wagers without requiring user model changes

2. Once the basic mechanism works, introduce the concept of bot identity with:
   - Basic configuration
   - Small set of personalities
   - Visual indicators in the UI

3. Add more sophisticated decision logic:
   - Integration with game evaluation data
   - Varied betting strategies
   - Risk management based on bankroll

## Conclusion

This first attempt provided valuable insights into the architecture and integration points of the Betmate platform. The reactive nature of the betting system, coupled with the complex chess evaluation backend, requires a more modular approach than initially anticipated.

For the next implementation, we'll focus on creating a standalone service that can be developed and tested independently before integrating with the core platform.