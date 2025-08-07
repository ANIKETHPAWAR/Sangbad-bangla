# Hindustan Times Bangla - Implementation Guide

## 🚀 Getting Started

### Step 1: Install Additional Dependencies

First, let's add the necessary dependencies to your existing React + Vite project:

```bash
cd frontend
npm install react-router-dom axios react-query framer-motion react-icons date-fns react-helmet-async
npm install -D @types/react-helmet-async
```

### Step 2: Update package.json

Your `package.json` should look like this:

```json
{
  "name": "hindustan-times-bangla",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.6.0",
    "react-query": "^3.39.0",
    "framer-motion": "^10.16.0",
    "react-icons": "^4.12.0",
    "date-fns": "^2.30.0",
    "react-helmet-async": "^1.3.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.30.1",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "eslint": "^9.30.1",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "vite": "^7.0.4"
  }
}
```

## 📁 Create Project Structure

### Step 3: Create Directory Structure

```bash
mkdir -p src/{components/{layout,common,homepage,news,media,search,social},pages,hooks,services,utils,styles,context}
mkdir -p public/{fonts,images/icons}
```

### Step 4: Set Up Basic Files

Let's start with the essential files:

#### 1. Constants (src/utils/constants.js)

```javascript
// News categories
export const CATEGORIES = [
  {
    id: "west-bengal",
    name: "পশ্চিমবঙ্গ",
    englishName: "West Bengal",
    icon: "🏛️",
    description: "কলকাতা ও অন্যান্য জেলার খবর",
  },
  {
    id: "india-world",
    name: "ভারত ও বিশ্ব",
    englishName: "India & World",
    icon: "🌍",
    description: "জাতীয় ও আন্তর্জাতিক খবর",
  },
  {
    id: "bioscope",
    name: "বায়োস্কোপ",
    englishName: "Entertainment",
    icon: "🎬",
    description: "চলচ্চিত্র ও টেলিভিশন খবর",
  },
  {
    id: "cricket",
    name: "ক্রিকেট",
    englishName: "Sports",
    icon: "🏏",
    description: "ক্রিকেট ও অন্যান্য খেলার খবর",
  },
  {
    id: "tukitaki",
    name: "টুকিটাকি",
    englishName: "Lifestyle",
    icon: "💄",
    description: "স্বাস্থ্য, ভ্রমণ, খাবার ও সম্পর্ক",
  },
  {
    id: "bhagyolipi",
    name: "ভাগ্যলিপি",
    englishName: "Astrology",
    icon: "🔮",
    description: "দৈনিক রাশিফল ও জ্যোতিষ",
  },
  {
    id: "karmakhali",
    name: "কর্মক্ষালি",
    englishName: "Careers",
    icon: "💼",
    description: "চাকরির খবর ও ক্যারিয়ার পরামর্শ",
  },
];

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: "https://api.hindustantimes.com/bangla",
  ARTICLES: "/articles",
  CATEGORIES: "/categories",
  SEARCH: "/search",
  BREAKING_NEWS: "/breaking-news",
};

// App configuration
export const APP_CONFIG = {
  SITE_NAME: "Hindustan Times Bangla",
  SITE_URL: "https://bangla.hindustantimes.com",
  DEFAULT_LANGUAGE: "bn",
  SUPPORTED_LANGUAGES: ["bn", "en"],
};
```

#### 2. Global Styles (src/styles/globals.css)

