# Vercel Deployment Guide

## Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- Environment variables configured

## Environment Variables

Set these in your Vercel project settings:

```
VITE_DOMAIN_NAME=your-auth0-domain.auth0.com
VITE_CLIENT_ID=your-auth0-client-id
```

## Deployment Steps

1. **Connect Repository**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Build Settings**

   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**

   - Add the environment variables listed above
   - Redeploy after adding environment variables

4. **Custom Domain**
   - Your app will be available at: `sangbadbangla.vercel.app`
   - You can configure a custom domain in Vercel settings

## Build Process

The app uses Vite for building and includes:

- React 19 with modern features
- Tailwind CSS for styling
- Auth0 for authentication
- Mock news data (no external API dependencies)

## Troubleshooting

- If build fails, check environment variables are set
- Ensure all dependencies are in package.json
- Check Vercel logs for specific error messages
