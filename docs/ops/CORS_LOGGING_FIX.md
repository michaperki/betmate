# CORS and Logging Fix Documentation

## Issue Summary

The application was experiencing two main issues:

1. **CORS Errors**: The frontend (Netlify) was unable to make requests to the backend (Heroku) due to CORS configuration issues.
2. **404 Logging Errors**: The frontend was attempting to send logs to `/api/log` but was constructing the URL incorrectly.

## Changes Made

### 1. Frontend Logging URL Fix

Fixed the frontend logger to properly use the backend URL for the logging endpoint:

**File:** `/frontend/src/utils/logger.ts`

```diff
+ import { ROOT_URL } from './index';

// ...

- const response = await fetch(AXIOM_ENDPOINT, {
+ const response = await fetch(`${ROOT_URL}${AXIOM_ENDPOINT}`, {
```

This change ensures that the logging requests are sent to the correct backend URL (e.g., `https://betmate-c5e3b1b52828.herokuapp.com/api/log`) instead of trying to access `/api/log` on the frontend domain.

### 2. CORS Configuration Verification

Verified that the CORS configuration on the backend properly includes the Netlify domains:

**File:** `/backend/src/server.ts`

```javascript
// Define allowed origins for both CORS and Socket.IO
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://betmate-prod.netlify.app', 'https://betmate-dev.netlify.app']
  : ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:8080'];
```

The log router also has appropriate CORS configuration:

**File:** `/backend/src/routers/log_router.ts`

```javascript
// Define allowed origins for the log endpoint
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://betmate-prod.netlify.app', 'https://betmate-dev.netlify.app']
  : ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:8080'];
```

## Deployment Steps

### Frontend Deployment

1. Push the changes to the frontend repository:

```bash
cd frontend
git add src/utils/logger.ts
git commit -m "fix: correct logging endpoint URL construction"
git push
```

2. Deploy to Netlify:
   - The deployment will automatically trigger when changes are pushed to the configured branch
   - Alternatively, trigger a manual deploy from the Netlify dashboard

### Backend Verification

No changes were needed for the backend as the CORS configuration was already correct. However, if you make any changes to the backend CORS configuration in the future:

1. Push the changes to the backend repository:

```bash
cd backend
git add src/server.ts src/routers/log_router.ts
git commit -m "fix: update CORS configuration"
git push
```

2. Deploy to Heroku:

```bash
git push heroku main
```

## Verification Steps

After deployment, verify that:

1. The frontend loads without CORS errors
2. Client-side logs are successfully sent to the backend
3. The manifest.json file loads correctly

Check the browser's developer console to ensure there are no CORS-related errors or 404s for the logging endpoint.