# Hindustan Times Bangla - Component Architecture

## 📁 Project Structure

```
frontend/
├── public/
│   ├── fonts/
│   │   ├── NotoSansBengali-Regular.woff2
│   │   ├── NotoSansBengali-Bold.woff2
│   │   └── SolaimanLipi.woff2
│   ├── images/
│   │   ├── logo.svg
│   │   ├── placeholder.jpg
│   │   └── icons/
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Breadcrumb.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── SEO.jsx
│   │   ├── homepage/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── BreakingNews.jsx
│   │   │   ├── CategoryGrid.jsx
│   │   │   ├── TopStories.jsx
│   │   │   ├── TrendingNews.jsx
│   │   │   └── NewsletterSignup.jsx
│   │   ├── news/
│   │   │   ├── ArticleCard.jsx
│   │   │   ├── ArticleDetail.jsx
│   │   │   ├── ArticleList.jsx
│   │   │   ├── CategoryFilter.jsx
│   │   │   └── RelatedArticles.jsx
│   │   ├── media/
│   │   │   ├── ImageGallery.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── WebStory.jsx
│   │   │   └── Carousel.jsx
│   │   ├── search/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   └── SearchFilters.jsx
│   │   └── social/
│   │       ├── ShareButtons.jsx
│   │       ├── Comments.jsx
│   │       └── SocialFeed.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Category.jsx
│   │   ├── Article.jsx
│   │   ├── Search.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── NotFound.jsx
│   ├── hooks/
│   │   ├── useNews.js
│   │   ├── useSearch.js
│   │   ├── useNotifications.js
│   │   └── useLocalStorage.js
│   ├── services/
│   │   ├── api.js
│   │   ├── newsService.js
│   │   ├── searchService.js
│   │   └── analyticsService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── dateUtils.js
│   │   └── validation.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── components.css
│   │   └── responsive.css
│   ├── context/
│   │   ├── NewsContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── UserContext.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## 🧩 Component Specifications

### Layout Components

#### Header.jsx

```jsx
// Features: Logo, navigation menu, search bar, language toggle, user menu
// Props: isLoggedIn, user, onSearch, onLanguageChange
// State: isMenuOpen, searchQuery
```

#### Navigation.jsx

```jsx
// Features: Main navigation menu with all 7 categories
// Props: currentPath, onNavigate
// State: activeCategory, isMobileMenuOpen
```

#### Footer.jsx

```jsx
// Features: Social links, newsletter signup, contact info, legal links
// Props: onNewsletterSignup
// State: emailInput
```

### Homepage Components

#### HeroSection.jsx

```jsx
// Features: Featured story with large image, headline, excerpt
// Props: featuredArticle
// State: isLoaded
```

#### BreakingNews.jsx

```jsx
// Features: Ticker-style breaking news updates
// Props: breakingNews
// State: currentIndex, isPaused
```

#### CategoryGrid.jsx

```jsx
// Features: Grid of all 7 news categories with icons
// Props: categories, onCategoryClick
// State: hoveredCategory
```

### News Components

#### ArticleCard.jsx

```jsx
// Features: Article preview with image, title, excerpt, metadata
// Props: article, variant (small, medium, large)
// State: isImageLoaded
```

#### ArticleDetail.jsx

```jsx
// Features: Full article with rich content, social sharing, related articles
// Props: article, relatedArticles
// State: isBookmarked, shareCount
```

#### ArticleList.jsx

```jsx
// Features: Paginated list of articles with filters
// Props: articles, filters, onLoadMore
// State: currentPage, isLoading
```

### Media Components

#### ImageGallery.jsx

```jsx
// Features: Photo gallery with lightbox, navigation, captions
// Props: images, title
// State: currentIndex, isLightboxOpen
```

#### VideoPlayer.jsx

```jsx
// Features: Custom video player with Bengali subtitles
// Props: video, subtitles, autoplay
// State: isPlaying, currentTime, volume
```

#### WebStory.jsx

```jsx
// Features: Mobile-first story format with swipe navigation
// Props: story
// State: currentSlide, progress
```

### Search Components

#### SearchBar.jsx

```jsx
// Features: Global search with autocomplete, filters
// Props: onSearch, placeholder
// State: query, suggestions, isOpen
```

#### SearchResults.jsx

```jsx
// Features: Search results with highlighting, filters, sorting
// Props: results, query, onResultClick
// State: selectedFilters, sortBy
```

## 🎨 Styling Strategy

### CSS Architecture

```css
/* Base styles */
:root {
  /* Bengali font variables */
  --font-bengali-primary: "Noto Sans Bengali", sans-serif;
  --font-bengali-secondary: "SolaimanLipi", serif;

  /* Color palette */
  --color-primary: #1a365d;
  --color-secondary: #e53e3e;
  --color-accent: #f6ad55;
  --color-text: #2d3748;
  --color-background: #ffffff;

  /* Spacing system */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Breakpoints */
  --breakpoint-sm: 320px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1440px;
}

