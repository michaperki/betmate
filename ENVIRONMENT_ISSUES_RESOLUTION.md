# BetMate Environment Issues & Resolution

## Issues Identified

We identified and fixed several issues affecting the BetMate application environments:

### 1. Incorrect Backend URLs

**Problem:** The frontend was trying to connect to non-existent or incorrect backend URLs:
- Dev environment was trying to use `https://betmate-c5e3b1b52828.herokuapp.com` which no longer exists
- Production logging was using the frontend domain instead of the backend domain

**Root Cause:** The Heroku backend app URLs changed, but the frontend configuration wasn't updated. Additionally, the logging endpoint URL construction was incorrect.

### 2. CORS Issues

**Problem:** CORS errors were occurring when the frontend tried to make requests to the backend.

**Root Cause:** Since the backend URLs were incorrect, the CORS headers were never being returned because requests were going to non-existent services.

### 3. Manifest.json Syntax Error

**Problem:** Browser console showed a manifest.json syntax error.

**Root Cause:** This was actually a 404 error being reported as a syntax error. The manifest file was fine, but it wasn't being served correctly in production.

### 4. JWT Authentication Failure

**Problem:** Production environment showed 401 Unauthorized errors when trying to access authenticated endpoints.

**Root Cause:** The app is attempting to make authenticated requests before the user is logged in, or the JWT token is not being properly initialized.

## Solutions Implemented

### 1. Updated Backend URLs

**Solution:** Updated the frontend configuration to use the correct backend URLs:
- Updated dev environment to use the staging backend: `https://betmate-staging-b13c28d0322d.herokuapp.com`
- Verified production environment uses the correct URL: `https://betmate-prod-1d67bb013aa8.herokuapp.com`

**Files Changed:**
- `/frontend/src/utils/index.ts` - Updated ROOT_URL configuration

### 2. Fixed Logging URL Construction

**Solution:** Modified the logging service to properly use the backend URL instead of trying to post to the frontend domain.

**Files Changed:**
- `/frontend/src/utils/logger.ts`:
  - Added import for ROOT_URL
  - Updated fetch URL to use `${ROOT_URL}${AXIOM_ENDPOINT}`

### 3. Authentication Flow

**Issue:** The 401 Unauthorized errors occur because the app is trying to make authenticated requests before the user logs in.

**Expected Behavior:** This is actually normal behavior. The app attempts to restore a user session using JWT token authentication. If no valid token exists, it will show 401 errors in the console, but the app should handle this gracefully by redirecting to the login page.

## Deployment Information

### Backend Heroku Apps

- **Production:** https://betmate-prod-1d67bb013aa8.herokuapp.com
- **Staging:** https://betmate-staging-b13c28d0322d.herokuapp.com

### Frontend Netlify Sites

- **Production:** https://betmate-prod.netlify.app
- **Development:** https://betmate-dev.netlify.app

## Notes for Future Maintenance

1. **Heroku App Names:** If Heroku app names change in the future, remember to update the frontend configuration in `src/utils/index.ts`.

2. **Authentication Flow:** The 401 errors are expected when no user is logged in. This is part of the normal authentication flow trying to restore a session. If these errors persist after login, there may be an issue with token storage or transmission.

3. **Manifest Errors:** If manifest.json errors persist in production, check that the file is being properly included in the build and served with the correct content type.