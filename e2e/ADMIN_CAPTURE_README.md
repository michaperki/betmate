# Admin UI Capture Guide

This document explains how the screenshot capture system handles admin page access for capturing admin UI components.

## Admin Authentication Approaches

The system uses multiple approaches to gain admin access for screenshots:

### 1. Database User Promotion

The primary approach is to use the admin promotion script to update the user's role in the database:

```bash
npm run admin:promote -- --email "test@example.com" --role admin --yes
```

This requires:
- MongoDB connection to be available
- MONGODB_URI in the environment
- The user to exist in the database

### 2. Admin API Key Header Injection

For server-side admin access, the system injects the `X-Admin-Key` header into all API requests:

- Uses E2E_ADMIN_KEY environment variable (defaults to 'dev-admin-key')
- Intercepts all fetch and XMLHttpRequest calls
- Adds the admin key header to all requests

This matches the backend's `requireAdminAccess` middleware which accepts either:
- An admin user token, or
- The X-Admin-Key header matching ADMIN_API_KEY

### 3. Frontend Redux State Manipulation

For frontend UI rendering of admin components:

- Manipulates the Redux state in localStorage
- Sets the user's role to 'admin' in the auth state
- Reloads the page to apply the changes

This allows the React components to render admin UI elements without server validation.

## How to Use

By default, all three approaches are applied automatically by the capture system. If you want to focus on one approach:

### For Server-Side Access Only

```bash
# Set the admin API key
export E2E_ADMIN_KEY=your-admin-key-here

# Run the capture
npm run e2e:capture:admin
```

### For Local Testing

1. First run the admin capture test
2. If any access methods fail, check the logs for specific errors

## Troubleshooting

- **MongoDB Connection Issues**: Check if MongoDB is running and MONGODB_URI is correct
- **Admin API Key Mismatch**: Ensure E2E_ADMIN_KEY matches the backend's ADMIN_API_KEY
- **Frontend UI Access**: If admin components are still not visible, check the browser console for errors

## Security Note

These mechanisms are specifically for testing and screenshot capture in development/staging environments. They should never be used in production environments.