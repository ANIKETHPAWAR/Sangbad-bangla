// Per-section API overrides. Paste full HT endpoints here if you want to override.
// If not provided, the app will call the backend proxy: /api/section-feed/:section/:limit
export const SECTION_API_OVERRIDES = {
  // Example (you can paste the ones you share):
  // bengal: 'https://bangla.hindustantimes.com/api/app/sectionFeedPerp/v1/bengal/15',
  // Keep empty in dev to avoid CORS; backend proxy will be used instead.
};

// Route path to section key mapping
export const ROUTE_TO_SECTION_KEY = {
  '/bengal-face': 'bengal',
  '/astrology': 'astrology',
  '/football': 'sports',
  '/photo-gallery': 'pictures', // confirmed mapping
  '/careers': 'career', // confirmed mapping
  '/lifestyle': 'lifestyle', // confirmed mapping
  '/popular': 'popular',
  // Add more as needed
};


