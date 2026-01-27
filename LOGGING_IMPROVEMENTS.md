# Betmate Logging Improvement Plan

This document outlines a comprehensive plan to improve logging across the Betmate application. The goal is to make logging more consistent, informative, and manageable while reducing noise in development.

## Current State

The Betmate application currently uses a structured logging approach with Axiom integration:

- **Backend**: Uses custom AxiomLogger with fallback to console logging
- **Frontend**: Has structured logging with backend proxy endpoint
- **Microservice**: Python-based logging with Axiom integration

### Issues Identified

1. **Inconsistent log formats**: While all components use JSON logging, there are subtle differences in field naming and structure
2. **Development noise**: Excessive logging during development, particularly for candidate scoring and timeouts
3. **Incomplete trace context**: Correlation between frontend and backend exists but could be improved
4. **Limited log filtering**: Minimal support for targeted log filtering by component or feature
5. **Redundant implementation**: Similar logging code duplicated across components

## Proposed Improvements

### 1. Unified Logger Configuration

Create a central logger configuration file for each component that standardizes:
- Log levels
- Context fields
- Formatting
- Sampling rates

### 2. Enhanced Development Experience

- Create a development-specific logging configuration that:
  - Reduces verbosity for common operations
  - Adds colors to console output for better readability
  - Implements intelligent grouping of related logs
  - Filters out noisy microservice timeouts during startup

### 3. Better Frontend Integration

- Enhance frontend logging to:
  - Improve error boundary integration
  - Add better Redux action logging
  - Implement performance logging for key user interactions
  - Maintain trace context across the entire request lifecycle

### 4. Microservice Improvements

- Standardize microservice logging formats
- Add configurable sampling for high-volume operations
- Implement circuit breaker pattern for timeout prevention
- Better correlation with backend trace IDs

### 5. Enhanced Contextual Information

- Add more structured context to logs:
  - User session information
  - Feature flags in effect
  - Application version
  - Performance metrics
  - Current resource utilization

### 6. Implementation Approach

The implementation will focus on non-disruptive changes that maintain backward compatibility:

1. Create enhanced logger implementations that extend current functionality
2. Add configuration files for environment-specific settings
3. Gradually adopt the new logging patterns in high-value areas first
4. Add automated testing for logging functionality

## Implementation Timeline

1. Create unified configuration files
2. Implement backend improvements
3. Enhance frontend integration
4. Update microservice logging
5. Test and validate

## Expected Benefits

- **Developers**: Cleaner console output, better debugging information
- **Operations**: More consistent log format for easier searching and analysis
- **Support**: Better correlation of issues across system components
- **Performance**: Reduced overhead from excessive logging

## Specific Implementation Details

### Backend (`backend/src/helpers/logger.ts`)

- Create a new enhanced logger with better development formatting
- Add intelligent log grouping for related operations
- Implement configurable filtering by feature area

### Frontend (`frontend/src/utils/logger.ts`)

- Enhance Redux integration
- Improve error boundary logging
- Add performance metrics for key user interactions

### Microservice (`microservice/src/logging/`)

- Create a new unified logging package
- Standardize formats with backend
- Add configuration for development-friendly output