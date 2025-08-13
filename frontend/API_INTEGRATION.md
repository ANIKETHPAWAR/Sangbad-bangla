# API Integration Documentation

## Overview

This app has been successfully integrated with the **Hindustan Times Bangla API** to fetch real-time news content while maintaining the exact same frontend structure and user experience.

## API Endpoint

- **Base URL**: `https://bangla.hindustantimes.com/api/app`
- **News Feed**: `/sectionfeedperp/v1/nation%20and%20world/6`
- **Full URL**: `https://bangla.hindustantimes.com/api/app/sectionfeedperp/v1/nation%20and%20world/6`

## API Response Structure

The API returns news data in the following format:

```json
{
  "content": {
    "sectionItems": [
      {
        "itemId": "31755010257833",
        "contentType": "News",
        "headLine": "India China Relation: গিঁট খুলছে সম্পর্কের জটিলতার?",
        "shortDescription": "কোভিড-১৯ এবং ২০২০ সালের সংঘর্ষের পর...",
        "publishedDate": "08/12/2025 08:45:49 PM",
        "thumbImage": "https://images.hindustantimes.com/bangla/img/...",
        "mediumRes": "https://images.hindustantimes.com/bangla/img/...",
        "wallpaperLarge": "https://images.hindustantimes.com/bangla/img/...",
        "detailFeedURL": "https://bangla.hindustantimes.com/api/app/detailfeed/v1/...",
        "websiteURL": "https://bangla.hindustantimes.com/nation-and-world/...",
        "section": "nation and world",
        "timeToRead": 1,
        "keywords": "india china direct flights, ভারত চিন সরাসরি বিমান..."
      }
    ]
  }
}
```

## Data Transformation

The `NewsDataService` transforms the API response to match our frontend structure:

| API Field          | Frontend Field | Description                             |
| ------------------ | -------------- | --------------------------------------- |
| `itemId`           | `id`           | Unique news identifier                  |
| `headLine`         | `title`        | Main headline                           |
| `mobileHeadline`   | `subtitle`     | Mobile-optimized headline               |
| `shortDescription` | `excerpt`      | News summary                            |
| `publishedDate`    | `publishDate`  | Publication date (parsed to ISO format) |
| `wallpaperLarge`   | `imageUrl`     | High-resolution image                   |
| `section`          | `category`     | News category                           |
| `agencyName`       | `author`       | News source/agency                      |
| `timeToRead`       | `readTime`     | Estimated reading time                  |
| `detailFeedURL`    | `detailUrl`    | API detail endpoint                     |
| `websiteURL`       | `websiteUrl`   | Full article URL                        |
| `keywords`         | `keywords`     | Array of related keywords               |

## Features

### 1. Real-time News Fetching

- Automatically fetches latest news from Hindustan Times Bangla
- Featured news (first 5 items)
- Trending news (items 6-12)

### 2. Fallback System

- If API fails, falls back to mock data
- Ensures app always has content to display
- Graceful error handling

### 3. External Links

- Direct links to full articles on Hindustan Times website
- API detail endpoints for future detailed content integration
- Opens in new tabs for better user experience

### 4. Responsive Images

- Multiple image resolutions from API
- Fallback placeholder images if loading fails
- Optimized for different screen sizes

### 5. Bengali Language Support

- Full Bengali text support
- Proper date formatting in Bengali
- Bengali UI elements

## Service Methods

### `getFeaturedNews()`

Fetches and returns the first 5 news items as featured news.

### `getTrendingNews()`

Fetches and returns items 6-12 as trending news.

### `getNewsByCategory(category)`

Filters news by category (currently uses the same API endpoint).

### `searchNews(query)`

Searches news by headline, description, or keywords.

## Error Handling

- Network errors are caught and logged
- Fallback to mock data ensures app functionality
- User-friendly error messages in Bengali
- Retry functionality for failed requests

## Future Enhancements

1. **Multiple API Endpoints**: Add support for different news categories
2. **Real-time Updates**: Implement WebSocket or polling for live updates
3. **Caching**: Add local storage caching for offline support
4. **Search API**: Integrate with dedicated search endpoints
5. **Detail Content**: Fetch full article content using detail endpoints

## Testing

To test the API integration:

1. Start the development server: `npm run dev`
2. Check browser console for API calls
3. Verify news content is loading from the API
4. Test fallback functionality by temporarily disabling network

## Notes

- The API is publicly accessible and doesn't require authentication
- Rate limiting may apply for production use
- Images are served from Hindustan Times CDN
- All dates are parsed from DD/MM/YYYY HH:MM:SS AM/PM format to ISO format
