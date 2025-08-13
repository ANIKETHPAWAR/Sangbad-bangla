# 🚀 Blendpilot Deployment Guide

## Overview

This guide will help you deploy Blendpilot for optimal performance and fast user experience.

## 🎯 **Deployment Strategy**

- **Frontend**: Vercel (Global CDN, instant deployments)
- **Backend**: Railway (Fast, reliable, good free tier)
- **Database**: Firebase (Already configured)

---

## 📱 **Frontend Deployment (Vercel)**

### Step 1: Prepare Frontend

```bash
cd frontend
npm install
# Ensure terser is installed for minification
npm install --save-dev terser
npm run build
```

**Note**: If you encounter a "terser not found" error during build, the package.json has been updated to include terser as a dependency. The build should work automatically now.

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   vercel --prod
   ```

4. **Or connect GitHub repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-deploy on every push

### Step 3: Configure Environment Variables

In Vercel dashboard, add:

- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_API_BASE_URL` (your backend URL)

---

## 🔧 **Backend Deployment (Railway)**

### Step 1: Prepare Backend

```bash
cd backend
npm install
```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login with GitHub**
3. **Create New Project**
4. **Deploy from GitHub:**
   - Select your repository
   - Set root directory to `backend/`
   - Railway will auto-detect Node.js

### Step 3: Configure Environment Variables

In Railway dashboard, add all variables from `env.production`:

- `NODE_ENV=production`
- `PORT=5000`
- Firebase credentials
- `CORS_ORIGIN=https://your-frontend-domain.vercel.app`

### Step 4: Get Backend URL

- Railway will provide a URL like: `https://your-app.railway.app`
- Update your frontend environment variables with this URL

---

## 🔄 **Update Frontend API Configuration**

After getting your backend URL, update the frontend:

1. **Update environment variables in Vercel:**

   ```
   VITE_API_BASE_URL=https://your-app.railway.app
   ```

2. **Update vite.config.js proxy (remove localhost references):**
   ```javascript
   // Remove or update proxy configurations for production
   ```

---

## 🚀 **Performance Optimizations Applied**

### Frontend (Vite)

- ✅ **Code splitting** - Separate chunks for vendor, auth, icons
- ✅ **Minification** - Terser for JavaScript, CSS minification
- ✅ **Target optimization** - ES2015 for better browser support
- ✅ **Asset caching** - Long-term caching for static assets

### Backend (Railway)

- ✅ **Health checks** - Automatic monitoring
- ✅ **Restart policies** - Auto-recovery on failures
- ✅ **Environment separation** - Production vs development configs

### CDN & Delivery

- ✅ **Global CDN** - Vercel's 200+ edge locations
- ✅ **HTTP/2** - Multiplexed connections
- ✅ **Automatic HTTPS** - Security by default
- ✅ **Edge caching** - Fastest possible response times

---

## 📊 **Expected Performance**

| Metric                       | Before   | After           |
| ---------------------------- | -------- | --------------- |
| **First Contentful Paint**   | ~3-5s    | ~1-2s           |
| **Largest Contentful Paint** | ~5-8s    | ~2-3s           |
| **Time to Interactive**      | ~6-10s   | ~3-4s           |
| **Global Load Time**         | Variable | ~2-4s worldwide |

---

## 🔍 **Monitoring & Maintenance**

### Vercel Analytics

- Enable in Vercel dashboard
- Monitor Core Web Vitals
- Track user experience metrics

### Railway Monitoring

- Built-in performance metrics
- Log aggregation
- Error tracking

### Firebase Monitoring

- Database performance
- Authentication analytics
- Real-time usage stats

---

## 🚨 **Troubleshooting**

### Common Issues

1. **CORS Errors:**

   - Ensure `CORS_ORIGIN` matches your frontend domain exactly
   - Check for trailing slashes

2. **Environment Variables:**

   - Verify all variables are set in both Vercel and Railway
   - Check for typos in variable names

3. **Build Failures:**

   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`

4. **API Timeouts:**

   - Railway has 30s timeout by default
   - Optimize database queries if needed

5. **Terser Build Error:**
   - **Error**: `terser not found. Since Vite v3, terser has become an optional dependency`
   - **Solution**: The package.json has been updated to include terser
   - **Alternative**: Use `minify: 'esbuild'` in vite.config.js (already configured)

---

## 🎉 **Deployment Complete!**

After following these steps:

1. ✅ Frontend deployed to Vercel
2. ✅ Backend deployed to Railway
3. ✅ Environment variables configured
4. ✅ CORS settings updated
5. ✅ Performance optimizations applied

Your users will experience:

- **Lightning-fast loading** from global CDN
- **Reliable backend** with auto-scaling
- **Professional performance** with monitoring
- **Global reach** with edge locations worldwide

---

## 📞 **Support**

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