/* Component-specific styles */
.component-name {
  /* Component styles */
}

/* Responsive design */
@media (max-width: 768px) {
  .component-name {
    /* Mobile styles */
  }
}
```

### Bengali Typography

```css
/* Bengali text rendering */
.bengali-text {
  font-family: var(--font-bengali-primary);
  font-size: 1rem;
  line-height: 1.6;
  text-align: left;
  direction: ltr;
}

.bengali-heading {
  font-family: var(--font-bengali-secondary);
  font-weight: 700;
  line-height: 1.2;
}
```

## 🔄 State Management

### Context Structure

```jsx
// NewsContext.jsx
const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArticles = async (category) => {
    // API call logic
  };

  const value = {
    articles,
    categories,
    loading,
    error,
    fetchArticles,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};
```

### Custom Hooks

```jsx
// useNews.js
export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error("useNews must be used within NewsProvider");
  }
  return context;
};

// useSearch.js
export const useSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (searchQuery) => {
    // Search logic
  }, []);

  return { query, results, isSearching, search, setQuery };
};
```

## 🚀 Performance Optimizations

### Code Splitting

```jsx
// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Category = lazy(() => import("./pages/Category"));
const Article = lazy(() => import("./pages/Article"));

// Lazy load components
const ImageGallery = lazy(() => import("./components/media/ImageGallery"));
const VideoPlayer = lazy(() => import("./components/media/VideoPlayer"));
```

### Image Optimization

```jsx
// Responsive images
const ResponsiveImage = ({ src, alt, sizes }) => {
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={`${src}-large.webp`} />
      <source media="(min-width: 768px)" srcSet={`${src}-medium.webp`} />
      <img src={`${src}-small.webp`} alt={alt} loading="lazy" />
    </picture>
  );
};
```

## 📱 Mobile-First Approach

### Touch Interactions

```css
/* Touch-friendly buttons */
.touch-button {
  min-height: 44px;
  min-width: 44px;
  padding: var(--spacing-md);
  border-radius: 8px;
}

/* Swipe gestures for web stories */
.swipe-container {
  touch-action: pan-y;
  user-select: none;
}
```

### Responsive Navigation

```jsx
// Mobile navigation with hamburger menu
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`mobile-nav ${isOpen ? "open" : ""}`}>
      <button onClick={() => setIsOpen(!isOpen)}>
        <span className="hamburger" />
      </button>
      {/* Navigation items */}
    </nav>
  );
};
```

## 🔍 SEO Implementation

### Meta Tags

```jsx
// SEO component for dynamic meta tags
const SEO = ({ title, description, image, url }) => {
  return (
    <Helmet>
      <title>{title} | Hindustan Times Bangla</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};
```

### Structured Data

```jsx
// JSON-LD structured data for articles
const ArticleStructuredData = ({ article }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished: article.publishedAt,
    image: article.featuredImage,
  };

  return (
    <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
  );
};
```

---

_This component architecture provides a scalable foundation for building the Hindustan Times Bangla website. Each component is designed to be reusable, maintainable, and optimized for performance._
