# Mock Data Management

This directory contains the mock news data that can be easily updated without rebuilding the entire application.

## 📁 Files

- `mockNewsData.js` - Main mock data file containing featured and trending news
- `README.md` - This documentation file

## 🔄 How to Update Mock Data

### 1. **Edit the Data File**
Open `mockNewsData.js` and modify the news items as needed:

```javascript
// Example: Add a new featured news item
{
  id: 13, // Use a unique ID
  imageUrl: 'https://example.com/image.jpg',
  title: "নতুন খবরের শিরোনাম",
  subtitle: "উপশিরোনাম",
  excerpt: "খবরের সংক্ষিপ্ত বিবরণ...",
  publishDate: '2025-01-16T10:00:00Z', // Use current date
  category: 'নতুন ক্যাটাগরি',
  author: 'রিপোর্টারের নাম',
  readTime: 5,
  isBreaking: false // Set to true for breaking news
}
```

### 2. **Update Dates**
Use the `getCurrentDate()` helper function for current timestamps:

```javascript
import { getCurrentDate } from './mockNewsData.js';

// In your news item:
publishDate: getCurrentDate()
```

### 3. **Redeploy**
After updating the data, redeploy your application to Vercel:

```bash
git add .
git commit -m "Update mock news data"
git push
```

Vercel will automatically rebuild and deploy with the new data.

## 📊 Data Structure

### Featured News
- `id` - Unique identifier
- `imageUrl` - Image URL for the news
- `title` - Main headline in Bengali
- `subtitle` - Sub-headline
- `excerpt` - Brief description
- `publishDate` - Publication date (ISO format)
- `category` - News category
- `author` - Reporter's name
- `readTime` - Estimated reading time in minutes
- `isBreaking` - Boolean for breaking news badge

### Trending News
Same structure as featured news, but displayed in the sidebar.

## 🚀 Helper Functions

The file includes helper functions for dynamic updates:

- `getCurrentDate()` - Returns current date in ISO format
- `addNewsItem(newsItem)` - Adds a new news item
- `updateNewsItem(newsId, updates)` - Updates existing news
- `deleteNewsItem(newsId)` - Deletes news by ID

## ⚠️ Important Notes

1. **Unique IDs**: Always use unique IDs for new news items
2. **Image URLs**: Ensure image URLs are accessible and valid
3. **Bengali Text**: Use proper Bengali text for titles and content
4. **Date Format**: Use ISO date format (YYYY-MM-DDTHH:mm:ssZ)
5. **Redeploy Required**: Changes require redeployment to take effect

## 🔧 Future Enhancement

When you're ready to move to a real API:
1. Replace the mock data service calls with actual API endpoints
2. Keep the same data structure for consistency
3. Update the service methods to use real HTTP requests

## 📝 Example Update

```javascript
// Add this to the featuredNews array
{
  id: 13,
  imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
  title: "ঢাকায় নতুন মেট্রো লাইন উদ্বোধন",
  subtitle: "রাজধানীর গণপরিবহন ব্যবস্থায় নতুন মাইলফলক",
  excerpt: "ঢাকায় নতুন মেট্রো লাইন উদ্বোধন করা হয়েছে। এই লাইন রাজধানীর যানজট সমস্যা সমাধানে গুরুত্বপূর্ণ ভূমিকা পালন করবে...",
  publishDate: '2025-01-16T09:00:00Z',
  category: 'পরিবহন',
  author: 'পরিবহন রিপোর্টার',
  readTime: 4,
  isBreaking: true
}
```
