# 🚀 Sangbad Bangla Admin Panel Setup Guide

## 📋 Overview

This guide will help you set up the admin panel for your Sangbad Bangla news application. The admin panel allows authorized users to create, edit, and manage news articles that will be combined with external API news in your frontend feed.

## 🔐 Prerequisites

1. **Firebase Project**: Ensure your Firebase project is set up with Firestore and Storage
2. **Auth0 Configuration**: Auth0 account with custom roles configured
3. **Backend Server**: Node.js backend running with Firebase Admin SDK
4. **Frontend**: React application with Auth0 integration

## 🛠️ Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install jsonwebtoken jose multer uuid
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://sangbadbangla.vercel.app

# Firebase Configuration (already configured)
FIREBASE_PROJECT_ID=sangbad-bangla
FIREBASE_STORAGE_BUCKET=sangbad-bangla.firebasestorage.app

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
```

### 3. Auth0 Role Configuration

1. Go to your Auth0 Dashboard
2. Navigate to **User Management** → **Roles**
3. Create a new role called `admin`
4. Assign this role to users who should have admin access
5. Ensure the role includes the custom claim namespace: `https://sangbadbangla.com/roles`

### 4. Test Backend

```bash
cd backend
npm run dev
```

Test the endpoints:

- `GET /health` - Health check
- `GET /api/admin/stats` - Admin statistics (requires admin role)

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install @auth0/auth0-react
```

### 2. Auth0 Configuration

Update your Auth0 configuration in the frontend:

```javascript
// In your Auth0Provider configuration
<Auth0Provider
  domain="your-domain.auth0.com"
  clientId="your-client-id"
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: "https://sangbadbangla.vercel.app",
  }}
>
  {/* Your app components */}
</Auth0Provider>
```

### 3. Test Admin Access

1. Login with a user that has the `admin` role
2. Navigate to `/admin` - you should see the admin dashboard
3. Try creating a new news article

## 🔥 Firebase Setup

### 1. Firestore Database

1. Go to Firebase Console → Firestore Database
2. Create a new collection called `news`
3. The schema will be automatically created when you add news

### 2. Storage Rules

Copy the rules from `firebase-storage-rules.txt` to your Firebase Storage rules:

1. Go to Firebase Console → Storage → Rules
2. Replace the existing rules with the provided ones
3. Publish the rules

### 3. Firestore Rules

Copy the Firestore rules from `firebase-storage-rules.txt` to your Firestore rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace the existing rules with the provided ones
3. Publish the rules

## 📱 Admin Panel Features

### Dashboard (`/admin`)

- View all news articles with pagination
- Search and filter news
- Statistics overview
- Quick actions (edit, delete)

### Create News (`/admin/new`)

- Title and content in Bengali
- Category selection
- Image upload with preview
- Tags and author information
- Auto-publish on save

### Edit News (`/admin/edit/:id`)

- Modify existing articles
- Update images
- Change categories and tags

## 🔄 Integration with Frontend

### Combined News Feed

The admin panel integrates with your existing news feed:

1. **Internal News**: Created via admin panel (stored in Firestore)
2. **External News**: Fetched from Hindustan Times API
3. **Combined Display**: Both sources shown together, sorted by date

### API Endpoints

- `GET /api/combined-news` - Get combined news for frontend
- `GET /api/admin/news` - Admin news management
- `POST /api/admin/news` - Create new news
- `PUT /api/admin/news/:id` - Update news
- `DELETE /api/admin/news/:id` - Soft delete news

## 🧪 Testing

### 1. Backend Testing

```bash
# Test Firebase connection
cd backend
node test-firebase.js

# Test admin endpoints (requires admin token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/admin/stats
```

### 2. Frontend Testing

1. Login with admin user
2. Navigate to `/admin`
3. Create a test news article
4. Upload an image
5. Verify it appears in the combined news feed

## 🚨 Troubleshooting

### Common Issues

1. **"Admin role required" error**

   - Ensure user has `admin` role in Auth0
   - Check custom claim namespace

2. **Firebase connection failed**

   - Verify service account credentials
   - Check environment variables

3. **Image upload fails**

   - Verify Storage rules are published
   - Check file size and type limits

4. **JWT verification fails**
   - Verify Auth0 domain and audience
   - Check token expiration

### Debug Mode

Enable debug logging in your backend:

```javascript
// In server.js
console.log("User roles:", req.user.roles);
console.log("Auth token:", req.headers.authorization);
```

## 📚 Next Steps

### Potential Enhancements

1. **Rich Text Editor**: Integrate Quill or TipTap for better content editing
2. **Bulk Operations**: Select multiple articles for batch actions
3. **Content Scheduling**: Schedule articles for future publication
4. **Media Library**: Centralized image management
5. **User Management**: Admin user creation and role management
6. **Analytics**: Article performance metrics

### Security Considerations

1. **Rate Limiting**: Implement API rate limiting
2. **Input Validation**: Sanitize all user inputs
3. **Audit Logging**: Track all admin actions
4. **Backup Strategy**: Regular Firestore backups

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure Firebase services are enabled
4. Check Auth0 role configuration
5. Review Firebase security rules

## 🎉 Success!

Once everything is working:

- Admins can create and manage news articles
- Images are securely stored in Firebase Storage
- News combines seamlessly with external API content
- Frontend displays unified news feed
- Bengali language support throughout

Your Sangbad Bangla news application now has a powerful admin panel! 🚀

