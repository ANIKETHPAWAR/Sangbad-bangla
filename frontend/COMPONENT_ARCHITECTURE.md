# Component Architecture - Reusable News Components

## Overview

The app now uses a **unified, reusable component architecture** that eliminates code duplication and provides consistent styling across different news display modes.

## 🧩 **Core Components**

### 1. **NewsCard** - The Universal News Component

- **Location**: `src/components/news/NewsCard.jsx`
- **Purpose**: Single, configurable component for all news display needs
- **Variants**: `featured`, `trending`, `default`

#### Props

```jsx
<NewsCard
  // News Data
  id={news.id}
  imageUrl={news.imageUrl}
  title={news.title}
  subtitle={news.subtitle}
  excerpt={news.excerpt}
  publishDate={news.publishDate}
  category={news.category}
  author={news.author}
  readTime={news.readTime}
  // Links
  detailUrl={news.detailUrl}
  websiteUrl={news.websiteUrl}
  // Display Options
  variant="featured" // 'featured' | 'trending' | 'default'
  isNew={false} // Show "NEW" badge
  keywords={news.keywords} // Array of keywords
  // Events
  onClick={handleNewsClick}
/>
```

#### Variants

**Featured News (`variant="featured"`)**

- Large image (250px height)
- Full excerpt display
- Keywords display
- Both external and detail links
- Full date format

**Trending News (`variant="trending"`)**

- Compact image (120px height)
- No excerpt
- Relative time format (e.g., "2 hours ago")
- Only external link
- Compact layout

**Default (`variant="default"`)**

- Medium image (200px height)
- Balanced layout
- Standard date format

### 2. **NewsContainer** - Main Layout Component

- **Location**: `src/components/news/NewsContainer.jsx`
- **Purpose**: Orchestrates news display and API integration
- **Features**: Loading states, error handling, data source indication

### 3. **NewsDataService** - Data Layer

- **Location**: `src/services/newsDataService.js`
- **Purpose**: Handles API calls and data transformation
- **Features**: Proxy support, fallback to mock data, error handling

## 🎨 **Styling System**

### CSS Architecture

- **Base Styles**: `.news-card` - Common styles for all variants
- **Variant Styles**: `.news-card.featured`, `.news-card.trending`
- **Responsive Design**: Mobile-first approach with breakpoints
- **Consistent Spacing**: Using CSS custom properties for consistency

### Key Features

- **Hover Effects**: Smooth transitions and transforms
- **Image Fallbacks**: Automatic fallback to placeholder images
- **Responsive Images**: Different sizes for different variants
- **Accessibility**: Proper alt texts and ARIA labels

## 🚀 **Usage Examples**

### Basic Featured News

```jsx
<NewsCard {...newsData} variant="featured" onClick={handleNewsClick} />
```

### Trending News with New Badge

```jsx
<NewsCard
  {...newsData}
  variant="trending"
  isNew={true}
  onClick={handleNewsClick}
/>
```

### Custom News Card

```jsx
<NewsCard {...newsData} variant="default" onClick={handleNewsClick} />
```

## 🔧 **Configuration**

### Image Fallbacks

```jsx
onError={(e) => {
  const fallbackUrl = isFeatured
    ? `https://picsum.photos/600/338?random=${Math.random()}`
    : `https://picsum.photos/250/250?random=${Math.random()}`;
  e.target.src = fallbackUrl;
}}
```

### Date Formatting

- **Featured**: Full date with time (e.g., "15 Jan, 2025, 03:50 PM")
- **Trending**: Relative time (e.g., "2 hours ago", "এখনই")

## 📱 **Responsive Behavior**

### Breakpoints

- **Desktop**: Full layout with sidebar
- **Tablet**: Stacked layout, no sidebar
- **Mobile**: Compact cards, optimized spacing

### Adaptive Features

- Image heights adjust automatically
- Font sizes scale appropriately
- Spacing adjusts for touch interfaces

## 🎯 **Benefits of New Architecture**

1. **Code Reusability**: Single component for all news types
2. **Consistent Styling**: Unified design language
3. **Easy Maintenance**: Changes in one place affect all instances
4. **Flexible Configuration**: Variants adapt to different use cases
5. **Better Performance**: Reduced bundle size, optimized rendering
6. **Developer Experience**: Clear API, easy to understand and extend

## 🔄 **Migration from Old Components**

### Before (Separate Components)

```jsx
import FeaturedNewsCard from './FeaturedNewsCard';
import TrendingNewsItem from './TrendingNewsItem';

// Different components for different news types
<FeaturedNewsCard {...news} />
<TrendingNewsItem {...news} />
```

### After (Unified Component)

```jsx
import NewsCard from './NewsCard';

// Single component with variants
<NewsCard {...news} variant="featured" />
<NewsCard {...news} variant="trending" />
```

## 🚀 **Future Extensions**

The component is designed to be easily extensible:

1. **New Variants**: Add `variant="compact"`, `variant="hero"`, etc.
2. **Custom Themes**: Support for different color schemes
3. **Animation Options**: Configurable hover and click animations
4. **Layout Modes**: Grid, list, masonry layouts
5. **Interactive Features**: Bookmark, share, like buttons

## 📚 **Best Practices**

1. **Always specify variant**: Use explicit variant prop for clarity
2. **Handle errors gracefully**: Provide fallback images and content
3. **Optimize images**: Use appropriate image sizes for variants
4. **Accessibility**: Ensure proper alt texts and keyboard navigation
5. **Performance**: Lazy load images and optimize re-renders
