# Auth0 Setup Guide

## 🚀 Getting Started with Auth0

### Step 1: Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application or select an existing one
3. Choose "Single Page Application" as the application type
4. Go to "Settings" tab

### Step 2: Configure Application Settings

**Allowed Callback URLs:**

```
http://localhost:5173,http://localhost:3000
```

**Allowed Logout URLs:**

```
http://localhost:5173,http://localhost:3000
```

**Allowed Web Origins:**

```
http://localhost:5173,http://localhost:3000
```

### Step 3: Create Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
```

### Step 4: Update Auth0Provider Configuration

In `src/App.jsx`, update the Auth0Provider with your actual values:

```jsx
<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: window.location.origin
  }}
>
```

### Step 5: Test Authentication

1. Start your development server: `npm run dev`
2. Click the "সাইন ইন করুন" button in the header
3. Complete the Auth0 login flow
4. Verify logout functionality

## 🔧 Features Implemented

- ✅ **Auth0 Integration**: Complete authentication flow
- ✅ **Login Button**: Replaces old signin functionality
- ✅ **User Menu**: Shows user info and logout option
- ✅ **Bengali Language**: UI in Bengali
- ✅ **Responsive Design**: Works on all screen sizes

## 📝 Next Steps

1. **User Profile**: Add user profile management
2. **Role-Based Access**: Implement admin/editor roles
3. **Premium Features**: Add subscription management
4. **Social Logins**: Configure additional providers
