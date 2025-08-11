// News Data Service - Can be replaced with real API calls
class NewsDataService {
  constructor() {
    this.baseUrl = 'https://api.hindustantimes.com/bangla';
    this.mockData = this.getMockData();
  }

  // Get mock data for development
  getMockData() {
    return {
      featuredNews: [
        {
          id: 1,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
          title: "বাংলাদেশে নতুন প্রযুক্তি বিপ্লব",
          subtitle: "ডিজিটাল বাংলাদেশের নতুন অধ্যায়",
          excerpt: "বাংলাদেশ সরকারের ডিজিটাল বাংলাদেশ কর্মসূচির অধীনে দেশের প্রতিটি গ্রামে ইন্টারনেট সংযোগ স্থাপনের কাজ শুরু হয়েছে। এই উদ্যোগ দেশের অর্থনৈতিক উন্নয়নে গুরুত্বপূর্ণ ভূমিকা পালন করবে...",
          publishDate: '2025-01-15T10:20:00Z',
          category: 'প্রযুক্তি',
          author: 'প্রযুক্তি রিপোর্টার',
          readTime: 4
        },
        {
          id: 2,
          imageUrl: 'https://imgs.search.brave.com/16sBvE2JMdaDtFibBdtZtaE7yrK0TJjDoLA-795j92U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy8y/LzIzL1N1bmRhcmJh/bl9UaWdlci5qcGc',
          title: "সুন্দরবনে নতুন প্রজাতির প্রাণী আবিষ্কার",
          subtitle: "বাংলাদেশের জীববৈচিত্র্যে নতুন সংযোজন",
          excerpt: "সুন্দরবন গবেষণা কেন্দ্রের বিজ্ঞানীরা নতুন একটি প্রজাতির প্রাণী আবিষ্কার করেছেন। এই আবিষ্কার বিশ্বের জীববৈচিত্র্য গবেষণায় গুরুত্বপূর্ণ অবদান রাখবে...",
          publishDate: '2025-01-15T09:15:00Z',
          category: 'পরিবেশ',
          author: 'পরিবেশ রিপোর্টার',
          readTime: 6
        },
        {
          id: 3,
          imageUrl: 'https://imgs.search.brave.com/uPrKcCeyobWNOXPbd92L60WAO2_1NY_ln7WV09qpBZM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMudGVsZWdyYXBo/aW5kaWEuY29tL3Rl/bGVncmFwaC8yMDI0/L0p1bC8xNzIwMTcx/MTk0X2tpZmYtZW50/cmllcy1vcGVuLmpw/Zw',
          title: "কলকাতায় আন্তর্জাতিক চলচ্চিত্র উৎসব",
          subtitle: "বাংলা সিনেমার বিশ্বব্যাপী স্বীকৃতি",
          excerpt: "কলকাতা আন্তর্জাতিক চলচ্চিত্র উৎসবে এবার বাংলাদেশের চলচ্চিত্রকারদের সিনেমা বিশেষভাবে প্রশংসিত হয়েছে। বিশ্বের বিভিন্ন দেশ থেকে আগত দর্শকরা বাংলা সিনেমার গুণমানের প্রশংসা করেছেন...",
          publishDate: '2025-01-15T08:45:00Z',
          category: 'সংস্কৃতি',
          author: 'সংস্কৃতি রিপোর্টার',
          readTime: 5
        },
        {
          id: 4,
          imageUrl: 'https://wenr.wes.org/wp-content/uploads/2019/08/iStock-1054069874_740x440.png',
          title: "বাংলাদেশে নতুন শিক্ষা নীতি ঘোষণা",
          subtitle: "শিক্ষার মান উন্নয়নে নতুন পদক্ষেপ",
          excerpt: "বাংলাদেশ সরকার নতুন শিক্ষা নীতি ঘোষণা করেছে। এই নীতির অধীনে প্রাথমিক থেকে উচ্চশিক্ষা পর্যন্ত সব স্তরে শিক্ষার মান উন্নত করার পরিকল্পনা করা হয়েছে...",
          publishDate: '2025-01-15T07:30:00Z',
          category: 'শিক্ষা',
          author: 'শিক্ষা রিপোর্টার',
          readTime: 4
        },
        {
          id: 5,
          imageUrl: 'https://imgs.search.brave.com/IaK2v7stsKYLIuv5G6VC9CkBiEsKcwzPKUtkZWDf730/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy83/Lzc3L0tlYW5lX0Jy/aWRnZV9hbmRfQWxp/X0FtamFkJ3NfQ2xv/Y2ssX1N5bGhldC5q/cGc',
          title: "সিলেটে নতুন পর্যটন কেন্দ্র উদ্বোধন",
          subtitle: "পর্যটন শিল্পে নতুন সম্ভাবনা",
          excerpt: "সিলেটে নতুন পর্যটন কেন্দ্র উদ্বোধন করা হয়েছে। এই কেন্দ্রে দেশি-বিদেশি পর্যটকরা সিলেটের প্রাকৃতিক সৌন্দর্য উপভোগ করতে পারবেন...",
          publishDate: '2025-01-15T06:45:00Z',
          category: 'পর্যটন',
          author: 'পর্যটন রিপোর্টার',
          readTime: 3
        }
      ],
      trendingNews: [
        {
          id: 6,
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
          title: "চট্টগ্রাম বন্দরে নতুন জাহাজ ঘাট নির্মাণ",
          subtitle: "বাংলাদেশের অর্থনৈতিক উন্নয়নে নতুন মাইলফলক",
          excerpt: "চট্টগ্রাম বন্দরে নতুন জাহাজ ঘাট নির্মাণের কাজ শুরু হয়েছে। এই প্রকল্প বাস্তবায়িত হলে বাংলাদেশের আমদানি-রপ্তানি ক্ষমতা বহুগুণে বৃদ্ধি পাবে...",
          publishDate: '2025-01-15T07:00:00Z',
          category: 'অর্থনীতি',
          author: 'অর্থনীতি রিপোর্টার',
          readTime: 4
        },
        {
          id: 7,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
          title: "রাজশাহীতে নতুন মেডিকেল কলেজ প্রতিষ্ঠা",
          subtitle: "উত্তরাঞ্চলে চিকিৎসা শিক্ষার মান উন্নয়ন",
          excerpt: "রাজশাহীতে নতুন মেডিকেল কলেজ প্রতিষ্ঠার পরিকল্পনা করা হয়েছে। এই কলেজ প্রতিষ্ঠিত হলে উত্তরাঞ্চলের ছাত্র-ছাত্রীরা সহজেই চিকিৎসা শিক্ষা গ্রহণ করতে পারবেন...",
          publishDate: '2025-01-15T06:45:00Z',
          category: 'স্বাস্থ্য',
          author: 'স্বাস্থ্য রিপোর্টার',
          readTime: 5
        },
        {
          id: 8,
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
          title: "খুলনায় নতুন শিল্প এলাকা গড়ে উঠছে",
          subtitle: "দক্ষিণাঞ্চলে শিল্পায়নের নতুন সম্ভাবনা",
          excerpt: "খুলনায় নতুন শিল্প এলাকা গড়ে উঠছে। এই এলাকায় বিভিন্ন ধরনের শিল্প প্রতিষ্ঠান স্থাপনের পরিকল্পনা করা হয়েছে...",
          publishDate: '2025-01-15T06:30:00Z',
          category: 'শিল্প',
          author: 'শিল্প রিপোর্টার',
          readTime: 3
        },
        {
          id: 9,
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
          title: "বরিশালে নতুন কৃষি গবেষণা কেন্দ্র",
          subtitle: "দক্ষিণাঞ্চলে কৃষি গবেষণার নতুন কেন্দ্র",
          excerpt: "বরিশালে নতুন কৃষি গবেষণা কেন্দ্র প্রতিষ্ঠার কাজ শুরু হয়েছে। এই কেন্দ্রে আধুনিক কৃষি প্রযুক্তি নিয়ে গবেষণা করা হবে...",
          publishDate: '2025-01-15T06:15:00Z',
          category: 'কৃষি',
          author: 'কৃষি রিপোর্টার',
          readTime: 4
        },
        {
          id: 10,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
          title: "ঢাকায় নতুন আর্ট গ্যালারি উদ্বোধন",
          subtitle: "বাংলাদেশের শিল্পকলার বিকাশে নতুন উদ্যোগ",
          excerpt: "ঢাকায় নতুন আর্ট গ্যালারি উদ্বোধন করা হয়েছে। এই গ্যালারিতে দেশি-বিদেশি শিল্পীদের শিল্পকর্ম প্রদর্শিত হবে...",
          publishDate: '2025-01-15T05:45:00Z',
          category: 'শিল্পকলা',
          author: 'শিল্পকলা রিপোর্টার',
          readTime: 3
        },
        {
          id: 11,
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
          title: "রংপুরে নতুন বিজ্ঞান মেলা",
          subtitle: "উত্তরাঞ্চলে বিজ্ঞান শিক্ষার প্রসার",
          excerpt: "রংপুরে নতুন বিজ্ঞান মেলার আয়োজন করা হয়েছে। এই মেলায় বিভিন্ন ধরনের বৈজ্ঞানিক প্রদর্শনী থাকবে...",
          publishDate: '2025-01-15T05:30:00Z',
          category: 'বিজ্ঞান',
          author: 'বিজ্ঞান রিপোর্টার',
          readTime: 4
        },
        {
          id: 12,
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
          title: "কুমিল্লায় নতুন স্পোর্টস কমপ্লেক্স",
          subtitle: "দক্ষিণ-পূর্বাঞ্চলে খেলাধুলার উন্নয়ন",
          excerpt: "কুমিল্লায় নতুন স্পোর্টস কমপ্লেক্স নির্মাণের কাজ শুরু হয়েছে। এই কমপ্লেক্সে বিভিন্ন ধরনের খেলাধুলার সুবিধা থাকবে...",
          publishDate: '2025-01-15T05:15:00Z',
          category: 'খেলাধুলা',
          author: 'খেলাধুলা রিপোর্টার',
          readTime: 3
        }
      ]
    };
  }

