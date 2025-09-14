import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// New Components
import ConsentBanner from './components/ConsentBanner';
import NotificationPermission from './components/NotificationPermission';
import AdSlot from './components/ads/AdSlot';

// Page Components
import SignIn from './pages/SignIn';

// News Components
import NewsContainer from './components/news/NewsContainer';
import ArticlePage from './components/news/ArticlePage';
import ArticleDetailPage from './components/news/ArticleDetailPage';
// Removed direct TrendingNewsSidebar import; CategoryNewsPage includes it
import CategoryNewsPage from './components/news/CategoryNewsPage';

// Admin Components
import RequireAdmin from './components/admin/RequireAdmin';
import AdminDashboard from './components/admin/AdminDashboard';
import NewsForm from './components/admin/NewsForm';
import TempLogin from './components/admin/TempLogin';
import Advertise from './pages/Advertise';
import StaticPage from './pages/StaticPage';
import { staticPages } from './pages/static/content';
import MatchCarousel from './components/cricket/MatchCarousel';
import ScorecardModal from './components/cricket/ScorecardModal';
import ScorecardPage from './pages/ScorecardPage';


// Simple Cricket News Page Component
const CricketNewsPage = () => {
  const [scoreOpen, setScoreOpen] = React.useState(false);
  const [activeMatchCode, setActiveMatchCode] = React.useState('');
  const [activeMatchMeta, setActiveMatchMeta] = React.useState(null);
  const navigate = useNavigate();

  const handleViewScorecard = ({ code, meta }) => {
    if (!code) return;
    setActiveMatchCode(code);
    setActiveMatchMeta(meta || null);
    navigate(`/scorecard/${code}`, { state: { meta } });
  };

  return (
    <div className="cricket-news-page">
      <div style={{ backgroundColor: '#000', color: '#fff', borderRadius: '8px', padding: '12px 16px', marginBottom: '4px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>ক্রিকেটের সবকিছু এক জায়গায়</h2>
      </div>
      <div className="cricket-main" style={{ paddingTop: 15 }}>
        <MatchCarousel onViewScorecard={handleViewScorecard} />
      </div>
      <ScorecardModal open={scoreOpen} onClose={() => setScoreOpen(false)} matchCode={activeMatchCode} matchMeta={activeMatchMeta} />
      {/* Category layout with combined news (internal + external) and trending sidebar */}
      <CategoryNewsPage sectionKey="cricket" title="ক্রিকেট" subtitle="ক্রিকেটের সর্বশেষ খবর" />
    </div>
  );
};

// Scroll to top on route change
function ScrollToTop() {
  const location = useLocation();
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);
  return null;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // iPhone Safari loading fix
  React.useEffect(() => {
    console.log('App useEffect running');
    
    const timer = setTimeout(() => {
      console.log('Setting loading to false');
      setIsLoading(false);
    }, 100);

    // iPhone Safari specific fixes
    if (/iPhone/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)) {
      console.log('iPhone Safari detected, applying fixes');
      // Force reflow to fix rendering issues
      document.body.offsetHeight;
      
      // Fix for iPhone Safari viewport
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);
      
      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
      };
    }

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  console.log('App rendering, isLoading:', isLoading);

  // Show loading screen for iPhone Safari
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <Header onMenuClick={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <main className="main-content">
          {/* Global Top Ad */}
          <div style={{ margin: '12px 0' }}>
            <AdSlot adSlot={import.meta.env.VITE_ADSENSE_TOP_SLOT || ''} adFormat="auto" fullWidthResponsive={true} />
          </div>
          {/* Cookie Consent Banner */}
          <ConsentBanner />
          
          {/* Notification Permission Banner */}
          <NotificationPermission />
          
          <Routes>
            <Route path="/" element={<NewsContainer />} />
            <Route path="/all-news" element={<NewsContainer />} />
            <Route path="/article/:articleId" element={<ArticlePage />} />
            <Route path="/section/:sectionName/:numberOfStories" element={<ArticleDetailPage />} />
            <Route path="/popular" element={<NewsContainer />} />
            <Route path="/cricket" element={<CricketNewsPage />} />
            <Route path="/scorecard/:code" element={<ScorecardPage />} />
            <Route path="/bengal-face" element={<CategoryNewsPage sectionKey="bengal" title="বাংলার মুখ" />} />
            <Route path="/astrology" element={<CategoryNewsPage sectionKey="astrology" title="ভাগ্যলিপি" />} />
            <Route path="/football" element={<CategoryNewsPage sectionKey="football" title="ফুটবলের মহারণ" />} />
            <Route path="/photo-gallery" element={<CategoryNewsPage sectionKey="pictures" title="ছবিঘর" />} />
            <Route path="/careers" element={<CategoryNewsPage sectionKey="career" title="কর্মখালি" />} />
            <Route path="/lifestyle" element={<CategoryNewsPage sectionKey="lifestyle" title="টুকিটাকি" />} />
            <Route path="/special-report" element={<NewsContainer />} />
            <Route path="/horoscope" element={<NewsContainer />} />
            <Route path="/gold-rate" element={<NewsContainer />} />
            <Route path="/cricket-live" element={<NewsContainer />} />
            <Route path="/category" element={<NewsContainer />} />
            <Route path="/panchpuran" element={<NewsContainer />} />
            <Route path="/trending" element={<NewsContainer />} />
            <Route path="/national" element={<NewsContainer />} />
            <Route path="/tech-talk" element={<NewsContainer />} />
            <Route path="/sports" element={<NewsContainer />} />
            <Route path="/must-see" element={<NewsContainer />} />
            <Route path="/rss" element={<StaticPage title={staticPages.rss.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.rss.html }} /> </StaticPage>} />
            <Route path="/about" element={<StaticPage title={staticPages.about.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.about.html }} /> </StaticPage>} />
            <Route path="/about-us" element={<StaticPage title={staticPages.about.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.about.html }} /> </StaticPage>} />
            <Route path="/contact" element={<StaticPage title={staticPages.contact.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.contact.html }} /> </StaticPage>} />
            <Route path="/privacy" element={<StaticPage title={staticPages.privacy.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.privacy.html }} /> </StaticPage>} />
            <Route path="/terms" element={<StaticPage title={staticPages.terms.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.terms.html }} /> </StaticPage>} />
            <Route path="/sitemap" element={<StaticPage title={staticPages.sitemap.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.sitemap.html }} /> </StaticPage>} />
            <Route path="/archive" element={<StaticPage title={staticPages.archive.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.archive.html }} /> </StaticPage>} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/admin-login" element={<TempLogin />} />
            <Route path="/profile" element={<NewsContainer />} />
            <Route path="/settings" element={<NewsContainer />} />
            <Route path="/help" element={<NewsContainer />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            } />
            <Route path="/admin/new" element={
              <RequireAdmin>
                <NewsForm />
              </RequireAdmin>
            } />
            <Route path="/admin/edit/:id" element={
              <RequireAdmin>
                <NewsForm />
              </RequireAdmin>
            } />
          </Routes>
          {/* Global Bottom Ad */}
          <div style={{ margin: '12px 0' }}>
            <AdSlot adSlot={import.meta.env.VITE_ADSENSE_BOTTOM_SLOT || ''} adFormat="auto" fullWidthResponsive={true} />
          </div>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
