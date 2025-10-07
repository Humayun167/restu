# Environment Variables Setup for Vercel Deployment

## Client Environment Variables (Vercel Dashboard for Client)
```
VITE_BACKEND_URL=https://your-server-vercel-url.vercel.app
```

## Server Environment Variables (Vercel Dashboard for Server)
```
NODE_ENV=production
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=admin123
JWT_SECRET=your-jwt-secret-here
FRONTEND_URL=https://your-client-vercel-url.vercel.app
MONGODB_URI=your-mongodb-connection-string
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## Steps to Deploy:

1. **Deploy Server First:**
   - Deploy the server folder to Vercel
   - Add all server environment variables in Vercel dashboard
   - Note the deployed server URL

2. **Update Client Configuration:**
   - Update the VITE_BACKEND_URL in client/.env.production with the server URL
   - Deploy the client folder to Vercel
   - Add client environment variables in Vercel dashboard

3. **Update Server FRONTEND_URL:**
   - Go back to server Vercel dashboard
   - Update FRONTEND_URL with the deployed client URL

## Debugging Tips:

1. Check Vercel function logs for server errors
2. Check browser network tab for CORS errors
3. Verify environment variables are set correctly in Vercel dashboard
4. Ensure both deployments are using HTTPS (required for secure cookies)

## Common Issues:

- **CORS errors**: Make sure FRONTEND_URL is set correctly
- **Cookie not set**: Ensure secure: true and sameSite: 'None' for production
- **Environment variables not loading**: Check Vercel dashboard settings
- **Wrong API URL**: Verify VITE_BACKEND_URL points to correct server deployment