  // Get featured news
  async getFeaturedNews() {
    try {
      // For now, return mock data
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseUrl}/featured-news`);
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.mockData.featuredNews);
        }, 500);
      });
    } catch (error) {
      console.error('Error fetching featured news:', error);
      return [];
    }
  }

  // Get trending news
  async getTrendingNews() {
    try {
      // For now, return mock data
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseUrl}/trending-news`);
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.mockData.trendingNews);
        }, 300);
      });
    } catch (error) {
      console.error('Error fetching trending news:', error);
      return [];
    }
  }

  // Get news by category
  async getNewsByCategory(category) {
    try {
      // For now, return mock data filtered by category
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseUrl}/news?category=${category}`);
      // return await response.json();
      
      const allNews = [...this.mockData.featuredNews, ...this.mockData.trendingNews];
      const filteredNews = allNews.filter(news => 
        news.category && news.category.toLowerCase() === category.toLowerCase()
      );
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(filteredNews);
        }, 400);
      });
    } catch (error) {
      console.error('Error fetching news by category:', error);
      return [];
    }
  }



  // Search news
  async searchNews(query) {
    try {
      // For now, return mock data filtered by search query
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      // return await response.json();
      
      const allNews = [...this.mockData.featuredNews, ...this.mockData.trendingNews];
      const searchResults = allNews.filter(news => 
        news.title.toLowerCase().includes(query.toLowerCase()) ||
        news.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
        news.category?.toLowerCase().includes(query.toLowerCase())
      );
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(searchResults);
        }, 600);
      });
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  // Add new news (for real-time updates)
  addNews(newsItem) {
    if (newsItem.isFeatured) {
      this.mockData.featuredNews.unshift(newsItem);
    } else {
      this.mockData.trendingNews.unshift(newsItem);
    }
  }

  // Update news
  updateNews(newsId, updates) {
    const allNews = [...this.mockData.featuredNews, ...this.mockData.trendingNews];
    const newsIndex = allNews.findIndex(news => news.id === newsId);
    
    if (newsIndex !== -1) {
      allNews[newsIndex] = { ...allNews[newsIndex], ...updates };
    }
  }

  // Delete news
  deleteNews(newsId) {
    this.mockData.featuredNews = this.mockData.featuredNews.filter(news => news.id !== newsId);
    this.mockData.trendingNews = this.mockData.trendingNews.filter(news => news.id !== newsId);
  }
}

export default new NewsDataService(); 