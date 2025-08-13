const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5000;

// Helper function to validate and format dates
function validateAndFormatDate(dateString) {
  if (!dateString) return null;
  
  try {
    // Handle format: "2025-08-13 10:30:15" (YYYY-MM-DD HH:MM:SS)
    if (dateString.includes('-') && dateString.includes(':')) {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute, second] = timePart.split(':');
      
      // Create date with UTC to avoid timezone issues
      const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second)));
      
      // Check if date is valid and not in the future (more than 1 year ahead)
      const now = new Date();
      const maxFutureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (date > maxFutureDate) {
        console.warn('Date is too far in the future, using current date:', dateString);
        return new Date().toISOString();
      }
      
      return date.toISOString();
    }
    
    // Try to parse as ISO string or other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Check if date is valid and not in the future
    const now = new Date();
    const maxFutureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    if (date > maxFutureDate) {
      console.warn('Date is too far in the future, using current date:', dateString);
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error validating date:', dateString, error);
    return null;
  }
}

// Middleware
const corsOptions = {
  origin: [
    'https://sangbadbangla.vercel.app', // Your Vercel frontend
    'http://localhost:3000', // Local development
    'http://localhost:5173'  // Vite dev server
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Bengali News API Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Test API connection endpoint
app.get('/api/test-connection', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API connection successful!',
    timestamp: new Date().toISOString(),
    backendUrl: 'https://sangbadbangla1.onrender.com',
    endpoints: [
      '/api/popular-stories',
      '/api/section-feed/:sectionName/:numStories',
      '/api/cricket-data'
    ]
  });
});

// Test proxy endpoint
app.get('/test-proxy/:sectionName', async (req, res) => {
  const { sectionName } = req.params;
  try {
    const response = await fetch(`https://bangla.hindustantimes.com/api/app/sectionfeedperp/v1/${sectionName}/5`);
    const data = await response.text();
    res.json({
      success: true,
      sectionName,
      responseLength: data.length,
      responsePreview: data.substring(0, 500),
      contentType: response.headers.get('content-type'),
      status: response.status
    });
  } catch (error) {
    res.json({
      success: false,
      sectionName,
      error: error.message
    });
  }
});

// Cricket API endpoint
app.get('/api/cricket-data', async (req, res) => {
  try {
    console.log('=== Fetching cricket data from Hindustan Times ===');
    
    const response = await fetch('https://www.hindustantimes.com/static-content/10s/opta-cricket/cricket-opta.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.hindustantimes.com/',
        'Origin': 'https://www.hindustantimes.com'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }

    const data = await response.json();
    console.log('Successfully fetched cricket data');
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching cricket data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch cricket data', 
      error: error.message
    });
  }
});

// New: Hindustan Times Popular Stories API endpoint
app.get('/api/popular-stories', async (req, res) => {
  try {
    console.log('=== Fetching Popular Stories from Hindustan Times ===');
    
    const apiUrl = 'https://personalize.hindustantimes.com/popular-story?propertyId=bg&platformId=web&articleType=story&numStories=8';
    console.log('Target API URL:', apiUrl);
    
    // Headers to mimic a real browser request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'bn-IN,bn;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://bangla.hindustantimes.com/',
      'Origin': 'https://bangla.hindustantimes.com'
    };

    console.log('Sending request with headers:', headers);
    
    const response = await fetch(apiUrl, { 
      headers,
      timeout: 15000 // 15 second timeout
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Popular Stories API Response received');
    
    // Transform the response to match our frontend structure
    if (data.status === 'success' && data.items && Array.isArray(data.items)) {
      const transformedStories = data.items.map((item, index) => ({
        id: item.storyId || index,
        title: item.headline || `Story ${index + 1}`,
        subtitle: item.shortDescription || '',
        excerpt: item.shortDescription || '',
        imageUrl: item.imageObject?.bigImage || item.imageObject?.mediumImage || item.imageObject?.thumbnailImage || '',
        publishDate: validateAndFormatDate(item.publishDate || item.date) || new Date().toISOString(),
        readTime: item.timeToRead || 3,
        detailUrl: item.storyURL || '',
        websiteUrl: item.storyURL || '',
        contentType: item.contentType || 'story',
        sectionName: item.sectionName || '',
        category: item.sectionName || '',
        authorName: item.authorName || '',
        keywords: item.keywords || []
      }));
      
      console.log(`Transformed ${transformedStories.length} popular stories`);
      
      res.json({
        success: true,
        count: transformedStories.length,
        stories: transformedStories,
        apiSource: 'personalize.hindustantimes.com/popular-story'
      });
    } else {
      throw new Error('Invalid response structure from popular stories API');
    }
    
  } catch (error) {
    console.error('Error fetching popular stories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch popular stories',
      details: error.message
    });
  }
});

