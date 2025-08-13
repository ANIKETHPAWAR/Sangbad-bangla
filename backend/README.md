# Blendpilot Firebase Backend

Firebase-powered backend for the Blendpilot Bengali News Admin Panel.

## 🚀 Features

- **Articles Management**: Create, read, update, delete news articles
- **Media Management**: Upload and manage images
- **Categories Management**: Organize news by categories
- **Dashboard Statistics**: Real-time content analytics
- **Firebase Integration**: Firestore database + Cloud Storage

## 🛠️ Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Firestore Database** and **Cloud Storage**
4. Go to Project Settings → Service Accounts
5. Click "Generate New Private Key"
6. Download the JSON file and rename it to `firebase-service-account.json`
7. Place it in the `backend/` directory

### 2. Environment Configuration

1. Copy `env.example` to `.env`
2. Update the following values:

```env
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Health Check

- `GET /health` - Server health status

### Articles Management

- `POST /api/articles` - Create new article
- `GET /api/articles` - Get all articles (with filters)
- `GET /api/articles/:id` - Get single article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Categories Management

- `POST /api/categories` - Create new category
- `GET /api/categories` - Get all categories

### Media Management

- `POST /api/media/upload` - Upload media file
- `GET /api/media` - Get all media files

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Authentication (Future Implementation)

This backend is designed to work with Auth0 for role-based access control:

- **Admin**: Full access to all features
- **Editor**: Can create/edit articles, manage media
- **Author**: Can create/edit own articles

## 📁 Project Structure

```
backend/
├── server.js                 # Main Express server
├── package.json             # Dependencies and scripts
├── env.example             # Environment variables template
├── firebase-service-account.json  # Firebase credentials (not in git)
└── README.md               # This file
```

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Configure production Firebase project
- Set proper CORS origins
- Configure SSL/HTTPS

## 🔧 Firebase Configuration

### Firestore Collections

1. **articles** - News articles with metadata
2. **categories** - News categories
3. **media** - Uploaded media files

### Storage Buckets

1. **articles/** - Article featured images
2. **media/** - General media uploads

## 📊 Data Models

### Article Schema

```javascript
{
  title: String,           // Article title in Bengali
  content: String,         // Rich text content
  excerpt: String,         // Short description
  category: String,        // Category ID
  author: String,          // Author name
  status: String,          // 'draft' | 'published'
  featuredImage: String,   // Image URL
  viewCount: Number,       // View counter
  likeCount: Number,       // Like counter
  shareCount: Number,      // Share counter
  createdAt: Timestamp,    // Creation date
  updatedAt: Timestamp     // Last update date
}
```

### Category Schema

```javascript
{
  name: String,            // Category name in Bengali
  slug: String,            // URL-friendly slug
  description: String,     // Category description
  color: String,           // Hex color code
  icon: String,            // Emoji or icon
  sortOrder: Number,       // Display order
  createdAt: Timestamp,    // Creation date
  updatedAt: Timestamp     // Last update date
}
```

## 🚨 Security Notes

1. **Never commit** `firebase-service-account.json` to git
2. **Use environment variables** for sensitive configuration
3. **Implement proper authentication** before production use
4. **Set up Firebase Security Rules** for Firestore and Storage
5. **Enable CORS properly** for production domains

## 🔍 Troubleshooting

### Common Issues

1. **Firebase connection error**: Check service account JSON file
2. **CORS error**: Verify CORS_ORIGIN in environment
3. **File upload fails**: Check Firebase Storage bucket permissions
4. **Port already in use**: Change PORT in environment variables

### Debug Mode

Set `NODE_ENV=development` for detailed error logging.

## 📞 Support

For issues and questions:

1. Check Firebase Console for project status
2. Verify environment configuration
3. Check server logs for error details
4. Ensure all dependencies are installed

---

**Next Steps**: Set up Firebase project and configure environment variables, then start building the admin panel frontend!
