# Instructions for finding and setting your Vercel server URL

## Step 1: Find Your Server URL
1. Go to https://vercel.com/dashboard
2. Look for your server deployment (the one with the server folder)
3. Click on it and copy the URL (should be something like https://your-project-name.vercel.app)

## Step 2: Update Environment Variables

### For Development (.env.development):
VITE_BACKEND_URL=http://localhost:4000

### For Production (.env.production and .env):
VITE_BACKEND_URL=https://YOUR_ACTUAL_SERVER_URL.vercel.app

## Step 3: Common Server URLs to Try
Based on your client URL https://restu-alpha.vercel.app, try these:

1. https://restu-server.vercel.app
2. https://restu-api.vercel.app  
3. https://restu-backend.vercel.app
4. https://restu.vercel.app
5. https://restu-alpha-server.vercel.app

## Step 4: Test Your Server URL
Open browser console on https://restu-alpha.vercel.app and run:

```javascript
// Test if your server is accessible
fetch('https://YOUR_SERVER_URL.vercel.app/api/health')
  .then(r => r.json())
  .then(data => console.log('Server response:', data))
  .catch(err => console.error('Server error:', err));
```

## Step 5: Set Environment Variables in Vercel
1. Go to your CLIENT project settings in Vercel
2. Go to Environment Variables
3. Add: VITE_BACKEND_URL = https://YOUR_SERVER_URL.vercel.app
4. Redeploy your client

## Step 6: Set Server Environment Variables
Make sure your SERVER has these environment variables:
- NODE_ENV=production
- ADMIN_EMAIL=admin@restaurant.com
- ADMIN_PASSWORD=admin123
- JWT_SECRET=your-secret
- FRONTEND_URL=https://restu-alpha.vercel.app