// New: Hindustan Times Section Feed API endpoint
app.get('/api/section-feed/:sectionName/:numStories', async (req, res) => {
  try {
    const { sectionName, numStories } = req.params;
    console.log(`=== Fetching Section Feed for ${sectionName} with ${numStories} stories ===`);
    
    const apiUrl = `https://bangla.hindustantimes.com/api/app/sectionfeedperp/v1/${encodeURIComponent(sectionName)}/${numStories}`;
    console.log('Target API URL:', apiUrl);
    
    // Headers to mimic a real browser request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'bn-IN,bn;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://bangla.hindustantimes.com/',
      'Origin': 'https://bangla.hindustantimes.com'
    };

    console.log('Sending request with headers:', headers);
    
    const response = await fetch(apiUrl, { 
      headers,
      timeout: 15000 // 15 second timeout
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Section Feed API Response received');
    
    // Transform the response to match our frontend structure
    if (data.content && data.content.sectionItems && Array.isArray(data.content.sectionItems)) {
      const transformedStories = data.content.sectionItems
        .filter(item => item.contentType === 'News')
        .map((item, index) => ({
          id: item.itemId || index,
          title: item.headLine || `Story ${index + 1}`,
          subtitle: item.subHead || '',
          excerpt: item.shortDescription || '',
          imageUrl: item.wallpaperLarge || item.mediumRes || item.thumbImage || '',
          publishDate: validateAndFormatDate(item.publishedDate) || new Date().toISOString(),
          readTime: item.timeToRead || 3,
          detailUrl: item.detailFeedURL || '',
          websiteUrl: item.websiteURL || '',
          contentType: item.contentType || 'News',
          sectionName: item.section || sectionName,
          category: item.section || sectionName,
          authorName: item.authorName || '',
          keywords: item.keywords || []
        }));
      
      console.log(`Transformed ${transformedStories.length} section stories`);
      
      res.json({
        success: true,
        count: transformedStories.length,
        stories: transformedStories,
        sectionName: sectionName,
        apiSource: 'bangla.hindustantimes.com/api/app/sectionfeedperp'
      });
    } else {
      throw new Error('Invalid response structure from section feed API');
    }
    
  } catch (error) {
    console.error('Error fetching section feed:', error);
    res.status(500).json({ 
      error: 'Failed to fetch section feed',
      details: error.message
    });
  }
});

// Keep existing endpoints for backward compatibility
// Bengali News API endpoint - Updated to use homepage listing
app.get('/api/bengali-news', async (req, res) => {
  try {
    console.log('=== Starting Bengali News API Request ===');
    
    const apiUrl = 'https://bangla.hindustantimes.com/onScrollHomeListing/2';
    console.log('Target API URL:', apiUrl);
    
    // Headers to mimic a real browser request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'bn-IN,bn;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      'Referer': 'https://bangla.hindustantimes.com/',
      'Origin': 'https://bangla.hindustantimes.com',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    };

    console.log('Sending request with headers:', headers);
    
    const response = await fetch(apiUrl, { 
      headers,
      timeout: 15000 // 15 second timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    let rawData;
    if (contentType && contentType.includes('application/json')) {
      rawData = await response.json();
    } else {
      const textData = await response.text();
      console.log('Raw text response:', textData);
      try {
        rawData = JSON.parse(textData);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Response is not valid JSON');
      }
    }
    
    // Log the raw JSON to console for inspection
    console.log('Raw API Response Structure:');
    console.log('Keys in response:', Object.keys(rawData));
    console.log('Response type:', typeof rawData);
    console.log('Is array?', Array.isArray(rawData));
    
    if (rawData && typeof rawData === 'object') {
      console.log('Sample of first few keys and their types:');
      Object.keys(rawData).slice(0, 5).forEach(key => {
        console.log(`${key}: ${typeof rawData[key]} (${Array.isArray(rawData[key]) ? 'array' : 'not array'})`);
      });
    }
    
    // Auto-detect and map the news stories
    let newsStories = [];
    
    // Try to find the stories array in the response
    if (rawData.stories && Array.isArray(rawData.stories)) {
      newsStories = rawData.stories;
      console.log('Found stories in rawData.stories');
    } else if (rawData.data && Array.isArray(rawData.data)) {
      newsStories = rawData.data;
      console.log('Found stories in rawData.data');
    } else if (rawData.articles && Array.isArray(rawData.articles)) {
      newsStories = rawData.articles;
      console.log('Found stories in rawData.articles');
    } else if (rawData.results && Array.isArray(rawData.results)) {
      newsStories = rawData.results;
      console.log('Found stories in rawData.results');
    } else if (rawData.items && Array.isArray(rawData.items)) {
      newsStories = rawData.items;
      console.log('Found stories in rawData.items');
    } else if (rawData.list && Array.isArray(rawData.list)) {
      newsStories = rawData.list;
      console.log('Found stories in rawData.list');
    } else if (Array.isArray(rawData)) {
      newsStories = rawData;
      console.log('Found stories in rawData (root level array)');
    } else {
      // If none of the above, try to find any array in the response
      console.log('Searching for any array in response...');
      for (const key in rawData) {
        if (Array.isArray(rawData[key])) {
          console.log(`Found array in key: ${key} with ${rawData[key].length} items`);
          newsStories = rawData[key];
          break;
        }
      }
    }
    
    if (!newsStories.length) {
      console.log('No stories array found in response.');
      console.log('Available keys:', Object.keys(rawData));
      console.log('Response structure:', JSON.stringify(rawData, null, 2).substring(0, 1000) + '...');
      return res.status(500).json({ 
        error: 'No stories found in API response',
        availableKeys: Object.keys(rawData),
        responseType: typeof rawData,
        isArray: Array.isArray(rawData)
      });
    }
    
    console.log(`Found ${newsStories.length} stories`);
    console.log('First story sample:', JSON.stringify(newsStories[0], null, 2));
    
    // Map the stories to our desired format with better field detection
    const mappedStories = newsStories.map((story, index) => {
      // Enhanced field detection for homepage news
      const title = story.title || story.headline || story.name || story.text || story.articleTitle || story.storyTitle || `News ${index + 1}`;
      const image = story.image || story.imageUrl || story.thumbnail || story.photo || story.pic || story.imagePath || story.heroImage || story.featuredImage || '';
      const link = story.link || story.url || story.articleUrl || story.permalink || story.webUrl || story.canonicalUrl || story.storyUrl || story.articleLink || '';
      const summary = story.summary || story.description || story.excerpt || story.content || story.body || story.abstract || story.shortDescription || story.metaDescription || '';
      
      // Additional fields that might be available
      const category = story.category || story.section || story.genre || story.type || '';
      const publishDate = story.publishDate || story.publishedAt || story.date || story.timestamp || '';
      const author = story.author || story.reporter || story.writer || story.byline || '';
      const readTime = story.readTime || story.readingTime || story.timeToRead || '';
      
      return {
        title: title ? title.toString() : `News ${index + 1}`,
        image: image ? image.toString() : '',
        link: link ? link.toString() : '',
        summary: summary ? summary.toString().substring(0, 150) + (summary.toString().length > 150 ? '...' : '') : '',
        category: category ? category.toString() : '',
        publishDate: publishDate ? publishDate.toString() : '',
        author: author ? author.toString() : '',
        readTime: readTime ? readTime.toString() : ''
      };
    });
    
    console.log('Mapped Stories:');
    console.log(JSON.stringify(mappedStories, null, 2));
    
    res.json({
      success: true,
      count: mappedStories.length,
      stories: mappedStories,
      debug: {
        originalKeys: Object.keys(rawData),
        storiesFoundIn: newsStories.length > 0 ? 'Found' : 'Not found',
        apiSource: 'bangla.hindustantimes.com/onScrollHomeListing'
      }
    });
    
  } catch (error) {
    console.error('=== Error Details ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to fetch Bengali news',
      details: error.message,
      type: error.constructor.name
    });
  }
});

// Proxy endpoint for Hindustan Times detailed articles
app.get('/api/proxy-hindustantimes/section/:sectionName/:numberOfStories', async (req, res) => {
  const { sectionName, numberOfStories } = req.params;
  
  // Try multiple possible API endpoints based on the homepage data structure
  const possibleEndpoints = [
    `https://bangla.hindustantimes.com/api/app/sectionfeedperp/v1/${sectionName}/${numberOfStories}`,
    `https://bangla.hindustantimes.com/api/app/sectionfeedperp/${sectionName}/${numberOfStories}`,
    `https://bangla.hindustantimes.com/api/section/${sectionName}/${numberOfStories}`,
    `https://bangla.hindustantimes.com/api/app/sectionfeedperp/v1/${sectionName}`,
    `https://bangla.hindustantimes.com/api/app/sectionfeedperp/${sectionName}`
  ];

  try {
    console.log(`=== Proxying request for section: ${sectionName}, stories: ${numberOfStories} ===`);
    
    // Headers to mimic a real browser request (same as homepage API)
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'bn-IN,bn;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': 'https://bangla.hindustantimes.com/',
      'Origin': 'https://bangla.hindustantimes.com'
    };

    let success = false;
    let data = null;
    let lastError = null;

    // Try each endpoint until one works
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, { 
          headers,
          timeout: 10000 // 10 second timeout
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log(`Response status: ${response.status}, Content-Type: ${contentType}`);
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            console.log(`Successfully got JSON response from: ${endpoint}`);
            success = true;
            break;
          } else {
            const textResponse = await response.text();
            console.log(`Got non-JSON response from ${endpoint}: ${textResponse.substring(0, 200)}...`);
            lastError = `Non-JSON response from ${endpoint}`;
          }
        } else {
          console.log(`Endpoint ${endpoint} returned status: ${response.status}`);
          lastError = `HTTP ${response.status} from ${endpoint}`;
        }
      } catch (endpointError) {
        console.log(`Error with endpoint ${endpoint}:`, endpointError.message);
        lastError = `Error with ${endpoint}: ${endpointError.message}`;
      }
    }

    if (success && data) {
      console.log(`Successfully proxied response for section: ${sectionName}, stories: ${numberOfStories}`);
      res.json(data);
    } else {
      // If all endpoints fail, return a structured error
      console.error(`All endpoints failed for section: ${sectionName}`);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch detailed article from all possible endpoints', 
        error: lastError,
        sectionName,
        numberOfStories,
        attemptedEndpoints: possibleEndpoints
      });
    }
  } catch (error) {
    console.error('Error proxying Hindustan Times API:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch detailed article via proxy', 
      error: error.message,
      sectionName,
      numberOfStories
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`=== Bengali News API Server ===`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📰 Using: bangla.hindustantimes.com/onScrollHomeListing`);
  console.log(`�� Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`�� Bengali News: http://localhost:${PORT}/api/bengali-news`);
  console.log(`===============================`);
});

module.exports = app;