```css
/* Import Bengali fonts */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap");

/* CSS Variables */
:root {
  /* Bengali fonts */
  --font-bengali-primary: "Noto Sans Bengali", sans-serif;
  --font-bengali-secondary: "Noto Sans Bengali", serif;

  /* Colors */
  --color-primary: #1a365d;
  --color-secondary: #e53e3e;
  --color-accent: #f6ad55;
  --color-text: #2d3748;
  --color-text-light: #718096;
  --color-background: #ffffff;
  --color-background-light: #f7fafc;
  --color-border: #e2e8f0;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Breakpoints */
  --breakpoint-sm: 320px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1440px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-bengali-primary);
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-background);
}

/* Bengali text styles */
.bengali-text {
  font-family: var(--font-bengali-primary);
  font-size: 1rem;
  line-height: 1.6;
}

.bengali-heading {
  font-family: var(--font-bengali-primary);
  font-weight: 700;
  line-height: 1.2;
}

/* Utility classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: 6px;
  font-family: var(--font-bengali-primary);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  min-width: 44px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: #2c5282;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-sm);
  }
}
```

#### 3. API Service (src/services/api.js)

```javascript
import axios from "axios";
import { API_ENDPOINTS } from "../utils/constants";

// Create axios instance
const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
```

#### 4. News Service (src/services/newsService.js)

```javascript
import api from "./api";
import { API_ENDPOINTS } from "../utils/constants";

export const newsService = {
  // Get articles by category
  getArticlesByCategory: async (category, page = 1, limit = 10) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.ARTICLES}`, {
        params: {
          category,
          page,
          limit,
        },
      });
      return response;
    } catch (error) {
      throw new Error("Failed to fetch articles");
    }
  },

  // Get article by ID
  getArticleById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.ARTICLES}/${id}`);
      return response;
    } catch (error) {
      throw new Error("Failed to fetch article");
    }
  },

  // Get breaking news
  getBreakingNews: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.BREAKING_NEWS);
      return response;
    } catch (error) {
      throw new Error("Failed to fetch breaking news");
    }
  },

  // Search articles
  searchArticles: async (query, filters = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.SEARCH, {
        params: {
          q: query,
          ...filters,
        },
      });
      return response;
    } catch (error) {
      throw new Error("Failed to search articles");
    }
  },
};
```

## 🧩 Create Core Components

### Step 5: Layout Components

#### Header Component (src/components/layout/Header.jsx)

```jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiSearch, FiUser } from "react-icons/fi";
import SearchBar from "../search/SearchBar";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <h1 className="bengali-heading">হিন্দুস্তান টাইমস বাংলা</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <ul className="nav-list">
              <li>
                <Link to="/west-bengal">পশ্চিমবঙ্গ</Link>
              </li>
              <li>
                <Link to="/india-world">ভারত ও বিশ্ব</Link>
              </li>
              <li>
                <Link to="/bioscope">বায়োস্কোপ</Link>
              </li>
              <li>
                <Link to="/cricket">ক্রিকেট</Link>
              </li>
              <li>
                <Link to="/tukitaki">টুকিটাকি</Link>
              </li>
              <li>
                <Link to="/bhagyolipi">ভাগ্যলিপি</Link>
              </li>
              <li>
                <Link to="/karmakhali">কর্মক্ষালি</Link>
              </li>
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            <button
              className="btn-icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <FiSearch />
            </button>
            <button className="btn-icon">
              <FiUser />
            </button>
            <button
              className="btn-icon mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FiMenu />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="search-container">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="nav-mobile">
            <ul className="nav-list-mobile">
              <li>
                <Link to="/west-bengal" onClick={() => setIsMenuOpen(false)}>
                  পশ্চিমবঙ্গ
                </Link>
              </li>
              <li>
                <Link to="/india-world" onClick={() => setIsMenuOpen(false)}>
                  ভারত ও বিশ্ব
                </Link>
              </li>
              <li>
                <Link to="/bioscope" onClick={() => setIsMenuOpen(false)}>
                  বায়োস্কোপ
                </Link>
              </li>
              <li>
                <Link to="/cricket" onClick={() => setIsMenuOpen(false)}>
                  ক্রিকেট
                </Link>
              </li>
              <li>
                <Link to="/tukitaki" onClick={() => setIsMenuOpen(false)}>
                  টুকিটাকি
                </Link>
              </li>
              <li>
                <Link to="/bhagyolipi" onClick={() => setIsMenuOpen(false)}>
                  ভাগ্যলিপি
                </Link>
              </li>
              <li>
                <Link to="/karmakhali" onClick={() => setIsMenuOpen(false)}>
                  কর্মক্ষালি
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
```

