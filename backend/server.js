const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
try {
  // Try to use environment variables first (production)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('✅ Firebase Admin SDK initialized successfully with environment variables');
  } else {
    // Fallback to JSON file (local development)
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('✅ Firebase Admin SDK initialized successfully with JSON file');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  // Don't exit the process, let it continue without Firebase for now
  console.log('⚠️ Continuing without Firebase Admin SDK...');
}

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
    'https://sangbadbangla.news', // Your custom domain
    'https://www.sangbadbangla.news', // Your custom domain with www
    'https://sangbadbangla.vercel.app', // Your Vercel frontend (keep as fallback)
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

// Advertising enquiry - email submission endpoint
app.post('/api/advertise', async (req, res) => {
  try {
    const { name, company, email, phone, adType, message } = req.body || {};

    // Basic validation
    if (!name || !company || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Ensure SMTP configuration is available
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_TO) {
      console.error('Email configuration missing. Please set SMTP_* and MAIL_TO env vars');
      return res.status(500).json({ success: false, message: 'Email service not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: (SMTP_SECURE === 'true') || parseInt(SMTP_PORT, 10) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    const subject = `New Advertise Enquiry - ${company} (${adType || 'N/A'})`;
    const text = `New advertising enquiry\n\n` +
      `Name: ${name}\n` +
      `Company: ${company}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Ad Type: ${adType || 'N/A'}\n` +
      `Message: ${message || ''}\n` +
      `Submitted: ${new Date().toISOString()}`;

    const html = `
      <h2>New advertising enquiry</h2>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Company:</strong> ${company}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Ad Type:</strong> ${adType || 'N/A'}</li>
      </ul>
      ${message ? `<p><strong>Message:</strong><br/>${String(message).replace(/\n/g, '<br/>')}</p>` : ''}
      <p style="color:#666">Submitted: ${new Date().toLocaleString()}</p>
    `;

    const info = await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: MAIL_TO,
      replyTo: email,
      subject,
      text,
      html
    });

    console.log('📧 Advertise enquiry email sent:', info.messageId);
    res.json({ success: true, message: 'Enquiry submitted successfully' });
  } catch (error) {
    console.error('❌ Failed to send advertise enquiry:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send enquiry' });
  }
});

// Get combined news (Firestore + external) for frontend
app.get('/api/combined-news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    
    // Get Firestore news
    const newsService = require('./services/newsService');
    let firestoreNews = [];
    
    try {
      if (category) {
        const firestoreResult = await newsService.getNewsByCategory(category, limit);
        firestoreNews = firestoreResult.data || [];
      } else {
        const firestoreResult = await newsService.getAllNews(page, limit, false);
        firestoreNews = firestoreResult.data || [];
      }
    } catch (error) {
      console.log('⚠️ Firestore news fetch failed, continuing with external news only:', error.message);
    }
    
    // Get external news from popular stories API (best-effort; never block internal)
    let externalNews = [];
    if (!category) {
      try {
        const response = await fetch('https://personalize.hindustantimes.com/popular-story?propertyId=bg&platformId=web&articleType=story&numStories=20', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'bn-IN,bn;q=0.9,en;q=0.8'
          },
          timeout: 8000
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.status === 'success' && Array.isArray(data.items)) {
            externalNews = data.items.slice(0, limit).map(item => ({
              id: item.storyId || `external_${Date.now()}_${Math.random()}`,
              title: item.headline || 'News Story',
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
              keywords: item.keywords || [],
              source: 'external'
            }));
          }
        }
      } catch (error) {
        console.log('⚠️ External news fetch failed, returning internal news only:', error.message);
      }
    }
    
    // Order: internal first (newest first within group), then external (newest first)
    const sortByDate = (arr) => arr.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.publishDate || a.publishedDate);
      const dateB = new Date(b.createdAt || b.publishDate || b.publishedDate);
      return dateB - dateA;
    });
    const combinedNews = [...sortByDate(firestoreNews), ...sortByDate(externalNews)];
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNews = combinedNews.slice(startIndex, endIndex);
     
     res.json({
      success: true,
      data: paginatedNews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(combinedNews.length / limit),
        totalItems: combinedNews.length,
        itemsPerPage: limit
      },
      sources: {
        firestore: firestoreNews.length,
        external: externalNews.length,
        total: combinedNews.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching combined news:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch combined news',
      error: error.message
    });
  }
});

// Section feed endpoint for detailed article view (proxying HT sectionFeedPerp)
app.get('/api/section-feed/:sectionName/:numStories', async (req, res) => {
  try {
    const { sectionName, numStories } = req.params;
    const limit = parseInt(numStories) || 10;
    
    console.log(`📰 Fetching section feed (HT) for: ${sectionName}, stories: ${limit}`);

    // Build the Hindustan Times Bangla sectionFeedPerp URL
    // Map route aliases to HT section names
    const map = {
      football: 'sports',
      careers: 'career'
    };
    const htSection = map[sectionName] || sectionName;
    const htUrl = `https://bangla.hindustantimes.com/api/app/sectionFeedPerp/v1/${encodeURIComponent(htSection)}/${Math.min(limit, 50)}`;

    const response = await fetch(htUrl, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://bangla.hindustantimes.com/'
      },
      timeout: 10000
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Expected: { content: { sectionItems: [...], sectionName, sectionUrl } }
    const sectionItems = data?.content?.sectionItems || [];

    if (Array.isArray(sectionItems) && sectionItems.length > 0) {
      const limitedStories = sectionItems.slice(0, limit);
      console.log(`✅ Returning ${limitedStories.length} HT stories for section: ${sectionName}`);

      return res.json({
        success: true,
        stories: limitedStories,
        sectionName: data?.content?.sectionName || sectionName,
        totalStories: limitedStories.length,
        requestedStories: limit,
        source: 'ht-sectionFeedPerp',
        upstreamUrl: htUrl
      });
    }

    console.warn(`⚠️ No section items found for ${sectionName}. Data keys:`, Object.keys(data || {}));
    return res.json({ success: false, stories: [], sectionName, requestedStories: limit, upstreamUrl: htUrl });
  } catch (error) {
    console.error(`❌ Error fetching section feed for ${sectionName}:`, error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch section feed',
      message: error.message 
    });
  }
});

// Lightweight image proxy to avoid hotlink/referrer issues
app.get('/api/image', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send('Missing url');
    }
    const upstream = await fetch(targetUrl, {
      headers: {
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://bangla.hindustantimes.com/'
      },
      timeout: 10000
    });
    if (!upstream.ok) {
      return res.status(upstream.status).send('Failed to load image');
    }
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    const buf = await upstream.buffer();
    res.send(buf);
  } catch (err) {
    console.error('Image proxy error:', err.message);
    res.status(500).send('Image proxy error');
  }
});

// Import and use admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Import and use notification routes
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

// Import and use config routes
const configRoutes = require('./routes/config');
app.use('/api/config', configRoutes);

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
 console.log('server running')
});

module.exports = app;