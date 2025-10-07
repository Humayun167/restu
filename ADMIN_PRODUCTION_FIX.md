# Admin Dashboard Production Deployment Fix

## Environment Variables Checklist

### Server Environment Variables (Required in Vercel Server Dashboard)

✅ **NODE_ENV=production**
✅ **ADMIN_EMAIL=admin@restaurant.com** (or your preferred admin email)
✅ **ADMIN_PASSWORD=admin123** (or your preferred secure password)
✅ **JWT_SECRET=your-jwt-secret-here** (generate a strong secret key)
✅ **FRONTEND_URL=https://your-client-vercel-url.vercel.app** (your deployed client URL)
✅ **MONGODB_URI=your-mongodb-connection-string**
✅ **CLOUDINARY_CLOUD_NAME=your-cloudinary-name**
✅ **CLOUDINARY_API_KEY=your-cloudinary-key**
✅ **CLOUDINARY_API_SECRET=your-cloudinary-secret**

### Client Environment Variables (Required in Vercel Client Dashboard)

✅ **VITE_BACKEND_URL=https://your-server-vercel-url.vercel.app** (your deployed server URL)

## Deployment Steps

1. **Deploy Server First:**
   ```bash
   # In server directory
   vercel --prod
   ```
   - Add all server environment variables in Vercel dashboard
   - Note the deployed server URL

2. **Update Client Configuration:**
   ```bash
   # Update client/.env.production with server URL
   VITE_BACKEND_URL=https://your-actual-server-url.vercel.app
   ```

3. **Deploy Client:**
   ```bash
   # In client directory  
   vercel --prod
   ```
   - Add client environment variables in Vercel dashboard
   - Note the deployed client URL

4. **Update Server FRONTEND_URL:**
   - Go back to server Vercel dashboard
   - Update FRONTEND_URL with the actual deployed client URL

## Recent Fixes Applied

### 1. Cookie Configuration Fixed
- Updated server-side cookie settings for production
- Set `secure: true` and `sameSite: 'None'` for cross-origin requests
- Removed environment-dependent cookie settings

### 2. Authorization Header Fallback
- Added token-based authentication as fallback
- Server now returns JWT token in login response
- Client stores token in localStorage for requests
- Auth middleware checks both cookies and Authorization headers

### 3. Enhanced Client-Side Authentication
- Added token storage and retrieval
- Enhanced error handling and debugging
- Added request interceptors for automatic token inclusion

### 4. Production Debug Component
- Added comprehensive debugging component
- Accessible via `?debug=admin` URL parameter in production
- Tests server connectivity, CORS, and authentication

## Troubleshooting

### If Admin Dashboard Still Not Working:

1. **Check Environment Variables:**
   - Verify all required variables are set in Vercel dashboard
   - Ensure no typos in variable names
   - Check that URLs don't have trailing slashes

2. **Test Using Debug Component:**
   - Go to your deployed client URL
   - Add `?debug=admin` to the URL
   - Use the debug panel to test connectivity and authentication

3. **Check Browser Console:**
   - Look for CORS errors
   - Check for network request failures
   - Verify authentication responses

4. **Manual Token Test:**
   - Use the debug component to test login
   - Check if token is being stored
   - Test authentication with stored token

### Common Issues and Solutions:

**Issue: CORS Error**
- Solution: Ensure FRONTEND_URL is set correctly on server

**Issue: Authentication Fails**  
- Solution: Verify ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET are set

**Issue: Network Errors**
- Solution: Check VITE_BACKEND_URL points to correct server deployment

**Issue: Cookies Not Working**
- Solution: Use the token fallback mechanism (already implemented)

## Files Modified

- `server/controllers/adminController.js` - Updated cookie config and added token response
- `server/middlewares/authAdmin.js` - Already had Authorization header fallback
- `client/src/components/admin/AdminLogin.tsx` - Added token storage
- `client/src/components/admin/AdminDashboard.tsx` - Added token interceptor
- `client/src/lib/api.ts` - Added admin token support
- `client/src/components/admin/AdminProductionDebug.tsx` - New debug component

## Next Steps

1. Deploy the updated code to both server and client
2. Verify environment variables are set correctly  
3. Test admin login using the debug component
4. If issues persist, use the debug information to identify the specific problem

The authentication system now has multiple fallback mechanisms and should work reliably in production.