#### Header Styles (src/components/layout/Header.css)

```css
.header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
}

.logo h1 {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin: 0;
}

.nav-desktop {
  display: none;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: var(--spacing-lg);
}

.nav-list a {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-list a:hover {
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-icon {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: var(--color-background-light);
}

.mobile-menu-btn {
  display: block;
}

.search-container {
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border);
}

.nav-mobile {
  display: none;
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border);
}

.nav-list-mobile {
  list-style: none;
}

.nav-list-mobile li {
  border-bottom: 1px solid var(--color-border);
}

.nav-list-mobile a {
  display: block;
  padding: var(--spacing-md);
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
}

.nav-list-mobile a:hover {
  background-color: var(--color-background-light);
}

/* Responsive Design */
@media (min-width: 768px) {
  .mobile-menu-btn {
    display: none;
  }

  .nav-desktop {
    display: block;
  }

  .nav-mobile {
    display: none !important;
  }
}
```

### Step 6: Homepage Components

#### Hero Section (src/components/homepage/HeroSection.jsx)

```jsx
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import "./HeroSection.css";

const HeroSection = ({ featuredArticle }) => {
  if (!featuredArticle) {
    return (
      <section className="hero-section">
        <div className="container">
          <div className="hero-placeholder">
            <h2>লোড হচ্ছে...</h2>
          </div>
        </div>
      </section>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(featuredArticle.publishedAt), {
    addSuffix: true,
    locale: bn,
  });

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-image">
            <img
              src={featuredArticle.featuredImage}
              alt={featuredArticle.title}
              loading="eager"
            />
            <div className="hero-overlay">
              <span className="category-tag">{featuredArticle.category}</span>
            </div>
          </div>
          <div className="hero-text">
            <h1 className="hero-title bengali-heading">
              <Link to={`/article/${featuredArticle.id}`}>
                {featuredArticle.title}
              </Link>
            </h1>
            <p className="hero-excerpt bengali-text">
              {featuredArticle.excerpt}
            </p>
            <div className="hero-meta">
              <span className="author">{featuredArticle.author}</span>
              <span className="time">{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

#### Hero Section Styles (src/components/homepage/HeroSection.css)

```css
.hero-section {
  padding: var(--spacing-xl) 0;
  background-color: var(--color-background-light);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

.hero-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hero-image:hover img {
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
}

.category-tag {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.hero-title {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
}

.hero-title a {
  color: var(--color-text);
  text-decoration: none;
  transition: color 0.2s ease;
}

.hero-title a:hover {
  color: var(--color-primary);
}

.hero-excerpt {
  font-size: 1.125rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
  line-height: 1.7;
}

.hero-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.author {
  font-weight: 500;
}

/* Responsive Design */
@media (min-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 3rem;
  }
}
```

### Step 7: Update App.jsx

```jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Article from "./pages/Article";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:categoryId" element={<Category />} />
                <Route path="/article/:articleId" element={<Article />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
```

## 🎯 Next Steps

1. **Install dependencies** and set up the project structure
2. **Create the remaining components** following the patterns above
3. **Implement the pages** (Home, Category, Article, Search, NotFound)
4. **Add Bengali font support** and typography
5. **Set up routing** for all categories
6. **Implement search functionality**
7. **Add responsive design** for mobile devices
8. **Set up API integration** with your backend
9. **Add SEO optimization** with meta tags
10. **Implement analytics** tracking

## 📱 Testing the Implementation

After setting up the basic structure, you can test it by running:

```bash
npm run dev
```

Visit `http://localhost:5173` to see your Hindustan Times Bangla website in action!

---

_This implementation guide provides a solid foundation for building the Hindustan Times Bangla website. Each component is designed to be scalable, maintainable, and optimized for Bengali language support._
