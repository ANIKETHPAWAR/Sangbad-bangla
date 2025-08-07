# Google Login Setup Guide

## 🚀 Getting Started with Google OAuth

### Step 1: Get Google Client ID

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (if using different port)
     - Your production domain (when deployed)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain (when deployed)
5. Copy the Client ID

### Step 2: Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# API Configuration (if needed)
VITE_API_URL=https://api.hindustantimes.com/bangla
VITE_API_KEY=your_api_key_here
```

### Step 3: Update App.jsx

Replace `YOUR_GOOGLE_CLIENT_ID` in `src/App.jsx` with your actual client ID:

```jsx
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
```

### Step 4: Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `/signin` or click "Sign In" in the header
3. Click the Google login button
4. Complete the Google OAuth flow

## 🔧 Features Implemented

### ✅ What's Working

- **Google OAuth Integration**: Complete Google login flow
- **Authentication Context**: Global state management for user authentication
- **Persistent Login**: Users stay logged in across browser sessions
- **Responsive Design**: Works on desktop and mobile
- **Bengali Language Support**: UI in Bengali with proper fonts
- **Error Handling**: Proper error messages and loading states
- **Accessibility**: WCAG compliant with proper focus management

### 🎨 UI Features

- Modern, clean design matching your existing theme
- Loading animations and states
- Error message display
- Password visibility toggle
- Back navigation
- Responsive layout

### 🔒 Security Features

- JWT token validation
- Automatic token expiration handling
- Secure token storage in localStorage
- Protected routes (ready for implementation)

## 📱 Usage

### For Users

1. Click "Sign In" in the header
2. Click the Google login button
3. Complete Google OAuth flow
4. User is automatically logged in and redirected to home

### For Developers

```jsx
// Use authentication context in any component
import { useAuth } from "../context/AuthContext";

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.name}!</div>;
  }

  return <div>Please sign in</div>;
};
```

## 🚨 Important Notes

1. **Client ID Security**: Never commit your actual Google Client ID to version control
2. **Production Setup**: Update authorized origins and redirect URIs for production
3. **HTTPS Required**: Google OAuth requires HTTPS in production
4. **Token Expiration**: Tokens automatically expire and users are logged out

## 🔄 Future Enhancements

- [ ] Protected routes implementation
- [ ] User profile management
- [ ] Social login (Facebook, Twitter)
- [ ] Email/password authentication
- [ ] Password reset functionality
- [ ] User preferences storage
- [ ] Admin panel integration

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid Client ID"**: Check your Google Client ID configuration
2. **"Redirect URI mismatch"**: Verify authorized redirect URIs in Google Console
3. **"API not enabled"**: Ensure Google+ API is enabled in Google Cloud Console
4. **"CORS errors"**: Check your domain is in authorized origins

### Debug Mode

Add this to your `.env` file for debugging:

```env
VITE_DEBUG=true
```

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify Google Cloud Console configuration
3. Ensure all environment variables are set correctly
4. Check network tab for API calls
